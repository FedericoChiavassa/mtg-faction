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
    from unnest(c.faction_affinities) as affinity(group_identity)
    where group_identity <@ :faction_identity
  );
