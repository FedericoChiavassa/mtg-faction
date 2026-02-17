import { useState } from 'react';

import { VirtualizedCombobox } from '@/components/virtualized-combobox';

import { matchesFaction } from '../lib/factionMatcher';
import { type FactionList, useFactionsList } from '../queries';

export type FactionComboboxProps = {
  value?: FactionList | null;
  onValueChange?: (value: FactionList | null) => void;
  placeholder?: string;
};

export function FactionCombobox({
  value: controlledValue,
  onValueChange,
  placeholder = 'Select a faction',
}: FactionComboboxProps) {
  const [internalValue, setInternalValue] = useState<FactionList | null>(null);

  const { data: factionList, isLoading } = useFactionsList();

  const value = controlledValue ?? internalValue;

  const handleValueChange = (optionId: string | null) => {
    const newValue =
      factionList?.find(faction => faction.id === optionId) ?? null;
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <VirtualizedCombobox
      value={value?.id}
      loading={isLoading}
      filter={matchesFaction}
      options={factionList ?? []}
      triggerPlaceholder={placeholder}
      onValueChange={handleValueChange}
      searchPlaceholder="Search a faction..."
    />
  );
}
