import { useState } from 'react';
import type { SliderRootChangeEventDetails } from '@base-ui/react/slider';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

type SliderValue = Parameters<typeof Slider>[0]['value'];
type SliderOnChange = Parameters<typeof Slider>[0]['onValueChange'];

type Props<TValue extends SliderValue = SliderValue> = {
  label?: string;
  id?: string;
  value?: TValue;
  defaultValue?: TValue;
  max?: number;
  onChange?: (
    value: TValue,
    eventDetails: SliderRootChangeEventDetails,
  ) => void;
  className?: string;
};

export function CountSlider<TValue extends SliderValue = SliderValue>({
  id = 'count-slider',
  label,
  value: controlledValue,
  onChange,
  defaultValue,
  max = 9999,
  className,
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
    <div
      className={cn(
        'grid w-[min(100%,420px)] max-w-md flex-1 gap-2.5',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        {label && (
          <Label htmlFor={id} className="mr-auto text-xs">
            {label}
          </Label>
        )}
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
