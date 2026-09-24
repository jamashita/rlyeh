import { createParseError, type ParseError } from '@rlyeh/lib/Error';
import { Type } from '@rlyeh/lib/Type';
import { type Either, left, right } from 'fp-ts/lib/Either.js';
import { z } from 'zod';
import { Language, type LanguageTag } from '../Language/Language.js';
import { StimulusText } from './StimulusText.js';

const StimulusIDSchema = z.string().min(1).brand<'StimulusID'>();

export type StimulusID = z.infer<typeof StimulusIDSchema>;

const QuestionIDSchema = z
  .string()
  .regex(/^q\d{2}$/)
  .brand<'QuestionID'>();

export type QuestionID = z.infer<typeof QuestionIDSchema>;

/**
 * The answer "the text does not say" (本文からはわからない). It is always shown as
 * the last choice, after the five concrete options (AGENTS.md §6).
 */
export const NOT_IN_TEXT = 'not-in-text';

const OptionIDSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .refine((value) => {
    return value !== NOT_IN_TEXT;
  })
  .brand<'OptionID'>();

/**
 * A concrete answer choice, shared by every language. The words shown for it
 * live in each language's locale.
 */
export type OptionID = z.infer<typeof OptionIDSchema>;

const LanguageTagSchema = z.custom<LanguageTag>((value) => {
  return Language.ALL.some((language) => {
    return Language.toTag(language) === value;
  });
});

const PropositionSchema = z
  .object({
    id: StimulusText.PropositionID.schema,
    summary: z.string().min(1)
  })
  .readonly();

/**
 * - `trope` tells whether the fact asked follows a common story pattern,
 *   departs from it, or has nothing to do with one (AGENTS.md §3.2).
 * - `answer` is one of `options`, or `not-in-text`.
 */
const QuestionSchema = z
  .object({
    id: QuestionIDSchema,
    proposition: StimulusText.PropositionID.schema,
    trope: z.enum(['follows', 'subverted', 'none']),
    answer: z.union([z.literal(NOT_IN_TEXT), OptionIDSchema]),
    options: z.array(OptionIDSchema).length(5).readonly()
  })
  .readonly();

const LocaleSchema = z
  .object({
    text: StimulusText.schema,
    notInText: z.string().min(1),
    questions: z.record(
      QuestionIDSchema,
      z
        .object({
          prompt: z.string().min(1),
          options: z.record(OptionIDSchema, z.string().min(1)).readonly()
        })
        .readonly()
    )
  })
  .readonly();

const sameMembers = (left: ReadonlyArray<string>, right: ReadonlyArray<string>): boolean => {
  return left.length === right.length && left.every((value) => right.includes(value));
};

const hasDuplicate = (values: ReadonlyArray<string>): boolean => {
  return new Set(values).size !== values.length;
};

/**
 * A text and its questions, in every offered language (AGENTS.md §10).
 *
 * Besides the shape of each field, it checks that the parts agree:
 * - ids of propositions and of questions are unique;
 * - every question asks about a proposition that exists, and its answer is
 *   one of its options or `not-in-text`;
 * - every offered language has a locale, and each locale marks every
 *   proposition exactly once and words every question and option.
 */
const StimulusSchema = z
  .object({
    id: StimulusIDSchema,
    role: z.enum(['practice', 'main']),
    propositions: z.array(PropositionSchema).min(1).readonly(),
    questions: z.array(QuestionSchema).min(1).readonly(),
    locales: z.record(LanguageTagSchema, LocaleSchema).readonly()
  })
  .readonly()
  .superRefine((stimulus, context) => {
    const propositionIDs = stimulus.propositions.map((proposition) => proposition.id);
    const questionIDs = stimulus.questions.map((question) => question.id);

    if (hasDuplicate(propositionIDs)) {
      context.addIssue({ code: 'custom', message: 'proposition ids are not unique' });
    }
    if (hasDuplicate(questionIDs)) {
      context.addIssue({ code: 'custom', message: 'question ids are not unique' });
    }
    for (const question of stimulus.questions) {
      if (!propositionIDs.includes(question.proposition)) {
        context.addIssue({ code: 'custom', message: `${question.id} asks about ${question.proposition}, which does not exist` });
      }
      if (question.answer !== NOT_IN_TEXT && !question.options.includes(question.answer)) {
        context.addIssue({ code: 'custom', message: `the answer of ${question.id} is not one of its options` });
      }
      if (hasDuplicate(question.options)) {
        context.addIssue({ code: 'custom', message: `the options of ${question.id} are not unique` });
      }
    }
    for (const language of Language.ALL) {
      const tag = Language.toTag(language);
      const locale = stimulus.locales[tag];

      if (Type.isUndefined(locale)) {
        context.addIssue({ code: 'custom', message: `the locale ${tag} is missing` });

        continue;
      }

      const marked = locale.text.spans.map((span) => span.proposition);

      if (!sameMembers(marked, propositionIDs)) {
        context.addIssue({ code: 'custom', message: `the text of ${tag} does not mark every proposition exactly once` });
      }
      if (!sameMembers(Object.keys(locale.questions), questionIDs)) {
        context.addIssue({ code: 'custom', message: `the questions of ${tag} do not match the question ids` });
      }
      for (const question of stimulus.questions) {
        const worded = locale.questions[question.id];

        if (!Type.isUndefined(worded) && !sameMembers(Object.keys(worded.options), question.options)) {
          context.addIssue({ code: 'custom', message: `the options of ${question.id} in ${tag} do not match its option ids` });
        }
      }
    }
  });

export type Stimulus = z.infer<typeof StimulusSchema>;
export type StimulusLocale = z.infer<typeof LocaleSchema>;
export type Question = z.infer<typeof QuestionSchema>;

export const Stimulus = {
  schema: StimulusSchema,

  /**
   * Builds a stimulus from values read from a stimulus file, validating every
   * field and how the parts agree.
   */
  of: (value: unknown): Either<ParseError, Stimulus> => {
    const parsed = StimulusSchema.safeParse(value);

    if (!parsed.success) {
      return left(createParseError(`not a valid stimulus: ${parsed.error.message}`));
    }

    return right(parsed.data);
  },

  /**
   * The locale for an offered language. Every offered language has one once a
   * stimulus passed `of`, so this never fails.
   */
  localeOf: (stimulus: Stimulus, language: Language): StimulusLocale => {
    return stimulus.locales[Language.toTag(language)];
  }
} as const;
