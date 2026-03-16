import { Link } from '@tanstack/react-router';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function FiltersToggle({
  open,
  onClose,
  onClick,
  isMobile,
  className,
  isFiltersDirty,
}: {
  open: boolean;
  isMobile: boolean;
  className?: string;
  onClose: () => void;
  onClick: () => void;
  isFiltersDirty: boolean;
}) {
  return (
    <div
      className={cn(
        'pointer-events-none relative z-20 flex md:w-full md:py-4',
        className,
      )}
    >
      <div className="pointer-events-auto flex items-center gap-3 max-md:gap-2">
        <Button
          size="xs"
          onClick={onClick}
          variant={isMobile ? 'outline' : 'link'}
          className="cursor-pointer justify-start bg-background! md:-ml-2 md:w-28.5!"
        >
          <SlidersHorizontal className="mr-1 size-4" />{' '}
          {open && !isMobile ? 'Hide Filters' : 'Show Filters'}
        </Button>
        {isFiltersDirty && (
          <Button
            size="xs"
            onClick={onClose}
            nativeButton={false}
            title={isMobile ? 'Reset Filters' : ''}
            render={
              <Link
                to="/factions"
                search={prev => ({
                  perPage: prev.perPage,
                  sortBy: prev.sortBy,
                })}
              />
            }
          >
            {isMobile ? <RotateCcw /> : 'Reset Filters'}
          </Button>
        )}
      </div>
    </div>
  );
}
