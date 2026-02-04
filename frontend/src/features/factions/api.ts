import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase.gen';

type FactionRow = Database['public']['Tables']['faction_identities']['Row'];

type Faction = Pick<
  FactionRow,
  | 'id'
  | 'name'
  | 'count'
  | 'creatures_count'
  | 'non_creatures_count'
  | 'lands_count'
>;

export type FactionsResponse = {
  data: Faction[];
  count: number | null;
};

export async function fetchFactions({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('faction_identities')
    .select(
      'id, name, count, creatures_count, non_creatures_count, lands_count',
      { count: 'exact' },
    )
    .order('creatures_count', { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return { data: data as Faction[], count };
}
