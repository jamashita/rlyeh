import { describe, expect, it, vi } from 'vitest';
import { ConsoleLogger } from '../ConsoleLogger.js';

describe('ConsoleLogger', () => {
  it('prefixes the message with its level', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const logger = new ConsoleLogger();

    logger.info('started', { port: 3001 });

    expect(spy).toHaveBeenCalledWith('[info] started', { port: 3001 });

    spy.mockRestore();
  });
});
