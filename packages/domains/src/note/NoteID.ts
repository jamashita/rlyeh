import { type Either, left, right } from 'fp-ts/Either';
import { z } from 'zod';
import { NoteValueError } from './NoteError.js';

export const noteIDSchema = z.uuid().brand<'NoteID'>();

export type NoteID = z.infer<typeof noteIDSchema>;

export const toNoteID = (value: string): Either<NoteValueError, NoteID> => {
  const parsed = noteIDSchema.safeParse(value);

  if (!parsed.success) {
    return left(new NoteValueError('NoteID', 'not a uuid'));
  }

  return right(parsed.data);
};
