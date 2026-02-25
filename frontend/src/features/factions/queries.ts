import { useQuery } from '@tanstack/react-query';

import type { QueryOptionsFromFn } from '@/lib/query/types';

import { fetchFactionList, fetchFactions } from './api';

export const factionKeys = {
  all: ['factions'] as const,
  list: () => [...factionKeys.all, 'list'] as const,
  paged: (page: number, pageSize: number) =>
    [...factionKeys.all, page, pageSize] as const,
};

export type Faction = NonNullable<
  Awaited<ReturnType<typeof useFactions>>['data']
>['data'][number];

export function useFactions({
  page,
  pageSize,
  ...options
}: {
  page: number;
  pageSize: number;
} & QueryOptionsFromFn<typeof fetchFactions>) {
  return useQuery({
    queryKey: factionKeys.paged(page, pageSize),
    queryFn: () => fetchFactions({ page, pageSize }),
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
