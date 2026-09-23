import { type Note, type NoteID, NoteNotFoundError, type NoteRepository, noteIDSchema, noteTitleSchema } from '@rlyeh/domains';
import type { Logger } from '@rlyeh/lib';
import { type Either, isLeft, left, right } from 'fp-ts/Either';
import { describe, expect, it } from 'vitest';
import { FetchNote } from '../FetchNote.js';

const id = noteIDSchema.parse('0b6cbd5a-7f3d-4b2b-9a9c-0e6a2f2b1d44');

const note: Note = {
  id,
  title: noteTitleSchema.parse('Dreams'),
  body: 'in his house at R’lyeh'
};

class StubNoteRepository implements NoteRepository {
  public constructor(private readonly stored: Note | null) {}

  public findByID(noteID: NoteID): Promise<Either<NoteNotFoundError, Note>> {
    if (this.stored === null) {
      return Promise.resolve(left(new NoteNotFoundError(noteID)));
    }

    return Promise.resolve(right(this.stored));
  }
}

const silentLogger: Logger = {
  debug: () => undefined,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined
};

describe('FetchNote', () => {
  it('returns a model when the note is stored', async () => {
    const result = await new FetchNote(new StubNoteRepository(note), silentLogger).execute(id);

    expect(result).toStrictEqual(right({ id, title: 'Dreams', body: 'in his house at R’lyeh' }));
  });

  it('fails before touching the repository when the id is not a uuid', async () => {
    const result = await new FetchNote(new StubNoteRepository(note), silentLogger).execute('not-a-uuid');

    expect(isLeft(result)).toBe(true);
  });

  it('propagates the repository failure', async () => {
    const result = await new FetchNote(new StubNoteRepository(null), silentLogger).execute(id);

    expect(isLeft(result)).toBe(true);
  });
});
