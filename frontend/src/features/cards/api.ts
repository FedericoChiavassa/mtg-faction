import { supabase } from '@/lib/supabase';

export async function fetchCards({
  faction,
  isCreature,
  page = 0,
  pageSize = 60,
}: {
  faction: string;
  isCreature?: boolean;
  page?: number;
  pageSize?: number;
}) {
  if (!faction) {
    return { data: [], count: 0 };
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .rpc(
      'get_cards_for_faction',
      { p_faction_id: faction, p_creature_filter: isCreature },
      { count: 'exact' },
    )
    .select('oracle_id, name, mana_value, normal_img_url, normal_img_url_2')
    .order('mana_value', { ascending: true })
    .order('name')
    .range(from, to);

  if (error) {
    throw error;
  }

  return { data, count };
}
