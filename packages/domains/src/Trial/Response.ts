import { DateTime } from '@rlyeh/lib/DateTime';
import { z } from 'zod';
import { NOT_IN_TEXT, Question, UNANSWERED } from '../Stimulus/Question.js';

/**
 * What the participant chose: one of the five options, "the text does not say",
 * or nothing within the time limit.
 */
const ChoiceSchema = z.union([z.literal(NOT_IN_TEXT), z.literal(UNANSWERED), Question.OptionID.schema]);

export type Choice = z.infer<typeof ChoiceSchema>;

/**
 * The answer to one question in a trial (AGENTS.md §14.9).
 *
 * - `optionOrder` is the order the five options were shown in; "the text does
 *   not say" is always shown last and is not included.
 * - `issuedAt` is when the server handed the question out, which starts its
 *   time limit.
 * - `answeredAt` is when the server received the choice; it is `null` when no
 *   choice arrived in time.
 *
 * Whether the choice is correct is not stored; it is derived from the question
 * with `isCorrect`, on the server only (AGENTS.md §14.15).
 */
const ResponseSchema = z
  .object({
    question: Question.ID.schema,
    optionOrder: z.array(Question.OptionID.schema).length(5).readonly(),
    choice: ChoiceSchema,
    issuedAt: DateTime.schema,
    answeredAt: DateTime.schema.nullable()
  })
  .readonly();

export type Response = z.infer<typeof ResponseSchema>;

export const Response = {
  schema: ResponseSchema,

  Choice: {
    schema: ChoiceSchema
  },

  isCorrect: (response: Response, question: Question): boolean => {
    return response.choice === question.answer;
  }
} as const;
