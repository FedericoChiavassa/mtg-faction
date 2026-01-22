alter table faction_identities
add column affinity_subsets uuid[];

create index faction_identities_affinity_subsets_gin
  on faction_identities
  using gin (affinity_subsets);