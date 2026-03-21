import { createFileRoute, Outlet } from '@tanstack/react-router';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-dvh flex-1 flex-col">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}
