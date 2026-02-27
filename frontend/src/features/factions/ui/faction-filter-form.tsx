import { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import type { useFactions } from '@/features/factions/queries';

import { FactionSortBySelect } from './faction-sort-by-select';

export type FactionFilterValues = {
  sortBy: Parameters<typeof useFactions>[0]['sortBy'] | null;
};

type Props = {
  initialValues?: FactionFilterValues;
  onSubmit?: (values: FactionFilterValues) => void;
  onChange?: (values: FactionFilterValues) => void;
};

export function FactionFilterForm({
  initialValues = {
    sortBy: 'count',
  },
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
    form.reset(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      const values = form.store.state.values;
      onChange?.(values);
    });
    return unsubscribe;
  }, [form, onChange]);

  return (
    <div className="mb-8">
      <form
        onSubmit={e => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <FieldGroup>
              <form.Field
                name="sortBy"
                // eslint-disable-next-line react/no-children-prop
                children={field => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Sort By</FieldLabel>
                    <FactionSortBySelect
                      value={field.state.value}
                      onChange={val => field.handleChange(val)}
                    />
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          <div className="space-y-6">
            {/* Other form fields would go here */}
            {/* <NameCombobox />
              <CardsSlider />
              <CreaturesSlider />
              <NonCreaturesSlider /> */}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link to="/factions" />}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
