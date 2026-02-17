import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { Container } from '@/components/layout/container';
import { Navbar } from '@/components/layout/navbar';

const RootLayout = () => (
  <>
    <Navbar />
    <Container>
      <Outlet />
    </Container>
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
