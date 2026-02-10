import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { fetchCards } from './api';

export const cardKeys = {
  all: ['cards'] as const,
  paged: (factionId: string, page: number, pageSize: number) =>
    [...cardKeys.all, factionId, page, pageSize] as const,
};

export function useCards({
  factionId,
  page,
  pageSize,
  ...options
}: {
  factionId: string;
  page: number;
  pageSize: number;
} & Omit<
  UseQueryOptions<Awaited<ReturnType<typeof fetchCards>>>,
  'queryKey' | 'queryFn'
>) {
  return useQuery({
    queryKey: cardKeys.paged(factionId, page, pageSize),
    queryFn: () =>
      fetchCards({
        faction: factionId,
        page,
        pageSize,
      }),
    enabled: !!factionId,
    ...options,
  });
}
