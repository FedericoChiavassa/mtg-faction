import { createFileRoute } from '@tanstack/react-router';

import { Container } from '@/components/layout/container';

export const Route = createFileRoute('/')({
  component: HomeRoute,
});

function HomeRoute() {
  return (
    <Container>
      <div className="flex justify-center py-6 text-3xl font-bold">
        <h3>Home Page</h3>
      </div>
    </Container>
  );
}
