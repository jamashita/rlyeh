import { createParseError, type ParseError } from '@rlyeh/lib/Error';
import { Type } from '@rlyeh/lib/Type';
import { type Either, left, right } from 'fp-ts/lib/Either.js';
import { z } from 'zod';

const LanguageSchema = z.union([
  z
    .object({
      iso639: z.literal('ja'),
      iso15924: z.literal('Jpan')
    })
    .readonly(),
  z
    .object({
      iso639: z.literal('en'),
      iso15924: z.literal('Latn')
    })
    .readonly()
]);

export type Language = z.infer<typeof LanguageSchema>;
export type ISO639 = Language['iso639'];
export type ISO15924 = Language['iso15924'];
export type LanguageTag = `${ISO639}-${ISO15924}`;

const JPN = {
  iso639: 'ja',
  iso15924: 'Jpan'
};
const ENG = {
  iso639: 'en',
  iso15924: 'Latn'
};
const ALL = [ENG, JPN] as Array<Language>;

export const Language = {
  JPN,
  ENG,
  ALL,

  fromISO639: (iso639: ISO639): Either<ParseError, Language> => {
    const language = ALL.find((candidate) => {
      return candidate.iso639 === iso639;
    });

    if (Type.isUndefined(language)) {
      return left(createParseError(`language with ISO639 code "${iso639}" is not offered`));
    }

    return right(language);
  },

  toTag: (language: Language): LanguageTag => {
    return `${language.iso639}-${language.iso15924}`;
  }
} as const;
