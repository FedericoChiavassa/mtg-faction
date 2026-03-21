import {
  FingerprintPattern,
  Layers,
  PawPrint,
  RulerDimensionLine,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

import type { usePageFilters } from '../-hooks/use-page-filters';

export function FilterBadges({
  rangeLimits,
  className,
  startingIcon,
  data: {
    filters,
    isFiltersDirty,
    isIdentitiesDirty,
    isMaxIdentitiesDirty,
    isCardsRangeDirty,
    isCreaturesRangeDirty,
    isNonCreaturesRangeDirty,
  },
}: {
  data: ReturnType<typeof usePageFilters>;
  className?: string;
  startingIcon?: boolean;
  rangeLimits: {
    maxCards: number;
    maxCreatures: number;
    maxNonCreatures: number;
  };
}) {
  if (!isFiltersDirty) return null;

  return (
    <div
      className={cn(
        'pointer-events-none relative mr-auto flex flex-wrap items-center gap-2 overflow-hidden text-xs text-ellipsis',
        className,
      )}
    >
      {startingIcon && (
        <SlidersHorizontal size={12} className="text-muted-foreground" />
      )}
      {isIdentitiesDirty && (
        <Badge variant="secondary" className="capitalize">
          <FingerprintPattern />
          {filters.identities.join(', ')}
        </Badge>
      )}
      {isMaxIdentitiesDirty && (
        <Badge variant="secondary">
          <RulerDimensionLine />
          {filters.maxIdentities}
        </Badge>
      )}
      {isCardsRangeDirty && (
        <Badge variant="secondary">
          <Layers />
          {filters.minCards ?? 0} - {filters.maxCards ?? rangeLimits.maxCards}
        </Badge>
      )}
      {isCreaturesRangeDirty && (
        <Badge variant="secondary">
          <PawPrint />
          {filters.minCreatures ?? 0} -{' '}
          {filters.maxCreatures ?? rangeLimits.maxCreatures}
        </Badge>
      )}
      {isNonCreaturesRangeDirty && (
        <Badge variant="secondary">
          <Sparkles />
          {filters.minNonCreatures ?? 0} -{' '}
          {filters.maxNonCreatures ?? rangeLimits.maxNonCreatures}
        </Badge>
      )}
    </div>
  );
}
