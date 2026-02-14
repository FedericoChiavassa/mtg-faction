import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Relative redirect - automatically knows we're redirecting from '/'
    throw Route.redirect({
      to: '/rules',
    });
  },
});
