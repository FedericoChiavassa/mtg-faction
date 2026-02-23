import { useEffect } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { createFileRoute, Link, useRouterState } from '@tanstack/react-router';
import { Shuffle } from 'lucide-react';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/container';
import { SubHeader } from '@/components/layout/site-header';
import {
  CardPaginationCount,
  SitePagination,
} from '@/components/layout/site-pagination';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { useCards } from '@/features/cards/queries';
import {
  CardFilterForm,
  type CardFilterValues,
} from '@/features/cards/ui/card-filter-form';
import { CardGrid } from '@/features/cards/ui/card-grid';
import { useFactionList } from '@/features/factions/queries';
import { FactionCombobox } from '@/features/factions/ui/faction-combobox';
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

  const handleFilterSubmit = ({
    faction: newFaction,
    cardType,
  }: CardFilterValues) => {
    void navigate({
      search: buildCardsSearch({
        faction: newFaction,
        type: cardType,
        page: 1,
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
        search: prev => ({ ...prev, page: 1 }),
        replace: true,
      });
    }
  }, [outOfRange, navigate]);

  return (
    <>
      {faction && (
        <SubHeader
          className={cn(
            'h-16 items-center',
            isScrolled ? 'border-b' : 'border-b-transparent',
          )}
        >
          <CardFilterForm
            onChange={handleFilterSubmit}
            initialValues={{ faction, cardType: type }}
          />

          <div className="ml-auto flex items-center">
            {faction && (
              <SitePagination
                showBoundaries
                variant="compact"
                currentPage={page}
                totalPages={totalPages}
                className="justify-end py-6"
                disabled={isPlaceholderData}
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
                <CardPaginationCount
                  page={page}
                  pageSize={PAGE_SIZE}
                  totalCount={totalCount}
                />
              </SitePagination>
            )}
          </div>
        </SubHeader>
      )}

      <Container className="flex flex-1 flex-col pt-2 pb-12">
        {faction ? (
          <CardGrid
            cards={cards}
            isError={isError}
            isLoading={isLoading}
            isPlaceholderData={isPlaceholderData}
          />
        ) : (
          <div className="flex flex-1 flex-col justify-start">
            <FactionCombobox
              hasPopover={false}
              placeholder="Select a faction..."
              className="mx-auto mt-2 max-w-none"
              onValueChange={selectedFaction => {
                void navigate({
                  search: buildCardsSearch({
                    faction: selectedFaction,
                    type: 'all',
                    page: 1,
                  }),
                  state: {
                    disablePlaceholderData: selectedFaction !== faction,
                  },
                });
              }}
            />
            <Empty className="justify-start gap-6 pt-6">
              <EmptyDescription className="text-xs italic">
                Select a faction to browse its cards
              </EmptyDescription>
              <EmptyDescription>
                <Button
                  size="sm"
                  variant="secondary"
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
                          page: 1,
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
            totalPages={totalPages}
            className="justify-end py-6"
            disabled={isPlaceholderData}
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
