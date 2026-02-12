-- FORCE FIX Storage RLS Policies for 'payments' bucket

-- 1. Force bucket to be public
UPDATE storage.buckets
SET public = true
WHERE id = 'payments';

-- If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public)
VALUES ('payments', 'payments', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- 2. RESET Policies (Delete all old ones to avoid conflicts)
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Public payments insert" ON storage.objects;
DROP POLICY IF EXISTS "Public payments update" ON storage.objects;
DROP POLICY IF EXISTS "Public payments select" ON storage.objects;
DROP POLICY IF EXISTS "Give me access to everything" ON storage.objects;

-- 3. Create CLEAN permissive policies
-- INSERT
CREATE POLICY "Public payments insert" ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'payments');

-- SELECT
CREATE POLICY "Public payments select" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'payments');

-- UPDATE
CREATE POLICY "Public payments update" ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'payments');
