/* eslint-disable react/no-children-prop */
import { useStore } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import {
  CircleChevronUp,
  FingerprintPattern,
  Layers,
  PawPrint,
  RulerDimensionLine,
  Sparkles,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { IdentityCombobox } from '@/features/creature-types/ui/Identity-combobox';
import { IdentityCountToggle } from '@/features/creature-types/ui/identity-count-toggle';
import type { FactionStats } from '@/features/factions/queries';

import type { useFactionForm } from '../hooks/use-faction-form';
import { CountSlider } from './count-slider';

type Props = {
  form: ReturnType<typeof useFactionForm>['form'];
  className?: string;
  stats?: FactionStats;
  isDirty?: boolean;
  onReset?: () => void;
  onClose?: () => void;
};

const fieldLabelStyle = 'w-[21%] pr-3 grow-0! text-xs';

export function FilterForm({
  form,
  className,
  stats,
  isDirty,
  onReset,
  onClose,
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
                    className="max-w-md flex-1"
                    onValueChange={val => field.handleChange(val)}
                  />
                </Field>
              )}
            />
          </FieldGroup>

          <FieldSeparator />

          <FieldGroup className="gap-2">
            <form.Field
              name="maxIdentities"
              children={field => (
                <Field orientation="horizontal">
                  <FieldLabel className={fieldLabelStyle}>
                    <RulerDimensionLine size={16} />
                    Number of Creature Types
                  </FieldLabel>
                  <IdentityCountToggle
                    value={field.state.value?.toString()}
                    onValueChange={val =>
                      field.handleChange(val ? Number(val) : null)
                    }
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
                  <CountSlider
                    id="slider-cards-range"
                    value={field.state.value}
                    max={stats?.maxCards ?? 9999}
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
                  <CountSlider
                    value={field.state.value}
                    id="slider-creatures-range"
                    max={stats?.maxCreatures ?? 9999}
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
                  <CountSlider
                    value={field.state.value}
                    id="slider-non-creatures-range"
                    max={stats?.maxNonCreatures ?? 9999}
                    onChange={val => field.handleChange(val)}
                  />
                </Field>
              )}
            />
          </FieldGroup>

          <FieldSeparator className="mt-2.5" />
        </div>

        <div className="mt-6 ml-[21%] flex flex-1 items-center pl-3">
          <div className="flex max-w-md flex-1 items-center gap-2">
            <Button
              size="xs"
              type="submit"
              disabled={!isTouched}
              className="flex-1 cursor-pointer"
            >
              Submit
            </Button>
            <Button
              size="xs"
              type="reset"
              variant="outline"
              onClick={onReset}
              nativeButton={false}
              className={cn('flex-1 no-underline!', !isDirty && 'invisible')}
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
          </div>
        </div>

        <FieldSeparator className="mt-3" />
      </form>

      {onClose && (
        <div className="mt-2 flex justify-center">
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="cursor-pointer"
          >
            <CircleChevronUp />
          </Button>
        </div>
      )}
    </div>
  );
}
