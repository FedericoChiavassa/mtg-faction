// --------------------
// Helper: Generate all subsets of an array

import { supabase } from '@lib/createClient';

import { bulkUpsert } from './bulkUpsert';
import { fetchAllFactionIdentities } from './fetchAllFactionIdentities';

// --------------------
function generateSubsets(arr: string[]): string[][] {
  const result: string[][] = [[]];

  for (const item of arr) {
    const len = result.length;
    for (let i = 0; i < len; i++) {
      result.push([...result[i], item]);
    }
  }

  return result;
}

// --------------------
// Helper: Create a stable key from a sorted array
// --------------------
function makeSubsetKey(subset: string[]): string {
  return subset.toSorted().join('|');
}

// --------------------
// Update faction counts
// --------------------
export async function updateFactionCounts() {
  console.log('\nUpdating faction counts...');

  // Fetch all faction identities
  const allIdentities = await fetchAllFactionIdentities();
  if (!allIdentities) throw new Error('Failed to fetch faction identities');

  console.log(`Building subset index for ${allIdentities.length} factions...`);

  // Build index: subset_key -> Set<faction_id>
  // This allows O(1) lookup of which factions contain a given affinity
  const subsetToFactions = new Map<string, Set<string>>();

  for (const faction of allIdentities) {
    const subsets = generateSubsets(faction.identity);

    for (const subset of subsets) {
      if (subset.length === 0) continue; // Skip empty subset

      const key = makeSubsetKey(subset);

      if (!subsetToFactions.has(key)) {
        subsetToFactions.set(key, new Set());
      }
      subsetToFactions.get(key)!.add(faction.id);
    }
  }

  console.log(`Index built with ${subsetToFactions.size} subset entries`);

  // Initialize counts for all factions
  const countsMap = new Map<
    string,
    {
      count: number;
      creatures_count: number;
      lands_count: number;
      non_creatures_count: number;
    }
  >();

  for (const faction of allIdentities) {
    countsMap.set(faction.id, {
      count: 0,
      creatures_count: 0,
      lands_count: 0,
      non_creatures_count: 0,
    });
  }

  // Fetch all cards in batches
  const pageSize = 1000;
  let from = 0;
  let to = pageSize - 1;

  console.log('Fetching all cards to compute counts...');

  while (true) {
    const { data: cards, error } = await supabase
      .from('cards')
      .select('is_creature, faction_identity_id, type_line, faction_affinities')
      .range(from, to);

    if (error) throw error;
    if (!cards || cards.length === 0) break;

    // Process each card
    for (const card of cards) {
      if (card.is_creature && card.faction_identity_id) {
        // Creature card - increment counts for its faction
        const counts = countsMap.get(card.faction_identity_id);
        if (counts) {
          counts.creatures_count++;
          counts.count++;

          // Check if it's also a land
          if (card.type_line.includes('Land')) {
            counts.lands_count++;
          }
        }
      } else if (!card.is_creature && card.faction_affinities) {
        // Non-creature card - use index to find matching factions
        const affinities = card.faction_affinities as string[][];
        const matchedFactions = new Set<string>();

        for (const affinity of affinities) {
          const key = makeSubsetKey(affinity);
          const factionIds = subsetToFactions.get(key);

          if (factionIds) {
            for (const factionId of factionIds) {
              matchedFactions.add(factionId);
            }
          }
        }

        // Increment counts for all matched factions
        for (const factionId of matchedFactions) {
          const counts = countsMap.get(factionId);
          if (counts) {
            counts.non_creatures_count++;
            counts.count++;
            if (card.type_line.includes('Land')) {
              counts.lands_count++;
            }
          }
        }
      }
    }

    if (cards.length < pageSize) break;
    from += pageSize;
    to += pageSize;
  }

  // Bulk update all faction counts
  console.log('Writing faction counts to database...');
  const updates = allIdentities.map(({ identity_count: _, ...faction }) => ({
    ...faction,
    ...countsMap.get(faction.id)!,
  }));

  await bulkUpsert({
    table: 'faction_identities',
    rows: updates,
    onConflict: 'id',
  });

  console.log('\nFaction counts updated!');
}
