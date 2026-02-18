import { createFileRoute } from '@tanstack/react-router';

import { Container } from '@/components/layout/container';

export const Route = createFileRoute('/rules')({
  component: RulesRoute,
});

function RulesRoute() {
  return (
    <Container>
      <div className="align-center flex justify-center py-6 text-3xl font-bold">
        <h3>Rules Page</h3>
      </div>
    </Container>
  );
}
