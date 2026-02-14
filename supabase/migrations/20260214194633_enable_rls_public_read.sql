-- Enable RLS
alter table faction_identities enable row level security;
alter table cards enable row level security;
alter table format_legalities enable row level security;

-- Public read access
create policy "Public read faction_identities"
on faction_identities
for select
to anon
using (true);

create policy "Public read cards"
on cards
for select
to anon
using (true);

create policy "Public read format_legalities"
on format_legalities
for select
to anon
using (true);
