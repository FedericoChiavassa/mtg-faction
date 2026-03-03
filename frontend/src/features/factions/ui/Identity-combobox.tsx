import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function IdentityCombobox({
  value,
  onValueChange,
}: {
  value: string[] | null;
  onValueChange: (value: string[] | null) => void;
}) {
  return (
    <Select multiple value={value} onValueChange={onValueChange}>
      <SelectTrigger size="sm">
        <SelectValue placeholder="Select an identity..." />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          <SelectItem value="light">Lorem</SelectItem>
          <SelectItem value="dark">Ipsum</SelectItem>
          <SelectItem value="system">Dolor Sit</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
