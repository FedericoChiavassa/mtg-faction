import { createFileRoute } from '@tanstack/react-router';

import { Container } from '@/components/layout/container';

export const Route = createFileRoute('/_app/about')({
  component: AboutRoute,
});

function AboutRoute() {
  return (
    <Container>
      <div className="flex justify-center py-6 text-3xl font-bold">
        <h3>About Page</h3>
      </div>
    </Container>
  );
}
