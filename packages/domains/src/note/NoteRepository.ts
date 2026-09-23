import type { Either } from 'fp-ts/Either';
import type { Note } from './Note.js';
import type { NoteNotFoundError } from './NoteError.js';
import type { NoteID } from './NoteID.js';

/**
 * The interface lives in domains; the implementation lives in apps/backend.
 *
 * The return type is `Either`, not `TaskEither`, because this is a public
 * boundary and must not lock callers into fp-ts' own type.
 */
export interface NoteRepository {
  findByID(id: NoteID): Promise<Either<NoteNotFoundError, Note>>;
}
