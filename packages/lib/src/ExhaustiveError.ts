/**
 * Thrown from the `default` branch of a `switch` over a literal union.
 *
 * The parameter is typed `never`, so once every member of the union is handled
 * the call type-checks. Adding a member to the union makes this call a compile
 * error, which is how an unhandled case is caught before runtime.
 */
export class ExhaustiveError extends Error {
  public constructor(value: never) {
    super(`unexhausted case: ${JSON.stringify(value)}`);
    this.name = 'ExhaustiveError';
  }
}
