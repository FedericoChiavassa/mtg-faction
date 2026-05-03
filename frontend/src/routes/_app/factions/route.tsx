import { useCallback, useEffect, useMemo, useState } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { OnChangeFn, SortingState } from '@tanstack/react-table';
import { Flag } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/container';
import {
  PageHeader,
  PageHeaderCaption,
  PageHeaderTitle,
} from '@/components/layout/page-header';
import { SitePagination } from '@/components/layout/site-pagination';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Field, FieldLabel } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type FactionFilterValues,
  useFactionForm,
} from '@/features/factions/hooks/use-faction-form';
import { useFactionLimits } from '@/features/factions/hooks/use-faction-limits';
import { useFactions } from '@/features/factions/queries';
import { FactionCardList } from '@/features/factions/ui/faction-card-list';
import { FilterForm } from '@/features/factions/ui/filter-form';
import { columns } from '@/features/factions/ui/table/columns';
import { DataTable } from '@/features/factions/ui/table/data-table';
import { DataTableSelect } from '@/features/factions/ui/table/data-table-select';
import { useDeferredLoading } from '@/hooks/use-deferred-loading';
import { useIsMobile } from '@/hooks/use-is-mobile';

import { usePageFilters } from './-hooks/use-page-filters';
import {
  DEFAULT_PER_PAGE,
  DEFAULT_SORT_BY,
  PER_PAGE_OPTIONS,
  SearchSchema,
  SORT_BY_OPTIONS,
} from './-schema';
import { FiltersDrawer } from './-ui/filters-drawer';
import { FiltersToggle } from './-ui/filters-toggle';
import { FormBadges } from './-ui/form-badges';
import { redirectIfOutOfRange } from './-utils/redirect-if-out-of-range';

export const Route = createFileRoute('/_app/factions')({
  component: FactionsRoute,
  validateSearch: SearchSchema,
});

function FactionsRoute() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const isMobile = useIsMobile();
  const [openFilters, setOpenFilters] = useState(false);

  const rangeLimits = useFactionLimits();

  const { filters, formFilters } = usePageFilters({
    search,
  });

  const { data, isLoading, isPlaceholderData } = useFactions({
    ...filters,
    page: filters.page - 1, // query starts from 0
    placeholderData: keepPreviousData,
  });

  const disablePagination = useDeferredLoading(isPlaceholderData);

  const factions = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / filters.pageSize);
  const currentPage = data?.currentPage ?? filters.page - 1;
  const outOfRange = data?.outOfRange;
  const pagination = useMemo(
    () => ({
      pageIndex: currentPage,
      pageSize: filters.pageSize,
      pageCount: totalPages,
    }),
    [currentPage, filters.pageSize, totalPages],
  );

  const closeFilters = useCallback(() => {
    setOpenFilters(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleFilterSubmit = useCallback(
    (newValues: FactionFilterValues) => {
      closeFilters();

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
          identities: identities,
          maxIdentities: maxIdentities,
          minCards: toMinParam(cardsRange),
          minCreatures: toMinParam(creaturesRange),
          minNonCreatures: toMinParam(nonCreaturesRange),
          maxCards: toMaxParam(cardsRange, rangeLimits.maxCards),
          maxCreatures: toMaxParam(creaturesRange, rangeLimits.maxCreatures),
          maxNonCreatures: toMaxParam(
            nonCreaturesRange,
            rangeLimits.maxNonCreatures,
          ),
        }),
      });
    },
    [
      closeFilters,
      navigate,
      rangeLimits.maxCards,
      rangeLimits.maxCreatures,
      rangeLimits.maxNonCreatures,
    ],
  );

  const { form, isFormDirty, formBadges } = useFactionForm({
    isOpen: openFilters,
    values: formFilters,
    onSubmit: handleFilterSubmit,
  });

  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    updaterOrValue => {
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
    },
    [navigate],
  );

  useEffect(() => {
    redirectIfOutOfRange(navigate, outOfRange, search, rangeLimits);
  }, [navigate, outOfRange, rangeLimits, search]);

  return (
    <>
      <PageHeader
        className="flex items-center max-md:h-[90.5px]"
        containerProps={{
          className: 'flex items-baseline-last justify-between',
        }}
      >
        <div className="flex flex-col justify-center">
          <PageHeaderCaption>Explore</PageHeaderCaption>
          <PageHeaderTitle icon={Flag}>Factions</PageHeaderTitle>
        </div>

        {/* Filters toggle - mobile */}
        {isMobile && (
          <FiltersToggle
            open={openFilters}
            className="ml-auto"
            isMobile={isMobile}
            onClose={closeFilters}
            isFiltersDirty={isFormDirty}
            onClick={() => setOpenFilters(prev => !prev)}
          />
        )}
      </PageHeader>
      <Container className="mt-px">
        <div className="mx-auto pb-15 max-md:pb-10">
          {/* Filters toggle - desktop */}
          {!isMobile && (
            <FiltersToggle
              open={openFilters}
              isMobile={isMobile}
              onClose={closeFilters}
              isFiltersDirty={isFormDirty}
              onClick={() => setOpenFilters(prev => !prev)}
            />
          )}

          {/* Filters form - desktop */}
          {!isMobile && (
            <Collapsible open={openFilters} onOpenChange={setOpenFilters}>
              <CollapsibleContent
                animate
                className="-mx-1.5 px-1.5 max-md:-mx-4 max-md:px-4"
              >
                <Separator />
                <FilterForm
                  form={form}
                  isDirty={isFormDirty}
                  onClose={closeFilters}
                  className="my-8 w-full pb-11.5"
                />
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Table actions */}
          <div
            className={cn(
              'relative z-15 -mt-15 flex w-full items-center justify-end gap-3 bg-background py-4',
              'max-md:mt-0 max-md:justify-between',
              isFormDirty && '-mt-5',
            )}
          >
            {/* Filter badges - desktop */}
            {!isMobile && <FormBadges badges={formBadges} />}

            {/* Sort By */}
            <Field
              orientation={isMobile ? 'vertical' : 'horizontal'}
              className="ml-auto w-auto gap-2 max-md:ml-0 max-md:flex-1 max-md:gap-1 max-md:overflow-hidden"
            >
              <FieldLabel className="text-xs text-nowrap">Sort By</FieldLabel>
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

            {/* Per Page */}
            <Field
              orientation={isMobile ? 'vertical' : 'horizontal'}
              className="w-auto shrink-0 gap-2 max-md:gap-1 max-md:overflow-hidden"
            >
              <FieldLabel className="text-xs text-nowrap">Per Page</FieldLabel>
              <DataTableSelect
                value={filters.pageSize}
                options={PER_PAGE_OPTIONS}
                onChange={val => {
                  const newPerPage = val ?? DEFAULT_PER_PAGE;
                  void navigate({
                    resetScroll: false,
                    search: prev => ({
                      ...prev,
                      page: undefined,
                      perPage:
                        newPerPage !== DEFAULT_PER_PAGE
                          ? newPerPage
                          : undefined,
                    }),
                  });
                }}
              />
            </Field>

            <Separator orientation="vertical" className="max-md:ml-2" />

            {/* Results count */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground max-md:flex-col">
              <span className="max-md:font-medium max-md:text-foreground">
                Results<span className="hidden md:inline">:</span>{' '}
              </span>
              {!isLoading ? (
                <span className="mr-2 flex items-center justify-center font-medium text-foreground tabular-nums max-md:mx-2 max-md:min-h-7">
                  {totalCount}
                </span>
              ) : (
                <Skeleton className="mr-2 inline-block h-4 w-7.5 max-md:mx-2 max-md:my-1.5" />
              )}
            </div>
          </div>

          <Separator className="-mx-4 mb-4 block min-w-dvw md:hidden" />

          {/* Filter badges - mobile */}
          {isMobile && (
            <FormBadges className="mb-4" showStartingIcon badges={formBadges} />
          )}

          {/* Table */}
          {isMobile ? (
            <FactionCardList
              data={factions}
              isLoading={isLoading}
              pagination={pagination}
            />
          ) : (
            <DataTable
              data={factions}
              columns={columns}
              isLoading={isLoading}
              sortBy={filters.sortBy}
              pagination={pagination}
              isPlaceholderData={isPlaceholderData}
              onSortingChange={handleSortingChange}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && factions.length && (
            <SitePagination
              size="sm"
              showBoundaries
              fullWidth={isMobile}
              totalPages={totalPages}
              currentPage={filters.page}
              disabled={disablePagination}
              className="justify-end pt-5 pb-6"
              variant={isMobile ? 'compact' : 'default'}
              onPageChange={newPage =>
                void navigate({
                  resetScroll: false,
                  search: prev => ({
                    ...prev,
                    page: newPage,
                  }),
                }).then(() => {
                  if (filters.pageSize === 100 || isMobile) {
                    closeFilters();
                  }
                })
              }
            />
          )}
        </div>
      </Container>

      {/* Filters drawer - mobile */}
      {isMobile && (
        <FiltersDrawer
          form={form}
          openFilters={openFilters}
          closeFilters={closeFilters}
          isFiltersDirty={isFormDirty}
          setOpenFilters={setOpenFilters}
        />
      )}
    </>
  );
}

function toMinParam(range: [number, number]) {
  if (range[0] > 0) {
    return range[0];
  }
  return undefined;
}

function toMaxParam(range: [number, number], limit: number) {
  if (range[1] < limit) {
    return range[1];
  }
  return undefined;
}
