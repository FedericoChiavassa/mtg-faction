import * as React from 'react';
import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { cn } from '@/lib/utils';

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  orientation = 'horizontal',
  ...props
}: Omit<SliderPrimitive.Root.Props, 'orientation'> & {
  orientation?:
    | SliderPrimitive.Root.Props['orientation']
    | 'horizontal-reverse';
}) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      min={min}
      max={max}
      value={value}
      data-slot="slider"
      thumbAlignment="edge"
      defaultValue={defaultValue}
      className={cn('data-horizontal:w-full data-vertical:h-full', className)}
      orientation={
        orientation === 'horizontal-reverse' ? 'horizontal' : orientation
      }
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1.5"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
            style={
              orientation === 'horizontal-reverse'
                ? {
                    position: 'absolute',
                    width: 'calc(100% - var(--start-position))',
                    left: 'auto',
                    right: 0,
                  }
                : undefined
            }
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            data-slot="slider-thumb"
            className="block size-3 shrink-0 rounded-full border border-primary bg-primary-foreground shadow-sm ring-ring/50 transition-[color,box-shadow] select-none hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
