-- FIX RLS Policies to allow public/anonymous inserts for Waitlist/Membership flow

-- 1. Profiles Table
-- Allow public inserts (anyone can create a profile via the form)
DROP POLICY IF EXISTS "Public profiles insert" ON profiles;
CREATE POLICY "Public profiles insert" ON profiles FOR INSERT WITH CHECK (true);

-- Allow public updates based on email (simplified for waitlist flow)
-- WARNING: In production, this should be stricter. 
-- Assuming email is unique, we allow updating if email matches.
-- However, RLS usually needs a UID. Since we don't have Auth UID here, 
-- we are essentially trusting the frontend. 
DROP POLICY IF EXISTS "Public profiles update" ON profiles;
CREATE POLICY "Public profiles update" ON profiles FOR UPDATE USING (true);

-- Allow public read so we can check if profile exists (by email)
DROP POLICY IF EXISTS "Public profiles select" ON profiles;
CREATE POLICY "Public profiles select" ON profiles FOR SELECT USING (true);


-- 2. Technical Data Table
DROP POLICY IF EXISTS "Public technical_data insert" ON technical_data;
CREATE POLICY "Public technical_data insert" ON technical_data FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public technical_data update" ON technical_data;
CREATE POLICY "Public technical_data update" ON technical_data FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public technical_data select" ON technical_data;
CREATE POLICY "Public technical_data select" ON technical_data FOR SELECT USING (true);


-- 3. Memberships Table
DROP POLICY IF EXISTS "Public memberships insert" ON memberships;
CREATE POLICY "Public memberships insert" ON memberships FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public memberships update" ON memberships;
CREATE POLICY "Public memberships update" ON memberships FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public memberships select" ON memberships;
CREATE POLICY "Public memberships select" ON memberships FOR SELECT USING (true);


-- 4. Email Jobs Table (queue)
DROP POLICY IF EXISTS "Public email_jobs insert" ON email_jobs;
CREATE POLICY "Public email_jobs insert" ON email_jobs FOR INSERT WITH CHECK (true);
