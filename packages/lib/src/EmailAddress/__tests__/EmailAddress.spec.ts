import { EmailAddress } from '../EmailAddress.js';

describe('EmailAddress', () => {
  describe('of', () => {
    it.each`
      value
      ${'taro@example.com'}
      ${'taro+test@example.com'}
      ${'t.a.r.o@gmail.com'}
      ${'Taro@Example.COM'}
      ${'taro@mail.example.co.jp'}
    `('accepts $value as it is given', ({ value }: { value: string }) => {
      expect(EmailAddress.of(value)).toStrictEqual({ _tag: 'Right', right: value });
    });

    it.each`
      value
      ${''}
      ${'taro'}
      ${'taro@'}
      ${'@example.com'}
      ${'taro@@example.com'}
      ${'taro@example'}
      ${'taro @example.com'}
      ${' taro@example.com'}
      ${'taro"@example.com'}
      ${'taro\n@example.com'}
    `('rejects $value', ({ value }: { value: string }) => {
      expect(EmailAddress.of(value)).toStrictEqual({
        _tag: 'Left',
        left: { error: 'ParseError', message: `${JSON.stringify(value)} is not a valid email address` }
      });
    });
  });
});
