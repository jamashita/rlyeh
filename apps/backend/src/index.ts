import { Hono } from 'hono';

const port = Number(process.env['PORT'] ?? 3001);

const app = new Hono();

app.get('/health', (context) => context.json({ status: 'ok' }));

export default {
  port,
  fetch: app.fetch
};
