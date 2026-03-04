CREATE VIEW faction_stats AS
SELECT 
  MAX(count) as max_cards, 
  MAX(creatures_count) as max_creatures, 
  MAX(non_creatures_count) as max_non_creatures, 
  MAX(identity_count) as max_identities
FROM faction_identities;