import { useState } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/container';
import { SubHeader } from '@/components/layout/site-header';
import { SitePagination } from '@/components/layout/site-pagination';
import { useCards } from '@/features/cards/queries';
import {
  CardsFilterForm,
  type CardsFilterValues,
} from '@/features/cards/ui/cards-filter-form';
import { useIsScrolled } from '@/hooks/use-is-scrolled';

export const Route = createFileRoute('/cards')({
  component: CardsRoute,
});

const PAGE_SIZE = 60;

function CardsRoute() {
  const [faction, setFaction] = useState<CardsFilterValues['faction']>(null);
  const [isCreature, setIsCreature] =
    useState<CardsFilterValues['isCreature']>(undefined);
  const [queryPage, setQueryPage] = useState(0);
  const isScrolled = useIsScrolled();

  const { data, isLoading, isError, isPlaceholderData } = useCards({
    factionId: faction?.id ?? '',
    isCreature,
    page: queryPage,
    pageSize: PAGE_SIZE,
    placeholderData: keepPreviousData,
  });

  const cards = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleFilterSubmit = (values: {
    faction: typeof faction;
    isCreature: typeof isCreature;
  }) => {
    setFaction(values.faction);
    setIsCreature(values.isCreature);
    setQueryPage(0);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <>
      <SubHeader
        className={cn(
          'h-16 items-center',
          isScrolled ? 'border-b' : 'border-b-transparent',
        )}
      >
        <CardsFilterForm
          onChange={handleFilterSubmit}
          initialValues={{ faction, isCreature: undefined }}
        />

        <div className="ml-auto flex items-center">
          {faction && (
            <SitePagination
              showBoundaries
              variant="compact"
              totalPages={totalPages}
              currentPage={queryPage + 1}
              className="justify-end py-6"
              disabled={isPlaceholderData}
              onPageChange={page => setQueryPage(page - 1)}
            >
              <span className="text-xs whitespace-nowrap">
                <span>
                  {Math.min(PAGE_SIZE * queryPage + 1, totalCount)}-
                  {Math.min(PAGE_SIZE * (queryPage + 1), totalCount)} of{' '}
                  <span className="font-bold">{totalCount}</span> cards
                </span>
              </span>
            </SitePagination>
          )}
        </div>
      </SubHeader>

      <Container>
        <div className="flex justify-center pt-2 pb-12">
          <div>
            {/* Cards List */}
            <div className="relative">
              {isLoading ? (
                <p>Loading cards</p>
              ) : isError ? (
                <p className="text-red-500">Failed to load cards</p>
              ) : (
                <div className="grid max-w-250 grid-cols-2 gap-1.5 md:grid-cols-3 lg:grid-cols-4">
                  {cards.map(card => (
                    <div key={card.oracle_id}>
                      <img
                        alt={card.name}
                        src={card.normal_img_url}
                        className="rounded-[4.75%/3.5%] shadow-lg/20"
                      ></img>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <SitePagination
                showBoundaries
                totalPages={totalPages}
                currentPage={queryPage + 1}
                className="justify-end py-6"
                disabled={isPlaceholderData}
                onPageChange={page => setQueryPage(page - 1)}
              />
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
