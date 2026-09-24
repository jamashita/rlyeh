/**
 * - `INVALID_QUESTION_ORDER`: the question order is not a shuffle of the
 *   stimulus' questions.
 * - `INVALID_OPTION_ORDER`: an option order is not a shuffle of its question's
 *   options.
 * - `INVALID_TRIAL`: values read back from storage do not form a valid trial.
 * - `INVALID_STATE`: the trial is not in a state that allows the operation, such
 *   as presenting the text a second time.
 * - `STILL_PRESENTING`: questions were asked for before the text had been shown
 *   for its full time.
 * - `UNKNOWN_OPTION`: the choice is not one of the current question's options.
 */
type Detail = 'INVALID_QUESTION_ORDER' | 'INVALID_OPTION_ORDER' | 'INVALID_TRIAL' | 'INVALID_STATE' | 'STILL_PRESENTING' | 'UNKNOWN_OPTION';

/**
 * A trial was asked to do something its state or its stimulus does not allow.
 */
export type TrialError = Readonly<{
  error: 'TrialError';
  detail: Detail;
  message: string;
}>;

export const createTrialError = (detail: Detail, message: string): TrialError => {
  return {
    error: 'TrialError',
    detail,
    message
  } satisfies TrialError;
};
