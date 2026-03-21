import { useCallback, useEffect, useMemo, useState } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
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
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Field, FieldLabel } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type FactionFilterValues,
  useFactionForm,
} from '@/features/factions/hooks/use-faction-form';
import { useFactions, useFactionStats } from '@/features/factions/queries';
import { FactionCardList } from '@/features/factions/ui/faction-card-list';
import { FilterForm } from '@/features/factions/ui/filter-form';
import { columns } from '@/features/factions/ui/table/columns';
import { DataTable } from '@/features/factions/ui/table/data-table';
import { DataTableSelect } from '@/features/factions/ui/table/data-table-select';
import { useDeferredLoading } from '@/hooks/use-deferred-loading';
import { useIsMobile } from '@/hooks/use-is-mobile';

import { FilterBadges } from './-filter-badges';
import { FiltersToggle } from './-filters-toggle';
import { redirectIfOutOfRange } from './-redirect-if-out-of-range';
import {
  DEFAULT_PER_PAGE,
  DEFAULT_SORT_BY,
  PER_PAGE_OPTIONS,
  SearchSchema,
  SORT_BY_OPTIONS,
} from './-schema';
import { usePageFilters } from './-use-page-filters';

export const Route = createFileRoute('/_app/factions')({
  component: FactionsRoute,
  validateSearch: SearchSchema,
});

function FactionsRoute() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const isMobile = useIsMobile();
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

  const {
    filters,
    isFiltersDirty,
    isIdentitiesDirty,
    isMaxIdentitiesDirty,
    isCardsRangeDirty,
    isCreaturesRangeDirty,
    isNonCreaturesRangeDirty,
  } = usePageFilters({
    search,
    rangeLimits,
  });

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

  const closeFilters = () => {
    setOpenFilters(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    [
      navigate,
      rangeLimits?.maxCards,
      rangeLimits?.maxCreatures,
      rangeLimits?.maxNonCreatures,
    ],
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
            isFiltersDirty={isFiltersDirty}
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
              isFiltersDirty={isFiltersDirty}
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
                  stats={stats}
                  onClose={closeFilters}
                  isDirty={isFiltersDirty}
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
              isFiltersDirty && '-mt-5',
            )}
          >
            {/* Filter badges - desktop */}
            {!isMobile && (
              <FilterBadges
                rangeLimits={rangeLimits}
                data={{
                  filters,
                  isFiltersDirty,
                  isIdentitiesDirty,
                  isMaxIdentitiesDirty,
                  isCardsRangeDirty,
                  isCreaturesRangeDirty,
                  isNonCreaturesRangeDirty,
                }}
              />
            )}

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
                <Skeleton className="mr-2 inline-block h-4 w-7.5 max-md:mx-2 max-md:my-3" />
              )}
            </div>
          </div>

          <Separator className="-mx-4 mb-4 block min-w-dvw md:hidden" />

          {/* Filter badges - mobile */}
          {isMobile && (
            <FilterBadges
              startingIcon
              className="mb-4"
              rangeLimits={rangeLimits}
              data={{
                filters,
                isFiltersDirty,
                isIdentitiesDirty,
                isMaxIdentitiesDirty,
                isCardsRangeDirty,
                isCreaturesRangeDirty,
                isNonCreaturesRangeDirty,
              }}
            />
          )}

          {/* Table */}
          {isMobile ? (
            <FactionCardList
              data={factions}
              isLoading={isLoading}
              pagination={{
                pageIndex: currentPage,
                pageSize: filters.perPage,
              }}
            />
          ) : (
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
                  if (filters.perPage === 100 || isMobile) {
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
        <Drawer
          fixed
          open={openFilters}
          onOpenChange={() => setOpenFilters(false)}
        >
          <DrawerContent className="min-h-[80dvh]">
            <DrawerHeader className="sr-only">
              <DrawerTitle>Filters options</DrawerTitle>
            </DrawerHeader>

            <div className="no-scrollbar overflow-y-auto bg-background px-4 pt-6">
              <FilterForm
                isMobile
                form={form}
                stats={stats}
                className="pb-11.5"
                onClose={closeFilters}
                isDirty={isFiltersDirty}
              />
            </div>

            <DrawerFooter className="flex flex-row gap-2 border-t bg-card">
              <Button
                size="xs"
                type="submit"
                className="flex-1"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  void form.handleSubmit();
                }}
              >
                Apply
              </Button>
              {isFiltersDirty && (
                <Button
                  size="xs"
                  type="reset"
                  variant="outline"
                  nativeButton={false}
                  onClick={() => setOpenFilters(false)}
                  className={cn('flex-1 bg-background no-underline!')}
                  render={
                    <Link
                      to="/factions"
                      resetScroll={false}
                      search={prev => ({
                        perPage: prev.perPage,
                        sortBy: prev.sortBy,
                      })}
                    />
                  }
                >
                  Reset
                </Button>
              )}

              <DrawerClose asChild className="flex flex-1">
                <Button size="xs" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
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
