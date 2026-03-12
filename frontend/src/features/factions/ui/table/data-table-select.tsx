import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type DataTableSelectOption<T extends string | number> = {
  value: T;
  label: React.ReactNode;
};

export function DataTableSelect<T extends string | number>({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: T | null | undefined;
  onChange: (val: T | null) => void;
  options: DataTableSelectOption<T>[];
  placeholder?: string;
}) {
  const selectedLabel = options.find(opt => opt.value === value)?.label;

  return (
    <Select onValueChange={onChange} value={value ?? undefined}>
      <SelectTrigger
        size="sm"
        className="h-7! cursor-pointer p-1.5 text-xs font-medium max-md:overflow-hidden"
      >
        <SelectValue
          className="max-md:truncate"
          placeholder={placeholder ?? 'Select...'}
        >
          {selectedLabel}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="end"
        className="w-auto"
        alignItemWithTrigger={false}
      >
        <SelectGroup>
          {options.map(opt => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="text-xs font-medium"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
