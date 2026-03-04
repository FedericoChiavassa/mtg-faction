import { useQuery } from '@tanstack/react-query';

import type { QueryOptionsFromFn } from '@/lib/query/types';

import { fetchCreatureTypes } from './api';

export const creatureTypeKeys = {
  all: ['creature-types'] as const,
};

export function useCreatureTypes({
  ...options
}: QueryOptionsFromFn<typeof fetchCreatureTypes>) {
  return useQuery({
    queryKey: creatureTypeKeys.all,
    queryFn: fetchCreatureTypes,
    ...options,
  });
}
