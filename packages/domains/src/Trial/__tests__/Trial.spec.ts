import { DateTime } from '@rlyeh/lib/DateTime';
import { type Either, isRight } from 'fp-ts/lib/Either.js';
import { Question } from '../../Stimulus/Question.js';
import { Stimulus } from '../../Stimulus/Stimulus.js';
import { ANSWER_LIMIT_MILLISECONDS, PRESENTATION_MILLISECONDS, Trial, type TrialError } from '../Trial.js';

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

const pending = (): Trial => {
  return Trial.create({
    stimulus: Stimulus.ID.schema.parse('sample'),
    questionOrder: [q02, q01],
    optionOrders: { [q01]: q01Options, [q02]: q02Options }
  });
};

const presenting = (): Trial => unwrap(Trial.present(pending(), T0));

const questioning = (): Trial => unwrap(Trial.startQuestions(presenting(), at(PRESENTATION_MILLISECONDS)));

const completed = (): Trial => {
  const first = unwrap(Trial.answer(questioning(), option('tree'), at(3000)));

  return unwrap(Trial.answer(first, option('woman'), at(4000)));
};

const abandoned = (): Trial => unwrap(Trial.abandon(presenting(), at(500)));

const expectTrialError = (result: Either<TrialError, unknown>): void => {
  expect(result).toMatchObject({ _tag: 'Left', left: { error: 'TrialError' } });
};

describe('Trial', () => {
  describe('create', () => {
    it('starts pending without responses', () => {
      const trial = pending();

      expect(trial.state).toStrictEqual({ kind: 'pending' });
      expect(trial.responses).toStrictEqual([]);
      expect(trial.questionOrder).toStrictEqual(['q02', 'q01']);
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
      expectTrialError(Trial.present(make(), at(10000)));
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
        left: { error: 'TrialError', message: 'the text is still being presented' }
      });
    });

    it.each`
      name             | make
      ${'pending'}     | ${pending}
      ${'questioning'} | ${questioning}
      ${'completed'}   | ${completed}
      ${'abandoned'}   | ${abandoned}
    `('fails on a $name trial', ({ make }: { make: () => Trial }) => {
      expectTrialError(Trial.startQuestions(make(), at(10000)));
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
      expectTrialError(Trial.currentQuestion(trial));
    });

    it('fails for a choice that is not an option of the current question', () => {
      expect(Trial.answer(questioning(), option('woman'), at(3000))).toStrictEqual({
        _tag: 'Left',
        left: { error: 'TrialError', message: 'woman is not an option of q02' }
      });
    });

    it.each`
      name            | make
      ${'pending'}    | ${pending}
      ${'presenting'} | ${presenting}
      ${'completed'}  | ${completed}
      ${'abandoned'}  | ${abandoned}
    `('fails on a $name trial', ({ make }: { make: () => Trial }) => {
      expectTrialError(Trial.answer(make(), option('tree'), at(3000)));
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
      expectTrialError(Trial.abandon(make(), at(9000)));
    });
  });

  describe('currentQuestion', () => {
    it.each`
      name            | make
      ${'pending'}    | ${pending}
      ${'presenting'} | ${presenting}
      ${'abandoned'}  | ${abandoned}
    `('fails on a $name trial', ({ make }: { make: () => Trial }) => {
      expectTrialError(Trial.currentQuestion(make()));
    });
  });

  describe('schema', () => {
    it('rebuilds a trial read back from storage', () => {
      const stored = JSON.parse(JSON.stringify(completed()));

      expect(Trial.schema.parse(stored)).toStrictEqual(completed());
    });
  });
});
