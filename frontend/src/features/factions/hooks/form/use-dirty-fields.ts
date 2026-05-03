import { useMemo } from 'react';

import { useFactionLimits } from '../use-faction-limits';
import type { FactionFormValues } from './use-faction-form';

export function useDirtyFields(values: FactionFormValues): {
  dirtyFields: Record<keyof FactionFormValues, boolean>;
  isDirty: boolean;
} {
  const rangeLimits = useFactionLimits();

  const isIdentitiesDirty =
    !!values.identities && values.identities?.length > 0;

  const isMaxIdentitiesDirty = values.maxIdentities !== undefined;

  const isCardsRangeDirty =
    !!values.cardsRange[0] || values.cardsRange[1] !== rangeLimits?.maxCards;

  const isCreaturesRangeDirty =
    !!values.creaturesRange[0] ||
    values.creaturesRange[1] !== rangeLimits?.maxCreatures;

  const isNonCreaturesRangeDirty =
    !!values.nonCreaturesRange[0] ||
    values.nonCreaturesRange[1] !== rangeLimits?.maxNonCreatures;

  const result = useMemo(
    () => ({
      identities: isIdentitiesDirty,
      maxIdentities: isMaxIdentitiesDirty,
      cardsRange: isCardsRangeDirty,
      creaturesRange: isCreaturesRangeDirty,
      nonCreaturesRange: isNonCreaturesRangeDirty,
    }),
    [
      isIdentitiesDirty,
      isMaxIdentitiesDirty,
      isCardsRangeDirty,
      isCreaturesRangeDirty,
      isNonCreaturesRangeDirty,
    ],
  );

  return {
    dirtyFields: result,
    isDirty: Object.values(result).some(Boolean),
  };
}
