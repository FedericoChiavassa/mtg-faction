import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Field, FieldGroup } from '@/components/ui/field';
import type { FactionStats } from '@/features/factions/queries';

import type { useFactionForm } from '../hooks/use-faction-form';
import { FactionSlider } from './faction-slider';

type Props = {
  form: ReturnType<typeof useFactionForm>['form'];
  className?: string;
  stats?: FactionStats;
};

export function FactionFilterForm({ form, className, stats }: Props) {
  return (
    <div className={className}>
      <form
        onSubmit={e => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className="space-y-6">
          {/* <NameCombobox />*/}
          {/* <IdentityCount />*/}

          <FieldGroup>
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
          <Button
            size="sm"
            type="reset"
            variant="outline"
            nativeButton={false}
            className="no-underline!"
            render={<Link to="/factions" />}
            onClick={e => {
              e.stopPropagation();
              void form.reset();
            }}
          >
            Reset
          </Button>
          <Button size="sm" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
}
