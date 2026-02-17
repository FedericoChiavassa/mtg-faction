import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { Container } from '@/components/layout/Container';
import { Navbar } from '@/components/layout/Navbar';

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
