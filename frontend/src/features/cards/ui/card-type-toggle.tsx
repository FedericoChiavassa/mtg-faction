import { CircleSmall } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type CardTypeValue = 'all' | 'creature' | 'non-creature';

export function CardTypeToggle({
  value,
  onValueChange,
  orientation = 'horizontal',
  className,
  originalColors = false,
}: {
  value: CardTypeValue;
  onValueChange: (value: CardTypeValue) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  originalColors?: boolean;
}) {
  const handleChange = ([val]: CardTypeValue[]) => {
    if (!val) return;

    onValueChange(val);
  };

  return (
    <ToggleGroup
      // spacing={3}
      value={[value]}
      variant="outline"
      orientation={orientation}
      className={cn('bg-background', className)}
      size={orientation === 'horizontal' ? 'sm' : 'default'}
      onValueChange={v => handleChange(v as CardTypeValue[])}
    >
      <ToggleGroupItem
        value="all"
        aria-label="Show all cards"
        originalColors={originalColors}
        className={cn(
          'gap-1.5 font-normal max-md:text-xs',
          orientation === 'vertical' && 'justify-start',
          value !== 'all' && 'cursor-pointer',
        )}
      >
        All
        {value === 'all' ? (
          <CircleSmall className="ml-auto size-3 text-muted-foreground md:hidden" />
        ) : (
          <CircleSmall className="ml-auto size-3 text-muted md:hidden" />
        )}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="creature"
        aria-label="Show creatures"
        originalColors={originalColors}
        className={cn(
          'gap-1.5 font-normal max-md:text-xs',
          orientation === 'vertical' && 'justify-start',
          value !== 'creature' && 'cursor-pointer',
        )}
      >
        Creatures
        {value === 'creature' ? (
          <CircleSmall className="ml-auto size-3 text-muted-foreground md:hidden" />
        ) : (
          <CircleSmall className="ml-auto size-3 text-muted md:hidden" />
        )}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="non-creature"
        aria-label="Show non-creatures"
        originalColors={originalColors}
        className={cn(
          'gap-1.5 font-normal max-md:text-xs',
          orientation === 'vertical' && 'justify-start',
          value !== 'non-creature' && 'cursor-pointer',
        )}
      >
        Non Creatures
        {value === 'non-creature' ? (
          <CircleSmall className="ml-auto size-3 text-muted-foreground md:hidden" />
        ) : (
          <CircleSmall className="ml-auto size-3 text-muted md:hidden" />
        )}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
