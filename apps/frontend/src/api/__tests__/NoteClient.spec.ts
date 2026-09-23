import { isLeft } from 'fp-ts/Either';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NoteClient } from '../NoteClient.js';

const id = '0b6cbd5a-7f3d-4b2b-9a9c-0e6a2f2b1d44';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('NoteClient', () => {
  it('returns the model on a successful response', async () => {
    const model = { id, title: 'Dreams', body: 'text' };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(model)));

    const result = await new NoteClient().findByID(id);

    expect(result).toStrictEqual({ _tag: 'Right', right: model });
    expect(fetch).toHaveBeenCalledWith(`/api/notes/${id}`);
  });

  it('returns a failure when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })));

    expect(isLeft(await new NoteClient().findByID(id))).toBe(true);
  });
});
