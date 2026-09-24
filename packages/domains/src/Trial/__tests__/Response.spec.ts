import { Question } from '../../Stimulus/Question.js';
import { Response } from '../Response.js';

const question = Question.schema.parse({
  id: 'q01',
  proposition: 'p01',
  trope: 'subverted',
  answer: 'woman',
  options: ['man', 'woman', 'elder', 'blacksmith', 'shepherd']
});

const notInTextQuestion = Question.schema.parse({
  id: 'q02',
  proposition: 'p02',
  trope: 'none',
  answer: 'not-in-text',
  options: ['ten-years', 'fifty-years', 'hundred-years', 'twenty-years', 'thirty-years']
});

const response = (question: string, choice: string) => {
  return Response.schema.parse({
    question,
    optionOrder: ['man', 'woman', 'elder', 'blacksmith', 'shepherd'],
    choice,
    issuedAt: '2026-09-24T00:00:00.000Z',
    answeredAt: null
  });
};

describe('Response', () => {
  describe('Choice', () => {
    it.each`
      value            | expected
      ${'woman'}       | ${true}
      ${'not-in-text'} | ${true}
      ${'unanswered'}  | ${true}
      ${'Woman'}       | ${false}
      ${''}            | ${false}
    `('returns $expected for $value', ({ value, expected }: { value: string; expected: boolean }) => {
      expect(Response.Choice.schema.safeParse(value).success).toBe(expected);
    });
  });

  describe('isCorrect', () => {
    it.each`
      target               | choice           | expected
      ${question}          | ${'woman'}       | ${true}
      ${question}          | ${'man'}         | ${false}
      ${question}          | ${'not-in-text'} | ${false}
      ${question}          | ${'unanswered'}  | ${false}
      ${notInTextQuestion} | ${'not-in-text'} | ${true}
      ${notInTextQuestion} | ${'ten-years'}   | ${false}
      ${notInTextQuestion} | ${'unanswered'}  | ${false}
    `(
      'returns $expected when $choice is chosen for $target.id',
      ({ target, choice, expected }: { target: Question; choice: string; expected: boolean }) => {
        expect(Response.isCorrect(response(target.id, choice), target)).toBe(expected);
      }
    );
  });
});
