import fetch from 'node-fetch';

import { bulkUpsert } from './helpers/bulkUpsert';
import { extractCreatureGroupsFromText } from './helpers/extractCreatureGroupsFromText';
import { fetchAllFactionIdentities } from './helpers/fetchAllFactionIdentities';
import { updateFactionCounts } from './helpers/updateFactionCounts';

// --------------------
// Memory Monitoring
// --------------------
function logMemoryUsage(label: string) {
  const used = process.memoryUsage();
  console.log(`\n[${label}] Memory Usage:`);
  console.log(`  RSS: ${Math.round(used.rss / 1024 / 1024)} MB`);
  console.log(`  Heap Total: ${Math.round(used.heapTotal / 1024 / 1024)} MB`);
  console.log(`  Heap Used: ${Math.round(used.heapUsed / 1024 / 1024)} MB`);
  console.log(`  External: ${Math.round(used.external / 1024 / 1024)} MB`);
}

// --------------------
// Types
// --------------------
type ScryfallCatalog = {
  object: 'catalog';
  data: string[];
};

type CardInsert = {
  oracle_id: string;
  scryfall_uri: string;
  name: string;
  type_line: string;
  is_creature: boolean;
  mana_value?: number;
  normal_img_url: string;
  normal_img_url_2?: string | null;
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
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
};

type ScryfallCard = {
  id: string;
  oracle_id: string;
  scryfall_uri: string;
  name: string;
  type_line: string;
  cmc: number;
  set_type: string;
  games: string[];
  layout: string;
  oracle_text?: string | null;
  card_faces?: ScryfallCardFace[];
  promo_types?: string[];
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
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
    const creatureFaces = cardFaces.filter(face =>
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

      const aInB = a.every(t => bSet.has(t));
      const bInA = b.every(t => aSet.has(t));

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
    const isSubset = result.some(existing =>
      group.every(type => new Set(existing).has(type)),
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

//Generate creature type plurals
function createCreatureTypeSet({
  creatureTypes,
}: {
  creatureTypes: ScryfallCatalog['data'];
}): {
  singularSet: Set<string>;
  pluralMap: Map<string, string>;
  maxTypeLength: number;
} {
  const singularSet = new Set<string>();
  const pluralMap = new Map<string, string>();

  const irregularPlurals: Record<string, string[]> = {
    ox: ['oxen'],
    mouse: ['mice'],
    louse: ['lice'],
    fungus: ['fungi'],
  };

  for (const type of creatureTypes) {
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
    ...Array.from(singularSet).map(t => t.split(' ').length),
  );

  return {
    singularSet,
    pluralMap,
    maxTypeLength,
  };
}

// Filter valid cards
function isValidCard(card: ScryfallCard): boolean {
  return (
    card.games.includes('paper') &&
    !card.type_line.includes('Token') &&
    !card.type_line.includes('Conspiracy') &&
    card.set_type !== 'funny' &&
    card.set_type !== 'token' &&
    card.set_type !== 'memorabilia' &&
    card.set_type !== 'minigame' &&
    card.layout !== 'planar' &&
    card.layout !== 'vanguard' &&
    card.layout !== 'scheme' &&
    !card.promo_types?.includes('playtest')
  );
}

function identityKey(identity: string[]): string {
  return identity.toSorted().join('|');
}

// --------------------
// Main import
// --------------------
async function importScryfall() {
  console.log('\n=== START ===');
  console.log('\nFetching Scryfall bulk data...');
  const bulkRes = await fetch('https://api.scryfall.com/bulk-data');
  const bulkData = (await bulkRes.json()) as ScryfallBulkData;

  const oracleCardsDataUrl = bulkData.data.find(
    d => d.type === 'oracle_cards',
  )?.download_uri;
  if (!oracleCardsDataUrl)
    throw new Error('Could not find oracle_cards bulk data');

  console.log('Downloading full card data...');
  const cardsRes = await fetch(oracleCardsDataUrl);
  const allCards = (await cardsRes.json()) as ScryfallCard[];

  console.log('Fetching creature types...');
  const creatureTypesRes = await fetch(
    'https://api.scryfall.com/catalog/creature-types',
  );
  const creatureTypesJson = (await creatureTypesRes.json()) as ScryfallCatalog;
  const creatureTypeSet = createCreatureTypeSet({
    creatureTypes: creatureTypesJson.data,
  });

  console.log(`Userting ${creatureTypesJson?.data?.length} creature types...`);
  await bulkUpsert({
    table: 'creature_types',
    rows: creatureTypesJson?.data?.map(type => ({
      name: type.toLowerCase(),
    })),
    onConflict: 'name',
  });

  console.log(`\nProcessing ${allCards.length} cards...`);

  // 0. Split cards into creatures and non-creatures
  const creatures: typeof allCards = [];
  const nonCreatures: typeof allCards = [];

  for (const card of allCards) {
    if (isValidCard(card)) {
      if (card.type_line.includes('Creature')) {
        creatures.push(card);
      } else {
        nonCreatures.push(card);
      }
    }
  }

  // Cleanup
  allCards.length = 0;

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

    const key = identityKey(identity);

    if (!identityMap.has(key)) {
      identityMap.set(key, identity);
    }

    creatureInserts.push({
      oracle_id: c.oracle_id,
      scryfall_uri: c.scryfall_uri,
      name: c.name,
      type_line: c.type_line,
      is_creature: true,
      mana_value: c.cmc,
      faction_identity_id: null, // Filled later
      faction_affinities: null,
      normal_img_url:
        c.image_uris?.normal ?? c.card_faces?.[0]?.image_uris?.normal ?? '',
      normal_img_url_2: c.card_faces?.[1]?.image_uris?.normal ?? null,
      _identityKey: key,
    });
  }

  // 2. Bulk Upsert Faction Identities
  const identityRows = Array.from(identityMap.values()).map(identity => ({
    identity: identity.toSorted(),
    name: identity.map(s => s[0].toUpperCase() + s.slice(1)).join(' '),
  }));

  console.log(`Upserting ${identityRows.length} faction identities...`);
  await bulkUpsert({
    table: 'faction_identities',
    rows: identityRows,
    onConflict: 'identity',
  });

  // 3. Fetch faction IDs to map back to crature cards
  const allIdentities = await fetchAllFactionIdentities('id, identity');

  if (!allIdentities) throw new Error('Failed to fetch faction identities');

  const factionIdentityMap = new Map<string, string>();
  for (const item of allIdentities) {
    factionIdentityMap.set(identityKey(item.identity), item.id);
  }

  // 4. Bulk Upsert Creature Cards
  const finalCreatureInserts = creatureInserts.map(c => {
    const { _identityKey, ...rest } = c;
    return {
      ...rest,
      faction_identity_id: factionIdentityMap.get(_identityKey) ?? null,
    };
  });

  console.log(`Upserting ${finalCreatureInserts.length} creature cards...`);
  await bulkUpsert({
    table: 'cards',
    rows: finalCreatureInserts,
    onConflict: 'oracle_id',
  });

  // Cleanup
  identityMap.clear();
  creatureInserts.length = 0;
  finalCreatureInserts.length = 0;

  // 5. Process Non-Creatures
  const nonCreatureInserts: CardInsert[] = [];
  for (const c of nonCreatures) {
    const factionAffinities = computeFactionAffinities(c, creatureTypeSet);

    if (factionAffinities.length === 0) continue; // skip if no affinities exist

    nonCreatureInserts.push({
      oracle_id: c.oracle_id,
      scryfall_uri: c.scryfall_uri,
      name: c.name,
      type_line: c.type_line,
      is_creature: false,
      mana_value: c.cmc,
      faction_identity_id: null,
      faction_affinities: factionAffinities,
      normal_img_url:
        c.image_uris?.normal ?? c.card_faces?.[0]?.image_uris?.normal ?? '',
      normal_img_url_2: c.card_faces?.[1]?.image_uris?.normal ?? null,
    });
  }

  console.log(`Upserting ${nonCreatureInserts.length} non-creature cards...`);
  await bulkUpsert({
    table: 'cards',
    rows: nonCreatureInserts,
    onConflict: 'oracle_id',
  });

  // Cleanup
  nonCreatureInserts.length = 0;

  console.log('\nImport complete!');
}

// --------------------
// Run
// --------------------
async function run() {
  const start = performance.now();
  await importScryfall();
  await updateFactionCounts();
  logMemoryUsage('END');
  console.log(
    `\n🏁 Total runtime: ${((performance.now() - start) / 1000).toFixed(2)}s`,
  );
  console.log('\n=== END ===');
}

run().catch(err => {
  console.error('Error importing Scryfall cards:', err);
  process.exit(1);
});
