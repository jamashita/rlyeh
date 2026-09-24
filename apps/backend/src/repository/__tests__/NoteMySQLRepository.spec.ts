import { noteIDSchema } from '@rlyeh/domains';
import { isLeft, isRight } from 'fp-ts/Either';
import { describe, expect, it, vi } from 'vitest';
import type { Database } from '../../database/Database.js';
import type { NoteRow } from '../../database/schema.js';
import { NoteMySQLRepository } from '../NoteMySQLRepository.js';

const id = noteIDSchema.parse('0b6cbd5a-7f3d-4b2b-9a9c-0e6a2f2b1d44');

const mockDatabase = (rows: readonly NoteRow[]) => {
  const limit = vi.fn().mockResolvedValue(rows);
  const where = vi.fn().mockReturnValue({ limit });
  const from = vi.fn().mockReturnValue({ where });
  const select = vi.fn().mockReturnValue({ from });

  return { database: { select } as unknown as Database, select, from, where, limit };
};

describe('NoteMySQLRepository', () => {
  describe('findByID', () => {
    it('returns the note built from the matching row', async () => {
      const { database, select, from, where, limit } = mockDatabase([{ id, title: 'Dreams', body: 'text' }]);

      const result = await new NoteMySQLRepository(database).findByID(id);

      expect(isRight(result)).toBe(true);
      expect(result).toStrictEqual({ _tag: 'Right', right: { id, title: 'Dreams', body: 'text' } });
      expect(select).toHaveBeenCalledOnce();
      expect(from).toHaveBeenCalledOnce();
      expect(where).toHaveBeenCalledOnce();
      expect(limit).toHaveBeenCalledOnce();
      expect(limit).toHaveBeenCalledWith(1);
    });

    it('returns NoteNotFoundError when no row matches', async () => {
      const { database, limit } = mockDatabase([]);

      const result = await new NoteMySQLRepository(database).findByID(id);

      expect(isLeft(result)).toBe(true);

      if (isLeft(result)) {
        expect(result.left.kind).toBe('noteNotFound');
      }

      expect(limit).toHaveBeenCalledOnce();
    });

    it('throws when the stored row violates the domain schema', async () => {
      const { database, limit } = mockDatabase([{ id, title: '', body: 'text' }]);

      await expect(new NoteMySQLRepository(database).findByID(id)).rejects.toThrow();
      expect(limit).toHaveBeenCalledOnce();
    });
  });
});
