import { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';

import { FactionCombobox } from '@/features/factions/ui/faction-combobox';

import { CardTypeToggle, type CardTypeValue } from './card-type-toggle';

export type CardFilterValues = {
  faction: string | null | undefined;
  cardType: CardTypeValue;
};

type Props = {
  initialValues?: CardFilterValues;
  onSubmit?: (values: CardFilterValues) => void;
  onChange?: (values: CardFilterValues) => void;
};

export function CardFilterForm({
  initialValues = { faction: null, cardType: 'all' },
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
        name="cardType"
        // eslint-disable-next-line react/no-children-prop
        children={field => (
          <CardTypeToggle
            value={field.state.value}
            onValueChange={cardType => {
              field.handleChange(cardType);
            }}
          />
        )}
      />
    </form>
  );
}
