import type { FetchNote, FetchNoteError, NoteModel } from '@rlyeh/applications';
import { ExhaustiveError } from '@rlyeh/lib';
import { match } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

export type NoteResponse = {
  readonly status: 400 | 404 | 200;
  readonly body: NoteModel | { readonly message: string };
};

export class NoteController {
  public constructor(private readonly fetchNote: FetchNote) {}

  public async find(rawID: string): Promise<NoteResponse> {
    const result = await this.fetchNote.execute(rawID);

    return pipe(
      result,
      match<FetchNoteError, NoteModel, NoteResponse>(
        (error) => this.toFailure(error),
        (model) => ({ status: 200, body: model })
      )
    );
  }

  /**
   * Branching on the `kind` discriminant keeps this exhaustive: a new domain
   * failure will not compile until it is given a status here.
   */
  private toFailure(error: FetchNoteError): NoteResponse {
    switch (error.kind) {
      case 'noteValue': {
        return { status: 400, body: { message: error.message } };
      }
      case 'noteNotFound': {
        return { status: 404, body: { message: error.message } };
      }
      default: {
        throw new ExhaustiveError(error);
      }
    }
  }
}
