-- 1. Drop the index first (Optional, as dropping the table removes its indexes)
DROP INDEX IF EXISTS format_legalities_format_status_idx;

-- 2. Drop the table
-- This also removes the foreign key constraint and the primary key
DROP TABLE IF EXISTS format_legalities;

-- 3. Drop the custom Enum type
DROP TYPE IF EXISTS legality_status;