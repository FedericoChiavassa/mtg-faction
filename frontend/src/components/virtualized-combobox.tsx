// The following file is a customization of
// https://github.com/oaarnikoivu/shadcn-virtualized-combobox

import type { KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type Option = {
  id: string;
  name: string;
};

type VirtualizedCommandProps<T extends Option = Option> = {
  height: string;
  options: T[];
  placeholder: string;
  selectedOption: string;
  filter?: (option: T, search: string) => boolean;
  onSelectOption?: (option: string) => void;
};

const VirtualizedCommand = <T extends Option = Option>({
  height,
  options,
  filter,
  placeholder,
  selectedOption,
  onSelectOption,
}: VirtualizedCommandProps<T>) => {
  const [filteredOptions, setFilteredOptions] = useState<T[]>(options);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isKeyboardNavActive, setIsKeyboardNavActive] = useState(false);

  const parentRef = useRef(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  });

  const virtualOptions = virtualizer.getVirtualItems();

  const scrollToIndex = useCallback(
    (index: number) => {
      virtualizer.scrollToIndex(index, {
        align: 'center',
      });
    },
    [virtualizer],
  );

  const updateFilteredOptions = useCallback(
    (search: string) => {
      if (filter) {
        setFilteredOptions(options.filter(option => filter(option, search)));
      } else {
        setFilteredOptions(
          options.filter(option =>
            option.name.toLowerCase().includes(search.toLowerCase() ?? []),
          ),
        );
      }
    },
    [filter, options],
  );

  const handleSearch = useCallback(
    (search: string) => {
      setIsKeyboardNavActive(false);
      updateFilteredOptions(search);
    },
    [updateFilteredOptions],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          setIsKeyboardNavActive(true);
          setFocusedIndex(prev => {
            const newIndex =
              prev === -1 ? 0 : Math.min(prev + 1, filteredOptions.length - 1);
            scrollToIndex(newIndex);
            return newIndex;
          });
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          setIsKeyboardNavActive(true);
          setFocusedIndex(prev => {
            const newIndex =
              prev === -1 ? filteredOptions.length - 1 : Math.max(prev - 1, 0);
            scrollToIndex(newIndex);
            return newIndex;
          });
          break;
        }
        case 'Enter': {
          event.preventDefault();
          if (filteredOptions[focusedIndex]) {
            onSelectOption?.(filteredOptions[focusedIndex].id);
          }
          break;
        }
        default:
          break;
      }
    },
    [filteredOptions, focusedIndex, onSelectOption, scrollToIndex],
  );

  useEffect(() => {
    if (selectedOption) {
      const option = filteredOptions.find(
        option => option.id === selectedOption,
      );
      if (option) {
        const index = filteredOptions.indexOf(option);
        setFocusedIndex(index);
        virtualizer.scrollToIndex(index, {
          align: 'center',
        });
      }
    }
  }, [selectedOption, filteredOptions, virtualizer]);

  return (
    <Command shouldFilter={false} onKeyDown={handleKeyDown}>
      <CommandInput placeholder={placeholder} onValueChange={handleSearch} />
      <CommandList
        ref={parentRef}
        onMouseDown={() => setIsKeyboardNavActive(false)}
        onMouseMove={() => setIsKeyboardNavActive(false)}
        style={{
          height: height,
          width: '100%',
          overflow: 'auto',
        }}
      >
        <CommandEmpty>No item found.</CommandEmpty>
        <CommandGroup>
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualOptions.map(virtualOption => (
              <CommandItem
                onSelect={onSelectOption}
                // disabled={isKeyboardNavActive} // greys out options - unsure of its purpose so commented out for now
                key={filteredOptions[virtualOption.index].id}
                value={filteredOptions[virtualOption.index].id}
                onMouseLeave={() => !isKeyboardNavActive && setFocusedIndex(-1)}
                onMouseEnter={() =>
                  !isKeyboardNavActive && setFocusedIndex(virtualOption.index)
                }
                style={{
                  height: `${virtualOption.size}px`,
                  transform: `translateY(${virtualOption.start}px)`,
                }}
                className={cn(
                  'absolute top-0 left-0 w-full bg-transparent',
                  focusedIndex === virtualOption.index &&
                    'bg-accent text-accent-foreground',
                  isKeyboardNavActive &&
                    focusedIndex !== virtualOption.index &&
                    'aria-selected:bg-transparent aria-selected:text-primary',
                )}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selectedOption === filteredOptions[virtualOption.index].id
                      ? 'opacity-100'
                      : 'opacity-0',
                  )}
                />
                <span className="w-75 truncate">
                  {filteredOptions[virtualOption.index].name}
                </span>
              </CommandItem>
            ))}
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

type VirtualizedComboboxProps<T extends Option = Option> = {
  value?: string;
  onValueChange?: (value: string) => void;
  options: T[];
  filter?: (option: T, search: string) => boolean;
  triggerPlaceholder?: string;
  searchPlaceholder?: string;
  width?: string;
  height?: string;
};

export function VirtualizedCombobox<T extends Option = Option>({
  value: controlledValue,
  onValueChange,
  options,
  filter,
  triggerPlaceholder = 'Select an item',
  searchPlaceholder = 'Search items...',
  width = '400px',
  height = '400px',
}: VirtualizedComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] =
    useState<NonNullable<VirtualizedComboboxProps['value']>>('');

  const value = controlledValue ?? internalValue;

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            role="combobox"
            variant="outline"
            aria-expanded={open}
            className="justify-between"
            style={{
              width: width,
            }}
          />
        }
      >
        <span className="truncate">
          {value
            ? options.find(option => option.id === value)?.name
            : triggerPlaceholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: width }}>
        <VirtualizedCommand
          height={height}
          filter={filter}
          options={options}
          selectedOption={value}
          placeholder={searchPlaceholder}
          onSelectOption={handleValueChange}
        />
      </PopoverContent>
    </Popover>
  );
}
