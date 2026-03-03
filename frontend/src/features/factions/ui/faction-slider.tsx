import { useState } from 'react';
import type { SliderRootChangeEventDetails } from '@base-ui/react/slider';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

type SliderValue = Parameters<typeof Slider>[0]['value'];
type SliderOnChange = Parameters<typeof Slider>[0]['onValueChange'];

type Props<TValue extends SliderValue = SliderValue> = {
  label: string;
  id?: string;
  value?: TValue;
  defaultValue?: TValue;
  max?: number;
  onChange?: (
    value: TValue,
    eventDetails: SliderRootChangeEventDetails,
  ) => void;
};

export function FactionSlider<TValue extends SliderValue = SliderValue>({
  id = 'faction-slider',
  label,
  value: controlledValue,
  onChange,
  defaultValue,
  max = 9999,
}: Props<TValue>) {
  const [internalValue, setInternalValue] = useState<TValue>(
    (defaultValue ?? [0]) as TValue,
  );
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleValueChange: SliderOnChange = (newValue, eventDetails) => {
    if (!isControlled) {
      setInternalValue(newValue as TValue);
    }
    onChange?.(newValue as TValue, eventDetails);
  };

  return (
    <div className="grid w-full gap-3 rounded-sm border p-4 pt-3.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-xs">
          {label}
        </Label>
        <span className="text-xs text-muted-foreground">
          {typeof value === 'number' ? value : value?.join(' - ')}
        </span>
      </div>
      <Slider
        min={0}
        id={id}
        max={max}
        value={value}
        onValueChange={handleValueChange}
      />
    </div>
  );
}
