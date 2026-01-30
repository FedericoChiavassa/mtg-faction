import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

const RootLayout = () => (
  <>
    <div className="flex gap-2 p-2">
      <Link to="/rules" className="[&.active]:font-bold">
        Rules
      </Link>{' '}
      <Link to="/factions" className="[&.active]:font-bold">
        Factions
      </Link>
      <Link to="/cards" className="[&.active]:font-bold">
        Cards
      </Link>
      <Link to="/about" className="[&.active]:font-bold">
        About
      </Link>
    </div>
    <hr />
    <Outlet />
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
