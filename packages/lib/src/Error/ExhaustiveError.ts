export class ExhaustiveError extends Error {
  public constructor(value: never, message = `Unsupported value: ${value as unknown as string}`) {
    super(message);
  }
}
