import { useStore } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Field, FieldGroup } from '@/components/ui/field';
import type { FactionStats } from '@/features/factions/queries';

import type { useFactionForm } from '../hooks/use-faction-form';
import { FactionSlider } from './faction-slider';
import { IdentityCombobox } from './Identity-combobox';

type Props = {
  form: ReturnType<typeof useFactionForm>['form'];
  className?: string;
  stats?: FactionStats;
  isDirty?: boolean;
  actions?: React.ReactNode;
  onReset?: () => void;
};

export function FactionFilterForm({
  form,
  className,
  stats,
  isDirty,
  actions,
  onReset,
}: Props) {
  const isTouched = useStore(form.store, state => state.isTouched);

  return (
    <div className={className}>
      <form
        onSubmit={e => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className="grid grid-cols-2 gap-6">
          {/* <NameCombobox />*/}
          {/* <IdentityCount />*/}
          <FieldGroup className="gap-2">
            <form.Field
              name="identities"
              // eslint-disable-next-line react/no-children-prop
              children={field => (
                <Field>
                  <IdentityCombobox
                    value={field.state.value}
                    onValueChange={val => field.handleChange(val)}
                  />
                </Field>
              )}
            />
          </FieldGroup>

          <FieldGroup className="gap-2">
            <form.Field
              name="cardsRange"
              // eslint-disable-next-line react/no-children-prop
              children={field => (
                <Field>
                  <FactionSlider
                    label="Cards"
                    value={field.state.value}
                    max={stats?.maxCards ?? 9999}
                    id="faction-slider-cards-range"
                    onChange={val => field.handleChange(val)}
                  />
                </Field>
              )}
            />

            <form.Field
              name="creaturesRange"
              // eslint-disable-next-line react/no-children-prop
              children={field => (
                <Field>
                  <FactionSlider
                    label="Creatures"
                    value={field.state.value}
                    max={stats?.maxCreatures ?? 9999}
                    id="faction-slider-creatures-range"
                    onChange={val => field.handleChange(val)}
                  />
                </Field>
              )}
            />

            <form.Field
              name="nonCreaturesRange"
              // eslint-disable-next-line react/no-children-prop
              children={field => (
                <Field>
                  <FactionSlider
                    label="Non Creatures"
                    value={field.state.value}
                    max={stats?.maxNonCreatures ?? 9999}
                    id="faction-slider-non-creatures-range"
                    onChange={val => field.handleChange(val)}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          {actions}
          {isDirty && (
            <Button
              size="xs"
              type="reset"
              variant="outline"
              onClick={onReset}
              nativeButton={false}
              className="no-underline!"
              render={
                <Link
                  to="/factions"
                  search={prev => ({
                    perPage: prev.perPage,
                    sortBy: prev.sortBy,
                  })}
                />
              }
            >
              Reset
            </Button>
          )}
          <Button
            size="xs"
            type="submit"
            disabled={!isTouched}
            className="cursor-pointer"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
}
