import { Hono } from 'hono';
import { createContainer } from './Container.js';
import { noteGateway } from './gateway/NoteGateway.js';

const port = Number(process.env['PORT'] ?? 3001);

const container = createContainer();

const app = new Hono();

app.get('/health', (context) => context.json({ status: 'ok' }));
app.route('/api', noteGateway(container.noteController));

export default {
  port,
  fetch: app.fetch
};
