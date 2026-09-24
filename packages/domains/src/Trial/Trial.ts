import { DateTime } from '@rlyeh/lib/DateTime';
import { type Nullable, Type } from '@rlyeh/lib/Type';
import { type Either, left, right } from 'fp-ts/lib/Either.js';
import { z } from 'zod';
import { NOT_IN_TEXT, type OptionID, Question, type QuestionID, UNANSWERED } from '../Stimulus/Question.js';
import { Stimulus } from '../Stimulus/Stimulus.js';
import { Response } from './Response.js';

/**
 * The text is shown for two seconds (AGENTS.md §2.3). The first question is not
 * handed out before that, so no one can read the questions first and then look
 * for their answers in the text (AGENTS.md §14.15).
 */
export const PRESENTATION_MILLISECONDS = 2000;

/**
 * Each question must be answered within fifteen seconds of being handed out
 * (AGENTS.md §14.2).
 */
export const ANSWER_LIMIT_MILLISECONDS = 15000;

/**
 * - `pending`: not started.
 * - `presenting`: the text was handed out at `presentedAt`.
 * - `questioning`: the question at `responses.length` was handed out at `issuedAt`.
 * - `completed`: every question has a response.
 * - `abandoned`: the participant left before completing (AGENTS.md §14.3).
 */
const TrialStateSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('pending') }).readonly(),
  z.object({ kind: z.literal('presenting'), presentedAt: DateTime.schema }).readonly(),
  z.object({ kind: z.literal('questioning'), presentedAt: DateTime.schema, issuedAt: DateTime.schema }).readonly(),
  z.object({ kind: z.literal('completed'), presentedAt: DateTime.schema, completedAt: DateTime.schema }).readonly(),
  z.object({ kind: z.literal('abandoned'), abandonedAt: DateTime.schema }).readonly()
]);

export type TrialState = z.infer<typeof TrialStateSchema>;

/**
 * One stimulus taken by one participant (AGENTS.md §14.2).
 *
 * - `questionOrder` and `optionOrders` are the shuffled orders the questions and
 *   options are shown in. Shuffling happens outside, so the model stays
 *   deterministic.
 * - `responses` follow `questionOrder`.
 *
 * Every transition takes the current time from the server; a time sent by the
 * client is never used to decide a transition (AGENTS.md §14.15).
 */
const TrialSchema = z
  .object({
    stimulus: Stimulus.ID.schema,
    questionOrder: z.array(Question.ID.schema).min(1).readonly(),
    optionOrders: z.record(Question.ID.schema, z.array(Question.OptionID.schema).length(5).readonly()).readonly(),
    responses: z.array(Response.schema).readonly(),
    state: TrialStateSchema
  })
  .readonly();

export type Trial = z.infer<typeof TrialSchema>;

export type TrialError = Readonly<{
  error: 'TrialError';
  message: string;
}>;

const trialError = (message: string): TrialError => {
  return { error: 'TrialError', message };
};

export type CreateTrial = Readonly<{
  stimulus: Trial['stimulus'];
  questionOrder: ReadonlyArray<QuestionID>;
  optionOrders: Readonly<Record<QuestionID, ReadonlyArray<OptionID>>>;
}>;

const optionOrderOf = (trial: Trial, question: QuestionID): ReadonlyArray<OptionID> => {
  return trial.optionOrders[question] ?? [];
};

/**
 * A choice made after the limit, or no choice at all, is recorded as
 * unanswered.
 */
const settle = (choice: Nullable<OptionID | typeof NOT_IN_TEXT>, issuedAt: DateTime, now: DateTime): Response['choice'] => {
  if (Type.isNull(choice) || now.millisecondsSince(issuedAt) > ANSWER_LIMIT_MILLISECONDS) {
    return UNANSWERED;
  }

  return choice;
};

const answeredAtOf = (choice: Response['choice'], now: DateTime): Nullable<DateTime> => {
  if (choice === UNANSWERED) {
    return null;
  }

  return now;
};

export const Trial = {
  schema: TrialSchema,

  create: (params: CreateTrial): Trial => {
    return {
      stimulus: params.stimulus,
      questionOrder: params.questionOrder,
      optionOrders: params.optionOrders,
      responses: [],
      state: { kind: 'pending' }
    };
  },

  /**
   * The question the participant is answering now.
   */
  currentQuestion: (trial: Trial): Either<TrialError, QuestionID> => {
    const question = trial.questionOrder[trial.responses.length];

    if (trial.state.kind !== 'questioning' || Type.isUndefined(question)) {
      return left(trialError('no question is being answered'));
    }

    return right(question);
  },

  present: (trial: Trial, now: DateTime): Either<TrialError, Trial> => {
    if (trial.state.kind !== 'pending') {
      return left(trialError(`cannot present a ${trial.state.kind} trial`));
    }

    return right({ ...trial, state: { kind: 'presenting', presentedAt: now } });
  },

  startQuestions: (trial: Trial, now: DateTime): Either<TrialError, Trial> => {
    if (trial.state.kind !== 'presenting') {
      return left(trialError(`cannot start questions on a ${trial.state.kind} trial`));
    }
    if (now.millisecondsSince(trial.state.presentedAt) < PRESENTATION_MILLISECONDS) {
      return left(trialError('the text is still being presented'));
    }

    return right({ ...trial, state: { kind: 'questioning', presentedAt: trial.state.presentedAt, issuedAt: now } });
  },

  /**
   * Records the choice for the current question and hands out the next one, or
   * completes the trial after the last. `null` means the client reports that the
   * time ran out.
   */
  answer: (trial: Trial, choice: Nullable<OptionID | typeof NOT_IN_TEXT>, now: DateTime): Either<TrialError, Trial> => {
    const question = trial.questionOrder[trial.responses.length];

    if (trial.state.kind !== 'questioning' || Type.isUndefined(question)) {
      return left(trialError(`cannot answer a ${trial.state.kind} trial`));
    }

    const optionOrder = optionOrderOf(trial, question);

    if (!Type.isNull(choice) && choice !== NOT_IN_TEXT && !optionOrder.includes(choice)) {
      return left(trialError(`${choice} is not an option of ${question}`));
    }

    const settled = settle(choice, trial.state.issuedAt, now);
    const response: Response = {
      question,
      optionOrder,
      choice: settled,
      issuedAt: trial.state.issuedAt,
      answeredAt: answeredAtOf(settled, now)
    };
    const responses = [...trial.responses, response];

    if (responses.length < trial.questionOrder.length) {
      return right({ ...trial, responses, state: { kind: 'questioning', presentedAt: trial.state.presentedAt, issuedAt: now } });
    }

    return right({ ...trial, responses, state: { kind: 'completed', presentedAt: trial.state.presentedAt, completedAt: now } });
  },

  abandon: (trial: Trial, now: DateTime): Either<TrialError, Trial> => {
    if (trial.state.kind === 'completed' || trial.state.kind === 'abandoned') {
      return left(trialError(`cannot abandon a ${trial.state.kind} trial`));
    }

    return right({ ...trial, state: { kind: 'abandoned', abandonedAt: now } });
  }
} as const;
