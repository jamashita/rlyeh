import { isRight } from 'fp-ts/lib/Either.js';
import { DateTime } from '../DateTime.js';

const dateTime = (value: unknown): DateTime => {
  const parsed = DateTime.of(value);

  if (!isRight(parsed)) {
    throw new Error(`invalid fixture: ${String(value)}`);
  }

  return parsed.right;
};

describe('DateTime', () => {
  describe('of', () => {
    it.each`
      value                               | expected
      ${new Date('2026-09-24T00:00:00Z')} | ${'2026-09-24T00:00:00.000Z'}
      ${'2026-09-24T00:00:00Z'}           | ${'2026-09-24T00:00:00.000Z'}
      ${'2026-09-24T00:00:00.123Z'}       | ${'2026-09-24T00:00:00.123Z'}
      ${'2026-09-24T09:00:00+09:00'}      | ${'2026-09-24T00:00:00.000Z'}
    `('accepts $value', ({ value, expected }: { value: unknown; expected: string }) => {
      const result = DateTime.of(value);

      expect(isRight(result)).toBe(true);

      if (isRight(result)) {
        expect(result.right.toISOString()).toBe(expected);
      }
    });

    it.each`
      value
      ${new Date('invalid')}
      ${'2026-09-24'}
      ${'2026-09-24T00:00:00'}
      ${'not a date'}
      ${''}
      ${1790208000000}
      ${null}
      ${undefined}
    `('rejects $value', ({ value }: { value: unknown }) => {
      expect(DateTime.of(value)).toStrictEqual({
        _tag: 'Left',
        left: { error: 'ParseError', message: `${JSON.stringify(value)} is not a valid date-time` }
      });
    });
  });

  describe('now', () => {
    it('returns the current instant', () => {
      const before = Date.now();
      const now = DateTime.now().toDate().getTime();
      const after = Date.now();

      expect(now).toBeGreaterThanOrEqual(before);
      expect(now).toBeLessThanOrEqual(after);
    });
  });

  describe('equals', () => {
    it.each`
      left                      | right                          | expected
      ${'2026-09-24T00:00:00Z'} | ${'2026-09-24T09:00:00+09:00'} | ${true}
      ${'2026-09-24T00:00:00Z'} | ${'2026-09-24T00:00:00.001Z'}  | ${false}
    `('returns $expected for $left and $right', ({ left, right, expected }: { left: string; right: string; expected: boolean }) => {
      expect(dateTime(left).equals(dateTime(right))).toBe(expected);
    });
  });

  describe('isAfter / isBefore', () => {
    it.each`
      left                      | right                     | after    | before
      ${'2026-09-24T00:00:01Z'} | ${'2026-09-24T00:00:00Z'} | ${true}  | ${false}
      ${'2026-09-24T00:00:00Z'} | ${'2026-09-24T00:00:01Z'} | ${false} | ${true}
      ${'2026-09-24T00:00:00Z'} | ${'2026-09-24T00:00:00Z'} | ${false} | ${false}
    `('compares $left with $right', ({ left, right, after, before }: { left: string; right: string; after: boolean; before: boolean }) => {
      expect(dateTime(left).isAfter(dateTime(right))).toBe(after);
      expect(dateTime(left).isBefore(dateTime(right))).toBe(before);
    });
  });

  describe('toDate', () => {
    it('returns a copy, so changing it does not change the DateTime', () => {
      const value = dateTime('2026-09-24T00:00:00Z');

      value.toDate().setFullYear(2000);

      expect(value.toISOString()).toBe('2026-09-24T00:00:00.000Z');
    });
  });

  describe('toJSON', () => {
    it('serializes to an ISO 8601 string in UTC', () => {
      expect(JSON.stringify({ at: dateTime('2026-09-24T09:00:00+09:00') })).toBe('{"at":"2026-09-24T00:00:00.000Z"}');
    });
  });

  describe('toString', () => {
    it('returns the ISO 8601 string without a format', () => {
      expect(dateTime('2026-09-24T00:00:00Z').toString()).toBe('2026-09-24T00:00:00.000Z');
    });

    it('returns the ISO 8601 string in a template literal', () => {
      expect(`${dateTime('2026-09-24T00:00:00Z')}`).toBe('2026-09-24T00:00:00.000Z');
    });

    // Built from local time, so the formatted result does not depend on the time zone of the machine running the test.
    it.each`
      format                   | expected
      ${'yyyy-MM-dd'}          | ${'2026-09-24'}
      ${'yyyy/MM/dd HH:mm:ss'} | ${'2026/09/24 09:05:03'}
      ${'yyyy年M月d日 H時m分'} | ${'2026年9月24日 9時5分'}
      ${'HH:mm'}               | ${'09:05'}
      ${"yyyy-MM-dd'T'HH:mm"}  | ${'2026-09-24T09:05'}
    `('formats with $format', ({ format, expected }: { format: string; expected: string }) => {
      expect(dateTime(new Date(2026, 8, 24, 9, 5, 3)).toString(format)).toBe(expected);
    });

    it('throws a RangeError for a format date-fns cannot read', () => {
      expect(() => dateTime('2026-09-24T00:00:00Z').toString('hello')).toThrow(RangeError);
    });
  });
});
