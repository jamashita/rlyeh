import { Type } from '../Type.js';

describe('Type', () => {
  describe('isBigInt', () => {
    it.each`
      value                              | expected
      ${null}                            | ${false}
      ${undefined}                       | ${false}
      ${''}                              | ${false}
      ${'123'}                           | ${false}
      ${'abcd'}                          | ${false}
      ${123}                             | ${false}
      ${0}                               | ${false}
      ${-12}                             | ${false}
      ${0.3}                             | ${false}
      ${Number.NaN}                      | ${false}
      ${0n}                              | ${true}
      ${-20n}                            | ${true}
      ${12n}                             | ${true}
      ${123456789012345678901234567890n} | ${true}
      ${false}                           | ${false}
      ${true}                            | ${false}
      ${Symbol('p')}                     | ${false}
      ${{}}                              | ${false}
      ${[]}                              | ${false}
      ${Object.create(null)}             | ${false}
    `('returns $expected when $value given', ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(Type.isBigInt(value)).toBe(expected);
    });
  });

  describe('isBoolean', () => {
    it.each`
      value                              | expected
      ${null}                            | ${false}
      ${undefined}                       | ${false}
      ${''}                              | ${false}
      ${'123'}                           | ${false}
      ${'abcd'}                          | ${false}
      ${123}                             | ${false}
      ${0}                               | ${false}
      ${-12}                             | ${false}
      ${0.3}                             | ${false}
      ${Number.NaN}                      | ${false}
      ${0n}                              | ${false}
      ${-20n}                            | ${false}
      ${12n}                             | ${false}
      ${123456789012345678901234567890n} | ${false}
      ${false}                           | ${true}
      ${true}                            | ${true}
      ${Symbol('p')}                     | ${false}
      ${{}}                              | ${false}
      ${[]}                              | ${false}
      ${Object.create(null)}             | ${false}
    `('returns $expected when $value given', ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(Type.isBoolean(value)).toBe(expected);
    });
  });

  describe('isInteger', () => {
    it.each`
      value                              | expected
      ${null}                            | ${false}
      ${undefined}                       | ${false}
      ${''}                              | ${false}
      ${'123'}                           | ${false}
      ${'abcd'}                          | ${false}
      ${123}                             | ${true}
      ${0}                               | ${true}
      ${-12}                             | ${true}
      ${0.3}                             | ${false}
      ${Number.NaN}                      | ${false}
      ${0n}                              | ${false}
      ${-20n}                            | ${false}
      ${12n}                             | ${false}
      ${123456789012345678901234567890n} | ${false}
      ${false}                           | ${false}
      ${true}                            | ${false}
      ${Symbol('p')}                     | ${false}
      ${{}}                              | ${false}
      ${[]}                              | ${false}
      ${Object.create(null)}             | ${false}
    `('returns $expected when $value given', ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(Type.isInteger(value)).toBe(expected);
    });
  });

  describe('isNone', () => {
    it.each`
      value                              | expected
      ${null}                            | ${true}
      ${undefined}                       | ${true}
      ${''}                              | ${false}
      ${'123'}                           | ${false}
      ${'abcd'}                          | ${false}
      ${123}                             | ${false}
      ${0}                               | ${false}
      ${-12}                             | ${false}
      ${0.3}                             | ${false}
      ${Number.NaN}                      | ${false}
      ${0n}                              | ${false}
      ${-20n}                            | ${false}
      ${12n}                             | ${false}
      ${123456789012345678901234567890n} | ${false}
      ${false}                           | ${false}
      ${true}                            | ${false}
      ${Symbol('p')}                     | ${false}
      ${{}}                              | ${false}
      ${[]}                              | ${false}
      ${Object.create(null)}             | ${false}
    `('returns $expected when $value given', ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(Type.isNone(value)).toBe(expected);
    });
  });

  describe('isNull', () => {
    it.each`
      value                              | expected
      ${null}                            | ${true}
      ${undefined}                       | ${false}
      ${''}                              | ${false}
      ${'123'}                           | ${false}
      ${'abcd'}                          | ${false}
      ${123}                             | ${false}
      ${0}                               | ${false}
      ${-12}                             | ${false}
      ${0.3}                             | ${false}
      ${Number.NaN}                      | ${false}
      ${0n}                              | ${false}
      ${-20n}                            | ${false}
      ${12n}                             | ${false}
      ${123456789012345678901234567890n} | ${false}
      ${false}                           | ${false}
      ${true}                            | ${false}
      ${Symbol('p')}                     | ${false}
      ${{}}                              | ${false}
      ${[]}                              | ${false}
      ${Object.create(null)}             | ${false}
    `('returns $expected when $value given', ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(Type.isNull(value)).toBe(expected);
    });
  });

  describe('isNumber', () => {
    it.each`
      value                              | expected
      ${null}                            | ${false}
      ${undefined}                       | ${false}
      ${''}                              | ${false}
      ${'123'}                           | ${false}
      ${'abcd'}                          | ${false}
      ${123}                             | ${true}
      ${0}                               | ${true}
      ${-12}                             | ${true}
      ${0.3}                             | ${true}
      ${Number.NaN}                      | ${true}
      ${0n}                              | ${false}
      ${-20n}                            | ${false}
      ${12n}                             | ${false}
      ${123456789012345678901234567890n} | ${false}
      ${false}                           | ${false}
      ${true}                            | ${false}
      ${Symbol('p')}                     | ${false}
      ${{}}                              | ${false}
      ${[]}                              | ${false}
      ${Object.create(null)}             | ${false}
    `('returns $expected when $value given', ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(Type.isNumber(value)).toBe(expected);
    });
  });

  describe('isObject', () => {
    it.each`
      value                              | expected
      ${null}                            | ${false}
      ${undefined}                       | ${false}
      ${''}                              | ${false}
      ${'123'}                           | ${false}
      ${'abcd'}                          | ${false}
      ${123}                             | ${false}
      ${0}                               | ${false}
      ${-12}                             | ${false}
      ${0.3}                             | ${false}
      ${Number.NaN}                      | ${false}
      ${0n}                              | ${false}
      ${-20n}                            | ${false}
      ${12n}                             | ${false}
      ${123456789012345678901234567890n} | ${false}
      ${false}                           | ${false}
      ${true}                            | ${false}
      ${Symbol('p')}                     | ${false}
      ${{}}                              | ${true}
      ${[]}                              | ${true}
      ${Object.create(null)}             | ${true}
    `('returns $expected when $value given', ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(Type.isObject(value)).toBe(expected);
    });
  });

  describe('isPrimitive', () => {
    it.each`
      value                              | expected
      ${null}                            | ${true}
      ${undefined}                       | ${true}
      ${''}                              | ${true}
      ${'123'}                           | ${true}
      ${'abcd'}                          | ${true}
      ${123}                             | ${true}
      ${0}                               | ${true}
      ${-12}                             | ${true}
      ${0.3}                             | ${true}
      ${Number.NaN}                      | ${true}
      ${0n}                              | ${true}
      ${-20n}                            | ${true}
      ${12n}                             | ${true}
      ${123456789012345678901234567890n} | ${true}
      ${false}                           | ${true}
      ${true}                            | ${true}
      ${Symbol('p')}                     | ${true}
      ${{}}                              | ${false}
      ${[]}                              | ${false}
      ${Object.create(null)}             | ${false}
    `('returns $expected when $value given', ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(Type.isPrimitive(value)).toBe(expected);
    });
  });

  describe('isString', () => {
    it.each`
      value                              | expected
      ${null}                            | ${false}
      ${undefined}                       | ${false}
      ${''}                              | ${true}
      ${'123'}                           | ${true}
      ${'abcd'}                          | ${true}
      ${123}                             | ${false}
      ${0}                               | ${false}
      ${-12}                             | ${false}
      ${0.3}                             | ${false}
      ${Number.NaN}                      | ${false}
      ${0n}                              | ${false}
      ${-20n}                            | ${false}
      ${12n}                             | ${false}
      ${123456789012345678901234567890n} | ${false}
      ${false}                           | ${false}
      ${true}                            | ${false}
      ${Symbol('p')}                     | ${false}
      ${{}}                              | ${false}
      ${[]}                              | ${false}
      ${Object.create(null)}             | ${false}
    `('returns $expected when $value given', ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(Type.isString(value)).toBe(expected);
    });
  });

  describe('isSymbol', () => {
    it.each`
      value                              | expected
      ${null}                            | ${false}
      ${undefined}                       | ${false}
      ${''}                              | ${false}
      ${'123'}                           | ${false}
      ${'abcd'}                          | ${false}
      ${123}                             | ${false}
      ${0}                               | ${false}
      ${-12}                             | ${false}
      ${0.3}                             | ${false}
      ${Number.NaN}                      | ${false}
      ${0n}                              | ${false}
      ${-20n}                            | ${false}
      ${12n}                             | ${false}
      ${123456789012345678901234567890n} | ${false}
      ${false}                           | ${false}
      ${true}                            | ${false}
      ${Symbol('p')}                     | ${true}
      ${{}}                              | ${false}
      ${[]}                              | ${false}
      ${Object.create(null)}             | ${false}
    `('returns $expected when $value given', ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(Type.isSymbol(value)).toBe(expected);
    });
  });

  describe('isUndefined', () => {
    it.each`
      value                              | expected
      ${null}                            | ${false}
      ${undefined}                       | ${true}
      ${''}                              | ${false}
      ${'123'}                           | ${false}
      ${'abcd'}                          | ${false}
      ${123}                             | ${false}
      ${0}                               | ${false}
      ${-12}                             | ${false}
      ${0.3}                             | ${false}
      ${Number.NaN}                      | ${false}
      ${0n}                              | ${false}
      ${-20n}                            | ${false}
      ${12n}                             | ${false}
      ${123456789012345678901234567890n} | ${false}
      ${false}                           | ${false}
      ${true}                            | ${false}
      ${Symbol('p')}                     | ${false}
      ${{}}                              | ${false}
      ${[]}                              | ${false}
      ${Object.create(null)}             | ${false}
    `('returns $expected when $value given', ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(Type.isUndefined(value)).toBe(expected);
    });
  });
});
