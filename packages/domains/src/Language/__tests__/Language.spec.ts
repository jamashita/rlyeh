import { describe, expect, it } from 'vitest';
import { type ISO639, Language } from '../Language.js';

describe('Language', () => {
  describe('JPN', () => {
    it('is Japanese written in the Japanese script', () => {
      expect(Language.JPN).toStrictEqual({ iso639: 'ja', iso15924: 'Jpan' });
    });
  });

  describe('ENG', () => {
    it('is English written in the Latin script', () => {
      expect(Language.ENG).toStrictEqual({ iso639: 'en', iso15924: 'Latn' });
    });
  });

  describe('ALL', () => {
    it('lists every offered language', () => {
      expect(Language.ALL).toStrictEqual([Language.ENG, Language.JPN]);
    });
  });

  describe('fromISO639', () => {
    it.each`
      iso639  | expected
      ${'ja'} | ${Language.JPN}
      ${'en'} | ${Language.ENG}
    `('returns the offered language when $iso639 given', ({ iso639, expected }: { iso639: ISO639; expected: Language }) => {
      expect(Language.fromISO639(iso639)).toStrictEqual({ _tag: 'Right', right: expected });
    });

    it('returns a ParseError when the code is not offered', () => {
      expect(Language.fromISO639('fr' as ISO639)).toStrictEqual({
        _tag: 'Left',
        left: { error: 'ParseError', message: 'language with ISO639 code "fr" is not offered' }
      });
    });
  });

  describe('toTag', () => {
    it.each`
      language        | expected
      ${Language.JPN} | ${'ja-Jpan'}
      ${Language.ENG} | ${'en-Latn'}
    `('returns $expected', ({ language, expected }: { language: Language; expected: string }) => {
      expect(Language.toTag(language)).toBe(expected);
    });
  });
});
