import { FieldSet } from '@/components/ui/field';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function CardTypeToggle({
  value,
  onValueChange,
}: {
  value: boolean | undefined;
  onValueChange: (value: boolean | undefined) => void;
}) {
  const toggleValue =
    value === undefined ? 'all' : value === true ? 'creature' : 'non-creature';

  const handleChange = ([val]: string[]) => {
    if (!val) return;

    if (val === 'all') {
      onValueChange(undefined);
    } else if (val === 'creature') {
      onValueChange(true);
    } else {
      onValueChange(false);
    }
  };

  return (
    <FieldSet>
      <ToggleGroup
        size="sm"
        variant="outline"
        value={[toggleValue]}
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
