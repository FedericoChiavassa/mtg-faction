create or replace function notify_new_contact_message()
returns trigger
language plpgsql
set search_path = public -- <--- Added this
as $$
begin
  perform
    net.http_post(
      url := 'https://kroubmabxsenswkofeup.functions.supabase.co/new-contact-message',
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'id', new.id
      )
    );

  return new;
end;
$$;