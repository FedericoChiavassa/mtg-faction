import { useMemo } from 'react';
import {
  FingerprintPattern,
  Layers,
  type LucideIcon,
  PawPrint,
  RulerDimensionLine,
  Sparkles,
} from 'lucide-react';

import { useDirtyFields } from './use-dirty-fields';
import type { FactionFormValues } from './use-faction-form';

const BADGE_CONFIG: Record<
  keyof FactionFormValues,
  {
    icon: LucideIcon;
    getValue: (values: FactionFormValues) => string;
  }
> = {
  identities: {
    icon: FingerprintPattern,
    getValue: values => values.identities?.join(', ') ?? '',
  },
  maxIdentities: {
    icon: RulerDimensionLine,
    getValue: values => values.maxIdentities?.toString() ?? '',
  },
  cardsRange: {
    icon: Layers,
    getValue: values => `${values.cardsRange[0]} - ${values.cardsRange[1]}`,
  },
  creaturesRange: {
    icon: PawPrint,
    getValue: values =>
      `${values.creaturesRange[0]} - ${values.creaturesRange[1]}`,
  },
  nonCreaturesRange: {
    icon: Sparkles,
    getValue: values =>
      `${values.nonCreaturesRange[0]} - ${values.nonCreaturesRange[1]}`,
  },
};

export function useFormBadges(values: FactionFormValues) {
  const { dirtyFields } = useDirtyFields(values);

  const formBadges = useMemo(
    () =>
      Object.entries(BADGE_CONFIG).map(([key, config]) => {
        const typedKey = key as keyof FactionFormValues;

        return {
          id: typedKey,
          icon: config.icon,
          show: dirtyFields[typedKey],
          value: config.getValue(values),
        };
      }),
    [dirtyFields, values],
  );

  return formBadges;
}
