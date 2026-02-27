import type { QueryData } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export async function fetchFactions({
  page,
  pageSize,
  sortBy = 'count',
}: {
  page: number;
  pageSize: number;
  sortBy?:
    | 'name'
    | 'count'
    | 'creatures_count'
    | 'non_creatures_count'
    | 'identity_count';
}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('faction_identities')
    .select(
      'id, name, count, creatures_count, non_creatures_count, identity_count',
      {
        count: 'exact',
      },
    );

  switch (sortBy) {
    case 'identity_count':
      query = query
        .order('identity_count', { ascending: true })
        .order('name', { ascending: true });
      break;
    case 'creatures_count':
    case 'non_creatures_count':
      query = query
        .order(sortBy, { ascending: false })
        .order('count', { ascending: false });
      break;
    case 'name':
      query = query.order('name', { ascending: true });
      break;
    case 'count':
    default: {
      query = query.order('count', { ascending: false });
    }
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw error;
  }

  return { data, count, currentPage: page };
}

export async function fetchFactionList() {
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
