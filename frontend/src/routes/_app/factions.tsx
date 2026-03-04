import { useCallback, useEffect, useMemo, useState } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import type { OnChangeFn, SortingState } from '@tanstack/react-table';
import { SlidersHorizontal } from 'lucide-react';
import z from 'zod';

import { Container } from '@/components/layout/container';
import { SitePagination } from '@/components/layout/site-pagination';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Field, FieldLabel } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type FactionFilterValues,
  useFactionForm,
} from '@/features/factions/hooks/use-faction-form';
import {
  DEFAULT_PER_PAGE,
  DEFAULT_SORT_BY,
  PER_PAGE_OPTIONS,
  perPageSchema,
  SORT_BY_OPTIONS,
  sortBySchema,
} from '@/features/factions/lib/faction-table.const';
import { useFactions, useFactionStats } from '@/features/factions/queries';
import { FilterForm } from '@/features/factions/ui/filter-form';
import { columns } from '@/features/factions/ui/table/columns';
import { DataTable } from '@/features/factions/ui/table/data-table';
import { DataTableSelect } from '@/features/factions/ui/table/data-table-select';
import { useDeferredLoading } from '@/hooks/use-deferred-loading';

export const Route = createFileRoute('/_app/factions')({
  component: FactionsRoute,
  validateSearch: z.object({
    page: z.coerce.number().int().min(1).catch(1).optional(),
    perPage: perPageSchema.optional(),
    sortBy: sortBySchema.optional(),
    identities: z.string().array().optional(),
    maxIdentities: z.coerce.number().int().min(1).optional().catch(undefined),
    minCards: z.coerce.number().int().min(0).optional().catch(undefined),
    minCreatures: z.coerce.number().int().min(0).optional().catch(undefined),
    minNonCreatures: z.coerce.number().int().min(0).optional().catch(undefined),
    maxCards: z.coerce.number().int().min(0).optional().catch(undefined),
    maxCreatures: z.coerce.number().int().min(0).optional().catch(undefined),
    maxNonCreatures: z.coerce.number().int().min(0).optional().catch(undefined),
  }),
});

function FactionsRoute() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const [openFilters, setOpenFilters] = useState(false);

  const { data: stats } = useFactionStats();
  const rangeLimits = useMemo(
    () => ({
      maxCards: stats?.maxCards ?? 9999,
      maxCreatures: stats?.maxCreatures ?? 9999,
      maxNonCreatures: stats?.maxNonCreatures ?? 9999,
    }),
    [stats],
  );

  const filters = useMemo(
    () => ({
      page: search.page ?? 1,
      perPage: search.perPage ?? DEFAULT_PER_PAGE,
      sortBy: search.sortBy ?? DEFAULT_SORT_BY,
      identities: search.identities ?? [],
      maxIdentities: search.maxIdentities,
      minCards: search.minCards ?? 0,
      minCreatures: search.minCreatures ?? 0,
      minNonCreatures: search.minNonCreatures ?? 0,
      maxCards: search.maxCards,
      maxCreatures: search.maxCreatures,
      maxNonCreatures: search.maxNonCreatures,
    }),
    [search],
  );

  const isFiltersDirty = useMemo(() => {
    return (
      filters.maxIdentities !== undefined ||
      filters.identities.length > 0 ||
      !!filters.minCards ||
      !!filters.minCreatures ||
      !!filters.minNonCreatures ||
      (filters.maxCards !== undefined &&
        filters.maxCards !== rangeLimits.maxCards) ||
      (filters.maxCreatures !== undefined &&
        filters.maxCreatures !== rangeLimits.maxCreatures) ||
      (filters.maxNonCreatures !== undefined &&
        filters.maxNonCreatures !== rangeLimits.maxNonCreatures)
    );
  }, [filters, rangeLimits]);

  const { data, isLoading, isPlaceholderData } = useFactions({
    page: filters.page - 1, // query starts from 0
    pageSize: filters.perPage,
    sortBy: filters.sortBy,
    identities: filters.identities.length > 0 ? filters.identities : undefined,
    maxIdentities: filters.maxIdentities,
    minCards: filters.minCards,
    minCreatures: filters.minCreatures,
    minNonCreatures: filters.minNonCreatures,
    maxCards: filters.maxCards,
    maxCreatures: filters.maxCreatures,
    maxNonCreatures: filters.maxNonCreatures,
    placeholderData: keepPreviousData,
  });

  const disablePagination = useDeferredLoading(isPlaceholderData);

  const factions = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / filters.perPage);
  const currentPage = data?.currentPage ?? filters.page - 1;
  const outOfRange = data?.outOfRange;

  const handleFilterSubmit = useCallback(
    (newValues: FactionFilterValues) => {
      const {
        cardsRange,
        creaturesRange,
        nonCreaturesRange,
        identities,
        maxIdentities,
      } = newValues;

      void navigate({
        resetScroll: false,
        search: prev => ({
          ...prev,
          page: undefined,
          identities: identities.length > 0 ? identities : undefined,
          maxIdentities: maxIdentities,
          minCards: getMin(cardsRange),
          minCreatures: getMin(creaturesRange),
          minNonCreatures: getMin(nonCreaturesRange),
          maxCards: getMax(cardsRange, rangeLimits?.maxCards),
          maxCreatures: getMax(creaturesRange, rangeLimits?.maxCreatures),
          maxNonCreatures: getMax(
            nonCreaturesRange,
            rangeLimits?.maxNonCreatures,
          ),
        }),
      });
    },
    [navigate, rangeLimits],
  );

  const { form } = useFactionForm({
    isOpen: openFilters,
    values: {
      maxIdentities: filters.maxIdentities,
      identities: filters.identities,
      cardsRange: [filters.minCards, filters.maxCards ?? rangeLimits?.maxCards],
      creaturesRange: [
        filters.minCreatures,
        filters.maxCreatures ?? rangeLimits?.maxCreatures,
      ],
      nonCreaturesRange: [
        filters.minNonCreatures,
        filters.maxNonCreatures ?? rangeLimits?.maxNonCreatures,
      ],
    },
    onSubmit: handleFilterSubmit,
  });

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
        resetScroll: false,
        search: prev => ({
          ...prev,
          page: undefined,
          sortBy: newSortBy !== DEFAULT_SORT_BY ? newSortBy : undefined,
        }),
      });
    }
  };

  useEffect(() => {
    redirectIfOutOfRange(
      navigate,
      outOfRange,
      search,
      rangeLimits,
      stats?.maxIdentities,
    );
  }, [navigate, outOfRange, rangeLimits, search, stats?.maxIdentities]);

  return (
    <Container>
      <div className="mx-auto pb-15">
        {/* Main filters */}
        <div className="flex w-full items-center justify-end gap-3 pt-10 pb-6">
          <div className="mr-auto flex items-center gap-3">
            <Button
              size="xs"
              variant="link"
              onClick={() => setOpenFilters(prev => !prev)}
              className="-ml-2 w-28.5! cursor-pointer justify-start"
            >
              <SlidersHorizontal className="mr-1 size-4" />{' '}
              {openFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            {isFiltersDirty && (
              <Button
                size="xs"
                nativeButton={false}
                onClick={() => setOpenFilters(false)}
                render={
                  <Link
                    to="/factions"
                    search={prev => ({
                      perPage: prev.perPage,
                      sortBy: prev.sortBy,
                    })}
                  />
                }
              >
                Reset Filters
              </Button>
            )}
          </div>

          <Field orientation="horizontal" className="w-auto gap-2">
            <FieldLabel className="text-xs">Sort By</FieldLabel>
            <DataTableSelect
              value={filters.sortBy}
              options={SORT_BY_OPTIONS}
              onChange={val => {
                const newSortBy = val ?? DEFAULT_SORT_BY;
                void navigate({
                  resetScroll: false,
                  search: prev => ({
                    ...prev,
                    page: undefined,
                    sortBy:
                      newSortBy !== DEFAULT_SORT_BY ? newSortBy : undefined,
                  }),
                });
              }}
            />
          </Field>

          <Field orientation="horizontal" className="w-auto gap-2">
            <FieldLabel className="text-xs">Per Page</FieldLabel>
            <DataTableSelect
              value={filters.perPage}
              options={PER_PAGE_OPTIONS}
              onChange={val => {
                const newPerPage = val ?? DEFAULT_PER_PAGE;
                void navigate({
                  resetScroll: false,
                  search: prev => ({
                    ...prev,
                    page: undefined,
                    perPage:
                      newPerPage !== DEFAULT_PER_PAGE ? newPerPage : undefined,
                  }),
                });
              }}
            />
          </Field>

          <Separator orientation="vertical" />

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            Results:{' '}
            {!isLoading ? (
              <span className="mr-2 font-medium text-foreground tabular-nums">
                {totalCount}
              </span>
            ) : (
              <Skeleton className="mr-2 inline-block h-4 w-7.5" />
            )}
          </div>
        </div>

        {/* Sub filters  */}
        <Collapsible open={openFilters} onOpenChange={setOpenFilters}>
          <CollapsibleContent animate className="-mx-1.5 px-1.5">
            <Separator />
            <FilterForm
              form={form}
              stats={stats}
              className="my-8 w-full"
              isDirty={isFiltersDirty}
              actions={
                <Button
                  size="xs"
                  variant="link"
                  className="cursor-pointer"
                  onClick={() => {
                    setOpenFilters(prev => !prev);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                >
                  Hide Filters
                </Button>
              }
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Table */}
        <DataTable
          data={factions}
          columns={columns}
          isLoading={isLoading}
          sortBy={filters.sortBy}
          isPlaceholderData={isPlaceholderData}
          onSortingChange={handleSortingChange}
          pagination={{
            pageIndex: currentPage,
            pageSize: filters.perPage,
            pageCount: totalPages,
          }}
        />

        {/* Pagination */}
        {totalPages > 1 && factions.length && (
          <SitePagination
            size="sm"
            showBoundaries
            totalPages={totalPages}
            currentPage={filters.page}
            className="justify-end py-6"
            disabled={disablePagination}
            onPageChange={newPage =>
              void navigate({
                resetScroll: false,
                search: prev => ({
                  ...prev,
                  page: newPage,
                }),
              }).then(() => {
                if (filters.perPage === 100) {
                  setOpenFilters(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              })
            }
          />
        )}
      </div>
    </Container>
  );
}

function redirectIfOutOfRange(
  navigate: ReturnType<typeof Route.useNavigate>,
  outOfRange: boolean | undefined,
  search: ReturnType<typeof Route.useSearch>,
  rangeLimits: {
    maxCards: number;
    maxCreatures: number;
    maxNonCreatures: number;
  },
  identitiesLimit: number | undefined = 4,
) {
  const {
    minCards,
    minCreatures,
    minNonCreatures,
    maxCards,
    maxCreatures,
    maxNonCreatures,
    maxIdentities,
  } = search;

  const fixedMinCards =
    minCards && minCards > rangeLimits.maxCards ? undefined : minCards;
  const fixedMaxCards =
    maxCards && maxCards > rangeLimits.maxCards ? undefined : maxCards;
  const fixedMinCreatures =
    minCreatures && minCreatures > rangeLimits.maxCreatures
      ? undefined
      : minCreatures;
  const fixedMaxCreatures =
    maxCreatures && maxCreatures > rangeLimits.maxCreatures
      ? undefined
      : maxCreatures;
  const fixedMinNonCreatures =
    minNonCreatures && minNonCreatures > rangeLimits.maxNonCreatures
      ? undefined
      : minNonCreatures;
  const fixedMaxNonCreatures =
    maxNonCreatures && maxNonCreatures > rangeLimits.maxNonCreatures
      ? undefined
      : maxNonCreatures;
  const fixedMaxIdentities =
    maxIdentities && maxIdentities > identitiesLimit
      ? undefined
      : maxIdentities;

  const isOutOfRange =
    outOfRange ||
    fixedMinCards !== minCards ||
    fixedMaxCards !== maxCards ||
    fixedMinCreatures !== minCreatures ||
    fixedMaxCreatures !== maxCreatures ||
    fixedMinNonCreatures !== minNonCreatures ||
    fixedMaxNonCreatures !== maxNonCreatures ||
    fixedMaxIdentities !== search.maxIdentities;

  if (isOutOfRange) {
    void navigate({
      replace: true,
      search: prev => ({
        ...prev,
        page: undefined,
        minCards: fixedMinCards,
        maxCards: fixedMaxCards,
        minCreatures: fixedMinCreatures,
        maxCreatures: fixedMaxCreatures,
        minNonCreatures: fixedMinNonCreatures,
        maxNonCreatures: fixedMaxNonCreatures,
        maxIdentities: fixedMaxIdentities,
      }),
    });
  }
}

function getMin(range: [number, number] | undefined) {
  if (range && range[0] > 0) {
    return range[0];
  }
  return undefined;
}

function getMax(
  range: [number, number] | undefined,
  limit: number | undefined,
) {
  if (range && range[1] < (limit ?? 9999)) {
    return range[1];
  }
  return undefined;
}
