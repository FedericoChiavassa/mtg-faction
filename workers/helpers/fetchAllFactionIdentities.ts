import type { Database } from '@db/types';
import type { SupabaseClient } from '@supabase/supabase-js';

// fetch all faction identities with pagination (avoiding 1000 cap)
export async function fetchAllFactionIdentities<S extends string = '*'>(
  supabase: SupabaseClient<Database>,
  select: (S & string) | null = null,
) {
  const pageSize = 1000;
  let from = 0;
  let to = pageSize - 1;

  const query = supabase
    .from('faction_identities')
    .select((select ?? '*') as S)
    .range(from, to);

  type Row = NonNullable<Awaited<typeof query>['data']>[number];
  const all: Row[] = [];

  while (true) {
    const { data, error } = await query;

    if (error) throw error;
    if (!data || data.length === 0) break;

    all.push(...data);

    if (data.length < pageSize) break;

    from += pageSize;
    to += pageSize;
  }

  return all;
}
