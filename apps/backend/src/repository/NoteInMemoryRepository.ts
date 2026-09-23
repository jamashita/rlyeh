import { type Note, type NoteID, NoteNotFoundError, type NoteRepository, noteIDSchema, noteTitleSchema } from '@rlyeh/domains';
import { type Either, left, right } from 'fp-ts/Either';

const seed: Note = {
  id: noteIDSchema.parse('0b6cbd5a-7f3d-4b2b-9a9c-0e6a2f2b1d44'),
  title: noteTitleSchema.parse('Dreams'),
  body: 'That is not dead which can eternal lie.'
};

/**
 * Placeholder implementation so the slice runs end to end before a datastore is
 * chosen. Replace this class, not the interface in domains.
 */
export class NoteInMemoryRepository implements NoteRepository {
  private readonly notes: ReadonlyMap<NoteID, Note>;

  public constructor(notes: readonly Note[] = [seed]) {
    this.notes = new Map(notes.map((note) => [note.id, note]));
  }

  public findByID(id: NoteID): Promise<Either<NoteNotFoundError, Note>> {
    const note = this.notes.get(id);

    if (note === undefined) {
      return Promise.resolve(left(new NoteNotFoundError(id)));
    }

    return Promise.resolve(right(note));
  }
}
