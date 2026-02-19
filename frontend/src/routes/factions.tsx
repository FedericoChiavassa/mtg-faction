// filepath: /home/fede/projects/mtg-faction/frontend/src/routes/factions.tsx
import { useState } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { Container } from '@/components/layout/container';
import { useFactions } from '@/features/factions/queries';

export const Route = createFileRoute('/factions')({
  component: FactionsRoute,
});

const PAGE_SIZE = 10;

function FactionsRoute() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, isPlaceholderData } = useFactions({
    page,
    pageSize: PAGE_SIZE,
    placeholderData: keepPreviousData,
  });

  const factions = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const hasMore = page < totalPages - 1;

  return (
    <Container>
      <div className="mx-auto py-6">
        {/* Page Header */}
        <div className="mb-6 text-center">
          <h3 className="text-3xl font-bold">Factions Page</h3>
          {totalCount > 0 && <p>Total Factions: {totalCount}</p>}
        </div>

        {/* Faction List */}
        <div className="relative">
          {isLoading ? (
            <p>Loading factions…</p>
          ) : isError ? (
            <p className="text-red-500">Failed to load factions</p>
          ) : (
            <ul className="space-y-2">
              {factions.map((faction, index) => (
                <li
                  key={faction.id}
                  className="rounded border p-3 transition hover:bg-gray-50"
                >
                  <div className="flex gap-6">
                    <div className="flex-1 font-semibold">
                      {index + 1 + page * PAGE_SIZE} - {faction.name}
                    </div>
                    <div className="flex-col items-center justify-between">
                      <div>Creatures</div>
                      <div>{faction.creatures_count}</div>
                    </div>
                    <div className="flex-col items-center justify-between">
                      <div>Non Creatures</div>
                      <div>{faction.non_creatures_count}</div>
                    </div>
                    <div className="flex-col items-center justify-between">
                      <div>Lands</div>
                      <div>{faction.lands_count}</div>
                    </div>
                    <div className="flex-col items-center justify-between">
                      <div>Total</div>
                      <div>{faction.count}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
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
    </Container>
  );
}
