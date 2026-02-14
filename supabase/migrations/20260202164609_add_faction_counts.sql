ALTER TABLE faction_identities
ADD COLUMN count integer NOT NULL DEFAULT 0,
ADD COLUMN creatures_count integer NOT NULL DEFAULT 0,
ADD COLUMN non_creatures_count integer NOT NULL DEFAULT 0,
ADD COLUMN lands_count integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN faction_identities.count IS 'Total unique cards in the faction';
COMMENT ON COLUMN faction_identities.creatures_count IS 'Cards with type Creature in their type_line';
COMMENT ON COLUMN faction_identities.non_creatures_count IS 'Cards without the Creature type in their type_line';
COMMENT ON COLUMN faction_identities.lands_count IS 'Cards with type Land in their type_line';
