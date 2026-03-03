/* eslint-disable react/no-children-prop */
import { useStore } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import { FingerprintPattern, Layers, PawPrint, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
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

const fieldLabelStyle = 'w-[20%] pr-3 grow-0! text-xs';

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
        <div className="flex flex-col gap-6">
          <FieldGroup className="gap-2">
            <form.Field
              name="identities"
              children={field => (
                <Field orientation="horizontal">
                  <FieldLabel className={fieldLabelStyle}>
                    <FingerprintPattern size={16} />
                    Creature Types
                  </FieldLabel>
                  <IdentityCombobox
                    value={field.state.value}
                    className="max-w-105 flex-1"
                    onValueChange={val => field.handleChange(val)}
                  />
                </Field>
              )}
            />
          </FieldGroup>

          <FieldSeparator />

          <FieldGroup className="gap-6">
            <form.Field
              name="cardsRange"
              children={field => (
                <Field orientation="horizontal">
                  <FieldLabel
                    className={cn(fieldLabelStyle, 'self-baseline-last')}
                  >
                    <Layers size={16} />
                    Cards Range
                  </FieldLabel>
                  <FactionSlider
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
              children={field => (
                <Field orientation="horizontal">
                  <FieldLabel
                    className={cn(fieldLabelStyle, 'self-baseline-last')}
                  >
                    <PawPrint size={16} />
                    Creatures Range
                  </FieldLabel>
                  <FactionSlider
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
              children={field => (
                <Field orientation="horizontal">
                  <FieldLabel
                    className={cn(fieldLabelStyle, 'self-baseline-last')}
                  >
                    <Sparkles size={16} />
                    Non Creatures Range
                  </FieldLabel>
                  <FactionSlider
                    value={field.state.value}
                    max={stats?.maxNonCreatures ?? 9999}
                    id="faction-slider-non-creatures-range"
                    onChange={val => field.handleChange(val)}
                  />
                </Field>
              )}
            />
          </FieldGroup>

          <FieldSeparator className="mt-2.5" />
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
                  resetScroll={false}
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
