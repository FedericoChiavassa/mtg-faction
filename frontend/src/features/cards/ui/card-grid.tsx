import { useState } from 'react';
import { Frown, FunnelX, RefreshCw } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
  const [isLoadingA, setIsLoadingA] = useState(true);
  const [isLoadingB, setIsLoadingB] = useState(true);
  const [hasErrorA, setHasErrorA] = useState(false);
  const [hasErrorB, setHasErrorB] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const isLoading = (!isFlipped && isLoadingA) || (isFlipped && isLoadingB);
  const hasError = (!isFlipped && hasErrorA) || (isFlipped && hasErrorB);

  const handleFlip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="relative aspect-488/680 w-full rounded-[4.75%/3.5%]">
      {isLoading && (
        <div className="absolute inset-0 animate-pulse rounded-[4.75%/3.5%] bg-muted select-none" />
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center rounded-[4.75%/3.5%] text-xs text-muted-foreground select-none">
          Image not found
        </div>
      )}

      {!hasError && (
        <a
          target="_blank"
          rel="noreferrer"
          href={card.scryfall_uri}
          className="block rounded-[4.75%/3.5%] select-none perspective-[2500px]"
        >
          {/* 1. THE FLIPPER CONTAINER */}
          <div
            className={cn(
              'relative transition-transform transform-3d',
              isFlipped ? '-rotate-y-180 duration-750' : 'duration-500',
            )}
          >
            {/* 2. FRONT FACE */}
            <div className="relative backface-hidden">
              <img
                alt={card.name}
                src={card.normal_img_url}
                onLoad={() => setIsLoadingA(false)}
                loading={index < 12 ? 'eager' : 'lazy'}
                onError={() => {
                  setIsLoadingA(false);
                  setHasErrorA(true);
                }}
                className={cn(
                  'rounded-[4.75%/3.5%] shadow-lg/20',
                  isLoadingA ? 'opacity-0' : 'opacity-100',
                )}
              />
            </div>

            {/* 3. BACK FACE */}
            {card.normal_img_url_2 && (
              <div className="absolute inset-0 h-full w-full rotate-y-180 backface-hidden">
                <img
                  alt={card.name}
                  loading="eager"
                  src={card.normal_img_url_2}
                  onLoad={() => setIsLoadingB(false)}
                  onError={() => {
                    setIsLoadingB(false);
                    setHasErrorB(true);
                  }}
                  className={cn(
                    'rounded-[4.75%/3.5%] shadow-lg/20',
                    isLoadingB ? 'opacity-0' : 'opacity-100',
                  )}
                />
              </div>
            )}
          </div>

          {/* 4. FLIP BUTTON */}
          {card.normal_img_url_2 && !isLoading && (
            <Button
              size="icon"
              variant="ghost"
              title="Flip Card"
              onClick={handleFlip}
              className="absolute top-[26%] right-[8%] cursor-pointer rounded-full bg-muted/80 hover:bg-muted!"
            >
              <RefreshCw />
            </Button>
          )}
        </a>
      )}
    </div>
  );
}
