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
}: SitePaginationProps) {
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

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
    <Pagination className={cn('select-none', className)}>
      <PaginationContent
        className={cn(
          disabled && 'pointer-events-none opacity-50 transition-opacity',
        )}
      >
        {/* JUMP TO FIRST */}
        {showBoundaries && (
          <PaginationItem>
            <PaginationLink
              aria-label="Go to first page"
              onClick={() => !isFirst && onPageChange(1)}
              size={variant === 'compact' ? 'icon-sm' : 'icon'}
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
            aria-disabled={isFirst}
            tabIndex={isFirst ? -1 : undefined}
            text={variant === 'compact' ? '' : undefined}
            size={variant === 'compact' ? 'icon-sm' : 'default'}
            onClick={() => !isFirst && onPageChange(currentPage - 1)}
            className={cn(
              'cursor-pointer',
              isFirst && 'pointer-events-none opacity-50',
              variant === 'compact' && 'text-xs font-normal',
            )}
          />
        </PaginationItem>

        {children ? (
          <PaginationItem>{children}</PaginationItem>
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
                  className="cursor-pointer"
                  isActive={currentPage === page}
                  onClick={() => onPageChange(page as number)}
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
            aria-disabled={isLast}
            tabIndex={isLast ? -1 : undefined}
            text={variant === 'compact' ? '' : undefined}
            size={variant === 'compact' ? 'icon-sm' : 'default'}
            onClick={() => !isLast && onPageChange(currentPage + 1)}
            className={cn(
              'cursor-pointer',
              isLast && 'pointer-events-none opacity-50',
              variant === 'compact' && 'text-xs font-normal',
            )}
          />
        </PaginationItem>

        {/* JUMP TO LAST */}
        {showBoundaries && (
          <PaginationItem>
            <PaginationLink
              aria-label="Go to last page"
              size={variant === 'compact' ? 'icon-sm' : 'icon'}
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
