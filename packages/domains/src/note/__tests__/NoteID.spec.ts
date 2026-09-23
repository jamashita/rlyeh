import { isLeft, isRight } from 'fp-ts/Either';
import { describe, expect, it } from 'vitest';
import { toNoteID } from '../NoteID.js';

describe('toNoteID', () => {
  it('accepts a uuid', () => {
    expect(isRight(toNoteID('0b6cbd5a-7f3d-4b2b-9a9c-0e6a2f2b1d44'))).toBe(true);
  });

  it('rejects anything that is not a uuid', () => {
    expect(isLeft(toNoteID(''))).toBe(true);
    expect(isLeft(toNoteID('1'))).toBe(true);
    expect(isLeft(toNoteID('0b6cbd5a-7f3d-4b2b-9a9c'))).toBe(true);
  });
});
