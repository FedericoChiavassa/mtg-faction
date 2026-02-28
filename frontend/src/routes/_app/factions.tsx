import { keepPreviousData } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { OnChangeFn, SortingState } from '@tanstack/react-table';
import z from 'zod';

import { Container } from '@/components/layout/container';
import { SitePagination } from '@/components/layout/site-pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { useFactions } from '@/features/factions/queries';
import {
  FactionFilterForm,
  type FactionFilterValues,
} from '@/features/factions/ui/faction-filter-form';
import { columns } from '@/features/factions/ui/table/columns';
import { DataTable } from '@/features/factions/ui/table/data-table';
import { useDeferredLoading } from '@/hooks/use-deferred-loading';

export const Route = createFileRoute('/_app/factions')({
  component: FactionsRoute,
  validateSearch: z.object({
    page: z.coerce.number().int().min(1).catch(1).optional(),
    sortBy: z
      .enum([
        'name',
        'count',
        'creatures_count',
        'non_creatures_count',
        'identity_count',
      ])
      .catch('count')
      .optional(),
    minCards: z.coerce.number().int().min(0).catch(0).optional(),
    minCreatures: z.coerce.number().int().min(0).catch(0).optional(),
    minNonCreatures: z.coerce.number().int().min(0).catch(0).optional(),
  }),
});

const PAGE_SIZE = 10;
const TEMPORARY_DISABLE_FORM = true;

function FactionsRoute() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const {
    page = 1,
    sortBy = 'count',
    minCards = 0,
    minCreatures = 0,
    minNonCreatures = 0,
  } = search;
  const { data, isLoading, isPlaceholderData } = useFactions({
    page: page - 1, // query starts from 0
    pageSize: PAGE_SIZE,
    sortBy,
    minCards,
    minCreatures,
    minNonCreatures,
    placeholderData: keepPreviousData,
  });

  const disablePagination = useDeferredLoading(isPlaceholderData);

  const factions = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const currentPage = data?.currentPage ?? page - 1;

  const handleFilterChange = (values: FactionFilterValues) => {
    void navigate({
      search: prev => ({
        ...prev,
        ...(values.sortBy !== 'count' && {
          sortBy: values.sortBy ?? undefined,
        }),
      }),
    });
  };

  const handleFilterSubmit = (values: FactionFilterValues) => {
    void navigate({
      search: prev => ({
        ...prev,
        minCards: values.minCards > 0 ? values.minCards : undefined,
        minCreatures: values.minCreatures > 0 ? values.minCreatures : undefined,
        minNonCreatures:
          values.minNonCreatures > 0 ? values.minNonCreatures : undefined,
      }),
    });
  };

  const handleSortingChange: OnChangeFn<SortingState> = updaterOrValue => {
    const newSorting =
      typeof updaterOrValue === 'function'
        ? updaterOrValue([])
        : updaterOrValue;

    const newSortBy = newSorting[0]?.id as
      | Parameters<typeof useFactions>[0]['sortBy']
      | undefined;

    if (newSortBy) {
      void navigate({
        search: prev => ({ ...prev, sortBy: newSortBy, page: 1 }),
      });
    }
  };

  return (
    <Container>
      <div className="mx-auto py-10">
        {!TEMPORARY_DISABLE_FORM && (
          <FactionFilterForm
            onChange={handleFilterChange}
            onSubmit={handleFilterSubmit}
            initialValues={{ sortBy, minCards, minCreatures, minNonCreatures }}
          />
        )}

        <div className="mb-4 ml-auto flex w-max items-center gap-1 text-xs text-muted-foreground">
          Results:{' '}
          {totalCount > 0 ? (
            <span className="mr-2 font-medium text-foreground">
              {totalCount}
            </span>
          ) : (
            <Skeleton className="mr-2 inline-block h-4 w-7.5" />
          )}
        </div>

        <DataTable
          data={factions}
          sortBy={sortBy}
          columns={columns}
          isLoading={isLoading}
          isPlaceholderData={isPlaceholderData}
          onSortingChange={handleSortingChange}
          pagination={{
            pageIndex: currentPage,
            pageSize: PAGE_SIZE,
            pageCount: totalPages,
          }}
        />

        {totalPages > 1 && factions.length && (
          <SitePagination
            size="sm"
            showBoundaries
            currentPage={page}
            totalPages={totalPages}
            className="justify-end py-6"
            disabled={disablePagination}
            onPageChange={newPage =>
              void navigate({
                search: prev => ({ ...prev, page: newPage }),
              })
            }
          />
        )}
      </div>
    </Container>
  );
}
