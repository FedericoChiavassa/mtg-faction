-- Remove trigger and function now handled by Supabase Database Webhook

drop trigger if exists contact_message_trigger on contact_messages;
drop function if exists notify_new_contact_message();
