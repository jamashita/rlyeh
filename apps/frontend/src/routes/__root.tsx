import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <div className="mx-auto max-w-2xl p-8">
      <header className="mb-8 border-b pb-4">
        <Link to="/" className="text-xl font-bold">
          R&rsquo;lyeh
        </Link>
      </header>
      <Outlet />
    </div>
  )
});
