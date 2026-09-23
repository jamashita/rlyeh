import type { NoteID } from './NoteID.js';
import type { NoteTitle } from './NoteTitle.js';

/**
 * Entities are plain readonly types. The invariants live in the branded value
 * objects, so a `Note` that exists is already valid and nothing has to
 * re-validate it downstream.
 */
export type Note = {
  readonly id: NoteID;
  readonly title: NoteTitle;
  readonly body: string;
};
