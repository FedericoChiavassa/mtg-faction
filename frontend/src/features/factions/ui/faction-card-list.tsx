import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Layers, type LucideIcon, PawPrint, Sparkles } from 'lucide-react';

import { Empty, EmptyDescription, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';

import type { Faction } from '../queries';

const getDigits = (num: number) => Math.abs(num).toString().length;

export function FactionCardList({
  isLoading,
  data,
  pagination,
}: {
  isLoading: boolean;
  data: Faction[];
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
}) {
  const { pageIndex, pageSize } = pagination;

  // Find the rank maximum digit count
  const num1 = pageIndex * pageSize + 1;
  const num2 = pageIndex * pageSize + pageSize;
  const maxRankDigits = Math.max(getDigits(num1), getDigits(num2));

  // Find the max digit count for each stat
  const statsDigits = useMemo(() => {
    return data.reduce(
      (acc, f) => ({
        count: Math.max(acc.count, getDigits(f.count)),
        creatures_count: Math.max(
          acc.creatures_count,
          getDigits(f.creatures_count),
        ),
        non_creatures_count: Math.max(
          acc.non_creatures_count,
          getDigits(f.non_creatures_count),
        ),
      }),
      { count: 1, creatures_count: 1, non_creatures_count: 1 },
    );
  }, [data]);

  if (!data.length && !isLoading) {
    return (
      <Empty>
        <EmptyTitle>No Results</EmptyTitle>
        <EmptyDescription>Try adjusting your filters</EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {isLoading
        ? Array.from({ length: pageSize }).map((_, i) => (
            <Skeleton key={i} className="h-14.5 w-full rounded-lg" />
          ))
        : data.map((faction, index) => (
            <FactionCard
              key={faction.id}
              faction={faction}
              statsDigits={statsDigits}
              maxRankDigits={maxRankDigits}
              rank={pageIndex * pageSize + (index + 1)}
            />
          ))}
    </div>
  );
}

const StatCell = ({
  title,
  value,
  maxDigits,
  icon: Icon,
}: {
  title: string;
  value: number;
  maxDigits?: number;
  icon: LucideIcon;
}) => {
  return (
    <span
      title={title}
      className="flex flex-col items-center gap-0"
      style={{
        ...(!!maxDigits && { minWidth: `${maxDigits}ch` }),
      }}
    >
      <div className="flex flex-col items-center gap-0">
        <Icon size={13} className="text-muted-foreground" />
        <span className="text-[9px] text-muted-foreground">{title}</span>
      </div>
      <span className="font-medium">{value}</span>
    </span>
  );
};

export function FactionCard({
  faction,
  rank,
  maxRankDigits,
  statsDigits,
}: {
  faction: Faction;
  rank: number;
  maxRankDigits?: number;
  statsDigits?: {
    count: number;
    creatures_count: number;
    non_creatures_count: number;
  };
}) {
  return (
    <Link to="/cards" search={{ faction: faction.id }}>
      <div className="flex items-start gap-3 rounded-lg border bg-card py-2.5 pr-4 pl-3 transition-colors hover:bg-muted">
        <div className="flex flex-1 flex-wrap gap-x-3 gap-y-1">
          {/* Rank */}
          <span
            className="shrink-0 text-right text-sm font-medium text-muted-foreground/50 tabular-nums"
            style={{
              ...(!!maxRankDigits && { minWidth: `${maxRankDigits}ch` }),
            }}
          >
            {maxRankDigits ? String(rank).padStart(maxRankDigits, '0') : rank}
          </span>

          {/* Name */}
          <span className="min-w-0 flex-1 text-sm font-medium">
            {faction.name}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex shrink-0 items-center gap-3 text-xs tabular-nums">
          <StatCell
            title="Cards"
            icon={Layers}
            value={faction.count}
            maxDigits={statsDigits?.count}
          />
          <StatCell
            title="Creat."
            icon={PawPrint}
            value={faction.creatures_count}
            maxDigits={statsDigits?.creatures_count}
          />
          <StatCell
            title="Spells"
            icon={Sparkles}
            value={faction.non_creatures_count}
            maxDigits={statsDigits?.non_creatures_count}
          />
        </div>
      </div>
    </Link>
  );
}
