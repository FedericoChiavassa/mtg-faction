import { useState } from 'react';

import { VirtualizedCombobox } from '@/components/virtualized-combobox';

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

  const { data: factionList } = useAllFactions();

  const value = controlledValue ?? internalValue;

  const handleValueChange = (value: string | null) => {
    const newValue = factionList?.find(faction => faction.id === value) ?? null;
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <VirtualizedCombobox
      value={value?.id}
      filter={matchesFaction}
      options={factionList ?? []}
      triggerPlaceholder={placeholder}
      onValueChange={handleValueChange}
      searchPlaceholder="Search a faction..."
    />
  );
}
