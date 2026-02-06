import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { fetchFactions } from './api';

export const factionKeys = {
  all: ['factions'] as const,
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
} & Omit<
  UseQueryOptions<Awaited<ReturnType<typeof fetchFactions>>>,
  'queryKey' | 'queryFn'
>) {
  return useQuery({
    queryKey: factionKeys.paged(page, pageSize),
    queryFn: () => fetchFactions({ page, pageSize }),
    ...options,
  });
}
