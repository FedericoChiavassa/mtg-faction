import { supabase } from '@/lib/supabase';

export async function fetchCreatureTypes() {
  const { data, error } = await supabase.from('creature_types').select('name');

  if (error) {
    throw error;
  }

  return data.map(creature => creature.name);
}
