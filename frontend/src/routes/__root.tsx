import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { SiteHeader } from '@/components/layout/site-header';

const RootLayout = () => {
  const location = useLocation();
  const hideHeader = location.pathname === '/';

  return (
    <>
      {!hideHeader && <SiteHeader />}
      <GlobalBackgroundAura />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });

function GlobalBackgroundAura() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute top-60 left-0 h-72 w-72 rounded-full bg-blue-400/3 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-red-400/3 blur-3xl" />
    </div>
  );
}
