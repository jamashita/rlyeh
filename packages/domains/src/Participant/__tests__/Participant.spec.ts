import { DateTime } from '@rlyeh/lib/DateTime';
import { EmailAddress } from '@rlyeh/lib/EmailAddress';
import { isRight } from 'fp-ts/lib/Either.js';
import { ISO639 } from '../../Language/ISO639.js';
import { Language } from '../../Language/Language.js';
import { Participant, type ParticipantID } from '../Participant.js';

const email = (value: string): EmailAddress => {
  const parsed = EmailAddress.of(value);

  if (!isRight(parsed)) {
    throw new Error(`invalid fixture: ${value}`);
  }

  return parsed.right;
};

const iso639 = (value: string): ISO639 => {
  const parsed = ISO639.of(value);

  if (!isRight(parsed)) {
    throw new Error(`invalid fixture: ${value}`);
  }

  return parsed.right;
};

const participantID = (value: string): ParticipantID => {
  const parsed = Participant.ID.of(value);

  if (!isRight(parsed)) {
    throw new Error(`invalid fixture: ${value}`);
  }

  return parsed.right;
};

const dateTime = (value: string): DateTime => {
  const parsed = DateTime.of(value);

  if (!isRight(parsed)) {
    throw new Error(`invalid fixture: ${value}`);
  }

  return parsed.right;
};

const id = participantID('0b6cbd5a-7f3d-4b2b-9a9c-0e6a2f2b1d44');
const registeredAt = dateTime('2026-09-24T00:00:00.000Z');

const register = (): Participant => {
  return Participant.register({
    id,
    email: email('Taro+exp@Gmail.com'),
    nativeLanguage: Language.JPN,
    otherNativeLanguages: [iso639('fr')],
    registeredAt
  });
};

describe('Participant', () => {
  describe('ID', () => {
    describe('of', () => {
      it.each`
        value
        ${'0b6cbd5a-7f3d-4b2b-9a9c-0e6a2f2b1d44'}
        ${'01a0d1d4-cd58-726c-8934-4ae3f617114c'}
      `('accepts $value', ({ value }: { value: string }) => {
        expect(Participant.ID.of(value)).toStrictEqual({ _tag: 'Right', right: value });
      });

      it('accepts what crypto.randomUUID returns', () => {
        const value = crypto.randomUUID();

        expect(Participant.ID.of(value)).toStrictEqual({ _tag: 'Right', right: value });
      });

      it.each`
        value
        ${''}
        ${'not-a-uuid'}
        ${'0b6cbd5a-7f3d-4b2b-9a9c'}
      `('rejects $value', ({ value }: { value: string }) => {
        expect(Participant.ID.of(value)).toStrictEqual({
          _tag: 'Left',
          left: { error: 'ParseError', message: `${JSON.stringify(value)} is not a UUID` }
        });
      });
    });
  });

  describe('of', () => {
    const stored = {
      id: '0b6cbd5a-7f3d-4b2b-9a9c-0e6a2f2b1d44',
      email: 'Taro+exp@Gmail.com',
      normalizedEmail: 'taro@gmail.com',
      nativeLanguage: { iso639: 'ja', iso15924: 'Jpan' },
      otherNativeLanguages: ['fr'],
      registeredAt: new Date('2026-09-24T00:00:00.000Z'),
      verifiedAt: '2026-09-24T01:00:00.000Z',
      consentedAt: null
    };

    it('rebuilds a participant, accepting a Date or an ISO 8601 string for each timestamp', () => {
      expect(Participant.of(stored)).toStrictEqual({
        _tag: 'Right',
        right: {
          ...stored,
          registeredAt: dateTime('2026-09-24T00:00:00.000Z'),
          verifiedAt: dateTime('2026-09-24T01:00:00.000Z')
        }
      });
    });

    it.each`
      field                     | value
      ${'id'}                   | ${'not-a-uuid'}
      ${'email'}                | ${'taro'}
      ${'nativeLanguage'}       | ${{ iso639: 'ja', iso15924: 'Latn' }}
      ${'otherNativeLanguages'} | ${['zz']}
      ${'registeredAt'}         | ${'2026-09-24'}
      ${'verifiedAt'}           | ${undefined}
    `('returns a ParseError when $field is invalid', ({ field, value }: { field: string; value: unknown }) => {
      const result = Participant.of({ ...stored, [field]: value });

      expect(result).toMatchObject({ _tag: 'Left', left: { error: 'ParseError' } });
    });

    it('returns a ParseError when the value is not an object', () => {
      expect(Participant.of(null)).toMatchObject({ _tag: 'Left', left: { error: 'ParseError' } });
    });
  });

  describe('Register', () => {
    describe('of', () => {
      const input = {
        id: '0b6cbd5a-7f3d-4b2b-9a9c-0e6a2f2b1d44',
        email: 'Taro+exp@Gmail.com',
        nativeLanguage: { iso639: 'ja', iso15924: 'Jpan' },
        otherNativeLanguages: ['fr'],
        registeredAt: '2026-09-24T00:00:00.000Z'
      };

      it('accepts the values a registration provides', () => {
        expect(Participant.Register.of(input)).toStrictEqual({
          _tag: 'Right',
          right: { ...input, registeredAt: dateTime('2026-09-24T00:00:00.000Z') }
        });
      });

      it('drops the fields a registration does not provide', () => {
        const result = Participant.Register.of({ ...input, normalizedEmail: 'taro@gmail.com', verifiedAt: null });

        expect(isRight(result)).toBe(true);

        if (isRight(result)) {
          expect(Object.keys(result.right).sort()).toStrictEqual(['email', 'id', 'nativeLanguage', 'otherNativeLanguages', 'registeredAt']);
        }
      });

      it.each`
        field                     | value
        ${'id'}                   | ${'not-a-uuid'}
        ${'email'}                | ${'taro'}
        ${'nativeLanguage'}       | ${{ iso639: 'fr', iso15924: 'Latn' }}
        ${'otherNativeLanguages'} | ${['zz']}
        ${'registeredAt'}         | ${'2026-09-24'}
      `('returns a ParseError when $field is invalid', ({ field, value }: { field: string; value: unknown }) => {
        expect(Participant.Register.of({ ...input, [field]: value })).toMatchObject({ _tag: 'Left', left: { error: 'ParseError' } });
      });
    });
  });

  describe('register', () => {
    it('keeps the given values, normalizes the email and starts unverified without consent', () => {
      expect(register()).toStrictEqual({
        id,
        email: 'Taro+exp@Gmail.com',
        normalizedEmail: 'taro@gmail.com',
        nativeLanguage: Language.JPN,
        otherNativeLanguages: ['fr'],
        registeredAt,
        verifiedAt: null,
        consentedAt: null
      });
    });
  });

  describe('verify', () => {
    it('records when the email was verified and keeps everything else', () => {
      const participant = register();
      const verifiedAt = dateTime('2026-09-24T01:00:00.000Z');

      expect(Participant.verify(participant, verifiedAt)).toStrictEqual({ ...participant, verifiedAt });
    });

    it('does not change the given participant', () => {
      const participant = register();

      Participant.verify(participant, dateTime('2026-09-24T01:00:00.000Z'));

      expect(participant.verifiedAt).toBeNull();
    });
  });

  describe('consent', () => {
    it('records when the participant consented and keeps everything else', () => {
      const participant = register();
      const consentedAt = dateTime('2026-09-24T02:00:00.000Z');

      expect(Participant.consent(participant, consentedAt)).toStrictEqual({ ...participant, consentedAt });
    });

    it('does not change the given participant', () => {
      const participant = register();

      Participant.consent(participant, dateTime('2026-09-24T02:00:00.000Z'));

      expect(participant.consentedAt).toBeNull();
    });
  });
});
