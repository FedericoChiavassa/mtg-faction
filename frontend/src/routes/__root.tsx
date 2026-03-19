import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Analytics } from '@vercel/analytics/react';

const RootLayout = () => (
  <>
    <Outlet />
    <TanStackRouterDevtools />
    <Analytics />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
