import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/factions')({
  component: FactionsRoute,
});

function FactionsRoute() {
  return (
    <div className="align-center flex justify-center p-6 text-3xl font-bold">
      <h3>Factions Page</h3>
    </div>
  );
}
