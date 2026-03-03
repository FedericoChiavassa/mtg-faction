import { cn } from '@/lib/utils';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';

import { useCreatureTypes } from '../queries';

export function IdentityCombobox({
  value,
  className,
  onValueChange,
}: {
  value: string[];
  className?: string;
  onValueChange?: (value: string[]) => void;
}) {
  const anchor = useComboboxAnchor();

  const { data: cratureTypes } = useCreatureTypes({});

  return (
    <Combobox
      multiple
      value={value}
      autoHighlight
      items={cratureTypes}
      onValueChange={onValueChange}
    >
      <ComboboxChips
        ref={anchor}
        className={cn('w-full max-w-md shadow-none', className)}
      >
        <ComboboxValue placeholder="Select creature types...">
          {values => (
            <>
              {values.map((val: string) => (
                <ComboboxChip key={val} className="capitalize">
                  {val}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                className="capitalize"
                placeholder="Select one or more creature types..."
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {item => (
            <ComboboxItem key={item} value={item} className="capitalize">
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
