import { ExhaustiveError } from './ExhaustiveError.js';
import type { Logger, LogLevel } from './Logger.js';

export class ConsoleLogger implements Logger {
  public debug(message: string, payload?: Record<string, unknown>): void {
    this.write('debug', message, payload);
  }

  public error(message: string, payload?: Record<string, unknown>): void {
    this.write('error', message, payload);
  }

  public info(message: string, payload?: Record<string, unknown>): void {
    this.write('info', message, payload);
  }

  public warn(message: string, payload?: Record<string, unknown>): void {
    this.write('warn', message, payload);
  }

  private write(level: LogLevel, message: string, payload?: Record<string, unknown>): void {
    const line = `[${level}] ${message}`;

    switch (level) {
      case 'debug': {
        console.debug(line, payload);

        return;
      }
      case 'info': {
        console.info(line, payload);

        return;
      }
      case 'warn': {
        console.warn(line, payload);

        return;
      }
      case 'error': {
        console.error(line, payload);

        return;
      }
      default: {
        throw new ExhaustiveError(level);
      }
    }
  }
}
