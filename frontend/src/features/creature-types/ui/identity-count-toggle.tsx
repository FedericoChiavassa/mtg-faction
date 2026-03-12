import { useMemo } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useFactionStats } from '@/features/factions/queries';

export function IdentityCountToggle({
  value,
  onValueChange,
}: {
  value: string | null | undefined;
  onValueChange: (value: string) => void;
}) {
  const { data: stats, isLoading } = useFactionStats();
  const options = useMemo(
    () =>
      stats
        ? [...Array(stats.maxIdentities)].map((_, i) => (i + 1).toString())
        : ['1', '2', '3', '4'],
    [stats],
  );

  const handleChange = ([val]: string[]) => {
    onValueChange(val);
  };

  return isLoading ? (
    <Skeleton className="h-8 w-full max-w-md" />
  ) : (
    <ToggleGroup
      size="sm"
      variant="outline"
      className="shadow-none!"
      onValueChange={handleChange}
      value={value ? [value] : []}
    >
      {options.map(option => (
        <ToggleGroupItem
          key={option}
          value={option}
          aria-label={`Show ${option} identities`}
          className="cursor-pointer font-normal tabular-nums shadow-none!"
        >
          {option}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
