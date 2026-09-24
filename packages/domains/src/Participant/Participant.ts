import { DateTime } from '@rlyeh/lib/DateTime';
import { EmailAddress } from '@rlyeh/lib/EmailAddress';
import { createParseError, type ParseError } from '@rlyeh/lib/Error';
import { type Either, left, right } from 'fp-ts/lib/Either.js';
import { z } from 'zod';
import { ISO639 } from '../Language/ISO639.js';
import { Language } from '../Language/Language.js';
import { NormalizedEmailAddress } from './NormalizedEmailAddress.js';

/**
 * The id is issued on the server with `crypto.randomUUID()` (UUID v4), so the
 * domain only validates it and never generates one.
 */
const ParticipantIDSchema = z.uuid().brand<'ParticipantID'>();

export type ParticipantID = z.infer<typeof ParticipantIDSchema>;

/**
 * A person registered for the experiment (AGENTS.md §14.1).
 *
 * - `email` is the address as entered; mail is sent to it.
 * - `normalizedEmail` is the key for detecting a second registration.
 * - `nativeLanguage` is the offered language the person takes the experiment
 *   in. It cannot be changed after registration.
 * - `otherNativeLanguages` records any further native language, offered or not,
 *   so that bilingual participants can be separated in the analysis.
 * - `verifiedAt` is set when the person opens the link in the confirmation mail.
 * - `consentedAt` is set when the person agrees on the consent screen. An account
 *   created from a language request has not consented yet.
 */
const ParticipantShape = z.object({
  id: ParticipantIDSchema,
  email: EmailAddress.schema,
  normalizedEmail: NormalizedEmailAddress.schema,
  nativeLanguage: Language.schema,
  otherNativeLanguages: z.array(ISO639.schema).readonly(),
  registeredAt: DateTime.schema,
  verifiedAt: DateTime.schema.nullable(),
  consentedAt: DateTime.schema.nullable()
});

const ParticipantSchema = ParticipantShape.readonly();

export type Participant = z.infer<typeof ParticipantSchema>;

/**
 * What a registration provides. Everything else is derived (`normalizedEmail`)
 * or starts empty (`verifiedAt`, `consentedAt`), so it is picked from the
 * participant's own fields to keep the two in step.
 */
const RegisterParticipantSchema = ParticipantShape.pick({
  id: true,
  email: true,
  nativeLanguage: true,
  otherNativeLanguages: true,
  registeredAt: true
}).readonly();

export type RegisterParticipant = z.infer<typeof RegisterParticipantSchema>;

export const Participant = {
  schema: ParticipantSchema,

  Register: {
    schema: RegisterParticipantSchema,

    of: (value: unknown): Either<ParseError, RegisterParticipant> => {
      const parsed = RegisterParticipantSchema.safeParse(value);

      if (!parsed.success) {
        return left(createParseError(`not a valid registration: ${parsed.error.message}`));
      }

      return right(parsed.data);
    }
  },

  ID: {
    schema: ParticipantIDSchema,

    of: (value: string): Either<ParseError, ParticipantID> => {
      const parsed = ParticipantIDSchema.safeParse(value);

      if (!parsed.success) {
        return left(createParseError(`${JSON.stringify(value)} is not a UUID`));
      }

      return right(parsed.data);
    }
  },

  /**
   * Rebuilds a participant from values read back from storage or another
   * boundary, validating every field.
   */
  of: (value: unknown): Either<ParseError, Participant> => {
    const parsed = ParticipantSchema.safeParse(value);

    if (!parsed.success) {
      return left(createParseError(`not a valid participant: ${parsed.error.message}`));
    }

    return right(parsed.data);
  },

  register: (params: RegisterParticipant): Participant => {
    return {
      id: params.id,
      email: params.email,
      normalizedEmail: NormalizedEmailAddress.from(params.email),
      nativeLanguage: params.nativeLanguage,
      otherNativeLanguages: params.otherNativeLanguages,
      registeredAt: params.registeredAt,
      verifiedAt: null,
      consentedAt: null
    };
  },

  verify: (participant: Participant, verifiedAt: DateTime): Participant => {
    return { ...participant, verifiedAt };
  },

  consent: (participant: Participant, consentedAt: DateTime): Participant => {
    return { ...participant, consentedAt };
  }
} as const;
