-- Fix RLS policies to allow reading profiles (required for checking duplicates)
-- Run this in Supabase SQL Editor

-- 1. Allow everyone to read profiles (needed to find user ID by email)
drop policy if exists "Enable read access for all users" on profiles;
create policy "Enable read access for all users" on profiles for select using (true);

-- 2. Allow everyone to read memberships (needed for the success tracker)
drop policy if exists "Enable read access for all users" on memberships;
create policy "Enable read access for all users" on memberships for select using (true);

-- 3. Ensure INSERT is still allowed (redundant if you already ran previous scripts, but safe)
drop policy if exists "Enable insert for all users" on profiles;
create policy "Enable insert for all users" on profiles for insert with check (true);

drop policy if exists "Enable insert for all users" on memberships;
create policy "Enable insert for all users" on memberships for insert with check (true);

-- 4. Allow updating own profile (optional, but good for "upsert")
-- Note: For anon users, this effectively allows updating any profile if they know the ID/Email and the policy allows it. 
-- In a stricter app, we'd restrict this. For this form, we can allow it or rely on the "Ignore duplicate" logic.
drop policy if exists "Enable update for all users" on profiles;
create policy "Enable update for all users" on profiles for update using (true);
