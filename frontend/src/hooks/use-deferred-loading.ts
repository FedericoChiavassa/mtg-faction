import { useEffect, useState } from 'react';

export function useDeferredLoading(isLoading: boolean, delay = 250) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isLoading) {
      // Start the countdown when loading begins
      timer = setTimeout(() => setShouldShow(true), delay);
    } else {
      // Hide the loading state immediately once data arrives
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldShow(false);
    }

    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  return shouldShow;
}
