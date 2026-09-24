import type { ILogger } from '../ILogger.js';

export class MockLogger implements ILogger {
  public debug(...args: ReadonlyArray<unknown>): void {
    console.log(...args);
  }

  public error(...args: ReadonlyArray<unknown>): void {
    console.error(...args);
  }

  public fatal(...args: ReadonlyArray<unknown>): void {
    console.error(...args);
  }

  public info(...args: ReadonlyArray<unknown>): void {
    console.log(...args);
  }

  public silly(...args: ReadonlyArray<unknown>): void {
    console.log(...args);
  }

  public trace(...args: ReadonlyArray<unknown>): void {
    console.log(...args);
  }

  public warn(...args: ReadonlyArray<unknown>): void {
    console.warn(...args);
  }
}
