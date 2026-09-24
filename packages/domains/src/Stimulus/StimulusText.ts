import { createParseError, type ParseError } from '@rlyeh/lib/Error';
import { Type } from '@rlyeh/lib/Type';
import { type Either, left, right } from 'fp-ts/lib/Either.js';
import { z } from 'zod';
import { Proposition } from './Proposition.js';

/**
 * Where a proposition is written in the text, counted in graphemes from the
 * start of the text shown to the participant (AGENTS.md §10.1). `end` is
 * exclusive.
 */
const PropositionSpanSchema = z
  .object({
    proposition: Proposition.ID.schema,
    start: z.number().int().nonnegative(),
    end: z.number().int().nonnegative()
  })
  .readonly();

export type PropositionSpan = z.infer<typeof PropositionSpanSchema>;

const SEGMENTER = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

const countGraphemes = (value: string): number => {
  return [...SEGMENTER.segment(value)].length;
};

/**
 * Where a quote was found in the text, in UTF-16 code units, before it is
 * turned into graphemes.
 */
const LocationSchema = z
  .object({
    proposition: Proposition.ID.schema,
    from: z.number().int().nonnegative(),
    to: z.number().int().nonnegative()
  })
  .readonly();

type Location = z.infer<typeof LocationSchema>;

const occurrencesOf = (text: string, quote: string): ReadonlyArray<number> => {
  const first = text.indexOf(quote);

  if (first === -1) {
    return [];
  }

  const second = text.indexOf(quote, first + 1);

  if (second === -1) {
    return [first];
  }

  return [first, second];
};

const toSpan = (text: string, location: Location): PropositionSpan => {
  const start = countGraphemes(text.slice(0, location.from));

  return {
    proposition: location.proposition,
    start,
    end: start + countGraphemes(text.slice(location.from, location.to))
  };
};

/**
 * A stimulus text in one language.
 *
 * Takes
 * - `text`: the text as the participant reads it;
 * - `spans`: for each proposition, the part of `text` that states it, quoted
 *   exactly;
 *
 * and gives
 * - `plain`: the text as it is;
 * - `spans`: in the order they appear, where each proposition is written.
 *
 * Fails when a quote is not in the text, appears more than once (quote a longer
 * part so it is unique), or overlaps another quote.
 */
const StimulusTextSchema = z
  .object({
    text: z.string().min(1),
    spans: z.record(Proposition.ID.schema, z.string().min(1))
  })
  .transform((input, context): Readonly<{ plain: string; spans: ReadonlyArray<PropositionSpan> }> => {
    const located = Object.entries(input.spans).flatMap(([proposition, quote]) => {
      const occurrences = occurrencesOf(input.text, quote);

      if (occurrences.length === 0) {
        context.addIssue({ code: 'custom', message: `the quote of ${proposition} is not in the text` });

        return [];
      }
      if (occurrences.length > 1) {
        context.addIssue({ code: 'custom', message: `the quote of ${proposition} appears more than once; quote a longer part` });

        return [];
      }

      const from = occurrences[0] ?? 0;

      return [LocationSchema.parse({ proposition, from, to: from + quote.length })];
    });
    const ordered = located.toSorted((a, b) => a.from - b.from);

    ordered.forEach((location, index) => {
      const next = ordered[index + 1];

      if (!Type.isUndefined(next) && location.to > next.from) {
        context.addIssue({ code: 'custom', message: `the quotes of ${location.proposition} and ${next.proposition} overlap` });
      }
    });

    return { plain: input.text, spans: ordered.map((location) => toSpan(input.text, location)) };
  });

export type StimulusText = z.infer<typeof StimulusTextSchema>;

export const StimulusText = {
  schema: StimulusTextSchema,

  PropositionSpan: {
    schema: PropositionSpanSchema
  },

  parse: (value: unknown): Either<ParseError, StimulusText> => {
    const parsed = StimulusTextSchema.safeParse(value);

    if (!parsed.success) {
      return left(createParseError(parsed.error.issues.map((issue) => issue.message).join('; ')));
    }

    return right(parsed.data);
  }
} as const;
