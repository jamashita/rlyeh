import { createTrialError } from '../TrialError.js';

describe('createTrialError', () => {
  it('creates a TrialError with the detail and the message', () => {
    expect(createTrialError('INVALID_STATE', 'cannot present a completed trial')).toStrictEqual({
      error: 'TrialError',
      detail: 'INVALID_STATE',
      message: 'cannot present a completed trial'
    });
  });
});
