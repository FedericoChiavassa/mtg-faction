import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { Layers, PawPrint, Sparkles } from 'lucide-react';

import type { Faction } from '@/features/factions/queries';

const columnHelper = createColumnHelper<Faction>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const columns: ColumnDef<Faction, any>[] = [
  columnHelper.display({
    id: 'index',
    header: 'Rank',
    size: 40,
    cell: ({ table, row }) => {
      const { pageIndex, pageSize } = table.options.meta?.paginationState ?? {
        pageIndex: 0,
        pageSize: 10,
      };

      return pageIndex * pageSize + row.index + 1;
    },
  }),
  columnHelper.accessor('name', {
    header: 'Faction',
    cell: info => <div>{info.getValue()}</div>,
  }),
  columnHelper.accessor('count', {
    header: () => (
      <div className="flex items-center justify-end gap-2">
        <Layers className="size-4" />
        <span>Cards</span>
      </div>
    ),
    cell: ({ renderValue }) => {
      return <div className="text-right">{renderValue()}</div>;
    },
  }),
  columnHelper.accessor('creatures_count', {
    header: () => (
      <div className="flex items-center justify-end gap-2">
        <PawPrint className="size-4" />
        <span>Creatures</span>
      </div>
    ),
    cell: ({ renderValue }) => {
      return <div className="text-right">{renderValue()}</div>;
    },
  }),
  columnHelper.accessor('non_creatures_count', {
    header: () => (
      <div className="flex items-center justify-end gap-2">
        <Sparkles className="size-4" />
        <span>Non Creatures</span>
      </div>
    ),
    cell: ({ renderValue }) => {
      return <div className="text-right">{renderValue()}</div>;
    },
  }),
];
