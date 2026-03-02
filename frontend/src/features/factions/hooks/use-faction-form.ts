import { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';

import type { useFactions } from '../queries';

export const DEFAULT_PER_PAGE = 15;
export const DEFAULT_SORT_BY = 'count';

export type FactionFilterValues = {
  perPage: Parameters<typeof useFactions>[0]['pageSize'];
  sortBy: Parameters<typeof useFactions>[0]['sortBy'] | null;
  cardsRange: [number, number];
  creaturesRange: [number, number];
  nonCreaturesRange: [number, number];
};

type UseFactionFormOptions = {
  initialValues?: FactionFilterValues;
  onSubmit?: (values: FactionFilterValues) => void;
  onChange?: (values: FactionFilterValues) => void;
  limits: {
    cardsLimit: number;
    creaturesLimit: number;
    nonCreaturesLimit: number;
  };
};

export function useFactionForm({
  initialValues = {
    perPage: DEFAULT_PER_PAGE,
    sortBy: DEFAULT_SORT_BY,
    cardsRange: [0, 9999],
    creaturesRange: [0, 9999],
    nonCreaturesRange: [0, 9999],
  },
  onSubmit,
  onChange,
  limits,
}: UseFactionFormOptions) {
  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      onSubmit?.(value);
    },
  });

  const {
    perPage,
    sortBy,
    cardsRange: [minCards, maxCards],
    creaturesRange: [minCreatures, maxCreatures],
    nonCreaturesRange: [minNonCreatures, maxNonCreatures],
  } = initialValues;

  const { cardsLimit, creaturesLimit, nonCreaturesLimit } = limits;

  const isDirty =
    perPage !== DEFAULT_PER_PAGE ||
    sortBy !== DEFAULT_SORT_BY ||
    minCards !== 0 ||
    maxCards !== cardsLimit ||
    minCreatures !== 0 ||
    maxCreatures !== creaturesLimit ||
    minNonCreatures !== 0 ||
    maxNonCreatures !== nonCreaturesLimit;

  useEffect(() => {
    const unsubscribe = form.store.subscribe(({ currentVal }) => {
      onChange?.(currentVal.values);
    });
    return unsubscribe;
  }, [form, onChange]);

  return {
    form,
    isDirty,
  };
}
