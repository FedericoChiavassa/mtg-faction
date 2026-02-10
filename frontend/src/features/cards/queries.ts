import { useQuery } from '@tanstack/react-query';

import type { QueryOptionsFromFn } from '@/lib/query/types';

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
} & QueryOptionsFromFn<typeof fetchCards>) {
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
