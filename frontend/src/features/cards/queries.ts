import { useQuery } from '@tanstack/react-query';

import type { QueryOptionsFromFn } from '@/lib/query/types';

import { fetchCards } from './api';

export const cardKeys = {
  all: ['cards'] as const,
  paged: (
    factionId: string,
    isCreature: boolean | undefined,
    page: number,
    pageSize: number,
  ) => [...cardKeys.all, factionId, isCreature, page, pageSize] as const,
};

export function useCards({
  factionId,
  isCreature,
  page,
  pageSize,
  ...options
}: {
  factionId: string;
  isCreature?: boolean;
  page: number;
  pageSize: number;
} & QueryOptionsFromFn<typeof fetchCards>) {
  return useQuery({
    queryKey: cardKeys.paged(factionId, isCreature, page, pageSize),
    queryFn: () =>
      fetchCards({
        faction: factionId,
        isCreature,
        page,
        pageSize,
      }),
    enabled: !!factionId,
    ...options,
  });
}
