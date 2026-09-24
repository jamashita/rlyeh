export interface ILogger {
  debug(...args: ReadonlyArray<unknown>): unknown;

  error(...args: ReadonlyArray<unknown>): unknown;

  fatal(...args: ReadonlyArray<unknown>): unknown;

  info(...args: ReadonlyArray<unknown>): unknown;

  trace(...args: ReadonlyArray<unknown>): unknown;

  warn(...args: ReadonlyArray<unknown>): unknown;
}
