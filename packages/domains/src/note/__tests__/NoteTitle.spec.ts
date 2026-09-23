import { isLeft, isRight } from 'fp-ts/Either';
import { describe, expect, it } from 'vitest';
import { toNoteTitle } from '../NoteTitle.js';

describe('toNoteTitle', () => {
  it('accepts a title within the allowed length', () => {
    expect(isRight(toNoteTitle('Ph’nglui mglw’nafh'))).toBe(true);
  });

  it('rejects a blank title', () => {
    expect(isLeft(toNoteTitle(''))).toBe(true);
    expect(isLeft(toNoteTitle('   '))).toBe(true);
  });

  it('rejects a title longer than 120 characters', () => {
    expect(isLeft(toNoteTitle('a'.repeat(121)))).toBe(true);
  });
});
