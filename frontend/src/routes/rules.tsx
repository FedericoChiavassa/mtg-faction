import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/rules')({
  component: RulesRoute,
});

function RulesRoute() {
  return (
    <div className="align-center flex justify-center py-6 text-3xl font-bold">
      <h3>Rules Page</h3>
    </div>
  );
}
