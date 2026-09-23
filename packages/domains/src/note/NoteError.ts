/**
 * Domain failures carry a `kind` discriminant so a caller can branch over them
 * with `switch` and close the `default` branch with `ExhaustiveError`. Adding a
 * failure to the union then becomes a compile error everywhere it is handled.
 *
 * These are returned as the left side of an `Either`, never thrown, so that a
 * caller has to acknowledge the failure at the type level.
 */
export class NoteValueError extends Error {
  public readonly kind = 'noteValue';

  public constructor(field: string, reason: string) {
    super(`${field} is invalid: ${reason}`);
    this.name = 'NoteValueError';
  }
}

export class NoteNotFoundError extends Error {
  public readonly kind = 'noteNotFound';

  public constructor(id: string) {
    super(`note not found: ${id}`);
    this.name = 'NoteNotFoundError';
  }
}
