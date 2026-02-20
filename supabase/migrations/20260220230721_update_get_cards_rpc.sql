-- 1. Drop the function first (because it depends on the view)
drop function if exists get_cards_for_faction(uuid, boolean);

-- 2. Update the view to include the new column
create or replace view card_summary_view as
select 
  oracle_id, 
  name, 
  mana_value, 
  normal_img_url, 
  normal_img_url_2,
  scryfall_uri  -- <--- Added this
from cards;

-- 3. Recreate the function (now returning the updated view)
create or replace function get_cards_for_faction(
  p_faction_id uuid,
  p_creature_filter boolean default null  -- null = all cards, true = creatures only, false = non-creatures only
)
returns setof card_summary_view as $$
declare
    v_faction_identity text[];
begin
  -- First, get the chosen faction's identity (the array of creature types)
  select identity into v_faction_identity
  from public.faction_identities
  where id = p_faction_id;

  -- If the faction doesn't exist, return nothing.
  if v_faction_identity is null then
      return;
  end if;

  -- Return a union of the two sets of cards:
  -- 1. Creature cards with an exact faction identity match.
  -- 2. Non-creature cards where at least one affinity is a subset of the faction identity.
  return query
    -- Creature cards
    select
      c.oracle_id,
      c.name,
      c.mana_value,
      c.normal_img_url,
      c.normal_img_url_2,
      c.scryfall_uri  -- <--- Added this
    from public.cards c
    where c.is_creature = true
      and c.faction_identity_id = p_faction_id
      and (p_creature_filter is null or p_creature_filter = true)

    union all

    -- Non-creature cards
    select
      c.oracle_id,
      c.name,
      c.mana_value,
      c.normal_img_url,
      c.normal_img_url_2,
      c.scryfall_uri  -- <--- Added this
    from public.cards c
    where c.is_creature = false
      and c.faction_affinities is not null
      and (p_creature_filter is null or p_creature_filter = false)
      and exists (
        select 1
        from jsonb_array_elements(c.faction_affinities) as affinity_group
        where affinity_group <@ to_jsonb(v_faction_identity)
      );
end;
$$ language plpgsql stable security invoker;