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
      {/* <GlobalBackgroundAura /> */}
    </>
  );
}

// function GlobalBackgroundAura() {
//   return (
//     <div className="pointer-events-none fixed inset-0 -z-10">
//       <div className="absolute top-60 left-0 h-72 w-72 rounded-full bg-blue-400/3 blur-3xl" />
//       <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-red-400/3 blur-3xl" />
//     </div>
//   );
// }
