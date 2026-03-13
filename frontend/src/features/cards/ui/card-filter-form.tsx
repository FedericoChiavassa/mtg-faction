import { useEffect, useRef, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { ListChevronsDownUp, ListChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
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
  isMobile?: boolean;
};

export function CardFilterForm({
  initialValues = { faction: null, cardType: 'all' },
  onSubmit,
  onChange,
  isMobile,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const isResetting = useRef(false);

  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      onSubmit?.(value);
    },
  });

  // Sync form fields when initialValues changes from outside
  useEffect(() => {
    isResetting.current = true;
    form.reset(initialValues);
    setTimeout(() => {
      isResetting.current = false;
    }, 0);
  }, [form, initialValues]);

  // Fire onChange only for user-driven changes
  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      if (isResetting.current) return;
      const values = form.store.state.values;
      if (values.faction) {
        onChange?.(values);
      }
    });

    return unsubscribe;
  }, [form, onChange]);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className={cn(
        'flex items-center gap-4',
        isMobile && 'w-full flex-col *:w-full',
      )}
    >
      <div className="flex items-center gap-2 max-md:px-4">
        <form.Field
          name="faction"
          // eslint-disable-next-line react/no-children-prop
          children={field => (
            <FactionCombobox
              size="sm"
              value={field.state.value}
              className="md:w-[calc(100dvw-600px)]"
              onValueChange={faction => {
                field.handleChange(faction);
              }}
            />
          )}
        />

        {isMobile && (
          <Button
            size="icon-sm"
            variant="outline"
            className="relative"
            onClick={() => setFiltersOpen(prev => !prev)}
          >
            {filtersOpen ? <ListChevronsDownUp /> : <ListChevronsUpDown />}
            {form.state.values['cardType'] !== 'all' && !filtersOpen && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="absolute -top-[20%] -left-[20%] inline-flex h-[140%] w-[140%] rounded-full bg-muted-foreground/50"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full border border-background bg-primary"></span>
              </span>
            )}
          </Button>
        )}
      </div>

      <Collapsible
        open={filtersOpen}
        className="flex w-full"
        onOpenChange={setFiltersOpen}
      >
        <CollapsibleContent animate keepMounted className="flex-1">
          {isMobile && <Separator className="mb-4" />}
          <form.Field
            name="cardType"
            // eslint-disable-next-line react/no-children-prop
            children={field => (
              <div className="max-md:mb-4 max-md:w-full max-md:px-4">
                <CardTypeToggle
                  value={field.state.value}
                  originalColors={isMobile}
                  className="max-md:w-full max-md:shadow-none!"
                  orientation={isMobile ? 'vertical' : 'horizontal'}
                  onValueChange={cardType => {
                    field.handleChange(cardType);
                  }}
                />
              </div>
            )}
          />
        </CollapsibleContent>
      </Collapsible>
    </form>
  );
}
