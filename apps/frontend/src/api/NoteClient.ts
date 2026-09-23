import type { NoteModel } from '@rlyeh/applications';
import { type Either, left, right } from 'fp-ts/Either';

export class NoteFetchError extends Error {
  public constructor(status: number) {
    super(`failed to fetch the note: ${status}`);
    this.name = 'NoteFetchError';
  }
}

/**
 * Talks to the HTTP API exposed by apps/backend. The return type is `Either`,
 * so a caller cannot read the model without first dealing with the failure.
 */
export class NoteClient {
  public constructor(private readonly baseURL: string = '/api') {}

  public async findByID(id: string): Promise<Either<NoteFetchError, NoteModel>> {
    const response = await fetch(`${this.baseURL}/notes/${id}`);

    if (!response.ok) {
      return left(new NoteFetchError(response.status));
    }

    return right((await response.json()) as NoteModel);
  }
}
