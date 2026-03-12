import { ChevronFirst, ChevronLast } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface SitePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: 'default' | 'compact';
  disabled?: boolean; // Usefull for TanStack Query isPlaceholderData
  className?: string;
  children?: React.ReactNode;
  showBoundaries?: boolean;
  size?: 'default' | 'xs' | 'sm' | 'lg';
  fullWidth?: boolean;
}

export function SitePagination({
  currentPage,
  totalPages,
  onPageChange,
  variant = 'default',
  disabled,
  className,
  children,
  showBoundaries = false,
  size,
  fullWidth,
}: SitePaginationProps) {
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  const defaultBoundariesSize = variant === 'compact' ? 'icon-sm' : 'icon';
  const boundariesSize =
    !size || variant === 'compact'
      ? defaultBoundariesSize
      : size === 'default'
        ? 'icon'
        : (`icon-${size}` as const);

  const defaultPrevNextSize = variant === 'compact' ? 'icon-sm' : 'default';
  const PrevNextSize =
    !size || variant === 'compact' ? defaultPrevNextSize : size;

  const pageLinkSize = size ?? 'default';

  const renderDefaultLinks = () => {
    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // If near the start: [1, 2, 3, 4, 5] ... [Last]
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, 'ellipsis-end', totalPages);
      }
      // If near the end: [1] ... [266, 267, 268, 269, 270]
      else if (currentPage >= totalPages - 4) {
        pages.push(
          1,
          'ellipsis-start',
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      }
      // If in the middle: [1] ... [98, 99, 100, 101, 102] ... [Last]
      else {
        pages.push(
          1,
          'ellipsis-start',
          currentPage - 2,
          currentPage - 1,
          currentPage,
          currentPage + 1,
          currentPage + 2,
          'ellipsis-end',
          totalPages,
        );
      }
    }
    return pages;
  };

  return (
    <Pagination
      className={cn(
        'select-none',
        disabled && 'disable-transitions',
        className,
      )}
    >
      <PaginationContent
        className={cn(
          disabled && 'pointer-events-none opacity-50 transition-opacity',
          fullWidth && 'mx-6 w-full justify-between max-md:mx-4',
        )}
      >
        {/* JUMP TO FIRST */}
        {showBoundaries && (
          <PaginationItem>
            <PaginationLink
              size={boundariesSize}
              aria-disabled={isFirst}
              aria-label="Go to first page"
              onClick={() => !isFirst && onPageChange(1)}
              className={cn(
                'cursor-pointer',
                isFirst && 'pointer-events-none opacity-50',
              )}
            >
              <ChevronFirst />
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            size={PrevNextSize}
            aria-disabled={isFirst}
            tabIndex={isFirst ? -1 : undefined}
            text={variant === 'compact' ? '' : undefined}
            onClick={() => !isFirst && onPageChange(currentPage - 1)}
            className={cn(
              'cursor-pointer',
              size === 'sm' && 'text-xs',
              isFirst && 'pointer-events-none opacity-50',
              variant === 'compact' && 'text-xs font-normal',
            )}
          />
        </PaginationItem>

        {children ? (
          <PaginationItem className="flex items-center">
            {children}
          </PaginationItem>
        ) : variant === 'compact' ? (
          /* COMPACT VARIANT: <current>/<total> */
          <PaginationItem className="px-2 text-xs font-normal">
            <span className="tabular-nums">{currentPage}</span>
            <span className="mx-1 text-muted-foreground">/</span>
            <span className="tabular-nums">{totalPages}</span>
          </PaginationItem>
        ) : (
          /* DEFAULT VARIANT: 1 ... 5 6 [7] 8 9 ... <last> */
          renderDefaultLinks().map((page, idx) => (
            <PaginationItem key={idx}>
              {page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  size={pageLinkSize}
                  isActive={currentPage === page}
                  onClick={() => onPageChange(page as number)}
                  className={cn(
                    'cursor-pointer tabular-nums',
                    size === 'sm' && 'text-xs',
                  )}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))
        )}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            size={PrevNextSize}
            aria-disabled={isLast}
            tabIndex={isLast ? -1 : undefined}
            text={variant === 'compact' ? '' : undefined}
            onClick={() => !isLast && onPageChange(currentPage + 1)}
            className={cn(
              'cursor-pointer',
              size === 'sm' && 'text-xs',
              isLast && 'pointer-events-none opacity-50',
              variant === 'compact' && 'text-xs font-normal',
            )}
          />
        </PaginationItem>

        {/* JUMP TO LAST */}
        {showBoundaries && (
          <PaginationItem>
            <PaginationLink
              size={boundariesSize}
              aria-disabled={isLast}
              aria-label="Go to last page"
              onClick={() => !isLast && onPageChange(totalPages)}
              className={cn(
                'cursor-pointer',
                isLast && 'pointer-events-none opacity-50',
              )}
            >
              <ChevronLast />
            </PaginationLink>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}

export function PaginationCount({
  pageSize,
  page,
  totalCount,
  entityName = 'items',
}: {
  pageSize: number;
  page: number;
  totalCount: number;
  entityName?: string;
}) {
  return (
    <span className="text-xs whitespace-nowrap text-muted-foreground">
      <span>
        <span className="tabular-nums">
          {Math.min(pageSize * (page - 1) + 1, totalCount)}
        </span>
        -
        <span className="tabular-nums">
          {Math.min(pageSize * page, totalCount)}
        </span>{' '}
        of{' '}
        <span className="font-bold text-foreground tabular-nums">
          {totalCount}{' '}
          <span className="text-[11px] uppercase">{entityName}</span>
        </span>
      </span>
    </span>
  );
}
