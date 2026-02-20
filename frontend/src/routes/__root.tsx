import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { SiteHeader } from '@/components/layout/site-header';

const RootLayout = () => (
  <>
    <SiteHeader />
    <main className="flex flex-1 flex-col">
      <Outlet />
    </main>
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
