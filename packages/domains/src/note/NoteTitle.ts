import { type Either, left, right } from 'fp-ts/Either';
import { z } from 'zod';
import { NoteValueError } from './NoteError.js';

export const noteTitleSchema = z.string().trim().min(1).max(120).brand<'NoteTitle'>();

export type NoteTitle = z.infer<typeof noteTitleSchema>;

export const toNoteTitle = (value: string): Either<NoteValueError, NoteTitle> => {
  const parsed = noteTitleSchema.safeParse(value);

  if (!parsed.success) {
    return left(new NoteValueError('NoteTitle', 'must be between 1 and 120 characters'));
  }

  return right(parsed.data);
};
