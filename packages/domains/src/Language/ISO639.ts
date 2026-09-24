import { createParseError, type ParseError } from '@rlyeh/lib/Error';
import { Type } from '@rlyeh/lib/Type';
import { type Either, left, right } from 'fp-ts/lib/Either.js';
import { z } from 'zod';

const ISO_639_1_FORMAT = /^[a-z]{2}$/;

/**
 * `Intl.DisplayNames` throws on a malformed tag, so the format is checked first,
 * and only a well-formed code is looked up to see whether the language exists.
 */
const isKnownLanguage = (value: string): boolean => {
  if (!ISO_639_1_FORMAT.test(value)) {
    return false;
  }

  return !Type.isUndefined(new Intl.DisplayNames(['en'], { type: 'language', fallback: 'none' }).of(value));
};

const ISO639Schema = z.string().refine(isKnownLanguage).brand<'ISO639'>();

/**
 * Any ISO 639-1 code, whether the experiment is offered in that language or not.
 * Used where a person names a language of their own, such as an additional
 * native language or a language they ask to be added. For a language the
 * experiment is offered in, use `Language`.
 */
export type ISO639 = z.infer<typeof ISO639Schema>;

export const ISO639 = {
  of: (value: string): Either<ParseError, ISO639> => {
    const parsed = ISO639Schema.safeParse(value);

    if (!parsed.success) {
      return left(createParseError(`${JSON.stringify(value)} is not an ISO 639-1 language code`));
    }

    return right(parsed.data);
  }
} as const;
