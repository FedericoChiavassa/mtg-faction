import type { QueryData } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

import type { TPerPage, TSortBy } from './lib/faction-table.const';

export async function fetchFactions({
  page,
  pageSize,
  sortBy = 'count',
  minCards = 0,
  minCreatures = 0,
  minNonCreatures = 0,
  maxCards,
  maxCreatures,
  maxNonCreatures,
  identities,
}: {
  page: number;
  pageSize: TPerPage;
  minCards?: number;
  minCreatures?: number;
  minNonCreatures?: number;
  maxCards?: number;
  maxCreatures?: number;
  maxNonCreatures?: number;
  sortBy?: TSortBy;
  identities?: string[] | null;
}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('faction_identities')
    .select(
      'id, name, count, creatures_count, non_creatures_count, identity_count, identity',
      {
        count: 'exact',
      },
    );

  if (identities) {
    query = query.contains('identity', identities);
  }

  if (minCards > 0) {
    query = query.gte('count', minCards);
  }
  if (minCreatures > 0) {
    query = query.gte('creatures_count', minCreatures);
  }
  if (minNonCreatures > 0) {
    query = query.gte('non_creatures_count', minNonCreatures);
  }
  if (maxCards || maxCards === 0) {
    query = query.lte('count', maxCards);
  }
  if (maxCreatures || maxCreatures === 0) {
    query = query.lte('creatures_count', maxCreatures);
  }
  if (maxNonCreatures || maxNonCreatures === 0) {
    query = query.lte('non_creatures_count', maxNonCreatures);
  }

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

  const { data, error, count, status } = await query.range(from, to);

  if (error) {
    if (status === 416 || error.code === 'PGRST103') {
      return { data: [], count: 0, outOfRange: true };
    }

    throw error;
  }

  return { data, count, currentPage: page, outOfRange: false };
}

export async function fetchFactionList() {
  const batchSize = 1000;
  let from = 0;
  let fetched;

  const query = supabase
    .from('faction_identities')
    .select('id, name, identity, identity_count');

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

export async function fetchFactionStats() {
  const query = supabase
    .from('faction_stats')
    .select('max_cards, max_creatures, max_non_creatures, max_identities');

  const { data, error } = await query.single();

  if (error) {
    throw error;
  }

  return {
    maxCards: data.max_cards ?? 9999,
    maxCreatures: data.max_creatures ?? 9999,
    maxNonCreatures: data.max_non_creatures ?? 9999,
    maxIdentities: data.max_identities ?? 9999,
  };
}
