import { Link } from '@tanstack/react-router';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { cva } from 'class-variance-authority';
import { Layers, MoreHorizontal, PawPrint, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Faction } from '@/features/factions/queries';

import { DataTableColumnHeader } from './data-table-column-header';

const columnHelper = createColumnHelper<Faction>();

const fullCellStyle = cva(
  'absolute inset-0 block h-full w-full rounded-none p-2',
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const columns: ColumnDef<Faction, any>[] = [
  columnHelper.display({
    id: 'index',
    header: 'Rank',
    size: 40,
    cell: ({ table, row }) => {
      const { pageIndex, pageSize } = table.getState().pagination;

      return (
        <span className="text-muted-foreground">
          {pageIndex * pageSize + row.index + 1}
        </span>
      );
    },
  }),
  columnHelper.accessor('name', {
    header: ({ column, table }) => (
      <DataTableColumnHeader table={table} column={column} title="Faction" />
    ),
    cell: info => (
      <Button
        size="sm"
        variant="link"
        nativeButton={false}
        className={cn(fullCellStyle(), 'text-left font-semibold')}
        render={
          <Link to={`/cards`} search={{ faction: info.row.original.id }} />
        }
      >
        {info.getValue()}
      </Button>
    ),
  }),

  columnHelper.accessor('count', {
    header: ({ column }) => (
      <DataTableColumnHeader
        title="Cards"
        icon={Layers}
        align="center"
        column={column}
      />
    ),
    cell: ({ renderValue, row }) => {
      return (
        <Button
          size="sm"
          variant="link"
          nativeButton={false}
          className={cn(fullCellStyle(), 'text-center font-normal')}
          render={<Link to={`/cards`} search={{ faction: row.original.id }} />}
        >
          {renderValue()}
        </Button>
      );
    },
  }),
  columnHelper.accessor('creatures_count', {
    header: ({ column }) => (
      <DataTableColumnHeader
        align="center"
        icon={PawPrint}
        column={column}
        title="Creatures"
      />
    ),
    cell: ({ renderValue, row }) => {
      return (
        <Button
          size="sm"
          variant="link"
          nativeButton={false}
          className={cn(fullCellStyle(), 'text-center font-normal')}
          render={
            <Link
              to={`/cards`}
              search={{ faction: row.original.id, type: 'creature' }}
            />
          }
        >
          {renderValue()}
        </Button>
      );
    },
  }),
  columnHelper.accessor('non_creatures_count', {
    header: ({ column }) => (
      <DataTableColumnHeader
        align="center"
        icon={Sparkles}
        column={column}
        title="Non Creatures"
      />
    ),
    cell: ({ renderValue, row }) => {
      return (
        <Button
          size="sm"
          variant="link"
          nativeButton={false}
          className={cn(fullCellStyle(), 'text-center font-normal')}
          render={
            <Link
              to={`/cards`}
              search={{ faction: row.original.id, type: 'non-creature' }}
            />
          }
        >
          {renderValue()}
        </Button>
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    size: 40,
    cell: ({ row }) => {
      const faction = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <div className={cn(fullCellStyle(), 'group cursor-pointer')}>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  className={
                    'absolute top-1/2 left-2 z-10 -translate-y-1/2 cursor-pointer group-hover:bg-muted'
                  }
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            }
          ></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-min">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-semibold text-foreground">
                {faction.name}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </DropdownMenuGroup>

            <DropdownMenuGroup>
              <DropdownMenuItem
                className="text-xs font-normal text-nowrap text-muted-foreground"
                render={
                  <Link
                    to={`/cards`}
                    className="block!"
                    search={{ faction: faction.id }}
                  />
                }
              >
                View <span className="font-semibold text-foreground">All</span>{' '}
                Cards
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs font-normal text-nowrap text-muted-foreground"
                render={
                  <Link
                    to={`/cards`}
                    className="block!"
                    search={{ faction: faction.id, type: 'creature' }}
                  />
                }
              >
                View{' '}
                <span className="font-semibold text-foreground">Creature</span>{' '}
                Cards
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs font-normal text-nowrap text-muted-foreground"
                render={
                  <Link
                    to={`/cards`}
                    className="block!"
                    search={{ faction: faction.id, type: 'non-creature' }}
                  />
                }
              >
                View{' '}
                <span className="font-semibold text-foreground">
                  Non Creature
                </span>{' '}
                Cards
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }),
];
