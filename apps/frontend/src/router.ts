import { createRouter } from '@tanstack/react-router';
import { indexRoute } from './routes/IndexRoute.js';
import { noteRoute } from './routes/NoteRoute.js';
import { rootRoute } from './routes/RootRoute.js';

const routeTree = rootRoute.addChildren([indexRoute, noteRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
