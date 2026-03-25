# Faction (Developer Reference)

> This document contains the authoritative rules and architecture for Faction. Intended for contributors and developers.

## Project Overview

**Faction** is a custom **Magic: The Gathering** format.  
The format revolves around the concept of multiple **factions**, set of creature types.

The project is a **read-only reference application**:

- No deckbuilding
- No user-generated content
- No writes after import
- Heavy read filtering

The application allows users to:

- Choose a faction
- Browse all legal cards for that faction

---

## Core Principles

1. **PostgreSQL is the source of truth**
   - Supabase-hosted PostgreSQL
   - Strong typing and constraints
   - No rule logic duplicated in frontend

2. **Read-optimized design**
   - Data imported once, queried often
   - Indexes are mandatory for all filter paths

3. **Scryfall as the only upstream**
   - Data is derived from Scryfall bulk data
   - Rules operate on Oracle cards, not printings

4. **Faction rules are first-class**
   - Faction legality is not derived at runtime
   - It is precomputed and stored explicitly

---

## Faction Rules (v0.1)

### Rules for Building a Deck

1. Choose a faction.
2. You may include any **creature card** whose faction identity **exactly matches** the chosen faction.
3. You may include any **non-creature card** with **at least one faction affinity** that is **equal to or a subset of** the chosen faction.
4. Cards with **no faction identity and no faction affinities** cannot be included, except for **basic lands**.

---

## Glossary

### Faction

A **faction** is a set of creature types.

A faction exists **only if** it appears as the **full set of creature types** on the type line of at least one existing creature card.

Examples:

- `["elf"]` → valid faction
- `["human", "ranger"]` → valid faction
- `["ranger"]` → _not_ a faction unless a creature card exists with exactly that type line

---

### Faction Identity (Creature Cards Only)

The **complete set of creature types** appearing on the type line of a creature card.

- Order-independent for logic
- Order-preserved only for display
- Exactly **one** per creature card

Examples:

- `Creature — Elf Warrior` → `["elf", "warrior"]`
- `Creature — Dragon` → `["dragon"]`

---

### Faction Affinities (Non-Creature Cards Only)

**Faction affinities** are **isolated sets of creature types** referenced anywhere in a non-creature card’s:

- rules text
- name
- type line

Rules:

- Multiple affinities may exist per card
- **Subsets are excluded**
  - If both `["elf"]` and `["elf", "warrior"]` are found, keep only `["elf", "warrior"]`
- Affinities do **not** need to correspond to an existing faction identity

Stored as: text[][] (each inner array is one affinity group)

---

## Double-Faced Card Rules

### Creature / Creature

- If one face’s faction identity is a subset of the other:
  - Keep the larger identity
- Otherwise:
  - The card has **no faction identity**

### Creature / Non-Creature

- Use the faction identity of the creature face
- **No faction affinities** are assigned

### Non-Creature / Non-Creature

- Combine faction affinities from both faces
- Remove any subset affinities

---

## Card Classification

### Creature Cards (or at least one creature face)

- Must have:
  - `is_creature = true`
  - exactly one `faction_identity_id`
- Must NOT have faction affinities

A creature card is legal **only if**: card.faction_identity_id = chosen_faction.id

---

### Non-Creature Cards

- Must have:
  - `is_creature = false`
  - zero or more `faction_affinities`
- Must NOT have a faction identity

A non-creature card is legal **if any** affinity group is a subset of the chosen faction.

---

### Cards Without Identity or Affinity

- Illegal by default
- Exception: basic lands (handled explicitly)

---

## Canonical Filtering Logic

Let:

- `F` = chosen faction identity (array of creature types)
- `C` = card

### Creature Filtering

C.is_creature = true
AND C.faction_identity_id = F.id

---

### Non-Creature Filtering

A non-creature card is legal if **any** affinity group `A` satisfies: A ⊆ F.identity

This is evaluated at query time using array containment logic.

---

## Data Model Strategy

### Normalized (Queryable)

- Card name
- Type line
- Mana value
- Creature flag
- Faction identity reference
- Faction affinities (`text[][]` saved as jsonb)

### Non-Normalized

- Potentially in the future, full raw Scryfall JSON (stored, not queried)

---

## Import Pipeline (Conceptual)

1. Fetch Scryfall bulk data
2. Identify creature vs non-creature cards
3. **Creature cards**
   - Extract creature types
   - Create or reuse faction identities
   - Assign exactly one faction identity
4. **Non-creature cards**
   - Scan name, type line, and rules text
   - Extract creature type groups
   - Remove subset groups
   - Store as faction affinities
5. Persist cards

The import process is:

- Idempotent
- Fully rerunnable
- Safe to reset

---

## Guiding Rule

> **Creature cards belong to exactly one faction.**  
> **Non-creature cards support one or more factions.**  
> **No runtime inference of faction rules is allowed.**

---
