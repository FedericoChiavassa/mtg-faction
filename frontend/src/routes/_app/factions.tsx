import { useCallback, useEffect, useState } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import type { OnChangeFn, SortingState } from '@tanstack/react-table';
import z from 'zod';

import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/container';
import { SitePagination } from '@/components/layout/site-pagination';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DEFAULT_PER_PAGE,
  DEFAULT_SORT_BY,
  type FactionFilterValues,
  useFactionForm,
} from '@/features/factions/hooks/use-faction-form';
import { useFactions, useFactionStats } from '@/features/factions/queries';
import { FactionFilterForm } from '@/features/factions/ui/faction-filter-form';
import { columns } from '@/features/factions/ui/table/columns';
import { DataTable } from '@/features/factions/ui/table/data-table';
import {
  DataTableSelect,
  type DataTableSelectOption,
} from '@/features/factions/ui/table/data-table-select';
import { useDeferredLoading } from '@/hooks/use-deferred-loading';

export const Route = createFileRoute('/_app/factions')({
  component: FactionsRoute,
  validateSearch: z.object({
    page: z.coerce.number().int().min(1).catch(1).optional(),
    perPage: z
      .union([z.literal(10), z.literal(15), z.literal(20)])
      .catch(DEFAULT_PER_PAGE)
      .optional(),
    sortBy: z
      .enum([
        'name',
        'count',
        'creatures_count',
        'non_creatures_count',
        'identity_count',
      ])
      .catch(DEFAULT_SORT_BY)
      .optional(),
    minCards: z.coerce.number().int().min(0).optional().catch(undefined),
    minCreatures: z.coerce.number().int().min(0).optional().catch(undefined),
    minNonCreatures: z.coerce.number().int().min(0).optional().catch(undefined),
    maxCards: z.coerce.number().int().min(0).optional().catch(undefined),
    maxCreatures: z.coerce.number().int().min(0).optional().catch(undefined),
    maxNonCreatures: z.coerce.number().int().min(0).optional().catch(undefined),
  }),
});

const SORT_BY_OPTIONS: DataTableSelectOption<
  NonNullable<FactionFilterValues['sortBy']>
>[] = [
  { value: 'name', label: 'Name' },
  {
    value: 'identity_count',
    label: (
      <span>
        Name{' '}
        <span className="text-xs font-normal italic">– Fewer Types First</span>
      </span>
    ),
  },
  { value: 'count', label: 'Cards' },
  { value: 'creatures_count', label: 'Creatures' },
  { value: 'non_creatures_count', label: 'Non Creatures' },
];

const PER_PAGE_OPTIONS: DataTableSelectOption<
  FactionFilterValues['perPage']
>[] = [
  { value: 10, label: '10' },
  { value: 15, label: '15' },
  { value: 20, label: '20' },
];

function FactionsRoute() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const [openFilters, setOpenFilters] = useState(false);
  const {
    page = 1,
    perPage = DEFAULT_PER_PAGE,
    sortBy = DEFAULT_SORT_BY,
    minCards = 0,
    minCreatures = 0,
    minNonCreatures = 0,
    maxCards = undefined,
    maxCreatures = undefined,
    maxNonCreatures = undefined,
  } = search;

  const { data, isLoading, isPlaceholderData } = useFactions({
    page: page - 1, // query starts from 0
    pageSize: perPage,
    sortBy,
    minCards,
    minCreatures,
    minNonCreatures,
    maxCards,
    maxCreatures,
    maxNonCreatures,
    placeholderData: keepPreviousData,
  });

  const { data: stats } = useFactionStats();
  const cardsLimit = stats?.maxCards ?? 9999;
  const creaturesLimit = stats?.maxCreatures ?? 9999;
  const nonCreaturesLimit = stats?.maxNonCreatures ?? 9999;

  const disablePagination = useDeferredLoading(isPlaceholderData);

  const factions = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / perPage);
  const currentPage = data?.currentPage ?? page - 1;
  const outOfRange = data?.outOfRange;

  const handleFilterChange = useCallback(
    (values: FactionFilterValues) => {
      const { sortBy: newSortBy, perPage: newPerPage } = values;
      void navigate({
        resetScroll: false,
        search: prev => ({
          ...prev,
          page: undefined,
          perPage: newPerPage !== DEFAULT_PER_PAGE ? newPerPage : undefined,
          sortBy:
            newSortBy !== DEFAULT_SORT_BY
              ? (newSortBy ?? undefined)
              : undefined,
        }),
      });
    },
    [navigate],
  );

  const handleFilterSubmit = useCallback(
    (values: FactionFilterValues) => {
      const {
        perPage: newPerPage,
        sortBy: newSortBy,
        cardsRange,
        creaturesRange,
        nonCreaturesRange,
      } = values;

      void navigate({
        resetScroll: false,
        search: prev => ({
          ...prev,
          page: undefined,
          perPage: newPerPage !== DEFAULT_PER_PAGE ? newPerPage : undefined,
          sortBy:
            newSortBy !== DEFAULT_SORT_BY
              ? (newSortBy ?? undefined)
              : undefined,
          minCards: getMin(cardsRange),
          maxCards: getMax(cardsRange, cardsLimit),
          minCreatures: getMin(creaturesRange),
          maxCreatures: getMax(creaturesRange, creaturesLimit),
          minNonCreatures: getMin(nonCreaturesRange),
          maxNonCreatures: getMax(nonCreaturesRange, nonCreaturesLimit),
        }),
      });
    },
    [navigate, cardsLimit, creaturesLimit, nonCreaturesLimit],
  );

  const { form, isDirty } = useFactionForm({
    onChange: handleFilterChange,
    onSubmit: handleFilterSubmit,
    limits: {
      cardsLimit,
      creaturesLimit,
      nonCreaturesLimit,
    },
    initialValues: {
      perPage,
      sortBy,
      cardsRange: [minCards, maxCards ?? cardsLimit],
      creaturesRange: [minCreatures, maxCreatures ?? creaturesLimit],
      nonCreaturesRange: [
        minNonCreatures,
        maxNonCreatures ?? nonCreaturesLimit,
      ],
    },
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
      form.setFieldValue('sortBy', newSortBy);
    }
  };

  useEffect(() => {
    if (outOfRange) {
      void navigate({
        search: prev => ({ ...prev, page: undefined }),
        replace: true,
      });
    }
  }, [outOfRange, navigate]);

  return (
    <Container>
      <div className="mx-auto pb-10">
        {/* Main filters */}
        <div className="flex w-full items-center justify-end gap-3 pt-10 pb-6">
          {isDirty && (
            <Button
              size="xs"
              nativeButton={false}
              render={<Link to="/factions" />}
              onClick={e => {
                e.stopPropagation();
                void form.reset();
              }}
            >
              Reset Filters
            </Button>
          )}
          <Button
            size="xs"
            variant="link"
            className="cursor-pointer"
            onClick={() => setOpenFilters(prev => !prev)}
          >
            {openFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>

          <Separator orientation="vertical" />

          <form.Field
            name="sortBy"
            // eslint-disable-next-line react/no-children-prop
            children={field => (
              <Field orientation="horizontal" className="w-auto gap-2">
                <FieldLabel className="text-xs" htmlFor={field.name}>
                  Sort By:
                </FieldLabel>
                <DataTableSelect
                  options={SORT_BY_OPTIONS}
                  value={field.state.value}
                  onChange={val => field.handleChange(val)}
                />
              </Field>
            )}
          />

          <form.Field
            name="perPage"
            // eslint-disable-next-line react/no-children-prop
            children={field => (
              <Field orientation="horizontal" className="w-auto gap-2">
                <FieldLabel className="text-xs" htmlFor={field.name}>
                  Per Page:
                </FieldLabel>
                <DataTableSelect
                  value={field.state.value}
                  options={PER_PAGE_OPTIONS}
                  onChange={val => field.handleChange(val ?? DEFAULT_PER_PAGE)}
                />
              </Field>
            )}
          />

          <Separator orientation="vertical" />

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            Results:{' '}
            {totalCount > 0 ? (
              <span className="mr-2 font-medium text-foreground tabular-nums">
                {totalCount}
              </span>
            ) : (
              <Skeleton className="mr-2 inline-block h-4 w-7.5" />
            )}
          </div>
        </div>

        {/* Sub filters  */}
        <div
          className={cn('flex items-center gap-2', !openFilters && 'hidden')}
        >
          <FactionFilterForm form={form} stats={stats} className="mb-8" />
        </div>

        {/* Table */}
        <DataTable
          data={factions}
          sortBy={sortBy}
          columns={columns}
          isLoading={isLoading}
          isPlaceholderData={isPlaceholderData}
          onSortingChange={handleSortingChange}
          pagination={{
            pageIndex: currentPage,
            pageSize: perPage,
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
                resetScroll: false,
                search: prev => ({
                  ...prev,
                  page: newPage,
                }),
              })
            }
          />
        )}
      </div>
    </Container>
  );
}

function getMin(range: [number, number] | undefined) {
  if (range && range[0] > 0) {
    return range[0];
  }
  return undefined;
}

function getMax(range: [number, number] | undefined, limit: number) {
  if (range && range[1] < limit) {
    return range[1];
  }
  return undefined;
}
