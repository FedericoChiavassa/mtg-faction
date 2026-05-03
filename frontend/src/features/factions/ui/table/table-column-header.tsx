import { type Column, type Table } from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpNarrowWide,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { isSortingDesc } from '@/features/factions/lib/faction-sorting';

interface TableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  table?: Table<TData>;
  icon?: LucideIcon;
  align?: 'left' | 'center' | 'right';
}

export function TableColumnHeader<TData, TValue>({
  column,
  title,
  table,
  icon: Icon,
  className,
  align = 'left',
}: TableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const showArrowUpNarrowWide =
    table?.getState().sorting?.[0]?.id === 'identity_count' &&
    column.id === 'name';

  return (
    <div
      className={cn(
        'flex items-center',
        align === 'left' && 'justify-start',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end',
        className,
      )}
    >
      <Button
        size="sm"
        variant="ghost"
        className={cn(
          'h-8 cursor-pointer',
          align === 'left' && '-ml-3',
          align === 'right' && '-mr-3',
          !!column.getIsSorted() &&
            column.id !== 'name' &&
            'pointer-events-none',
        )}
        onClick={() => {
          if (column.id === 'name') {
            if (column.getIsSorted()) {
              return table?.setSorting([{ id: 'identity_count', desc: false }]);
            }
            return table?.setSorting([{ id: 'name', desc: false }]);
          }
          column.toggleSorting(isSortingDesc(column.id));
        }}
      >
        {Icon && <Icon className="size-4" />}
        <span>{title}</span>
        {showArrowUpNarrowWide ? (
          <ArrowUpNarrowWide />
        ) : column.getIsSorted() === 'desc' ? (
          <ArrowDown />
        ) : column.getIsSorted() === 'asc' ? (
          <ArrowUp />
        ) : (
          <div className="invisible h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
