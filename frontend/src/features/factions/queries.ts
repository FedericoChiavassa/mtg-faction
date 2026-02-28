import { useQuery } from '@tanstack/react-query';

import type { QueryOptionsFromFn } from '@/lib/query/types';

import { fetchFactionList, fetchFactions } from './api';

export const factionKeys = {
  all: ['factions'] as const,
  list: () => [...factionKeys.all, 'list'] as const,
  paged: (params: Parameters<typeof useFactions>[0]) =>
    [...factionKeys.all, 'paged', params] as const,
};

export type Faction = NonNullable<
  Awaited<ReturnType<typeof useFactions>>['data']
>['data'][number];

export function useFactions({
  page,
  pageSize,
  sortBy,
  minCards,
  minCreatures,
  minNonCreatures,
  ...options
}: Parameters<typeof fetchFactions>[0] &
  QueryOptionsFromFn<typeof fetchFactions>) {
  const params = {
    page,
    pageSize,
    sortBy,
    minCards,
    minCreatures,
    minNonCreatures,
  };
  return useQuery({
    queryKey: factionKeys.paged(params),
    queryFn: () => fetchFactions(params),
    ...options,
  });
}

export type FactionList = NonNullable<
  ReturnType<typeof useFactionList>['data']
>[number];

export function useFactionList(
  options: QueryOptionsFromFn<typeof fetchFactionList> = {},
) {
  return useQuery({
    queryKey: factionKeys.list(),
    queryFn: fetchFactionList,
    staleTime: Infinity,
    ...options,
  });
}
