-- FORCE Columns & Cache Reload

-- 1. Explicitly add columns (safe if they exist)
ALTER TABLE memberships 
ADD COLUMN IF NOT EXISTS months_paid INTEGER DEFAULT 1;

ALTER TABLE memberships 
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ;

-- 2. Force Schema Cache Reload by modifying table metadata
-- Changing a comment usually triggers PostgREST to refresh its cache
COMMENT ON TABLE memberships IS 'Memberships data (Cache Reloaded)';

-- 3. Notify just in case
NOTIFY pgrst, 'reload config';
