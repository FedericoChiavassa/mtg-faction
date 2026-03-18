create table public.sync_logs (
  id uuid default gen_random_uuid() primary key,
  completed_at timestamp with time zone default now(),
  creature_types integer not null,
  faction_identities integer not null,
  creature_cards integer not null,
  non_creature_cards integer not null
);

alter table public.sync_logs enable row level security;
