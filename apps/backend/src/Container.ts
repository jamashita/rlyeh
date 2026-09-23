import { FetchNote } from '@rlyeh/applications';
import { ConsoleLogger } from '@rlyeh/lib';
import { NoteController } from './controller/NoteController.js';
import { NoteInMemoryRepository } from './repository/NoteInMemoryRepository.js';

export type Container = {
  readonly noteController: NoteController;
};

/**
 * Composition root. The object graph is built by hand so the dependency
 * direction stays visible in one place.
 */
export const createContainer = (): Container => {
  const logger = new ConsoleLogger();

  const noteRepository = new NoteInMemoryRepository();

  return {
    noteController: new NoteController(new FetchNote(noteRepository, logger))
  };
};
