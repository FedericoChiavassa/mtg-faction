import { useEffect, useState } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDeferredLoading } from '@/hooks/use-deferred-loading';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  isPlaceholderData?: boolean;
  pagination: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  isLoading = false,
  isPlaceholderData = false,
}: DataTableProps<TData, TValue>) {
  const showLoadingTransition = useDeferredLoading(isPlaceholderData);
  const { pageSize, pageCount } = pagination;

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { pagination },
    manualPagination: true,
    meta: {
      paginationState: pagination,
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="relative overflow-hidden rounded-md border">
      {showLoadingTransition && (
        <>
          <ProgressBar />
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60"></div>
        </>
      )}

      <Table className="table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <LoadingRow columns={columns} pageSize={pageSize} />
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function LoadingRow<TData, TValue>({
  pageSize,
  columns,
}: {
  pageSize: number;
  columns: ColumnDef<TData, TValue>[];
}) {
  return Array.from({ length: pageSize }).map((_, rowIndex) => (
    <TableRow key={`skeleton-${rowIndex}`}>
      {columns.map((_col, colIndex) => {
        const randomWidths = {
          long: ['w-[50%]', 'w-[70%]', 'w-[85%]'],
        };

        let widthClass = '';

        if (colIndex === 0) {
          // Column 0: Always full
          widthClass = 'w-full';
        } else if (colIndex === 1) {
          // Column 1: Variations of "long"
          widthClass =
            randomWidths.long[(rowIndex + colIndex) % randomWidths.long.length];
        } else {
          // All other columns: short
          widthClass = 'w-[40px]';
        }

        return (
          <TableCell key={`cell-${rowIndex}-${colIndex}`}>
            <Skeleton
              className={cn(`h-5 ${widthClass}`, colIndex > 1 && 'ml-auto')}
            />
          </TableCell>
        );
      })}
    </TableRow>
  ));
}

function ProgressBar() {
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    const move = () => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Don't go to 100% until data is ready

        // Randomize the increment so it feels "real"
        const increment = Math.floor(Math.random() * 15) + 5;
        return Math.min(prev + increment, 90);
      });

      // 2. Schedule the next jump at a random interval
      const nextDelay = Math.floor(Math.random() * 400) + 200;
      timer = setTimeout(move, nextDelay);
    };

    let timer = setTimeout(move, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Progress
      value={progress}
      className="absolute top-0 left-0 z-15 h-0.75 w-full overflow-hidden"
    />
  );
}
