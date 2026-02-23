import { createFileRoute, Outlet } from '@tanstack/react-router';

import { SiteHeader } from '@/components/layout/site-header';

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <SiteHeader />
      <GlobalBackgroundAura />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </>
  );
}

function GlobalBackgroundAura() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute top-60 left-0 h-72 w-72 rounded-full bg-blue-400/3 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-red-400/3 blur-3xl" />
    </div>
  );
}
