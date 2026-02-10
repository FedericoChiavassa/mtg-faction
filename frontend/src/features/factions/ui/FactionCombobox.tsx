import { useState } from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

import { matchesFaction } from '../lib/factionMatcher';
import { useAllFactions } from '../queries';

// Extract the faction type
type Faction = NonNullable<ReturnType<typeof useAllFactions>['data']>[number];

export type FactionComboboxProps = {
  value?: Faction | null;
  onValueChange?: (value: Faction | null) => void;
  placeholder?: string;
};

export function FactionCombobox({
  value: controlledValue,
  onValueChange,
  placeholder = 'Select a faction',
}: FactionComboboxProps) {
  const [internalValue, setInternalValue] = useState<Faction | null>(null);

  const { data: factionList, isLoading, isError, error } = useAllFactions();

  const value = controlledValue ?? internalValue;

  const handleValueChange = (newValue: Faction | null) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <Combobox
      value={value}
      filter={matchesFaction}
      items={factionList ?? []}
      onValueChange={handleValueChange}
      itemToStringLabel={value => value?.name}
    >
      <ComboboxInput placeholder={placeholder} />
      <ComboboxContent>
        {isLoading && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading factions...
          </div>
        )}

        {isError && (
          <div className="p-4 text-sm text-destructive">
            Failed to load factions:{' '}
            {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <ComboboxEmpty>No factions found.</ComboboxEmpty>
            <ComboboxList>
              {(item: Faction) => (
                <ComboboxItem value={item} key={item.id}>
                  {item.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </>
        )}
      </ComboboxContent>
    </Combobox>
  );
}
