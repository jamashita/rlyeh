import { constructNow, format as formatDate, isAfter, isBefore, isEqual, parseISO, toDate } from 'date-fns';
import { type Either, left, right } from 'fp-ts/lib/Either.js';
import { z } from 'zod';
import { createParseError, type ParseError } from '../Error/index.js';
import { Type } from '../Type/index.js';

/**
 * Describes a rejected value for an error message. `JSON.stringify` throws on a
 * `BigInt` or a circular structure, and a failed parse must still return a
 * `ParseError` rather than throw, so it falls back to `String`.
 */
const describeValue = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
};

/**
 * An instant in time.
 *
 * `Date` is mutable and arrives as a string from JSON but as a `Date` from the
 * database driver, so every boundary had to handle both. `DateTime` keeps its
 * own copy of the instant, never hands it out, and its schema accepts either
 * form. The date arithmetic is delegated to date-fns.
 */
export class DateTime {
  private readonly date: Date;

  /**
   * Accepts a valid `Date` or an ISO 8601 date-time string with a UTC offset
   * (`Z` or `+09:00`), and turns either into a `DateTime`.
   */
  public static readonly schema = z.union([z.date(), z.iso.datetime({ offset: true })]).transform((value) => {
    if (Type.isString(value)) {
      return new DateTime(parseISO(value));
    }

    return new DateTime(toDate(value));
  });

  private constructor(date: Date) {
    this.date = date;
  }

  public static now(): DateTime {
    return new DateTime(constructNow(undefined));
  }

  public static of(value: unknown): Either<ParseError, DateTime> {
    const parsed = DateTime.schema.safeParse(value);

    if (!parsed.success) {
      return left(createParseError(`${describeValue(value)} is not a valid date-time`));
    }

    return right(parsed.data);
  }

  public equals(other: DateTime): boolean {
    return isEqual(this.date, other.date);
  }

  public isAfter(other: DateTime): boolean {
    return isAfter(this.date, other.date);
  }

  public isBefore(other: DateTime): boolean {
    return isBefore(this.date, other.date);
  }

  /**
   * Returns a new `Date` every time, so changing it cannot change this value.
   */
  public toDate(): Date {
    return toDate(this.date);
  }

  /**
   * Always in UTC with milliseconds, such as `2026-09-24T00:00:00.000Z`.
   * date-fns' `formatISO` writes the local offset and drops milliseconds, so the
   * native `toISOString` is used here.
   */
  public toISOString(): string {
    return this.date.toISOString();
  }

  public toJSON(): string {
    return this.toISOString();
  }

  /**
   * Without a format, the same as `toISOString`, so `${dateTime}` stays in UTC.
   *
   * With a format, the instant is written with date-fns' `format` using its
   * pattern tokens, such as `yyyy/MM/dd HH:mm`. The time is shown in the time
   * zone of the runtime (the server's, or the viewer's browser). date-fns
   * throws a `RangeError` for a pattern it cannot read, such as unescaped latin
   * letters.
   */
  public toString(format?: string): string {
    if (Type.isUndefined(format)) {
      return this.toISOString();
    }

    return formatDate(this.date, format);
  }
}
