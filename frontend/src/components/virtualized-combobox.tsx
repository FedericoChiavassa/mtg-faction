// The following file is a customization of
// https://github.com/oaarnikoivu/shadcn-virtualized-combobox

import type { KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { VariantProps } from 'class-variance-authority';
import { Check, ChevronsUpDown } from 'lucide-react';

import { highlightText } from '@/lib/highlight-text';
import { cn } from '@/lib/utils';
import { Button, type buttonVariants } from '@/components/ui/button';
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
import { Spinner } from '@/components/ui/spinner';
import { useIsMobile } from '@/hooks/use-is-mobile';

type Option = {
  id: string;
  name: string;
};

type VirtualizedCommandProps<T extends Option = Option> = {
  height?: string;
  options: T[];
  placeholder?: string;
  selectedOption: string;
  loading?: boolean;
  filter?: (option: T, search: string) => boolean;
  onSelectOption?: (option: string) => void;
  className?: string;
  autofocus?: boolean;
  capitalizeValue?: boolean;
};

export const VirtualizedCommand = <T extends Option = Option>({
  height = '400px',
  options,
  placeholder = 'Search items...',
  selectedOption,
  loading,
  filter,
  onSelectOption,
  className,
  autofocus = false,
  capitalizeValue = false,
}: VirtualizedCommandProps<T>) => {
  const isMobile = useIsMobile();
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
      if (!isMobile) setIsKeyboardNavActive(true); // don't disable items on mobile
      updateFilteredOptions(newSearch);
      setSearch(prev => {
        if (newSearch.trim() !== prev.trim()) {
          setFocusedIndex(0);
          scrollToIndex(0);
        }
        return newSearch;
      });
    },
    [isMobile, scrollToIndex, updateFilteredOptions],
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
    <Command
      shouldFilter={false}
      className={className}
      onKeyDown={handleKeyDown}
    >
      <CommandInput
        readOnly={loading}
        autoFocus={autofocus}
        placeholder={placeholder}
        onValueChange={handleSearch}
        className={cn(
          'pl-1.5!',
          capitalizeValue && 'not-placeholder-shown:capitalize',
        )}
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
          scrollbarColor: 'var(--muted-foreground) transparent',
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
                  data-checked={isMobile && selectedOption === option.id}
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
                    'gap-2 opacity-100!',
                    'absolute top-0 left-0 w-full bg-transparent',
                    focusedIndex === virtualOption.index &&
                      'bg-accent! text-accent-foreground',
                    focusedIndex !== virtualOption.index &&
                      'bg-transparent! aria-selected:text-primary',
                  )}
                >
                  {!isMobile && (
                    <Check
                      className={cn(
                        'h-4 w-4',
                        selectedOption === option.id
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                  )}
                  <span className="w-75 truncate max-md:w-auto max-md:flex-1">
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

export type VirtualizedComboboxProps<T extends Option = Option> = {
  value?: string | null;
  onValueChange?: (value: string) => void;
  options: T[];
  filter?: (option: T, search: string) => boolean;
  triggerPlaceholder?: string;
  searchPlaceholder?: string;
  height?: string;
  loading?: boolean;
  size?: VariantProps<typeof buttonVariants>['size'];
  className?: string;
  capitalizeCommandValue?: boolean;
};

export function VirtualizedCombobox<T extends Option = Option>({
  value: controlledValue,
  onValueChange,
  options,
  filter,
  triggerPlaceholder = 'Select an item',
  searchPlaceholder = 'Search items...',
  height = '400px',
  loading,
  size,
  className,
  capitalizeCommandValue = false,
}: VirtualizedComboboxProps<T>) {
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] =
    useState<NonNullable<VirtualizedComboboxProps['value']>>('');

  const value = controlledValue ?? internalValue;

  const handleValueChange = useCallback(
    (newValue: string) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
      setOpen(false);
    },
    [controlledValue, onValueChange],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            size={size}
            role="combobox"
            variant="outline"
            aria-expanded={open}
            className={cn(
              'w-auto flex-1 cursor-pointer justify-between overflow-hidden md:w-92.5 lg:w-92.5',
              className,
            )}
          />
        }
      >
        <span className="truncate">
          {value
            ? (options.find(option => option.id === value)?.name ??
              triggerPlaceholder)
            : triggerPlaceholder}
        </span>
        {loading ? (
          <Spinner className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        ) : (
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="p-0"
        style={{ width: isMobile ? 'calc(100dvw - 32px)' : '370px' }}
      >
        <VirtualizedCommand
          height={height}
          filter={filter}
          options={options}
          loading={loading}
          autofocus={isMobile}
          selectedOption={value}
          placeholder={searchPlaceholder}
          onSelectOption={handleValueChange}
          capitalizeValue={capitalizeCommandValue}
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
