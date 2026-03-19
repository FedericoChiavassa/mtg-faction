-- Function that calls the Edge Function
create or replace function notify_new_contact_message()
returns trigger
language plpgsql
set search_path = public 
as $$
begin
  perform
    net.http_post(
      url := 'http://host.docker.internal:54321/functions/v1/new-contact-message',
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