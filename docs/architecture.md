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
   - Real PostgreSQL (Supabase)  
   - Hybrid schema: normalized tables + JSONB

2. **Read-optimized architecture**  
   - Heavy filtering, almost no writes  
   - Aggressive indexing

3. **Scryfall as upstream data source**  
   - Full raw Scryfall JSON is stored  
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

### Cards
- A **card** represents a unique game object (Oracle identity)
- Filtering is primarily done at the **card** level
- Each card:
  - Has `is_creature` explicitly defined
  - Is either creature-identity-based or affinity-based
  - May instead be universal to all factions

#### Creature Cards
- Must have **exactly one** faction identity
- Playable **only if**:
  ```
  card.faction_identity_id = deck.faction_identity_id
  ```

#### Non‑Creature Cards (Faction Affinity)
- Never have a faction identity
- Instead define **faction affinity** as a set of allowed faction identities
- Playable **only if**:
  ```
  deck.faction_identity_id ∈ card.faction_affinity_ids
  ```

#### Universal Cards
- Short‑circuit all checks via:
  ```
  faction_identity_all = true
  ```
- A reason is always stored for rule clarity

---

## Faction Identities

- A **faction identity** is a canonical set of creature types
- Stored once and reused by reference
- Order‑independent for identity logic
- Has a stable, human‑readable **display name**
  - Order preserved from card `type_line`
  - Used for UI only

---

## Data Model Strategy

### Normalized (Queryable)
Stored as columns or relational tables:
- Card name
- Mana value
- Colors
- Type line
- `is_creature` (BOOLEAN)

**Faction system fields**:
- `faction_identity_id` (UUID → faction_identities, creature cards only)
- `faction_affinity_ids` (UUID[] → faction_identities, non‑creature cards only)
- `faction_identity_all` (BOOLEAN)
- `faction_identity_all_reason` (ENUM)

**Legalities**:
- Faction legality
- External format legalities (Modern, Premodern, etc.)

### JSONB (Non‑Queryable by default)
- Full raw Scryfall payload

Raw JSON is **never discarded**.

---

## Minimal Initial Tables

### 1. faction_identities
- Canonical faction identities
- Creature‑type arrays + display name

### 2. cards
- Core oracle‑level data
- Creature vs non‑creature explicitly enforced
- References faction identities or affinities
- Universal override supported

### 3. legalities
- `(card_id, format, status)`
- Faction stored independently from other formats

---

## Database Migration (Supabase / PostgreSQL)

```sql
-- ENUMS
CREATE TYPE legality_status AS ENUM ('legal', 'not_legal', 'banned', 'restricted');
CREATE TYPE faction_identity_all_reason AS ENUM (
  'colorless',
  'rule_exception',
  'special_card'
);

-- FACTION IDENTITIES
CREATE TABLE faction_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity TEXT[] NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE INDEX faction_identities_identity_gin
  ON faction_identities USING GIN (identity);

-- CARDS
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mana_value NUMERIC,
  colors TEXT[],
  type_line TEXT NOT NULL,
  is_creature BOOLEAN NOT NULL,

  faction_identity_id UUID REFERENCES faction_identities(id),
  faction_affinity_ids UUID[],

  faction_identity_all BOOLEAN NOT NULL DEFAULT false,
  faction_identity_all_reason faction_identity_all_reason,

  raw JSONB NOT NULL
);

-- Integrity constraints
ALTER TABLE cards ADD CONSTRAINT faction_logic_check CHECK (
  faction_identity_all = true
  OR (
    is_creature = true
    AND faction_identity_id IS NOT NULL
    AND faction_affinity_ids IS NULL
  )
  OR (
    is_creature = false
    AND faction_identity_id IS NULL
  )
);

CREATE INDEX cards_colors_gin ON cards USING GIN (colors);
CREATE INDEX cards_affinity_gin ON cards USING GIN (faction_affinity_ids);

-- LEGALITIES
CREATE TABLE legalities (
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  format TEXT NOT NULL,
  status legality_status NOT NULL,
  PRIMARY KEY (card_id, format)
);

CREATE INDEX legalities_format_idx ON legalities (format, status);
```

---

## Import Pipeline

1. Fetch bulk data from Scryfall
2. Store full JSON payload
3. Derive `is_creature` from `type_line`
4. **Creature cards**:
   - Extract creature types
   - Normalize into a faction identity
   - Create or reuse `faction_identities`
   - Assign `faction_identity_id`
5. **Non‑creature cards**:
   - Assign allowed faction identities via `faction_affinity_ids`
6. Handle universal cards via `faction_identity_all`
7. Upsert cards
8. Rebuild legalities

Import must be:
- Idempotent
- Rerunnable
- Safe to reset

---

## Guiding Rule

> **Creature cards match exactly one faction identity.**  
> **Non‑creature cards allow one or more faction identities.**  
> **Universal cards bypass faction checks entirely.**

---

## Status
This document defines the authoritative architecture for the **Faction** format.

