import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './RootRoute.js';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <main>
      <h1 className="text-2xl font-bold">R&rsquo;lyeh</h1>
      <p className="mt-2">Experimental.</p>
    </main>
  )
});
