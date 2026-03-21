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
  const isIdentitiesDirty = useMemo(() => {
    return filters.identities.length > 0;
  }, [filters.identities.length]);

  const isMaxIdentitiesDirty = useMemo(() => {
    return filters.maxIdentities !== undefined;
  }, [filters.maxIdentities]);

  const isCardsRangeDirty = useMemo(() => {
    return (
      !!filters.minCards ||
      (filters.maxCards !== undefined &&
        filters.maxCards !== rangeLimits?.maxCards)
    );
  }, [filters.maxCards, filters.minCards, rangeLimits?.maxCards]);

  const isCreaturesRangeDirty = useMemo(() => {
    return (
      !!filters.minCreatures ||
      (filters.maxCreatures !== undefined &&
        filters.maxCreatures !== rangeLimits?.maxCreatures)
    );
  }, [filters.maxCreatures, filters.minCreatures, rangeLimits?.maxCreatures]);

  const isNonCreaturesRangeDirty = useMemo(() => {
    return (
      !!filters.minNonCreatures ||
      (filters.maxNonCreatures !== undefined &&
        filters.maxNonCreatures !== rangeLimits?.maxNonCreatures)
    );
  }, [
    filters.maxNonCreatures,
    filters.minNonCreatures,
    rangeLimits?.maxNonCreatures,
  ]);

  // create a dirty flag for all filters
  const isFiltersDirty = useMemo(() => {
    return (
      isIdentitiesDirty ||
      isMaxIdentitiesDirty ||
      isCardsRangeDirty ||
      isCreaturesRangeDirty ||
      isNonCreaturesRangeDirty
    );
  }, [
    isIdentitiesDirty,
    isMaxIdentitiesDirty,
    isCardsRangeDirty,
    isCreaturesRangeDirty,
    isNonCreaturesRangeDirty,
  ]);

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
