import { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';

export type FactionFilterValues = {
  identities: string[] | null;
  cardsRange: [number, number];
  creaturesRange: [number, number];
  nonCreaturesRange: [number, number];
};

type UseFactionFormOptions = {
  values: FactionFilterValues;
  onSubmit?: (values: FactionFilterValues) => void;
  isOpen?: boolean;
};

export function useFactionForm({
  values,
  onSubmit,
  isOpen,
}: UseFactionFormOptions) {
  const form = useForm({
    defaultValues: values,
    onSubmit: async ({ value }) => {
      onSubmit?.(value);
    },
  });

  useEffect(() => {
    if (!isOpen) return; // don't reset while hidden
    form.reset(values);
  }, [form, isOpen, values]);

  return {
    form,
  };
}
