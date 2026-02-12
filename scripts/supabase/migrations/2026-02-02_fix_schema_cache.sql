-- FIX Schema Cache & Verify Columns

-- 1. Ensure columns exist (just in case)
ALTER TABLE memberships 
ADD COLUMN IF NOT EXISTS months_paid INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ;

-- 2. Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload config';
