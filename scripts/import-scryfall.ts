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

// Upsert faction identity and return id
async function upsertFactionIdentity(
  identity: string[],
): Promise<string | null> {
  if (identity.length === 0) return null;

  // Check if it exists
  const { data: existing, error: selectError } = await supabase
    .from("faction_identities")
    .select("id")
    .eq("identity", identity);

  if (selectError) throw selectError;
  if (existing && existing.length > 0) return existing[0].id;

  // Insert new
  const { data, error: insertError } = await supabase
    .from("faction_identities")
    .insert({
      identity,
      name: identity.map((s) => s[0].toUpperCase() + s.slice(1)).join(" "),
    })
    .select("id")
    .single();

  if (insertError) throw insertError;
  if (!data) throw new Error("Failed to insert faction identity");

  return data.id;
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

    const key = normalizedWords.join(" ");
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

// Upsert a card
async function upsertCard(card: CardInsert) {
  const { error } = await supabase
    .from("cards")
    .upsert(card, { onConflict: "oracle_id" });

  if (error) throw error;
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

  // split cards into creatures and non-creatures and remove non paper cards
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

  // Process creatures first
  for (const c of creatures) {
    const identity = extractCreatureTypes(
      c.type_line,
      creatureTypeSet.singularSet,
      c.card_faces,
    );
    if (identity.length === 0) continue; // skip cards without creature identity

    const factionIdentityId = await upsertFactionIdentity(identity);

    const cardInsert: CardInsert = {
      oracle_id: c.oracle_id,
      name: c.name,
      type_line: c.type_line,
      is_creature: true,
      mana_value: c.cmc,
      faction_identity_id: factionIdentityId,
      faction_affinity_ids: null,
    };

    await upsertCard(cardInsert);
  }

  // Build factionIdentityMap from DB
  const { data: factionIdentities } = await supabase
    .from("faction_identities")
    .select("id, identity");
  if (!factionIdentities)
    throw new Error("Failed to fetch faction identities from DB");

  const factionIdentityMap = new Map<string, string>(
    factionIdentities.map((f: any) => [f.identity.join(" "), f.id]),
  );

  // Then process non-creatures
  for (const c of nonCreatures) {
    const factionAffinityIds = computeFactionAffinitiesForNonCreature(
      c,
      creatureTypeSet.pluralMap,
      creatureTypeSet.singularSet,
      factionIdentityMap,
    );
    if (factionAffinityIds.length === 0) continue; // skip if no affinities exist

    const cardInsert: CardInsert = {
      oracle_id: c.oracle_id,
      name: c.name,
      type_line: c.type_line,
      is_creature: false,
      mana_value: c.cmc,
      faction_identity_id: null,
      faction_affinity_ids: factionAffinityIds,
    };

    await upsertCard(cardInsert);
  }

  console.log("Import complete!");
}

// --------------------
// Run
// --------------------
importScryfall().catch((err) => {
  console.error("Error importing Scryfall cards:", err);
  process.exit(1);
});
