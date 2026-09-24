import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: () => (
    <main>
      <h1 className="text-2xl font-bold">R&rsquo;lyeh</h1>
      <p className="mt-2">Experimental.</p>
    </main>
  )
});
