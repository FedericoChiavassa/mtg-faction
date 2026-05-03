import { type LucideIcon, SlidersHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function FormBadges({
  badges,
  className,
  showStartingIcon = false,
}: {
  badges: { id: string; value: string; icon: LucideIcon; show: boolean }[];
  className?: string;
  showStartingIcon?: boolean;
}) {
  return (
    <div
      className={cn(
        'pointer-events-none relative flex flex-wrap items-center gap-2 overflow-hidden text-xs text-ellipsis',
        className,
      )}
    >
      {showStartingIcon && (
        <SlidersHorizontal size={12} className="text-muted-foreground" />
      )}
      {badges
        .filter(b => b.show)
        .map(({ id, value, icon: Icon }) => (
          <Badge key={id} variant="secondary">
            <Icon />
            {value}
          </Badge>
        ))}
    </div>
  );
}
