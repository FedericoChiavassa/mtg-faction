import { useState } from 'react';
import type { SliderRootChangeEventDetails } from '@base-ui/react/slider';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

type ValueType = number;
type OnChangeType = (
  value: number,
  eventDetails: SliderRootChangeEventDetails,
) => void;

export function FactionSlider({
  id = 'faction-slider',
  label,
  value: controlledValue,
  onChange,
}: {
  label: string;
  id?: string;
  value?: ValueType;
  onChange?: OnChangeType;
}) {
  const [internalValue, setInternalValue] = useState<ValueType>(0);
  const value = controlledValue ?? internalValue;

  const handleValueChange: OnChangeType = (newValue, eventDetails) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue, eventDetails);
  };

  return (
    <div className="grid w-full max-w-xs gap-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-sm text-muted-foreground">{value}+</span>
      </div>
      <Slider
        min={0}
        id={id}
        max={999}
        value={value}
        orientation="horizontal-reverse"
        onValueChange={(v, eventDetails) =>
          typeof v === 'number' ? handleValueChange(v, eventDetails) : null
        }
      />
    </div>
  );
}
