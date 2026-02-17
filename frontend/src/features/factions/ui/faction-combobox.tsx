import { useState } from 'react';

import { VirtualizedCombobox } from '@/components/virtualized-combobox';

import { searchMatchesFaction } from '../lib/faction-matcher';
import { type FactionList, useFactionList } from '../queries';

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

  const { data: factionList, isLoading } = useFactionList();

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
      options={factionList ?? []}
      filter={searchMatchesFaction}
      triggerPlaceholder={placeholder}
      onValueChange={handleValueChange}
      searchPlaceholder="Search a faction..."
    />
  );
}
