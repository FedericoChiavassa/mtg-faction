-- Create the "creature_types" table
create table public.creature_types (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  name text not null unique
);

-- Enable Row Level Security (RLS)
alter table public.creature_types enable row level security;

-- Create a policy to allow anyone to read
create policy "Public read creature_types"
on public.creature_types
for select
to anon
using (true);