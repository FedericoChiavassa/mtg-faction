import { useQuery } from '@tanstack/react-query';

import type { QueryOptionsFromFn } from '@/lib/query/types';

import { fetchFactionList, fetchFactions } from './api';

export const factionKeys = {
  all: ['factions'] as const,
  list: () => [...factionKeys.all, 'list'] as const,
  paged: (
    page: number,
    pageSize: number,
    sortBy: Parameters<typeof useFactions>[0]['sortBy'],
  ) => [...factionKeys.all, page, pageSize, sortBy] as const,
};

export type Faction = NonNullable<
  Awaited<ReturnType<typeof useFactions>>['data']
>['data'][number];

export function useFactions({
  page,
  pageSize,
  sortBy,
  ...options
}: {
  page: number;
  pageSize: number;
  sortBy?: Parameters<typeof fetchFactions>[0]['sortBy'];
} & QueryOptionsFromFn<typeof fetchFactions>) {
  return useQuery({
    queryKey: factionKeys.paged(page, pageSize, sortBy),
    queryFn: () => fetchFactions({ page, pageSize, sortBy }),
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
