import type { FetchNote } from '@rlyeh/applications';
import { NoteNotFoundError, NoteValueError } from '@rlyeh/domains';
import { left, right } from 'fp-ts/Either';
import { describe, expect, it, vi } from 'vitest';
import { NoteController } from '../NoteController.js';

const id = '0b6cbd5a-7f3d-4b2b-9a9c-0e6a2f2b1d44';

const stub = (result: unknown): FetchNote => ({ execute: vi.fn().mockResolvedValue(result) }) as unknown as FetchNote;

describe('NoteController', () => {
  it('answers 200 with the model', async () => {
    const model = { id, title: 'Dreams', body: 'text' };

    await expect(new NoteController(stub(right(model))).find(id)).resolves.toStrictEqual({ status: 200, body: model });
  });

  it('maps an invalid value to 400', async () => {
    const response = await new NoteController(stub(left(new NoteValueError('NoteID', 'not a uuid')))).find('1');

    expect(response.status).toBe(400);
  });

  it('maps a missing note to 404', async () => {
    const response = await new NoteController(stub(left(new NoteNotFoundError(id)))).find(id);

    expect(response.status).toBe(404);
  });
});
