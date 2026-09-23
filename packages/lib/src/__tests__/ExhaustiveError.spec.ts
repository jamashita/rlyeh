import { describe, expect, it } from 'vitest';
import { ExhaustiveError } from '../ExhaustiveError.js';

describe('ExhaustiveError', () => {
  it('reports the value that fell through to the default branch', () => {
    const error = new ExhaustiveError('unexpected' as never);

    expect(error.name).toBe('ExhaustiveError');
    expect(error.message).toBe('unexhausted case: "unexpected"');
  });
});
