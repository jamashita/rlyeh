import { StimulusLocale } from '../StimulusLocale.js';

const valid = {
  text: '{p01:Mira found it}.',
  notInText: 'The text does not say',
  questions: {
    q01: {
      prompt: 'Who found it?',
      options: { man: 'Thomas', woman: 'Mira', elder: 'The elder', blacksmith: 'The blacksmith', shepherd: 'The shepherd' }
    }
  }
};

describe('StimulusLocale', () => {
  describe('schema', () => {
    it('parses the marked text', () => {
      const parsed = StimulusLocale.schema.safeParse(valid);

      expect(parsed.success).toBe(true);

      if (parsed.success) {
        expect(parsed.data.text).toStrictEqual({ plain: 'Mira found it.', spans: [{ proposition: 'p01', start: 0, end: 13 }] });
      }
    });

    it.each`
      field          | value
      ${'text'}      | ${'{p01:Mira found it.'}
      ${'notInText'} | ${''}
      ${'questions'} | ${{ x01: valid.questions.q01 }}
      ${'questions'} | ${{ q01: { prompt: '', options: valid.questions.q01.options } }}
      ${'questions'} | ${{ q01: { prompt: 'Who found it?', options: { Woman: 'Mira' } } }}
    `('rejects an invalid $field', ({ field, value }: { field: string; value: unknown }) => {
      expect(StimulusLocale.schema.safeParse({ ...valid, [field]: value }).success).toBe(false);
    });
  });
});
