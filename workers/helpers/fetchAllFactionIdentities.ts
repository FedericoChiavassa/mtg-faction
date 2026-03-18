import { supabase } from '@lib/createClient';
import type { QueryData } from '@supabase/supabase-js';

// fetch all faction identities with pagination (avoiding 1000 cap)
export async function fetchAllFactionIdentities<S extends string = '*'>(
  select: (S & string) | null = null,
) {
  const pageSize = 1000;
  let from = 0;
  let to = pageSize - 1;

  const query = supabase
    .from('faction_identities')
    .select((select ?? '*') as S);

  type Rows = QueryData<typeof query>;
  const all: Rows = [];

  while (true) {
    const { data, error } = await query.range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;

    all.push(...data);

    if (data.length < pageSize) break;

    from += pageSize;
    to += pageSize;
  }

  return all;
}
