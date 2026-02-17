import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomeRoute,
});

function HomeRoute() {
  return (
    <div className="align-center flex justify-center py-6 text-3xl font-bold">
      <h3>Home Page</h3>
    </div>
  );
}
