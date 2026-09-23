import type { NoteModel } from '@rlyeh/applications';
import { createRoute } from '@tanstack/react-router';
import { match } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { NoteClient } from '../api/NoteClient.js';
import { rootRoute } from './RootRoute.js';

type NoteRouteData = { readonly note: NoteModel } | { readonly error: string };

const noteClient = new NoteClient();

/**
 * Fetching happens in the loader rather than inside the component, so the route
 * keeps working if this app later renders on the server.
 */
export const noteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notes/$id',
  loader: async ({ params }): Promise<NoteRouteData> => {
    const result = await noteClient.findByID(params.id);

    return pipe(
      result,
      match<Error, NoteModel, NoteRouteData>(
        (error) => ({ error: error.message }),
        (note) => ({ note })
      )
    );
  },
  component: () => {
    const loaded = noteRoute.useLoaderData();

    if ('error' in loaded) {
      return <main role="alert">{loaded.error}</main>;
    }

    return (
      <main>
        <h1 className="text-2xl font-bold">{loaded.note.title}</h1>
        <p className="mt-2 whitespace-pre-line">{loaded.note.body}</p>
      </main>
    );
  }
});
