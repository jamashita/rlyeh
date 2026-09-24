import { isRight } from 'fp-ts/lib/Either.js';
import { Language } from '../../Language/Language.js';
import { NOT_IN_TEXT, Stimulus } from '../Stimulus.js';

const valid = () => {
  return {
    id: 'sample',
    role: 'main',
    propositions: [
      { id: 'p01', summary: 'A woman found the object' },
      { id: 'p02', summary: 'The object was near a fallen tree' }
    ],
    questions: [
      { id: 'q01', proposition: 'p01', trope: 'subverted', answer: 'woman', options: ['man', 'woman', 'elder', 'blacksmith', 'shepherd'] },
      { id: 'q02', proposition: 'p02', trope: 'follows', answer: NOT_IN_TEXT, options: ['tree', 'river', 'well', 'rock', 'fence'] }
    ],
    locales: {
      'ja-Jpan': {
        text: '{p02:倒れた木のそばで}、{p01:美咲が}見つけた。',
        notInText: '本文からはわからない',
        questions: {
          q01: { prompt: '誰が見つけましたか？', options: { man: '健太', woman: '美咲', elder: '長老', blacksmith: '鍛冶屋', shepherd: '羊飼い' } },
          q02: { prompt: 'どこで見つかりましたか？', options: { tree: '木', river: '川', well: '井戸', rock: '岩', fence: '柵' } }
        }
      },
      'en-Latn': {
        text: '{p01:Mira found it} {p02:near a fallen tree}.',
        notInText: 'The text does not say',
        questions: {
          q01: {
            prompt: 'Who found it?',
            options: { man: 'Thomas', woman: 'Mira', elder: 'The elder', blacksmith: 'The blacksmith', shepherd: 'The shepherd' }
          },
          q02: { prompt: 'Where was it found?', options: { tree: 'A tree', river: 'A river', well: 'A well', rock: 'A rock', fence: 'A fence' } }
        }
      }
    }
  };
};

const expectInvalid = (value: unknown): void => {
  expect(Stimulus.of(value)).toMatchObject({ _tag: 'Left', left: { error: 'ParseError' } });
};

describe('Stimulus', () => {
  describe('of', () => {
    it('builds a stimulus and parses the text of every locale', () => {
      const result = Stimulus.of(valid());

      expect(isRight(result)).toBe(true);

      if (isRight(result)) {
        expect(result.right.locales['ja-Jpan'].text).toStrictEqual({
          plain: '倒れた木のそばで、美咲が見つけた。',
          spans: [
            { proposition: 'p02', start: 0, end: 8 },
            { proposition: 'p01', start: 9, end: 12 }
          ]
        });
        expect(result.right.locales['en-Latn'].text).toStrictEqual({
          plain: 'Mira found it near a fallen tree.',
          spans: [
            { proposition: 'p01', start: 0, end: 13 },
            { proposition: 'p02', start: 14, end: 32 }
          ]
        });
      }
    });

    it('rejects duplicate proposition ids', () => {
      const value = valid();

      expectInvalid({ ...value, propositions: [...value.propositions, { id: 'p01', summary: 'again' }] });
    });

    it('rejects duplicate question ids', () => {
      const value = valid();
      const [first] = value.questions;

      expectInvalid({ ...value, questions: [...value.questions, first] });
    });

    it('rejects a question about a proposition that does not exist', () => {
      const value = valid();
      const [first, second] = value.questions;

      expectInvalid({ ...value, questions: [{ ...first, proposition: 'p09' }, second] });
    });

    it('rejects an answer that is not one of the options', () => {
      const value = valid();
      const [first, second] = value.questions;

      expectInvalid({ ...value, questions: [{ ...first, answer: 'child' }, second] });
    });

    it('rejects duplicate options', () => {
      const value = valid();
      const [first, second] = value.questions;

      expectInvalid({ ...value, questions: [{ ...first, options: ['man', 'man', 'elder', 'blacksmith', 'woman'] }, second] });
    });

    it.each`
      options
      ${['man', 'woman', 'elder', 'blacksmith']}
      ${['man', 'woman', 'elder', 'blacksmith', 'shepherd', 'child']}
      ${['man', 'woman', 'elder', 'blacksmith', NOT_IN_TEXT]}
    `('rejects options other than five concrete choices: $options', ({ options }: { options: Array<string> }) => {
      const value = valid();
      const [first, second] = value.questions;

      expectInvalid({ ...value, questions: [{ ...first, options }, second] });
    });

    it('rejects a missing offered language', () => {
      const value = valid();

      expectInvalid({ ...value, locales: { 'ja-Jpan': value.locales['ja-Jpan'] } });
    });

    it('rejects a language that is not offered', () => {
      const value = valid();

      expectInvalid({ ...value, locales: { ...value.locales, 'fr-Latn': value.locales['en-Latn'] } });
    });

    it('rejects a text that does not mark every proposition', () => {
      const value = valid();

      expectInvalid({
        ...value,
        locales: { ...value.locales, 'en-Latn': { ...value.locales['en-Latn'], text: '{p01:Mira found it} near a fallen tree.' } }
      });
    });

    it('rejects a text with a broken marker', () => {
      const value = valid();

      expectInvalid({
        ...value,
        locales: { ...value.locales, 'en-Latn': { ...value.locales['en-Latn'], text: '{p01:Mira found it {p02:near a fallen tree}.' } }
      });
    });

    it('rejects a locale that misses a question', () => {
      const value = valid();
      const english = value.locales['en-Latn'];

      expectInvalid({ ...value, locales: { ...value.locales, 'en-Latn': { ...english, questions: { q01: english.questions.q01 } } } });
    });

    it('rejects a locale whose options do not match the option ids', () => {
      const value = valid();
      const english = value.locales['en-Latn'];
      const q01 = {
        ...english.questions.q01,
        options: { man: 'Thomas', woman: 'Mira', elder: 'The elder', blacksmith: 'The blacksmith', child: 'A child' }
      };

      expectInvalid({ ...value, locales: { ...value.locales, 'en-Latn': { ...english, questions: { ...english.questions, q01 } } } });
    });

    it('rejects an unknown role', () => {
      expectInvalid({ ...valid(), role: 'pilot' });
    });
  });

  describe('localeOf', () => {
    it('returns the locale of the given language', () => {
      const result = Stimulus.of(valid());

      expect(isRight(result)).toBe(true);

      if (isRight(result)) {
        expect(Stimulus.localeOf(result.right, Language.JPN).notInText).toBe('本文からはわからない');
        expect(Stimulus.localeOf(result.right, Language.ENG).notInText).toBe('The text does not say');
      }
    });
  });
});
