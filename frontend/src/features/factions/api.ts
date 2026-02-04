import { supabase } from '@/lib/supabase';

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

  return { data, count };
}
