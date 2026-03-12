import { useEffect } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { createFileRoute, Link, useRouterState } from '@tanstack/react-router';
import { Layers, Shuffle } from 'lucide-react';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/container';
import {
  PageHeader,
  PageHeaderCaption,
  PageHeaderTitle,
} from '@/components/layout/page-header';
import { SubHeader } from '@/components/layout/site-header';
import {
  PaginationCount,
  SitePagination,
} from '@/components/layout/site-pagination';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription } from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useCards } from '@/features/cards/queries';
import {
  CardFilterForm,
  type CardFilterValues,
} from '@/features/cards/ui/card-filter-form';
import { CardGrid } from '@/features/cards/ui/card-grid';
import { useFactionList } from '@/features/factions/queries';
import { FactionCombobox } from '@/features/factions/ui/faction-combobox';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useIsScrolled } from '@/hooks/use-is-scrolled';

export const Route = createFileRoute('/_app/cards')({
  component: CardsRoute,
  validateSearch: z.object({
    faction: z.string().optional().nullable(),
    type: z.enum(['all', 'creature', 'non-creature']).catch('all').optional(),
    page: z.coerce.number().int().min(1).catch(1).optional(),
  }),
});

const PAGE_SIZE = 60;

function CardsRoute() {
  const { faction, ...search } = Route.useSearch();
  const page = search.page ?? 1;
  const type = search.type ?? 'all';
  const isScrolled = useIsScrolled();
  const isMobile = useIsMobile();
  const navigate = Route.useNavigate();
  const { data: factionList, isLoading: isFactionListLoading } =
    useFactionList();
  const { disablePlaceholderData = false } = useRouterState({
    select: s => s.location.state,
  });

  const { data, isLoading, isError, isPlaceholderData } = useCards({
    factionId: faction ?? '',
    isCreature:
      type === 'creature' ? true : type === 'non-creature' ? false : undefined,
    page: page - 1, // query starts from 0
    pageSize: PAGE_SIZE,
    placeholderData: disablePlaceholderData ? undefined : keepPreviousData,
  });

  const cards = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const outOfRange = data?.outOfRange;

  const handleFilterChange = ({
    faction: newFaction,
    cardType,
  }: CardFilterValues) => {
    void navigate({
      search: buildCardsSearch({
        faction: newFaction,
        type: cardType,
        page: undefined,
      }),
      state: {
        disablePlaceholderData: newFaction !== faction,
      },
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
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
    <>
      {!faction && (
        <PageHeader>
          <PageHeaderCaption>Browse by Faction</PageHeaderCaption>
          <PageHeaderTitle icon={Layers}>Cards</PageHeaderTitle>
        </PageHeader>
      )}

      {faction && (
        <SubHeader
          className={cn(
            'h-16 items-center',
            isScrolled ? 'border-b' : 'border-b-transparent',
            isMobile ? 'static h-auto border-b-0' : '',
          )}
          containerProps={{
            className: cn(
              isMobile
                ? 'max-md:flex-col max-md:items-center max-md:px-0 max-md:py-4'
                : '',
            ),
          }}
        >
          <CardFilterForm
            isMobile={isMobile}
            onChange={handleFilterChange}
            initialValues={{ faction, cardType: type }}
          />

          <div className="ml-auto flex items-center max-md:ml-0 max-md:w-full max-md:flex-col max-md:justify-center">
            {isMobile && <Separator />}
            <SitePagination
              showBoundaries
              variant="compact"
              currentPage={page}
              fullWidth={isMobile}
              totalPages={totalPages}
              disabled={isPlaceholderData}
              className="justify-end max-md:justify-center max-md:py-1"
              onPageChange={newPage =>
                void navigate({
                  search: prev =>
                    buildCardsSearch({
                      ...prev,
                      page: newPage,
                    }),
                })
              }
            >
              <PaginationCount
                page={page}
                pageSize={PAGE_SIZE}
                totalCount={totalCount}
                entityName={
                  type === 'all'
                    ? 'cards'
                    : type === 'creature'
                      ? 'creatures'
                      : 'non-creatures'
                }
              />
            </SitePagination>
            {isMobile && <Separator />}
          </div>
        </SubHeader>
      )}

      <Container
        className={cn(
          'flex flex-1 flex-col pt-2 pb-15 max-md:pb-10',
          faction && 'max-md:px-2',
        )}
      >
        {faction ? (
          <CardGrid
            cards={cards}
            isError={isError}
            isLoading={isLoading}
            isPlaceholderData={isPlaceholderData}
          />
        ) : (
          <div className="flex flex-1 flex-col justify-start pt-6 max-md:pt-1">
            <FactionCombobox
              hasPopover={false}
              placeholder="Select a faction..."
              className="mx-auto mt-2 max-w-none"
              onValueChange={selectedFaction => {
                void navigate({
                  search: buildCardsSearch({
                    faction: selectedFaction,
                    type: 'all',
                    page: undefined,
                  }),
                  state: {
                    disablePlaceholderData: selectedFaction !== faction,
                  },
                });
              }}
            />
            <Empty className="justify-start gap-6 pt-6">
              <EmptyDescription>
                <Button
                  size="sm"
                  variant="secondary"
                  nativeButton={false}
                  className="no-underline!"
                  disabled={isFactionListLoading}
                  render={
                    <Link
                      to="/cards"
                      state={{ disablePlaceholderData: true }}
                      search={() =>
                        buildCardsSearch({
                          faction:
                            factionList?.[
                              Math.floor(Math.random() * factionList.length)
                            ].id,
                          type: 'all',
                          page: undefined,
                        })
                      }
                    />
                  }
                >
                  Random faction{' '}
                  {isFactionListLoading ? <Spinner /> : <Shuffle />}
                </Button>
              </EmptyDescription>
            </Empty>
          </div>
        )}

        {totalPages > 1 && faction && (
          <SitePagination
            showBoundaries
            currentPage={page}
            fullWidth={isMobile}
            totalPages={totalPages}
            disabled={isPlaceholderData}
            variant={isMobile ? 'compact' : 'default'}
            className="justify-end py-6 max-md:mt-4 max-md:justify-center"
            onPageChange={newPage =>
              void navigate({
                search: prev =>
                  buildCardsSearch({
                    ...prev,
                    page: newPage,
                  }),
              })
            }
          />
        )}
      </Container>
    </>
  );
}

function buildCardsSearch({
  faction,
  page,
  type,
}: {
  faction?: string | null;
  page?: number;
  type?: CardFilterValues['cardType'];
}) {
  return {
    faction,
    ...(type !== 'all' && { type }),
    ...(page !== 1 && { page }),
  };
}
