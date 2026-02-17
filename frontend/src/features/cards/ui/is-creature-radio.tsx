import {
  Field,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function IsCreatureRadio({
  value,
  onValueChange,
}: {
  value: boolean | undefined;
  onValueChange: (value: boolean | undefined) => void;
}) {
  const radioValue =
    value === undefined ? 'all' : value === true ? 'creature' : 'non-creature';

  const handleChange = (val: string) => {
    if (val === 'all') {
      onValueChange(undefined);
    } else if (val === 'creature') {
      onValueChange(true);
    } else {
      onValueChange(false);
    }
  };

  return (
    <FieldSet className="w-full max-w-xs">
      <FieldLegend variant="label">Card Type</FieldLegend>

      <RadioGroup value={radioValue} onValueChange={handleChange}>
        <Field orientation="horizontal">
          <RadioGroupItem value="all" id="card-type-all" />
          <FieldLabel className="font-normal" htmlFor="card-type-all">
            All
          </FieldLabel>
        </Field>

        <Field orientation="horizontal">
          <RadioGroupItem value="creature" id="card-type-creature" />
          <FieldLabel className="font-normal" htmlFor="card-type-creature">
            Creatures
          </FieldLabel>
        </Field>

        <Field orientation="horizontal">
          <RadioGroupItem value="non-creature" id="card-type-non-creature" />
          <FieldLabel className="font-normal" htmlFor="card-type-non-creature">
            Non Creatures
          </FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  );
}
