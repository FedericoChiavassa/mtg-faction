-- Canonical creature filter
-- input: :faction_identity_id (uuid)
select c.*
from cards c
where c.is_creature = true
  and c.faction_identity_id = :faction_identity_id;

-- Canonical non-creature filter
-- input: :faction_identity (text[])
select distinct c.*
from cards c
where c.is_creature = false
  and exists (
    select 1
    from jsonb_array_elements(c.faction_affinities) as affinity_group
    where affinity_group <@ to_jsonb(:faction_identity::text[])
  );
