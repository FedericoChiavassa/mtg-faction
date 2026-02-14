alter table faction_identities
add column identity_count int
generated always as (array_length(identity,1)) stored
not null;
