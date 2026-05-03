import { useMemo } from 'react';

import { useFactionStats } from '../queries';

export function useFactionLimits() {
  const { data: stats } = useFactionStats();

  const factionLimits = useMemo(
    () => ({
      maxCards: stats?.maxCards ?? 9999,
      maxCreatures: stats?.maxCreatures ?? 9999,
      maxNonCreatures: stats?.maxNonCreatures ?? 9999,
      maxIdentities: stats?.maxIdentities ?? 4,
    }),
    [stats],
  );

  return factionLimits;
}
