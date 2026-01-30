import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/rules')({
  component: RulesRoute,
});

function RulesRoute() {
  const [count, setCount] = useState(0);
  console.log('🚀 ~ Index ~ useState:', useState);

  return (
    <>
      <div className="align-center flex justify-center p-6 text-3xl font-bold">
        <h3>Rules Page</h3>
      </div>
      <div className="flex justify-center p-6">
        <Button onClick={() => setCount(count + 1)}>
          Click Me - count: {count}
        </Button>
      </div>
    </>
  );
}
