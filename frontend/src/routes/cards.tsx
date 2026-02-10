import { useState } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { useCards } from '@/features/cards/queries';
import {
  FactionCombobox,
  type FactionComboboxProps,
} from '@/features/factions/ui/FactionCombobox';

export const Route = createFileRoute('/cards')({
  component: CardsRoute,
});

const PAGE_SIZE = 60;

function CardsRoute() {
  const [faction, setFaction] = useState<FactionComboboxProps['value']>(null);
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, isPlaceholderData } = useCards({
    factionId: faction?.id ?? '',
    page,
    pageSize: PAGE_SIZE,
    placeholderData: keepPreviousData,
  });

  const cards = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const hasMore = page < totalPages - 1;

  const handleFactionChange = (f: FactionComboboxProps['value']) => {
    setFaction(f);
    setPage(0);
  };

  return (
    <div className="align-center flex justify-center p-6 text-3xl font-bold">
      <div>
        {/* Page Header */}
        <div className="mb-6 text-center">
          <h3 className="text-3xl font-bold">Cards Page</h3>
          {totalCount > 0 && <p>Total cards: {totalCount}</p>}
        </div>

        <div className="p-6">
          <FactionCombobox
            value={faction}
            onValueChange={handleFactionChange}
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
                <div
                  key={card.oracle_id}
                  className="rounded transition hover:bg-gray-50"
                >
                  <img
                    alt={card.name}
                    src={card.normal_img_url}
                    className="rounded-md shadow-lg/20"
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
  );
}
