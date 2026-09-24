import { z } from 'zod';
import { Proposition } from './Proposition.js';

const QuestionIDSchema = z
  .string()
  .regex(/^q\d{2}$/)
  .brand<'QuestionID'>();

/**
 * `q01`, `q02` and so on.
 */
export type QuestionID = z.infer<typeof QuestionIDSchema>;

/**
 * The answer "the text does not say" (本文からはわからない). It is always shown as
 * the last choice, after the five concrete options (AGENTS.md §6).
 */
export const NOT_IN_TEXT = 'not-in-text';

/**
 * Recorded when no choice was made within the time limit (AGENTS.md §14.2). It
 * is never shown as a choice.
 */
export const UNANSWERED = 'unanswered';

const OptionIDSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .refine((value) => {
    return value !== NOT_IN_TEXT && value !== UNANSWERED;
  })
  .brand<'OptionID'>();

/**
 * A concrete answer choice, shared by every language. The words shown for it
 * live in each language's locale.
 */
export type OptionID = z.infer<typeof OptionIDSchema>;

/**
 * A question about one proposition, shared by every language.
 *
 * - `trope` tells whether the fact asked follows a common story pattern,
 *   departs from it, or has nothing to do with one (AGENTS.md §3.2).
 * - `answer` is one of `options`, or `not-in-text`. Whether it really is one of
 *   `options` is checked with the whole stimulus.
 * - `options` are the five concrete choices.
 */
const QuestionSchema = z
  .object({
    id: QuestionIDSchema,
    proposition: Proposition.ID.schema,
    trope: z.enum(['follows', 'subverted', 'none']),
    answer: z.union([z.literal(NOT_IN_TEXT), OptionIDSchema]),
    options: z.array(OptionIDSchema).length(5).readonly()
  })
  .readonly();

export type Question = z.infer<typeof QuestionSchema>;

export const Question = {
  schema: QuestionSchema,

  ID: {
    schema: QuestionIDSchema
  },

  OptionID: {
    schema: OptionIDSchema
  }
} as const;
