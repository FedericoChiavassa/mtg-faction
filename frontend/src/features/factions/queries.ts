import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { type FactionsResponse, fetchFactions } from './api';

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
} & Omit<UseQueryOptions<FactionsResponse>, 'queryKey' | 'queryFn'>) {
  return useQuery<FactionsResponse>({
    queryKey: factionKeys.paged(page, pageSize),
    queryFn: () => fetchFactions({ page, pageSize }),
    ...options,
  });
}
