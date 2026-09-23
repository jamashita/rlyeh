/**
 * What leaves the application layer. Branded domain types are flattened to
 * primitives here, so apps can serialise a model without reaching into domains.
 */
export type NoteModel = {
  readonly id: string;
  readonly title: string;
  readonly body: string;
};
