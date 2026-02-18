import { useState } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { Container } from '@/components/layout/container';
import { SubHeader } from '@/components/layout/site-header';
import { useCards } from '@/features/cards/queries';
import {
  CardsFilterForm,
  type CardsFilterValues,
} from '@/features/cards/ui/cards-filter-form';

export const Route = createFileRoute('/cards')({
  component: CardsRoute,
});

const PAGE_SIZE = 60;

function CardsRoute() {
  const [faction, setFaction] = useState<CardsFilterValues['faction']>(null);
  const [isCreature, setIsCreature] =
    useState<CardsFilterValues['isCreature']>(undefined);
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, isPlaceholderData } = useCards({
    factionId: faction?.id ?? '',
    isCreature,
    page,
    pageSize: PAGE_SIZE,
    placeholderData: keepPreviousData,
  });

  const cards = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const hasMore = page < totalPages - 1;

  const handleFilterSubmit = (values: {
    faction: typeof faction;
    isCreature: typeof isCreature;
  }) => {
    setFaction(values.faction);
    setIsCreature(values.isCreature);
    setPage(0);
  };

  return (
    <>
      <SubHeader>
        <ul className="flex gap-4 text-sm font-medium">Todo</ul>
      </SubHeader>
      <Container>
        <div className="align-center flex justify-center py-6 text-3xl font-bold">
          <div>
            {/* Page Header */}
            <div className="mb-6 text-center">
              {totalCount > 0 && <p>Total cards: {totalCount}</p>}
            </div>

            <div className="flex justify-center p-6">
              <CardsFilterForm
                onChange={handleFilterSubmit}
                initialValues={{ faction, isCreature: undefined }}
              />
            </div>

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

            {/* Pagination */}
            <div className="mt-6 flex justify-between">
              <button
                disabled={page === 0}
                onClick={() => setPage(old => Math.max(old - 1, 0))}
                className="rounded border bg-gray-100 px-4 py-2 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-lg">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={isPlaceholderData || !hasMore}
                className="rounded border bg-gray-100 px-4 py-2 disabled:opacity-50"
                onClick={() => {
                  if (!isPlaceholderData && hasMore) {
                    setPage(old => old + 1);
                  }
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
