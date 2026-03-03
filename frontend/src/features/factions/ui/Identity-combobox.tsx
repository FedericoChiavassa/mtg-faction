import { cn } from '@/lib/utils';
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
  className,
}: {
  value: string[] | null;
  onValueChange: (value: string[] | null) => void;
  className?: string;
}) {
  return (
    <Select multiple value={value} onValueChange={onValueChange}>
      <SelectTrigger size="sm" className={cn('shadow-none', className)}>
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
