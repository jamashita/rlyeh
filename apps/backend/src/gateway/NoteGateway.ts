import { Hono } from 'hono';
import type { NoteController } from '../controller/NoteController.js';

/**
 * Routing only. Everything it knows how to do is delegated to the controller,
 * so Hono stays confined to this layer.
 */
export const noteGateway = (controller: NoteController): Hono => {
  const app = new Hono();

  app.get('/notes/:id', async (context) => {
    const response = await controller.find(context.req.param('id'));

    return context.json(response.body, response.status);
  });

  return app;
};
