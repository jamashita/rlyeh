import { NOT_IN_TEXT, Question, UNANSWERED } from '../Question.js';

const valid = {
  id: 'q01',
  proposition: 'p01',
  trope: 'subverted',
  answer: 'woman',
  options: ['man', 'woman', 'elder', 'blacksmith', 'shepherd']
};

describe('Question', () => {
  describe('ID', () => {
    it.each`
      value    | expected
      ${'q01'} | ${true}
      ${'q1'}  | ${false}
      ${'p01'} | ${false}
    `('returns $expected for $value', ({ value, expected }: { value: string; expected: boolean }) => {
      expect(Question.ID.schema.safeParse(value).success).toBe(expected);
    });
  });

  describe('OptionID', () => {
    it.each`
      value                  | expected
      ${'woman'}             | ${true}
      ${'woman-approached'}  | ${true}
      ${'two-hundred-years'} | ${true}
      ${NOT_IN_TEXT}         | ${false}
      ${UNANSWERED}          | ${false}
      ${'Woman'}             | ${false}
      ${'woman_approached'}  | ${false}
      ${'-woman'}            | ${false}
      ${''}                  | ${false}
    `('returns $expected for $value', ({ value, expected }: { value: string; expected: boolean }) => {
      expect(Question.OptionID.schema.safeParse(value).success).toBe(expected);
    });
  });

  describe('schema', () => {
    it('accepts a question whose answer is one of the options', () => {
      expect(Question.schema.safeParse(valid).success).toBe(true);
    });

    it('accepts not-in-text as the answer', () => {
      expect(Question.schema.safeParse({ ...valid, answer: NOT_IN_TEXT }).success).toBe(true);
    });

    it.each`
      field            | value
      ${'id'}          | ${'x01'}
      ${'proposition'} | ${'x01'}
      ${'trope'}       | ${'unknown'}
      ${'answer'}      | ${'Woman'}
      ${'options'}     | ${['man', 'woman', 'elder', 'blacksmith']}
      ${'options'}     | ${['man', 'woman', 'elder', 'blacksmith', NOT_IN_TEXT]}
    `('rejects an invalid $field', ({ field, value }: { field: string; value: unknown }) => {
      expect(Question.schema.safeParse({ ...valid, [field]: value }).success).toBe(false);
    });
  });
});
