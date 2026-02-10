import { useQuery } from '@tanstack/react-query';

import type { QueryOptionsFromFn } from '@/lib/query/types';

import { fetchAllFactions, fetchFactions } from './api';

export const factionKeys = {
  all: ['factions'] as const,
  list: () => [...factionKeys.all, 'list'] as const,
  paged: (page: number, pageSize: number) =>
    [...factionKeys.all, page, pageSize] as const,
};

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

export function useAllFactions(
  options: QueryOptionsFromFn<typeof fetchAllFactions> = {},
) {
  return useQuery({
    queryKey: factionKeys.list(),
    queryFn: fetchAllFactions,
    staleTime: Infinity,
    ...options,
  });
}
