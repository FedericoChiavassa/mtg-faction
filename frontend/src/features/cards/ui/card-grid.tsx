import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

import type { fetchCards } from '../api';

export function CardGrid({
  cards,
  isLoading,
  isError,
}: {
  cards: Awaited<ReturnType<typeof fetchCards>>['data'];
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return (
      <Grid>
        {Array.from({ length: 60 }).map((_, index) => (
          <Skeleton
            key={index}
            className="relative aspect-488/680 w-full overflow-hidden rounded-[4.75%/3.5%]"
          ></Skeleton>
        ))}
      </Grid>
    );
  }

  if (isError) {
    return (
      <p className="py-6 text-center text-destructive">Failed to load cards</p>
    );
  }

  return (
    <Grid>
      {cards.map((card, index) => (
        <Card card={card} index={index} key={card.oracle_id} />
      ))}
    </Grid>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid w-full max-w-250 grid-cols-2 gap-1.5 md:grid-cols-3 lg:grid-cols-4">
      {children}
    </div>
  );
}

function Card({
  card,
  index,
}: {
  card: Awaited<ReturnType<typeof fetchCards>>['data'][0];
  index: number;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative aspect-488/680 w-full overflow-hidden rounded-[4.75%/3.5%]">
      {isLoading && <div className="absolute inset-0 animate-pulse bg-muted" />}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
          Image not found
        </div>
      )}

      {!hasError && (
        <img
          alt={card.name}
          src={card.normal_img_url}
          onLoad={() => setIsLoading(false)}
          loading={index < 12 ? 'eager' : 'lazy'}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={cn(
            'rounded-[4.75%/3.5%] shadow-lg/20',
            isLoading ? 'opacity-0' : 'opacity-100',
          )}
        ></img>
      )}
    </div>
  );
}
