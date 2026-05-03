import { useMemo } from 'react';

import type { FactionFilterValues } from '@/features/factions/hooks/use-faction-form';
import { useFactionLimits } from '@/features/factions/hooks/use-faction-limits';

import { DEFAULT_PER_PAGE, DEFAULT_SORT_BY, type TSearch } from '../-schema';

export function usePageFilters({ search }: { search: TSearch }) {
  const rangeLimits = useFactionLimits();

  const filters = useMemo(
    () => ({
      page: search.page ?? 1,
      pageSize: search.perPage ?? DEFAULT_PER_PAGE,
      sortBy: search.sortBy ?? DEFAULT_SORT_BY,
      identities: search.identities,
      maxIdentities: search.maxIdentities,
      minCards: search.minCards ?? 0,
      minCreatures: search.minCreatures ?? 0,
      minNonCreatures: search.minNonCreatures ?? 0,
      maxCards: search.maxCards,
      maxCreatures: search.maxCreatures,
      maxNonCreatures: search.maxNonCreatures,
    }),
    [search],
  );

  const formFilters: FactionFilterValues = useMemo(
    () => ({
      maxIdentities: filters.maxIdentities,
      identities: filters.identities,
      cardsRange: [filters.minCards, filters.maxCards ?? rangeLimits?.maxCards],
      creaturesRange: [
        filters.minCreatures,
        filters.maxCreatures ?? rangeLimits?.maxCreatures,
      ],
      nonCreaturesRange: [
        filters.minNonCreatures,
        filters.maxNonCreatures ?? rangeLimits?.maxNonCreatures,
      ],
    }),
    [
      filters.identities,
      filters.maxCards,
      filters.maxCreatures,
      filters.maxIdentities,
      filters.maxNonCreatures,
      filters.minCards,
      filters.minCreatures,
      filters.minNonCreatures,
      rangeLimits?.maxCards,
      rangeLimits?.maxCreatures,
      rangeLimits?.maxNonCreatures,
    ],
  );

  return {
    filters,
    formFilters,
  };
}
