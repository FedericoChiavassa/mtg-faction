import { FieldSet } from '@/components/ui/field';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type CardTypeValue = 'all' | 'creature' | 'non-creature';

export function CardTypeToggle({
  value,
  onValueChange,
}: {
  value: CardTypeValue;
  onValueChange: (value: CardTypeValue) => void;
}) {
  const handleChange = ([val]: CardTypeValue[]) => {
    if (!val) return;

    onValueChange(val);
  };

  return (
    <FieldSet>
      <ToggleGroup
        size="sm"
        value={[value]}
        variant="outline"
        onValueChange={handleChange}
      >
        <ToggleGroupItem
          value="all"
          className="font-normal"
          aria-label="Show all cards"
        >
          All
        </ToggleGroupItem>
        <ToggleGroupItem
          value="creature"
          className="font-normal"
          aria-label="Show creatures"
        >
          Creatures
        </ToggleGroupItem>
        <ToggleGroupItem
          value="non-creature"
          className="font-normal"
          aria-label="Show non-creatures"
        >
          Non Creatures
        </ToggleGroupItem>
      </ToggleGroup>
    </FieldSet>
  );
}
