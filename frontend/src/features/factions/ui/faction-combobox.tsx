import { useState } from 'react';

import { cn } from '@/lib/utils';
import {
  VirtualizedCombobox,
  type VirtualizedComboboxProps,
  VirtualizedCommand,
} from '@/components/virtualized-combobox';
import { useIsMobile } from '@/hooks/use-is-mobile';

import { searchMatchesFaction } from '../lib/faction-matcher';
import { useFactionList } from '../queries';

export type FactionComboboxProps = {
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  size?: VirtualizedComboboxProps['size'];
  hasPopover?: boolean;
  className?: string;
};

export function FactionCombobox({
  value: controlledValue,
  onValueChange,
  placeholder = 'Select a faction',
  size,
  hasPopover = true,
  className,
}: FactionComboboxProps) {
  const isMobile = useIsMobile();
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

  return hasPopover ? (
    <VirtualizedCombobox
      size={size}
      value={value}
      loading={isLoading}
      className={className}
      capitalizeCommandValue
      options={factionList ?? []}
      filter={searchMatchesFaction}
      triggerPlaceholder={placeholder}
      onValueChange={handleValueChange}
      searchPlaceholder="Search a faction..."
    />
  ) : (
    <VirtualizedCommand
      capitalizeValue
      loading={isLoading}
      autofocus={!isMobile}
      placeholder={placeholder}
      options={factionList ?? []}
      selectedOption={value ?? ''}
      filter={searchMatchesFaction}
      onSelectOption={handleValueChange}
      className={cn('max-w-md rounded-lg border', className)}
    />
  );
}
