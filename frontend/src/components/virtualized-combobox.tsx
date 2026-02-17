// The following file is a customization of
// https://github.com/oaarnikoivu/shadcn-virtualized-combobox

import type { KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Check, ChevronsUpDown } from 'lucide-react';

import { highlightText } from '@/lib/highlight-text';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';

type Option = {
  id: string;
  name: string;
};

type VirtualizedCommandProps<T extends Option = Option> = {
  height: string;
  options: T[];
  placeholder: string;
  selectedOption: string;
  loading?: boolean;
  filter?: (option: T, search: string) => boolean;
  onSelectOption?: (option: string) => void;
};

const VirtualizedCommand = <T extends Option = Option>({
  height,
  options,
  placeholder,
  selectedOption,
  loading,
  filter,
  onSelectOption,
}: VirtualizedCommandProps<T>) => {
  const [search, setSearch] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<T[]>(options);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isKeyboardNavActive, setIsKeyboardNavActive] = useState(false);

  const parentRef = useRef(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    enabled: !!options.length,
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
    (newSearch: string) => {
      if (filter) {
        setFilteredOptions(options.filter(option => filter(option, newSearch)));
      } else {
        setFilteredOptions(
          options.filter(option =>
            option.name.toLowerCase().includes(newSearch.toLowerCase() ?? []),
          ),
        );
      }
    },
    [filter, options],
  );

  const handleSearch = useCallback(
    (newSearch: string) => {
      setIsKeyboardNavActive(true);
      updateFilteredOptions(newSearch);
      setSearch(prev => {
        if (newSearch.trim() !== prev.trim()) {
          setFocusedIndex(0);
          scrollToIndex(0);
        }
        return newSearch;
      });
    },
    [scrollToIndex, updateFilteredOptions],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          setIsKeyboardNavActive(true);
          setFocusedIndex(prev => {
            const newIndex = prev >= filteredOptions.length - 1 ? 0 : prev + 1;
            scrollToIndex(newIndex);
            return newIndex;
          });
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          setIsKeyboardNavActive(true);
          setFocusedIndex(prev => {
            const newIndex = prev <= 0 ? filteredOptions.length - 1 : prev - 1;
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
    if (selectedOption && !search) {
      const matchingOption = filteredOptions.find(
        option => option.id === selectedOption,
      );
      if (matchingOption) {
        const index = filteredOptions.indexOf(matchingOption);
        setFocusedIndex(index);
        virtualizer.scrollToIndex(index, {
          align: 'center',
        });
      }
    }
  }, [selectedOption, filteredOptions, virtualizer, search]);

  useEffect(() => {
    if (options) {
      setFilteredOptions(options);
    }
  }, [options]);

  return (
    <Command shouldFilter={false} onKeyDown={handleKeyDown}>
      <CommandInput
        readOnly={loading}
        className="pl-3.5!"
        placeholder={placeholder}
        onValueChange={handleSearch}
      />
      <CommandList
        ref={parentRef}
        className={cn(loading && 'overflow-hidden!')}
        onMouseDown={() => setIsKeyboardNavActive(false)}
        onMouseMove={() => setIsKeyboardNavActive(false)}
        style={{
          height: height,
          width: '100%',
          overflow: 'auto',
        }}
      >
        {!loading && <CommandEmpty>No item found.</CommandEmpty>}
        {loading && <LoadingList />}
        <CommandGroup>
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualOptions.map(virtualOption => {
              const option = filteredOptions[virtualOption.index];
              return (
                <CommandItem
                  key={option.id}
                  value={option.id}
                  onSelect={onSelectOption}
                  disabled={isKeyboardNavActive}
                  onMouseLeave={() =>
                    !isKeyboardNavActive && setFocusedIndex(-1)
                  }
                  onMouseEnter={() =>
                    !isKeyboardNavActive && setFocusedIndex(virtualOption.index)
                  }
                  style={{
                    height: `${virtualOption.size}px`,
                    transform: `translateY(${virtualOption.start}px)`,
                  }}
                  className={cn(
                    'opacity-100!',
                    'absolute top-0 left-0 w-full bg-transparent',
                    focusedIndex === virtualOption.index &&
                      'bg-accent! text-accent-foreground',
                    focusedIndex !== virtualOption.index &&
                      'bg-transparent! aria-selected:text-primary',
                  )}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedOption === option.id
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                  <span className="w-75 truncate">
                    {highlightText(option.name, search)}
                  </span>
                </CommandItem>
              );
            })}
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
  loading?: boolean;
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
  loading,
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
          loading={loading}
          selectedOption={value}
          placeholder={searchPlaceholder}
          onSelectOption={handleValueChange}
        />
      </PopoverContent>
    </Popover>
  );
}

function LoadingList() {
  return (
    <CommandLoading className="p-1 *:[div]:flex *:[div]:flex-col">
      <div className="flex h-8.75 w-full items-center pl-11">
        <Skeleton className="h-4.75 w-1/8 rounded-sm" />
      </div>
      <div className="flex h-8.75 w-full items-center pl-11">
        <Skeleton className="h-4.75 w-1/7 rounded-sm" />
      </div>
      <div className="flex h-8.75 w-full items-center pl-11">
        <Skeleton className="h-4.75 w-1/6 rounded-sm" />
      </div>
      <div className="flex h-8.75 w-full items-center pl-11">
        <Skeleton className="h-4.75 w-1/9 rounded-sm" />
      </div>
      <div className="flex h-8.75 w-full items-center pl-11">
        <Skeleton className="h-4.75 w-1/7 rounded-sm" />
      </div>
      <div className="flex h-8.75 w-full items-center pl-11">
        <Skeleton className="h-4.75 w-1/6 rounded-sm" />
      </div>
      <div className="flex h-8.75 w-full items-center pl-11">
        <Skeleton className="h-4.75 w-1/7 rounded-sm" />
      </div>
      <div className="flex h-8.75 w-full items-center pl-11">
        <Skeleton className="h-4.75 w-1/6 rounded-sm" />
      </div>
    </CommandLoading>
  );
}
