import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: AboutRoute,
});

function AboutRoute() {
  return (
    <div className="align-center flex justify-center p-6 text-3xl font-bold">
      <h3>About Page</h3>
    </div>
  );
}
