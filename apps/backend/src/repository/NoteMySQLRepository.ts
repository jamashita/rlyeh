import { type Note, type NoteID, NoteNotFoundError, type NoteRepository, noteIDSchema, noteTitleSchema } from '@rlyeh/domains';
import { eq } from 'drizzle-orm';
import { type Either, left, right } from 'fp-ts/Either';
import type { Database } from '../database/Database.js';
import { type NoteRow, notes } from '../database/schema.js';

/**
 * Rows are written only through this application, so a row that fails the
 * domain schema means the table is corrupted. That is not a domain failure the
 * caller can handle, which is why it throws instead of returning `left`.
 */
const toNote = (row: NoteRow): Note => {
  return {
    id: noteIDSchema.parse(row.id),
    title: noteTitleSchema.parse(row.title),
    body: row.body
  };
};

export class NoteMySQLRepository implements NoteRepository {
  public constructor(private readonly database: Database) {}

  public async findByID(id: NoteID): Promise<Either<NoteNotFoundError, Note>> {
    const rows = await this.database.select().from(notes).where(eq(notes.id, id)).limit(1);
    const row = rows[0];

    if (row === undefined) {
      return left(new NoteNotFoundError(id));
    }

    return right(toNote(row));
  }
}
