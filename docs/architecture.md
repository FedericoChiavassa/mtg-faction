# Faction – Architecture Overview

## Project Summary
**Faction** is a custom Magic: The Gathering format with multiple playable variants. Each variant uses *Faction rules* combined with card-pool restrictions from existing formats (e.g. Modern, Premodern).

The site is a **public, read-only** reference tool that allows users to:
- Browse cards
- Filter cards by Faction legality and variant
- Explore which cards are allowed under different format restrictions

The project is not a deckbuilder and does not accept user-generated content.

---

## Core Principles (Non-Negotiable)

1. **PostgreSQL is the source of truth**
   - Real PostgreSQL (not compatible layers)  
   - Hybrid schema: normalized tables + JSONB

2. **Read-optimized architecture**
   - Heavy filtering, almost no writes  
   - Aggressive indexing

3. **Scryfall as upstream data source**
   - Full raw Scryfall JSON is stored (for reference, but optional)  
   - Only relevant fields are extracted for querying

4. **Faction rules are first-class**
   - Faction legality is modeled explicitly  
   - External formats (Modern, Premodern, etc.) are treated as *card-pool sources*, not rules engines

5. **Schema evolves intentionally**
   - New Scryfall fields do **not** trigger schema changes by default  
   - Schema changes only happen when a new field is required for filtering or rules logic

---

## Supported Concepts

### Formats
- **Base format**: Faction  
- **Variants**: Faction + external format restriction
  - Examples:
    - Faction (Modern)
    - Faction (Premodern)

External formats are used **only** to define card eligibility pools.

### Cards vs Prints
- A **card** represents a unique game object (Oracle identity)  
- A **print** represents a specific printing of that card  

Filtering is primarily done at the **card** level.

---

## Data Model Strategy

### Normalized (Queryable)
Stored as columns or relational tables:
- Card name
- Mana value
- Type line
- `is_creature` (frequently filtered)
- Faction identity (for creatures)
- Faction affinities (for non-creatures)
- External format legality (Modern, Premodern, etc.)

### JSONB (Non-Queryable by default)
Stored as raw Scryfall JSON (optional for now):
- Image URIs
- Prices
- Rulings
- Flavor text
- Layout-specific or future fields

Raw JSON is **never discarded**.

---

## Minimal Initial Tables

### `faction_identities`
- `id`: UUID primary key  
- `identity`: canonical array of creature types (order-insensitive)  
- `name`: display name (order-sensitive, derived from type_line)  
- `affinity_subsets`: **array of UUIDs pointing to faction identities that are subsets of this identity**  
- `created_at`: timestamp  

**Rules for generating `affinity_subsets`**:
1. Insert all faction identities first.  
2. For each identity, generate all non-empty subsets of its `identity` array.  
3. For each subset, find the corresponding `id` in `faction_identities`.  
4. Store all found UUIDs in `affinity_subsets`.  
   - Example: `identity = ["human","warrior"]` → `affinity_subsets = ['uuid_human','uuid_warrior','uuid_human_warrior']`  

### `cards`
- `id`: UUID primary key  
- `oracle_id`: unique Oracle ID  
- `name`  
- `type_line`  
- `is_creature`: boolean  
- `mana_value`  
- `faction_identity_id`: UUID reference to `faction_identities` (for creatures)  
- `faction_affinity_ids`: array of UUIDs (for non-creatures)  
- `created_at`

**Indexes**:
- `is_creature` → frequently filtered  
- `faction_identity_id` → creature equality lookup  
- `faction_affinity_ids` GIN → non-creature subset/overlap queries  

---

## Filtering Logic

### Creatures
- Only one `faction_identity_id`  
- Match requires exact equality:

```sql
deck_identity_id = card.faction_identity_id
```

### Non-Creatures
- Each card has `faction_affinity_ids` (array of UUIDs)  
- For a selected faction identity:
  1. Lookup `affinity_subsets` of that faction identity  
  2. Query all non-creature cards where `faction_affinity_ids` **overlaps** any of the subset UUIDs

```sql
SELECT * FROM cards
WHERE NOT is_creature
  AND faction_affinity_ids && ANY(
    SELECT unnest(affinity_subsets)
    FROM faction_identities
    WHERE id = :selectedFactionId
  );
```

- This allows matching a non-creature card that references **any subset** of the selected identity.  

---

## Double-Faced Card (DFC) Rules

- **Both sides creatures**:  
  - If all creature types of one side are included in the other, keep the **larger** side.  
  - If overlapping types exist but neither fully contains the other → card is **invalid**, skip it.  

- **One side creature, one side non-creature**:  
  - Only consider the creature side for faction identity.  

- **No creature sides**:  
  - Faction identity is not applicable  

---

## Tools / Frameworks

- **Frontend**: Next.js  
- **Backend / Database**: Supabase (PostgreSQL)  
- **Local dev**: Docker for PostgreSQL  

---

## Database Migration (SQL)

```sql
create table faction_identities (
  id uuid primary key default gen_random_uuid(),

  identity text[] not null,
  name text not null,
  affinity_subsets uuid[],

  created_at timestamptz not null default now(),

  constraint faction_identities_identity_unique unique (identity)
);

create index faction_identities_identity_gin
  on faction_identities
  using gin (identity);

create table cards (
  id uuid primary key default gen_random_uuid(),

  oracle_id uuid not null unique,
  name text not null,

  type_line text not null,
  is_creature boolean not null,

  mana_value numeric,

  faction_identity_id uuid references faction_identities(id),
  faction_affinity_ids uuid[],

  created_at timestamptz not null default now()
);

create index cards_is_creature_idx on cards (is_creature);
create index cards_faction_identity_id_idx on cards (faction_identity_id);
create index cards_faction_affinity_ids_gin on cards using gin (faction_affinity_ids);

create type legality_status as enum (
  'legal',
  'not_legal',
  'banned',
  'restricted'
);

create table format_legalities (
  card_id uuid references cards(id) on delete cascade,
  format text not null,
  status legality_status not null,
  primary key (card_id, format)
);

create index format_legalities_format_status_idx
  on format_legalities (format, status);
```

---

This architecture ensures:

- Fast queries for both creatures and non-creatures  
- Deterministic non-creature filtering using `affinity_subsets`  
- Faction identity logic is **order-insensitive**  
- Clear separation of normalized data vs JSON/optional fields

