import { useMemo } from 'react';

import { DEFAULT_PER_PAGE, DEFAULT_SORT_BY, type TSearch } from '../-schema';

export function usePageFilters({
  search,
  rangeLimits,
}: {
  search: TSearch;
  rangeLimits: {
    maxCards: number;
    maxCreatures: number;
    maxNonCreatures: number;
  };
}) {
  // create a filters object
  const filters = useMemo(
    () => ({
      page: search.page ?? 1,
      perPage: search.perPage ?? DEFAULT_PER_PAGE,
      sortBy: search.sortBy ?? DEFAULT_SORT_BY,
      identities: search.identities ?? [],
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

  // create a dirty flag for each filter
  const isIdentitiesDirty = filters.identities.length > 0;

  const isMaxIdentitiesDirty = filters.maxIdentities !== undefined;

  const isCardsRangeDirty =
    !!filters.minCards ||
    (filters.maxCards !== undefined &&
      filters.maxCards !== rangeLimits?.maxCards);

  const isCreaturesRangeDirty =
    !!filters.minCreatures ||
    (filters.maxCreatures !== undefined &&
      filters.maxCreatures !== rangeLimits?.maxCreatures);

  const isNonCreaturesRangeDirty =
    !!filters.minNonCreatures ||
    (filters.maxNonCreatures !== undefined &&
      filters.maxNonCreatures !== rangeLimits?.maxNonCreatures);

  // create a dirty flag for all filters
  const isFiltersDirty =
    isIdentitiesDirty ||
    isMaxIdentitiesDirty ||
    isCardsRangeDirty ||
    isCreaturesRangeDirty ||
    isNonCreaturesRangeDirty;

  return {
    filters,
    isFiltersDirty,
    isIdentitiesDirty,
    isMaxIdentitiesDirty,
    isCardsRangeDirty,
    isCreaturesRangeDirty,
    isNonCreaturesRangeDirty,
  };
}
