create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  ip text not null,
  created_at timestamp default now()
);

alter table contact_messages enable row level security;

alter table contact_messages
add constraint name_length_check
check (char_length(name) <= 80);

alter table contact_messages
add constraint email_length_check
check (char_length(email) <= 120);

alter table contact_messages
add constraint subject_length_check
check (char_length(subject) <= 120);

alter table contact_messages
add constraint message_length_check
check (char_length(message) <= 5000);

create or replace function insert_contact_message(
  p_name text,
  p_email text,
  p_subject text,
  p_message text,
  p_ip text
)
returns void
language plpgsql
as $$
declare
  submission_count integer;
begin

  select count(*)
  into submission_count
  from contact_messages
  where ip = p_ip
  and created_at > now() - interval '1 hour';

  if submission_count >= 3 then
    raise exception 'Rate limit exceeded';
  end if;

  insert into contact_messages (
    name,
    email,
    subject,
    message,
    ip
  )
  values (
    p_name,
    p_email,
    p_subject,
    p_message,
    p_ip
  );

end;
$$;