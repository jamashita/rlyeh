import { createParseError, type ParseError } from '@rlyeh/lib/Error';
import { Type } from '@rlyeh/lib/Type';
import { type Either, left, right } from 'fp-ts/lib/Either.js';
import { z } from 'zod';

const PropositionIDSchema = z
  .string()
  .regex(/^p\d{2}$/)
  .brand<'PropositionID'>();

/**
 * `p01`, `p02` and so on: a fact stated in the text, shared by every language.
 */
export type PropositionID = z.infer<typeof PropositionIDSchema>;

/**
 * Where a proposition is written in the text, counted in graphemes from the
 * start of the text shown to the participant (AGENTS.md §10.1). `end` is
 * exclusive.
 */
const PropositionSpanSchema = z
  .object({
    proposition: PropositionIDSchema,
    start: z.number().int().nonnegative(),
    end: z.number().int().nonnegative()
  })
  .readonly();

export type PropositionSpan = z.infer<typeof PropositionSpanSchema>;

const MARKER = /\{(p\d{2}):([^{}]*)\}/g;

const SEGMENTER = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

const countGraphemes = (value: string): number => {
  return [...SEGMENTER.segment(value)].length;
};

/**
 * A span while the text is being scanned. The proposition id is still a plain
 * string here; it is checked and branded when the result goes through
 * `PropositionSpanSchema`.
 */
const SpanSchema = z
  .object({
    proposition: z.string(),
    start: z.number().int().nonnegative(),
    end: z.number().int().nonnegative()
  })
  .readonly();

type Span = z.infer<typeof SpanSchema>;

/**
 * The state carried through the scan: the text shown so far, the spans found so
 * far, and how many characters of the marked text have been read.
 */
const ScanSchema = z
  .object({
    plain: z.string(),
    spans: z.array(SpanSchema).readonly(),
    consumed: z.number().int().nonnegative()
  })
  .readonly();

type Scan = z.infer<typeof ScanSchema>;

const scan = (marked: string): Scan => {
  return [...marked.matchAll(MARKER)].reduce<Scan>(
    (acc, match) => {
      const before = marked.slice(acc.consumed, match.index);
      const content = match[2] ?? '';
      const start = countGraphemes(acc.plain + before);

      return {
        plain: acc.plain + before + content,
        spans: [...acc.spans, { proposition: match[1] ?? '', start, end: start + countGraphemes(content) }],
        consumed: match.index + match[0].length
      };
    },
    { plain: '', spans: [], consumed: 0 }
  );
};

const findDuplicate = (spans: ReadonlyArray<Span>): string | undefined => {
  return spans.map((span) => span.proposition).find((proposition, index, all) => all.indexOf(proposition) !== index);
};

/**
 * A stimulus text in one language.
 *
 * Takes a text where each proposition is wrapped as `{p01:…}`, and gives
 * - `plain`: what the participant reads, with every marker removed;
 * - `spans`: in the order they appear, where each proposition is written.
 *
 * Fails when a brace is left that is not part of a marker (a nested or broken
 * marker), or when one proposition is marked more than once.
 */
const StimulusTextSchema = z
  .string()
  .transform((marked, context) => {
    if (/[{}]/.test(marked.replaceAll(MARKER, ''))) {
      context.addIssue({ code: 'custom', message: 'the text has a brace that is not part of a {pNN:…} marker' });

      return z.NEVER;
    }

    const scanned = scan(marked);
    const duplicate = findDuplicate(scanned.spans);

    if (!Type.isUndefined(duplicate)) {
      context.addIssue({ code: 'custom', message: `proposition ${duplicate} is marked more than once` });

      return z.NEVER;
    }

    return { plain: scanned.plain + marked.slice(scanned.consumed), spans: scanned.spans };
  })
  .pipe(
    z
      .object({
        plain: z.string(),
        spans: z.array(PropositionSpanSchema).readonly()
      })
      .readonly()
  );

export type StimulusText = z.infer<typeof StimulusTextSchema>;

export const StimulusText = {
  schema: StimulusTextSchema,

  PropositionID: {
    schema: PropositionIDSchema
  },

  PropositionSpan: {
    schema: PropositionSpanSchema
  },

  parse: (marked: string): Either<ParseError, StimulusText> => {
    const parsed = StimulusTextSchema.safeParse(marked);

    if (!parsed.success) {
      return left(createParseError(parsed.error.issues.map((issue) => issue.message).join('; ')));
    }

    return right(parsed.data);
  }
} as const;
