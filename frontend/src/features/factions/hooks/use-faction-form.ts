import { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';

export type FactionFilterValues = {
  cardsRange: [number, number];
  creaturesRange: [number, number];
  nonCreaturesRange: [number, number];
};

type UseFactionFormOptions = {
  values: FactionFilterValues;
  onSubmit?: (values: FactionFilterValues) => void;
};

export function useFactionForm({ values, onSubmit }: UseFactionFormOptions) {
  const form = useForm({
    defaultValues: values,
    onSubmit: async ({ value }) => {
      onSubmit?.(value);
    },
  });

  useEffect(() => {
    form.reset(values);
  }, [form, values]);

  return {
    form,
  };
}
