import dotenv from 'dotenv';
import type { Database } from '@db/types';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

import { bulkUpsert } from './helpers/bulkUpsert';
import { extractCreatureGroupsFromText } from './helpers/extractCreatureGroupsFromText';
import { fetchAllFactionIdentities } from './helpers/fetchAllFactionIdentities';
import { updateFactionCounts } from './helpers/updateFactionCounts';

dotenv.config();

// --------------------
// Supabase client
// --------------------
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env');
}

const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
);

// --------------------
// Types
// --------------------
type ScryfallCatalog = {
  object: 'catalog';
  data: string[];
};

type CardInsert = {
  oracle_id: string;
  name: string;
  type_line: string;
  is_creature: boolean;
  mana_value?: number;
  faction_identity_id?: string | null;
  faction_affinities?: string[][] | null;
};

type ScryfallBulkData = {
  object: 'list';
  data: {
    object: string;
    id: string;
    type: string;
    name: string;
    uri: string;
    download_uri: string;
  }[];
};

type ScryfallCardFace = {
  name: string;
  type_line: string;
  oracle_text?: string | null;
};

type ScryfallCard = {
  id: string;
  oracle_id: string;
  name: string;
  type_line: string;
  cmc: number;
  set_type: string;
  games: string[];
  layout: string;
  oracle_text?: string | null;
  card_faces?: ScryfallCardFace[];
  promo_types?: string[];
};

type CreatureTypeSet = {
  singularSet: Set<string>;
  pluralMap: Map<string, string>;
  maxTypeLength: number;
};

// --------------------
// Helpers
// --------------------

// Extract creature subtypes from a single type line
function extractSubtypes(
  typeLine: string,
  creatureTypeSet: CreatureTypeSet,
): string[] {
  const { singularSet, maxTypeLength } = creatureTypeSet;

  const parts = typeLine.split('—');
  if (!parts[1]) return [];

  const tokens = parts[1].trim().toLowerCase().split(/\s+/);

  const result: string[] = [];

  let i = 0;
  while (i < tokens.length) {
    let matched = false;

    // Greedy longest-match first
    for (let len = Math.min(maxTypeLength, tokens.length - i); len > 0; len--) {
      const candidate = tokens.slice(i, i + len).join(' ');

      if (singularSet.has(candidate)) {
        result.push(candidate);
        i += len;
        matched = true;
        break;
      }
    }

    if (!matched) {
      i++;
    }
  }

  return result;
}

// Extract creature types from a type line or double-faced card_faces
function extractCreatureTypes(
  typeLine: string,
  creatureTypeSet: CreatureTypeSet,
  cardFaces?: ScryfallCardFace[],
): string[] {
  // Double-faced cards including creatures
  if (cardFaces && cardFaces.length > 0) {
    const creatureFaces = cardFaces.filter((face) =>
      face.type_line.includes('Creature'),
    );

    // Case 1: one creature, one non-creature
    if (creatureFaces.length === 1) {
      return extractSubtypes(creatureFaces[0].type_line, creatureTypeSet);
    }

    // Case 2: both sides creature
    if (creatureFaces.length === 2) {
      const a = extractSubtypes(creatureFaces[0].type_line, creatureTypeSet);
      const b = extractSubtypes(creatureFaces[1].type_line, creatureTypeSet);

      const aSet = new Set(a);
      const bSet = new Set(b);

      const aInB = a.every((t) => bSet.has(t));
      const bInA = b.every((t) => aSet.has(t));

      if (aInB) return b;
      if (bInA) return a;

      // Invalid: overlapping but neither contains the other
      return [];
    }
  } else {
    // Single-faced creature
    if (typeLine.includes('Creature')) {
      return extractSubtypes(typeLine, creatureTypeSet);
    }
  }

  return [];
}

// Remove subset groups (keep only maximal groups)
function removeSubsets(groups: string[][]): string[][] {
  if (groups.length === 0) return [];

  // Sort by length descending (largest first)
  const sorted = [...groups].sort((a, b) => b.length - a.length);
  const result: string[][] = [];

  for (const group of sorted) {
    // Check if this group is a subset of any already-added group
    const isSubset = result.some((existing) =>
      group.every((type) => new Set(existing).has(type)),
    );
    if (!isSubset) {
      result.push(group);
    }
  }

  return result;
}

// Compute faction affinities for non-creatures
function computeFactionAffinities(
  card: ScryfallCard,
  creatureTypeSet: CreatureTypeSet,
): string[][] {
  const sources: string[] = [card.name, card.type_line];

  if (card.oracle_text) {
    sources.push(card.oracle_text);
  }

  // Handle double-faced non-creatures
  if (card.card_faces && !card.type_line.includes('Creature')) {
    for (const face of card.card_faces) {
      if (face.oracle_text) {
        sources.push(face.oracle_text);
      }
    }
  }

  const allGroups: string[][] = [];

  for (const src of sources) {
    const groups = extractCreatureGroupsFromText(src, creatureTypeSet);
    allGroups.push(...groups);
  }

  return removeSubsets(allGroups);
}

// Fetch all creature types and generate plurals
async function fetchAllCreatureTypes(): Promise<{
  singularSet: Set<string>;
  pluralMap: Map<string, string>;
  maxTypeLength: number;
}> {
  const res = await fetch('https://api.scryfall.com/catalog/creature-types');
  const json = (await res.json()) as ScryfallCatalog;

  const singularSet = new Set<string>();
  const pluralMap = new Map<string, string>();

  const irregularPlurals: Record<string, string[]> = {
    ox: ['oxen'],
    mouse: ['mice'],
    louse: ['lice'],
    fungus: ['fungi'],
  };

  for (const type of json.data) {
    const t = type.toLowerCase();
    singularSet.add(t);
    pluralMap.set(t, t); // singular → itself
    pluralMap.set(t + 's', t);

    if (t.endsWith('y')) pluralMap.set(t.slice(0, -1) + 'ies', t);
    if (t.endsWith('f')) pluralMap.set(t.slice(0, -1) + 'ves', t);
    if (t.endsWith('fe')) pluralMap.set(t.slice(0, -2) + 'ves', t);
  }

  for (const [singular, plurals] of Object.entries(irregularPlurals)) {
    for (const plural of plurals) pluralMap.set(plural, singular);
  }

  // Max words in any creature type (usually 2: "time lord")
  const maxTypeLength = Math.max(
    ...Array.from(singularSet).map((t) => t.split(' ').length),
  );

  return {
    singularSet,
    pluralMap,
    maxTypeLength,
  };
}

// --------------------
// Main import
// --------------------
async function importScryfall() {
  console.log('Fetching Scryfall bulk data...');
  const bulkRes = await fetch('https://api.scryfall.com/bulk-data');
  const bulkData = (await bulkRes.json()) as ScryfallBulkData;

  const oracleCardsDataUrl = bulkData.data.find(
    (d) => d.type === 'oracle_cards',
  )?.download_uri;
  if (!oracleCardsDataUrl)
    throw new Error('Could not find oracle_cards bulk data');

  console.log('Downloading full card data...');
  const cardsRes = await fetch(oracleCardsDataUrl);
  const cards = (await cardsRes.json()) as ScryfallCard[];

  console.log('Fetching creature types...');
  const creatureTypeSet = await fetchAllCreatureTypes();

  console.log(`Processing ${cards.length} cards...`);

  // 0. Split cards into creatures and non-creatures
  const creatures: typeof cards = [];
  const nonCreatures: typeof cards = [];

  for (const card of cards) {
    // remove non paper cards, tokens, funny sets ecc.
    if (
      card.games.includes('paper') &&
      !card.type_line.includes('Token') &&
      card.set_type != 'funny' &&
      card.set_type != 'token' &&
      card.set_type != 'memorabilia' &&
      card.set_type != 'minigame' &&
      card.layout != 'planar' &&
      card.layout != 'vanguard' &&
      card.layout != 'scheme' &&
      !card.promo_types?.includes('playtest')
    ) {
      if (card.type_line.includes('Creature')) {
        creatures.push(card);
      } else {
        nonCreatures.push(card);
      }
    }
  }

  // 1. Prepare Creature Data & Identities
  const identityMap = new Map<string, string[]>();
  const creatureInserts: (CardInsert & {
    _identityKey: string;
  })[] = [];

  for (const c of creatures) {
    const identity = extractCreatureTypes(
      c.type_line,
      creatureTypeSet,
      c.card_faces,
    );

    if (identity.length === 0) continue; // skip cards without creature identity

    const key = identity.toSorted().join('|');

    if (!identityMap.has(key)) {
      identityMap.set(key, identity);
    }

    creatureInserts.push({
      oracle_id: c.oracle_id,
      name: c.name,
      type_line: c.type_line,
      is_creature: true,
      mana_value: c.cmc,
      faction_identity_id: null, // Filled later
      faction_affinities: null,
      _identityKey: key,
    });
  }

  // 2. Bulk Upsert Faction Identities
  const identityRows = Array.from(identityMap.values()).map((identity) => ({
    identity: identity.toSorted(),
    name: identity.map((s) => s[0].toUpperCase() + s.slice(1)).join(' '),
  }));

  console.log(`Upserting ${identityRows.length} faction identities...`);
  await bulkUpsert(supabase, {
    table: 'faction_identities',
    rows: identityRows,
    onConflict: 'identity',
  });

  // 3. Fetch IDs to map back to cards
  const allIdentities = await fetchAllFactionIdentities(
    supabase,
    'id, identity',
  );

  if (!allIdentities) throw new Error('Failed to fetch faction identities');

  const factionIdentityMap = new Map<string, string>();
  for (const item of allIdentities) {
    const sortedIdentity = item.identity.toSorted();
    factionIdentityMap.set(sortedIdentity.join('|'), item.id);
  }

  // 4. Bulk Upsert Creature Cards
  const finalCreatureInserts = creatureInserts.map((c) => {
    const { _identityKey, ...rest } = c;
    return {
      ...rest,
      faction_identity_id: factionIdentityMap.get(_identityKey) ?? null,
    };
  });

  console.log(`Upserting ${finalCreatureInserts.length} creature cards...`);
  await bulkUpsert(supabase, {
    table: 'cards',
    rows: finalCreatureInserts,
    onConflict: 'oracle_id',
  });

  // 5. Process Non-Creatures
  const nonCreatureInserts: CardInsert[] = [];
  for (const c of nonCreatures) {
    const factionAffinities = computeFactionAffinities(c, creatureTypeSet);

    if (factionAffinities.length === 0) continue; // skip if no affinities exist

    nonCreatureInserts.push({
      oracle_id: c.oracle_id,
      name: c.name,
      type_line: c.type_line,
      is_creature: false,
      mana_value: c.cmc,
      faction_identity_id: null,
      faction_affinities: factionAffinities,
    });
  }

  console.log(`Upserting ${nonCreatureInserts.length} non-creature cards...`);
  await bulkUpsert(supabase, {
    table: 'cards',
    rows: nonCreatureInserts,
    onConflict: 'oracle_id',
  });

  console.log('Import complete!');
}

// --------------------
// Run
// --------------------
async function run() {
  await importScryfall();
  await updateFactionCounts(supabase);
}

run().catch((err) => {
  console.error('Error importing Scryfall cards:', err);
  process.exit(1);
});
