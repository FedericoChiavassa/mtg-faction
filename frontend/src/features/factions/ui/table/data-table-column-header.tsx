import { type Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { isSortingDesc } from '@/features/factions/lib/faction-sorting';

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  icon?: LucideIcon;
  align?: 'left' | 'center' | 'right';
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  icon: Icon,
  className,
  align = 'left',
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

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
        onClick={() => column.toggleSorting(isSortingDesc(column.id))}
        className={cn(
          'h-8 data-[state=open]:bg-accent',
          align === 'left' && '-ml-3',
          align === 'right' && '-mr-3',
        )}
      >
        {Icon && <Icon className="size-4" />}
        <span>{title}</span>
        {column.getIsSorted() === 'desc' ? (
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
