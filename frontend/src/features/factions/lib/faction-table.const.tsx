import z from 'zod';

export const DEFAULT_PER_PAGE = 15;
export const DEFAULT_SORT_BY = 'count';

export const perPageSchema = z.coerce
  .number()
  .pipe(z.union([z.literal(10), z.literal(15), z.literal(20)]))
  .catch(DEFAULT_PER_PAGE);

export const sortBySchema = z
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

export const PER_PAGE_OPTIONS: { value: TPerPage; label: string }[] = [
  { value: 10, label: '10' },
  { value: 15, label: '15' },
  { value: 20, label: '20' },
];

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
];
