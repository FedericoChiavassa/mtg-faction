ALTER FUNCTION public.get_cards_for_faction(uuid, boolean) 
SET search_path = public;

ALTER FUNCTION public.insert_contact_message(text, text, text, text, text) 
SET search_path = public, extensions;