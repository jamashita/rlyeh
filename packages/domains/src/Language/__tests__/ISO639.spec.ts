import { ISO639 } from '../ISO639.js';

describe('ISO639', () => {
  describe('of', () => {
    it.each`
      value
      ${'ja'}
      ${'en'}
      ${'fr'}
      ${'zh'}
      ${'ko'}
    `('accepts $value', ({ value }: { value: string }) => {
      expect(ISO639.of(value)).toStrictEqual({ _tag: 'Right', right: value });
    });

    it.each`
      value
      ${''}
      ${'j'}
      ${'jpn'}
      ${'JA'}
      ${'ja-JP'}
      ${'zz'}
      ${'xx'}
    `('rejects $value', ({ value }: { value: string }) => {
      expect(ISO639.of(value)).toStrictEqual({
        _tag: 'Left',
        left: { error: 'ParseError', message: `${JSON.stringify(value)} is not an ISO 639-1 language code` }
      });
    });
  });
});
