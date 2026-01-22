import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

// --------------------
// Supabase client
// --------------------
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// --------------------
// Types
// --------------------
type ScryfallCatalog = {
  object: "catalog";
  data: string[];
};

type CardInsert = {
  oracle_id: string;
  name: string;
  type_line: string;
  is_creature: boolean;
  mana_value?: number;
  faction_identity_id?: string | null;
  faction_affinity_ids?: string[] | null;
};

type ScryfallBulkData = {
  object: "list";
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
};

type ScryfallCard = {
  id: string;
  oracle_id: string;
  name: string;
  type_line: string;
  cmc: number;
  oracle_text?: string | null;
  card_faces?: ScryfallCardFace[];
  games?: string[];
};

// --------------------
// Helpers
// --------------------

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // remove reminder text
    .replace(/['"!]/g, "") // remove noise punctuation
    .replace(/[.;:]/g, ",") // normalize sentence/clause separators to comma
    .replace(/\s+/g, " ")
    .trim();
}

// Fetch all creature types and generate plurals
async function fetchCreatureTypes(): Promise<{
  singularSet: Set<string>;
  pluralMap: Map<string, string>;
}> {
  const res = await fetch("https://api.scryfall.com/catalog/creature-types");
  const json = (await res.json()) as ScryfallCatalog;

  const singularSet = new Set<string>();
  const pluralMap = new Map<string, string>();

  const irregularPlurals: Record<string, string[]> = {
    ox: ["oxen"],
    mouse: ["mice"],
    louse: ["lice"],
    fungus: ["fungi"],
  };

  for (const type of json.data) {
    const t = type.toLowerCase();
    singularSet.add(t);
    pluralMap.set(t, t); // singular → itself
    pluralMap.set(t + "s", t);

    if (t.endsWith("y")) pluralMap.set(t.slice(0, -1) + "ies", t);
    if (t.endsWith("f")) pluralMap.set(t.slice(0, -1) + "ves", t);
    if (t.endsWith("fe")) pluralMap.set(t.slice(0, -2) + "ves", t);
  }

  for (const [singular, plurals] of Object.entries(irregularPlurals)) {
    for (const plural of plurals) pluralMap.set(plural, singular);
  }

  return { singularSet, pluralMap };
}

// extract subtypes from a single type line
function extractSubtypes(
  typeLine: string,
  creatureTypeSet: Set<string>,
): string[] {
  const parts = typeLine.split("—");
  if (!parts[1]) return [];

  return parts[1]
    .trim()
    .toLowerCase()
    .split(" ")
    .filter((t) => creatureTypeSet.has(t));
}

// Extract creature types from a type line or double-faced card_faces
function extractCreatureTypes(
  typeLine: string,
  creatureTypeSet: Set<string>,
  cardFaces?: any[],
): string[] {
  const subtypes: string[] = [];

  // Double-faced cards including creatures
  if (cardFaces && cardFaces.length > 0) {
    const creatureFaces = cardFaces.filter((face) =>
      face.type_line.includes("Creature"),
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

      // ❌ Invalid: overlapping but neither contains the other
      return []; // signal caller to skip card
    }
  } else {
    // Single-faced creature
    if (typeLine.includes("Creature")) {
      subtypes.push(...extractSubtypes(typeLine, creatureTypeSet));
    }
  }

  return Array.from(new Set(subtypes));
}

// Generate all non-empty subsets of a list of creature types
function generateAllNonEmptySubsets(types: string[]): string[][] {
  const totalSubsets = 1 << types.length;
  const subsets: string[][] = [];

  for (let i = 1; i < totalSubsets; i++) {
    // Use bitmask to filter types included in this subset
    const subset = types.filter((_, index) => (i >> index) & 1);
    subsets.push(subset);
  }
  return subsets;
}

// Add affinity_subsets for all faction identities
async function updateFactionSubsets() {
  const { data: allIdentities, error } = await supabase
    .from("faction_identities")
    .select("*");

  if (error) throw error;
  if (!allIdentities) throw new Error("Failed to fetch faction identities");

  // Helper to create a consistent key for a list of types
  const getIdentityKey = (types: string[]) => [...types].sort().join("|");

  // Create a lookup map for O(1) access
  const identityMap = new Map<string, string>();
  for (const item of allIdentities) {
    identityMap.set(getIdentityKey(item.identity), item.id);
  }

  // Prepare all updates in memory
  const updates = allIdentities.map((identity) => {
    const subsets = generateAllNonEmptySubsets(identity.identity);
    const subsetIds = subsets
      .map((sub) => identityMap.get(getIdentityKey(sub)))
      .filter((id): id is string => !!id);

    return {
      ...identity,
      affinity_subsets: subsetIds,
    };
  });

  // Perform a single bulk upsert to minimize network requests
  const { error: upsertError } = await supabase
    .from("faction_identities")
    .upsert(updates);

  if (upsertError) throw upsertError;
}

// Helper to bulk upsert rows in chunks
async function bulkUpsert(table: string, rows: any[], onConflict: string, batchSize = 1000) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(table).upsert(batch, { onConflict });
    if (error) throw error;
  }
}

// Extract creature groups from text
function extractFactionIdentityIdsFromText(
  text: string,
  pluralMap: Map<string, string>,
  singularSet: Set<string>,
  factionIdentityMap: Map<string, string>,
): string[] {
  const groups: string[] = [];
  const normalized = normalizeText(text);

  const segments = normalized
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  for (const segment of segments) {
    const words = segment.split(/\s+/);
    const normalizedWords = words
      .map((w) => pluralMap.get(w))
      .filter((w): w is string => !!w && singularSet.has(w));
    if (normalizedWords.length === 0) continue;

    normalizedWords.sort(); // Ensure canonical order matches DB
    const key = normalizedWords.join("|");
    const factionId = factionIdentityMap.get(key);
    if (factionId) groups.push(factionId);
  }

  return groups;
}

// Compute faction affinities for non-creatures
function computeFactionAffinitiesForNonCreature(
  card: ScryfallCard,
  pluralMap: Map<string, string>,
  singularSet: Set<string>,
  factionIdentityMap: Map<string, string>,
): string[] {
  const sources = [card.name, card.type_line, card.oracle_text].filter(
    (v): v is string => Boolean(v),
  );
  const factionIdentityIds: string[] = [];

  for (const src of sources) {
    const groups = extractFactionIdentityIdsFromText(
      src,
      pluralMap,
      singularSet,
      factionIdentityMap,
    );
    factionIdentityIds.push(...groups);
  }

  return factionIdentityIds;
}

// --------------------
// Main import
// --------------------
async function importScryfall() {
  console.log("Fetching Scryfall bulk data...");
  const bulkRes = await fetch("https://api.scryfall.com/bulk-data");
  const bulkData = (await bulkRes.json()) as ScryfallBulkData;

  const oracleCardsDataUrl = bulkData.data.find(
    (d: any) => d.type === "oracle_cards",
  )?.download_uri;
  if (!oracleCardsDataUrl)
    throw new Error("Could not find oracle_cards bulk data");

  console.log("Downloading full card data...");
  const cardsRes = await fetch(oracleCardsDataUrl);
  const cards = (await cardsRes.json()) as ScryfallCard[];

  console.log("Fetching creature types...");
  const creatureTypeSet = await fetchCreatureTypes();

  console.log(`Processing ${cards.length} cards...`);

  // Split cards into creatures and non-creatures, and remove non paper cards
  const creatures: typeof cards = [];
  const nonCreatures: typeof cards = [];

  for (const card of cards) {
    if (card.games?.includes("paper")) {
      if (card.type_line.includes("Creature")) {
        creatures.push(card);
      } else {
        nonCreatures.push(card);
      }
    }
  }

  // 1. Prepare Creature Data & Identities
  const identityMap = new Map<string, string[]>();
  const creatureInserts: (CardInsert & { _identityKey: string })[] = [];

  for (const c of creatures) {
    const identity = extractCreatureTypes(
      c.type_line,
      creatureTypeSet.singularSet,
      c.card_faces,
    );

    if (identity.length === 0) continue; // skip cards without creature identity

    const key = identity.toSorted().join("|");
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
      faction_affinity_ids: null,
      _identityKey: key,
    });
  }

  // 2. Bulk Upsert Faction Identities
  const identityRows = Array.from(identityMap.values()).map((identity) => ({
    identity: identity.toSorted(),
    name: identity.map((s) => s[0].toUpperCase() + s.slice(1)).join(" "),
  }));

  console.log(`Upserting ${identityRows.length} faction identities...`);
  await bulkUpsert("faction_identities", identityRows, "identity");

  // 3. Fetch IDs to map back to cards
  const { data: allIdentities } = await supabase
    .from("faction_identities")
    .select("id, identity");
  
  if (!allIdentities) throw new Error("Failed to fetch faction identities");

  const factionIdentityMap = new Map<string, string>();
  for (const item of allIdentities) {
    factionIdentityMap.set(item.identity.sort().join("|"), item.id);
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
  await bulkUpsert("cards", finalCreatureInserts, "oracle_id");

  // 5. Add affinity_subsets to faction identities
  await updateFactionSubsets();

  // 6. Process Non-Creatures
  const nonCreatureInserts: CardInsert[] = [];
  for (const c of nonCreatures) {
    const factionAffinityIds = computeFactionAffinitiesForNonCreature(
      c,
      creatureTypeSet.pluralMap,
      creatureTypeSet.singularSet,
      factionIdentityMap,
    );
    if (factionAffinityIds.length === 0) continue; // skip if no affinities exist

    nonCreatureInserts.push({
      oracle_id: c.oracle_id,
      name: c.name,
      type_line: c.type_line,
      is_creature: false,
      mana_value: c.cmc,
      faction_identity_id: null,
      faction_affinity_ids: factionAffinityIds,
    });
  }

  console.log(`Upserting ${nonCreatureInserts.length} non-creature cards...`);
  await bulkUpsert("cards", nonCreatureInserts, "oracle_id");

  console.log("Import complete!");
}

// --------------------
// Run
// --------------------
importScryfall().catch((err) => {
  console.error("Error importing Scryfall cards:", err);
  process.exit(1);
});
