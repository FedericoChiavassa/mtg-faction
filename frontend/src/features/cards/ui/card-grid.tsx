import { useState } from 'react';
import { Frown, FunnelX } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';

import type { fetchCards } from '../api';

export function CardGrid({
  cards,
  isLoading,
  isError,
  isPlaceholderData,
}: {
  cards: Awaited<ReturnType<typeof fetchCards>>['data'];
  isLoading: boolean;
  isError: boolean;
  isPlaceholderData: boolean;
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
      <Empty className="pt-6">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="size-16">
            <Frown className="size-8" />
          </EmptyMedia>
          <EmptyTitle>Oops!</EmptyTitle>
          <EmptyDescription className="text-destructive">
            Something went wrong
          </EmptyDescription>
          <EmptyDescription>Failed to load cards</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!cards.length) {
    return (
      <Empty className="pt-6">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="size-16">
            <FunnelX className="size-8" />
          </EmptyMedia>
          <EmptyTitle>No cards found</EmptyTitle>
          <EmptyDescription>
            Your filters didn&apos;t match any cards — Try changing filters
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Grid
      className={cn(isPlaceholderData && 'pointer-events-none animate-pulse')}
    >
      {cards.map((card, index) => (
        <Card card={card} index={index} key={card.oracle_id} />
      ))}
    </Grid>
  );
}

function Grid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid w-full max-w-250 grid-cols-2 gap-1.5 md:grid-cols-3 lg:grid-cols-4',
        className,
      )}
    >
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
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-muted select-none" />
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground select-none">
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
            'cursor-pointer rounded-[4.75%/3.5%] shadow-lg/20 select-none',
            isLoading ? 'opacity-0' : 'opacity-100',
          )}
        />
      )}
    </div>
  );
}
