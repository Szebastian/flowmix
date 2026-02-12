-- FIX Storage RLS Policies for 'payments' bucket

-- 1. Ensure bucket exists (idempotent insert)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payments', 'payments', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public inserts (uploads) to 'payments' bucket
DROP POLICY IF EXISTS "Public payments insert" ON storage.objects;
CREATE POLICY "Public payments insert" ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'payments');

-- 3. Allow public updates (if needed)
DROP POLICY IF EXISTS "Public payments update" ON storage.objects;
CREATE POLICY "Public payments update" ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'payments');

-- 4. Allow public select (view/download)
DROP POLICY IF EXISTS "Public payments select" ON storage.objects;
CREATE POLICY "Public payments select" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'payments');
