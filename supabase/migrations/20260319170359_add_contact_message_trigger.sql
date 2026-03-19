-- Function that calls the Edge Function
create or replace function notify_new_contact_message()
returns trigger
language plpgsql
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


-- Trigger
drop trigger if exists contact_message_trigger on contact_messages;

create trigger contact_message_trigger
after insert on contact_messages
for each row
execute function notify_new_contact_message();