import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/cards')({
  component: CardsRoute,
});

function CardsRoute() {
  return (
    <div className="align-center flex justify-center p-6 text-3xl font-bold">
      <h3>Cards Page</h3>
    </div>
  );
}
