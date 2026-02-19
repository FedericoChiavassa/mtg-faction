import { useState } from 'react';

import {
  VirtualizedCombobox,
  type VirtualizedComboboxProps,
} from '@/components/virtualized-combobox';

import { searchMatchesFaction } from '../lib/faction-matcher';
import { useFactionList } from '../queries';

export type FactionComboboxProps = {
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  size?: VirtualizedComboboxProps['size'];
};

export function FactionCombobox({
  value: controlledValue,
  onValueChange,
  placeholder = 'Select a faction',
  size,
}: FactionComboboxProps) {
  const [internalValue, setInternalValue] =
    useState<FactionComboboxProps['value']>(null);

  const { data: factionList, isLoading } = useFactionList();

  const value = controlledValue ?? internalValue;

  const handleValueChange = (newValue: string | null) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <VirtualizedCombobox
      size={size}
      value={value}
      loading={isLoading}
      options={factionList ?? []}
      filter={searchMatchesFaction}
      triggerPlaceholder={placeholder}
      onValueChange={handleValueChange}
      searchPlaceholder="Search a faction..."
    />
  );
}
