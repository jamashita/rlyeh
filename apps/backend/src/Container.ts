import { FetchNote } from '@rlyeh/applications';
import type { NoteRepository } from '@rlyeh/domains';
import { ConsoleLogger } from '@rlyeh/lib';
import { NoteController } from './controller/NoteController.js';
import { createDatabase } from './database/Database.js';
import { NoteInMemoryRepository } from './repository/NoteInMemoryRepository.js';
import { NoteMySQLRepository } from './repository/NoteMySQLRepository.js';

export type Container = {
  readonly noteController: NoteController;
};

/**
 * Uses MySQL when DATABASE_URL is set, and falls back to the in-memory
 * repository so the app still runs without a database.
 */
const createNoteRepository = (): NoteRepository => {
  const databaseURL = process.env['DATABASE_URL'];

  if (databaseURL === undefined) {
    return new NoteInMemoryRepository();
  }

  return new NoteMySQLRepository(createDatabase(databaseURL));
};

/**
 * Composition root. The object graph is built by hand so the dependency
 * direction stays visible in one place.
 */
export const createContainer = (): Container => {
  const logger = new ConsoleLogger();

  const noteRepository = createNoteRepository();

  return {
    noteController: new NoteController(new FetchNote(noteRepository, logger))
  };
};
