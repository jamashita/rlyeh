import { DateTime } from '@rlyeh/lib/DateTime';
import { type Either, isRight } from 'fp-ts/lib/Either.js';
import { Question } from '../../Stimulus/Question.js';
import { Stimulus } from '../../Stimulus/Stimulus.js';
import { ANSWER_LIMIT_MILLISECONDS, PRESENTATION_MILLISECONDS, Trial } from '../Trial.js';
import type { TrialError } from '../TrialError.js';

const T0 = DateTime.schema.parse('2026-09-24T00:00:00.000Z');

const at = (milliseconds: number): DateTime => {
  return T0.plusMilliseconds(milliseconds);
};

const q01 = Question.ID.schema.parse('q01');
const q02 = Question.ID.schema.parse('q02');
const option = (value: string) => Question.OptionID.schema.parse(value);

const q01Options = ['woman', 'man', 'elder', 'blacksmith', 'shepherd'].map(option);
const q02Options = ['tree', 'river', 'well', 'rock', 'fence'].map(option);

const unwrap = (result: Either<TrialError, Trial>): Trial => {
  if (!isRight(result)) {
    throw new Error(`unexpected failure: ${result.left.message}`);
  }

  return result.right;
};

const stimulus = {
  id: Stimulus.ID.schema.parse('sample'),
  questions: [
    Question.schema.parse({
      id: 'q01',
      proposition: 'p01',
      trope: 'subverted',
      answer: 'woman',
      options: ['man', 'woman', 'elder', 'blacksmith', 'shepherd']
    }),
    Question.schema.parse({ id: 'q02', proposition: 'p02', trope: 'follows', answer: 'tree', options: ['tree', 'river', 'well', 'rock', 'fence'] })
  ]
};

const pending = (): Trial => {
  return unwrap(Trial.create({ stimulus, questionOrder: [q02, q01], optionOrders: { [q01]: q01Options, [q02]: q02Options } }));
};

const presenting = (): Trial => unwrap(Trial.present(pending(), T0));

const questioning = (): Trial => unwrap(Trial.startQuestions(presenting(), at(PRESENTATION_MILLISECONDS)));

const completed = (): Trial => {
  const first = unwrap(Trial.answer(questioning(), option('tree'), at(3000)));

  return unwrap(Trial.answer(first, option('woman'), at(4000)));
};

const abandoned = (): Trial => unwrap(Trial.abandon(presenting(), at(500)));

const expectTrialError = (result: Either<TrialError, unknown>, detail: TrialError['detail']): void => {
  expect(result).toMatchObject({ _tag: 'Left', left: { error: 'TrialError', detail } });
};

describe('Trial', () => {
  describe('create', () => {
    it('starts pending without responses', () => {
      const trial = pending();

      expect(trial.stimulus).toBe('sample');
      expect(trial.state).toStrictEqual({ kind: 'pending' });
      expect(trial.responses).toStrictEqual([]);
      expect(trial.questionOrder).toStrictEqual(['q02', 'q01']);
    });

    it.each`
      case                         | questionOrder
      ${'a question is missing'}   | ${[q01]}
      ${'a question is repeated'}  | ${[q01, q01]}
      ${'a question is not in it'} | ${[q01, Question.ID.schema.parse('q03')]}
    `('fails when $case in questionOrder', ({ questionOrder }: { questionOrder: Array<typeof q01> }) => {
      expect(Trial.create({ stimulus, questionOrder, optionOrders: { [q01]: q01Options, [q02]: q02Options } })).toStrictEqual({
        _tag: 'Left',
        left: { error: 'TrialError', detail: 'INVALID_QUESTION_ORDER', message: 'questionOrder is not a shuffle of the questions of sample' }
      });
    });

    it.each`
      case                        | options
      ${'an option is missing'}   | ${['woman', 'man', 'elder', 'blacksmith'].map(option)}
      ${'an option is repeated'}  | ${['woman', 'woman', 'elder', 'blacksmith', 'shepherd'].map(option)}
      ${'an option is not in it'} | ${['woman', 'man', 'elder', 'blacksmith', 'child'].map(option)}
    `('fails when $case in an option order', ({ options }: { options: typeof q01Options }) => {
      expect(Trial.create({ stimulus, questionOrder: [q02, q01], optionOrders: { [q01]: options, [q02]: q02Options } })).toStrictEqual({
        _tag: 'Left',
        left: { error: 'TrialError', detail: 'INVALID_OPTION_ORDER', message: 'the option order of q01 is not a shuffle of its options' }
      });
    });

    it('fails when a question has no option order', () => {
      expect(Trial.create({ stimulus, questionOrder: [q02, q01], optionOrders: { [q02]: q02Options } })).toStrictEqual({
        _tag: 'Left',
        left: { error: 'TrialError', detail: 'INVALID_OPTION_ORDER', message: 'the option order of q01 is not a shuffle of its options' }
      });
    });
  });

  describe('present', () => {
    it('records when the text was handed out', () => {
      expect(presenting().state).toStrictEqual({ kind: 'presenting', presentedAt: T0 });
    });

    it.each`
      name             | make
      ${'presenting'}  | ${presenting}
      ${'questioning'} | ${questioning}
      ${'completed'}   | ${completed}
      ${'abandoned'}   | ${abandoned}
    `('fails on a $name trial, so the text is handed out only once', ({ make }: { make: () => Trial }) => {
      expectTrialError(Trial.present(make(), at(10000)), 'INVALID_STATE');
    });
  });

  describe('startQuestions', () => {
    it('hands out the first question once the text has been shown for two seconds', () => {
      const trial = questioning();

      expect(trial.state).toStrictEqual({ kind: 'questioning', presentedAt: T0, issuedAt: at(PRESENTATION_MILLISECONDS) });
      expect(Trial.currentQuestion(trial)).toStrictEqual({ _tag: 'Right', right: 'q02' });
    });

    it('fails while the text is still being presented', () => {
      expect(Trial.startQuestions(presenting(), at(PRESENTATION_MILLISECONDS - 1))).toStrictEqual({
        _tag: 'Left',
        left: { error: 'TrialError', detail: 'STILL_PRESENTING', message: 'the text is still being presented' }
      });
    });

    it.each`
      name             | make
      ${'pending'}     | ${pending}
      ${'questioning'} | ${questioning}
      ${'completed'}   | ${completed}
      ${'abandoned'}   | ${abandoned}
    `('fails on a $name trial', ({ make }: { make: () => Trial }) => {
      expectTrialError(Trial.startQuestions(make(), at(10000)), 'INVALID_STATE');
    });
  });

  describe('answer', () => {
    const issuedAt = at(PRESENTATION_MILLISECONDS);

    it('records the choice and hands out the next question', () => {
      const trial = unwrap(Trial.answer(questioning(), option('tree'), at(3000)));

      expect(trial.responses).toStrictEqual([{ question: 'q02', optionOrder: q02Options, choice: 'tree', issuedAt, answeredAt: at(3000) }]);
      expect(trial.state).toStrictEqual({ kind: 'questioning', presentedAt: T0, issuedAt: at(3000) });
      expect(Trial.currentQuestion(trial)).toStrictEqual({ _tag: 'Right', right: 'q01' });
    });

    it('accepts "the text does not say"', () => {
      const trial = unwrap(Trial.answer(questioning(), 'not-in-text', at(3000)));

      expect(trial.responses[0]?.choice).toBe('not-in-text');
    });

    it('accepts a choice exactly at the time limit', () => {
      const trial = unwrap(Trial.answer(questioning(), option('tree'), issuedAt.plusMilliseconds(ANSWER_LIMIT_MILLISECONDS)));

      expect(trial.responses[0]?.choice).toBe('tree');
    });

    it('records a choice that arrives after the time limit as unanswered', () => {
      const late = issuedAt.plusMilliseconds(ANSWER_LIMIT_MILLISECONDS + 1);
      const trial = unwrap(Trial.answer(questioning(), option('tree'), late));

      expect(trial.responses[0]).toStrictEqual({ question: 'q02', optionOrder: q02Options, choice: 'unanswered', issuedAt, answeredAt: null });
      expect(trial.state).toStrictEqual({ kind: 'questioning', presentedAt: T0, issuedAt: late });
    });

    it('records the time running out as unanswered', () => {
      const trial = unwrap(Trial.answer(questioning(), null, at(3000)));

      expect(trial.responses[0]).toMatchObject({ choice: 'unanswered', answeredAt: null });
    });

    it('completes the trial after the last question', () => {
      const trial = completed();

      expect(trial.responses.map((response) => [response.question, response.choice])).toStrictEqual([
        ['q02', 'tree'],
        ['q01', 'woman']
      ]);
      expect(trial.state).toStrictEqual({ kind: 'completed', presentedAt: T0, completedAt: at(4000) });
      expectTrialError(Trial.currentQuestion(trial), 'INVALID_STATE');
    });

    it('fails for a choice that is not an option of the current question', () => {
      expect(Trial.answer(questioning(), option('woman'), at(3000))).toStrictEqual({
        _tag: 'Left',
        left: { error: 'TrialError', detail: 'UNKNOWN_OPTION', message: 'woman is not an option of q02' }
      });
    });

    it.each`
      name            | make
      ${'pending'}    | ${pending}
      ${'presenting'} | ${presenting}
      ${'completed'}  | ${completed}
      ${'abandoned'}  | ${abandoned}
    `('fails on a $name trial', ({ make }: { make: () => Trial }) => {
      expectTrialError(Trial.answer(make(), option('tree'), at(3000)), 'INVALID_STATE');
    });
  });

  describe('abandon', () => {
    it.each`
      name             | make
      ${'pending'}     | ${pending}
      ${'presenting'}  | ${presenting}
      ${'questioning'} | ${questioning}
    `('abandons a $name trial and keeps its responses', ({ make }: { make: () => Trial }) => {
      const trial = make();
      const result = unwrap(Trial.abandon(trial, at(9000)));

      expect(result.state).toStrictEqual({ kind: 'abandoned', abandonedAt: at(9000) });
      expect(result.responses).toStrictEqual(trial.responses);
    });

    it.each`
      name           | make
      ${'completed'} | ${completed}
      ${'abandoned'} | ${abandoned}
    `('fails on a $name trial', ({ make }: { make: () => Trial }) => {
      expectTrialError(Trial.abandon(make(), at(9000)), 'INVALID_STATE');
    });
  });

  describe('currentQuestion', () => {
    it.each`
      name            | make
      ${'pending'}    | ${pending}
      ${'presenting'} | ${presenting}
      ${'abandoned'}  | ${abandoned}
    `('fails on a $name trial', ({ make }: { make: () => Trial }) => {
      expectTrialError(Trial.currentQuestion(make()), 'INVALID_STATE');
    });
  });

  describe('of', () => {
    const stored = () => JSON.parse(JSON.stringify(completed()));

    it('rebuilds a trial read back from storage', () => {
      expect(Trial.of(stored())).toStrictEqual({ _tag: 'Right', right: completed() });
    });

    it.each`
      case                                                | change
      ${'questionOrder repeats a question'}               | ${(value: Record<string, unknown>) => ({ ...value, questionOrder: ['q01', 'q01'] })}
      ${'optionOrders does not match questionOrder'}      | ${(value: Record<string, unknown>) => ({ ...value, optionOrders: { q01: q01Options } })}
      ${'an option order repeats an option'}              | ${(value: Record<string, unknown>) => ({ ...value, optionOrders: { q01: ['woman', 'woman', 'elder', 'blacksmith', 'shepherd'], q02: q02Options } })}
      ${'responses answer questions out of order'}        | ${(value: { responses: Array<unknown> }) => ({ ...value, responses: [...value.responses].reverse() })}
      ${'there are more responses than questions'}        | ${(value: { responses: Array<unknown> }) => ({ ...value, responses: [...value.responses, ...value.responses] })}
      ${'a response was shown with another option order'} | ${(value: { responses: Array<Record<string, unknown>> }) => ({ ...value, responses: value.responses.map((response) => ({ ...response, optionOrder: q01Options })) })}
    `('fails when $case', ({ change }: { change: (value: never) => unknown }) => {
      expectTrialError(Trial.of(change(stored() as never)), 'INVALID_TRIAL');
    });
  });
});
