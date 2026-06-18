import { type ComponentProps, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Shuffle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useFactionList } from '@/features/factions/queries';

type RandomCardsButtonProps = ComponentProps<typeof Button> & {
  label?: string;
};

export function RandomCardsButton(props: RandomCardsButtonProps) {
  const { label, className, ...buttonProps } = props;
  const { data: factionList, isLoading: isFactionListLoading } =
    useFactionList();
  const [hasHoveredWhileLoading, setHasHoveredWhileLoading] = useState(false);

  if (!isFactionListLoading && hasHoveredWhileLoading) {
    setHasHoveredWhileLoading(false);
  }

  const showSpinner = isFactionListLoading && hasHoveredWhileLoading;

  return (
    <Button
      nativeButton={false}
      disabled={isFactionListLoading}
      className={cn(isFactionListLoading && 'cursor-default', className)}
      onMouseEnter={() => {
        if (isFactionListLoading) setHasHoveredWhileLoading(true);
      }}
      render={
        <Link
          to="/cards"
          state={{ disablePlaceholderData: true }}
          search={() => ({
            faction:
              factionList?.[Math.floor(Math.random() * factionList.length)].id,
          })}
        />
      }
      {...buttonProps}
    >
      {label}
      {showSpinner ? <Spinner /> : <Shuffle />}
    </Button>
  );
}
