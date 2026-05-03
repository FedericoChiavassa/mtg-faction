import { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';

import { useDirtyFields } from './use-dirty-fields';
import { useFormBadges } from './use-form-badges';

export type FactionFilterValues = {
  identities: string[] | undefined;
  maxIdentities: number | null | undefined;
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
  const { isDirty } = useDirtyFields(values);
  const formBadges = useFormBadges(values);

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
    isFormDirty: isDirty,
    formBadges,
  };
}
