import { type Note, type NoteID, type NoteNotFoundError, type NoteRepository, type NoteValueError, toNoteID } from '@rlyeh/domains';
import type { Logger } from '@rlyeh/lib';
import type { Either } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import type { NoteModel } from '../model/NoteModel.js';

export type FetchNoteError = NoteValueError | NoteNotFoundError;

export class FetchNote {
  /**
   * Constructor arguments follow the project order: repository, service, then
   * everything else, and the logger last.
   */
  public constructor(
    private readonly noteRepository: NoteRepository,
    private readonly logger: Logger
  ) {}

  /**
   * Public boundary, so the return type is `Either` rather than fp-ts'
   * `TaskEither`. The composition itself happens in a private method, where
   * `TaskEither` is allowed.
   */
  public async execute(rawID: string): Promise<Either<FetchNoteError, NoteModel>> {
    this.logger.info('fetching note', { rawID });

    return this.fetch(rawID)();
  }

  private fetch(rawID: string): TE.TaskEither<FetchNoteError, NoteModel> {
    return pipe(
      TE.fromEither<FetchNoteError, NoteID>(toNoteID(rawID)),
      TE.flatMap((id: NoteID) => () => this.noteRepository.findByID(id)),
      TE.map((note: Note) => this.toModel(note))
    );
  }

  private toModel(note: Note): NoteModel {
    return {
      id: note.id,
      title: note.title,
      body: note.body
    };
  }
}
