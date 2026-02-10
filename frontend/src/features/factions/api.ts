import type { QueryData } from '@supabase/supabase-js';

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

export async function fetchAllFactions() {
  const batchSize = 1000;
  let from = 0;
  let fetched;

  const query = supabase
    .from('faction_identities')
    .select('id, name, identity, count, identity_count');

  type Rows = QueryData<typeof query>;
  let allData: Rows = [];

  do {
    const { data, error } = await query
      .order('identity_count', { ascending: true })
      .order('name', { ascending: true })
      .range(from, from + batchSize - 1);

    if (error) throw error;

    fetched = data.length;
    allData = allData.concat(data);
    from += batchSize;
  } while (fetched === batchSize);

  return allData;
}
