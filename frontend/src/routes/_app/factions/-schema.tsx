import z from 'zod';

export const DEFAULT_PER_PAGE = 15;
export const DEFAULT_SORT_BY = 'count';

const perPageSchema = z.coerce
  .number()
  .pipe(z.union([z.literal(10), z.literal(15), z.literal(20), z.literal(100)]))
  .catch(DEFAULT_PER_PAGE);

const sortBySchema = z
  .enum([
    'name',
    'count',
    'creatures_count',
    'non_creatures_count',
    'identity_count',
  ])
  .catch(DEFAULT_SORT_BY);

export type TPerPage = z.infer<typeof perPageSchema>;
export type TSortBy = z.infer<typeof sortBySchema>;

export const SearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1).optional(),
  perPage: perPageSchema.optional(),
  sortBy: sortBySchema.optional(),
  identities: z.string().array().optional(),
  maxIdentities: z.coerce.number().int().min(1).optional().catch(undefined),
  minCards: z.coerce.number().int().min(0).optional().catch(undefined),
  minCreatures: z.coerce.number().int().min(0).optional().catch(undefined),
  minNonCreatures: z.coerce.number().int().min(0).optional().catch(undefined),
  maxCards: z.coerce.number().int().min(0).optional().catch(undefined),
  maxCreatures: z.coerce.number().int().min(0).optional().catch(undefined),
  maxNonCreatures: z.coerce.number().int().min(0).optional().catch(undefined),
});

export type TSearch = z.infer<typeof SearchSchema>;

export const PER_PAGE_OPTIONS: { value: TPerPage; label: string }[] = [
  { value: 10, label: '10' },
  { value: 15, label: '15' },
  { value: 20, label: '20' },
  { value: 100, label: '100' },
] as const;

export const SORT_BY_OPTIONS: { value: TSortBy; label: React.ReactNode }[] = [
  { value: 'name', label: 'Name' },
  {
    value: 'identity_count',
    label: (
      <span>
        Name{' '}
        <span className="pr-px text-[11px] italic">– Fewer Types First</span>
      </span>
    ),
  },
  { value: 'count', label: 'Cards' },
  { value: 'creatures_count', label: 'Creatures' },
  { value: 'non_creatures_count', label: 'Non Creatures' },
] as const;
