import { describe, expect, it, vi } from 'vitest';
import type { NoteController } from '../../controller/NoteController.js';
import { noteGateway } from '../NoteGateway.js';

const id = '0b6cbd5a-7f3d-4b2b-9a9c-0e6a2f2b1d44';

describe('noteGateway', () => {
  describe('GET /notes/:id', () => {
    it('hands the path parameter to the controller and mirrors its status', async () => {
      const find = vi.fn().mockResolvedValue({ status: 200, body: { id, title: 'Dreams', body: 'text' } });
      const controller = { find } as unknown as NoteController;

      const response = await noteGateway(controller).request(`/notes/${id}`);

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toStrictEqual({ id, title: 'Dreams', body: 'text' });
      expect(find).toHaveBeenCalledOnce();
      expect(find).toHaveBeenCalledWith(id);
    });

    it('passes a failing status through unchanged', async () => {
      const find = vi.fn().mockResolvedValue({ status: 404, body: { message: 'note not found' } });
      const controller = { find } as unknown as NoteController;

      const response = await noteGateway(controller).request(`/notes/${id}`);

      expect(response.status).toBe(404);
      expect(find).toHaveBeenCalledOnce();
    });
  });
});
