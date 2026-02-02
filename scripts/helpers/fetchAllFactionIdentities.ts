import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../frontend/src/types/supabase.gen';

// fetch all faction identities with pagination (avoiding 1000 cap)
export async function fetchAllFactionIdentities(
  supabase: SupabaseClient,
  select: string | null = null,
): Promise<Database['public']['Tables']['faction_identities']['Row'][]> {
  const pageSize = 1000;
  let from = 0;
  let to = pageSize - 1;
  const all: any[] = [];

  while (true) {
    const { data, error } = await supabase
      .from('faction_identities')
      .select(select ?? '*')
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;

    all.push(...data);

    if (data.length < pageSize) break;

    from += pageSize;
    to += pageSize;
  }

  return all;
}
