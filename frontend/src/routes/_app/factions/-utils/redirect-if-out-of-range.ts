import type { UseNavigateResult } from '@tanstack/react-router';

import type { TSearch } from '../-schema';

export function redirectIfOutOfRange(
  navigate: UseNavigateResult<'/factions'>,
  outOfRange: boolean | undefined,
  search: TSearch,
  rangeLimits: {
    maxCards: number;
    maxCreatures: number;
    maxNonCreatures: number;
  },
  identitiesLimit: number | undefined = 4,
) {
  const {
    minCards,
    minCreatures,
    minNonCreatures,
    maxCards,
    maxCreatures,
    maxNonCreatures,
    maxIdentities,
  } = search;

  const fixedMinCards =
    minCards && minCards > rangeLimits.maxCards ? undefined : minCards;
  const fixedMaxCards =
    maxCards && maxCards > rangeLimits.maxCards ? undefined : maxCards;
  const fixedMinCreatures =
    minCreatures && minCreatures > rangeLimits.maxCreatures
      ? undefined
      : minCreatures;
  const fixedMaxCreatures =
    maxCreatures && maxCreatures > rangeLimits.maxCreatures
      ? undefined
      : maxCreatures;
  const fixedMinNonCreatures =
    minNonCreatures && minNonCreatures > rangeLimits.maxNonCreatures
      ? undefined
      : minNonCreatures;
  const fixedMaxNonCreatures =
    maxNonCreatures && maxNonCreatures > rangeLimits.maxNonCreatures
      ? undefined
      : maxNonCreatures;
  const fixedMaxIdentities =
    maxIdentities && maxIdentities > identitiesLimit
      ? undefined
      : maxIdentities;

  const isOutOfRange =
    outOfRange ||
    fixedMinCards !== minCards ||
    fixedMaxCards !== maxCards ||
    fixedMinCreatures !== minCreatures ||
    fixedMaxCreatures !== maxCreatures ||
    fixedMinNonCreatures !== minNonCreatures ||
    fixedMaxNonCreatures !== maxNonCreatures ||
    fixedMaxIdentities !== search.maxIdentities;

  if (isOutOfRange) {
    void navigate({
      replace: true,
      search: prev => ({
        ...prev,
        page: undefined,
        minCards: fixedMinCards,
        maxCards: fixedMaxCards,
        minCreatures: fixedMinCreatures,
        maxCreatures: fixedMaxCreatures,
        minNonCreatures: fixedMinNonCreatures,
        maxNonCreatures: fixedMaxNonCreatures,
        maxIdentities: fixedMaxIdentities,
      }),
    });
  }
}
