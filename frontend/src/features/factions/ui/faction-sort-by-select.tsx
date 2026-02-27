import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { useFactions } from '../queries';

type SortByValue = Parameters<typeof useFactions>[0]['sortBy'] | null;

export function FactionSortBySelect({
  value,
  onChange,
}: {
  value: SortByValue;
  onChange: (val: SortByValue) => void;
}) {
  const options: {
    value: SortByValue;
    label: React.ReactNode;
  }[] = [
    { value: 'name', label: 'Name' },
    {
      value: 'identity_count',
      label: (
        <span>
          Name{' '}
          <span className="text-xs font-normal italic">
            – Fewer Types First
          </span>
        </span>
      ),
    },
    { value: 'count', label: 'Cards' },
    { value: 'creatures_count', label: 'Creatures' },
    { value: 'non_creatures_count', label: 'Non Creatures' },
  ];

  const selectedLabel = options.find(opt => opt.value === value)?.label;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm">
        <SelectValue placeholder="Sort by...">{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {options.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
