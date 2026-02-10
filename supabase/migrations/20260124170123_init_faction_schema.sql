-- =========================
-- FACTION IDENTITIES
-- =========================

create table faction_identities (
  id uuid primary key default gen_random_uuid(),

  -- Canonical identity (order-insensitive, logic-only)
  identity text[] not null,

  -- Display name (order-sensitive, derived from type_line)
  name text not null,

  created_at timestamptz not null default now(),

  constraint faction_identities_identity_unique
    unique (identity)
);

create index faction_identities_identity_gin
  on faction_identities
  using gin (identity);

-- =========================
-- CARDS
-- =========================

create table cards (
  id uuid primary key default gen_random_uuid(),

  oracle_id uuid not null unique,
  name text not null,

  type_line text not null,
  is_creature boolean not null,

  mana_value numeric not null,

  -- Creature-only
  faction_identity_id uuid
    references faction_identities(id),

  -- Non-creature only
  -- Each entry is a group of creature types (e.g. ['human','warrior'])
  faction_affinities jsonb,

  created_at timestamptz not null default now(),

  constraint cards_faction_logic_check
  check (
    (
      is_creature = true
      and faction_identity_id is not null
      and faction_affinities is null
    )
    or
    (
      is_creature = false
      and faction_identity_id is null
    )
  )
);

-- Frequently used filter
create index cards_is_creature_idx
  on cards (is_creature);

-- Creature equality lookup
create index cards_faction_identity_id_idx
  on cards (faction_identity_id)
  where is_creature = true;

-- Non-creature affinity subset / overlap queries
create index cards_faction_affinities_gin
  on cards
  using gin (faction_affinities jsonb_path_ops)
  where is_creature = false;

-- =========================
-- FORMAT LEGALITIES
-- =========================

create type legality_status as enum (
  'legal',
  'not_legal',
  'banned',
  'restricted'
);

create table format_legalities (
  card_id uuid
    references cards(id)
    on delete cascade,

  format text not null,
  status legality_status not null,

  primary key (card_id, format)
);

create index format_legalities_format_status_idx
  on format_legalities (format, status);
