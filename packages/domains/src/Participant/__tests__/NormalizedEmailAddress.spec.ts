import { EmailAddress } from '@rlyeh/lib/EmailAddress';
import { isRight } from 'fp-ts/lib/Either.js';
import { NormalizedEmailAddress } from '../NormalizedEmailAddress.js';

const email = (value: string): EmailAddress => {
  const parsed = EmailAddress.of(value);

  if (!isRight(parsed)) {
    throw new Error(`invalid fixture: ${value}`);
  }

  return parsed.right;
};

describe('NormalizedEmailAddress', () => {
  describe('from', () => {
    it.each`
      value                        | expected
      ${'taro@example.com'}        | ${'taro@example.com'}
      ${'Taro@Example.COM'}        | ${'taro@example.com'}
      ${'taro+test@example.com'}   | ${'taro@example.com'}
      ${'taro+a+b@example.com'}    | ${'taro@example.com'}
      ${'t.a.r.o@example.com'}     | ${'t.a.r.o@example.com'}
      ${'t.a.r.o@gmail.com'}       | ${'taro@gmail.com'}
      ${'T.Aro+exp@GMAIL.com'}     | ${'taro@gmail.com'}
      ${'taro@googlemail.com'}     | ${'taro@gmail.com'}
      ${'t.aro+x@googlemail.com'}  | ${'taro@gmail.com'}
      ${'taro@mail.example.co.jp'} | ${'taro@mail.example.co.jp'}
      ${'+tag@example.com'}        | ${'+tag@example.com'}
      ${'+tag@gmail.com'}          | ${'+tag@gmail.com'}
    `('normalizes $value to $expected', ({ value, expected }: { value: string; expected: string }) => {
      expect(NormalizedEmailAddress.from(email(value))).toBe(expected);
    });
  });
});
