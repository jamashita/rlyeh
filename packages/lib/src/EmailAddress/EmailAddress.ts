import { type Either, left, right } from 'fp-ts/lib/Either.js';
import { z } from 'zod';
import { createParseError, type ParseError } from '../Error/index.js';

const EmailAddressSchema = z.email().brand<'EmailAddress'>();

export type EmailAddress = z.infer<typeof EmailAddressSchema>;

export const EmailAddress = {
  /**
   * The value is kept exactly as given. Folding case or removing aliases is a
   * policy of whoever compares addresses, not a property of an address, so it
   * does not happen here.
   */
  of: (value: string): Either<ParseError, EmailAddress> => {
    const parsed = EmailAddressSchema.safeParse(value);

    if (!parsed.success) {
      return left(createParseError(`"${value}" is not a valid email address`));
    }

    return right(parsed.data);
  }
} as const;
