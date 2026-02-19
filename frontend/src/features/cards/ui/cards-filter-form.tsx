import { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';

import type { FactionList } from '@/features/factions/queries';
import { FactionCombobox } from '@/features/factions/ui/faction-combobox';

import { CardTypeToggle } from './card-type-toggle';

export type CardsFilterValues = {
  faction: FactionList | null;
  isCreature: boolean | undefined;
};

type Props = {
  initialValues?: CardsFilterValues;
  onSubmit?: (values: CardsFilterValues) => void;
  onChange?: (values: CardsFilterValues) => void;
};

export function CardsFilterForm({
  initialValues = { faction: null, isCreature: undefined },
  onSubmit,
  onChange,
}: Props) {
  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      onSubmit?.(value);
    },
  });

  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      const values = form.store.state.values;
      if (values.faction) {
        onChange?.(values);
      }
    });

    return unsubscribe;
  }, [form, onChange]);

  return (
    <form
      className="flex items-center gap-4"
      onSubmit={e => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="faction"
        // eslint-disable-next-line react/no-children-prop
        children={field => (
          <FactionCombobox
            size="sm"
            value={field.state.value}
            onValueChange={faction => {
              field.handleChange(faction);
            }}
          />
        )}
      />

      <form.Field
        name="isCreature"
        // eslint-disable-next-line react/no-children-prop
        children={field => (
          <CardTypeToggle
            value={field.state.value}
            onValueChange={isCreature => {
              field.handleChange(isCreature);
            }}
          />
        )}
      />
    </form>
  );
}
