-- Fix: Allow anonymous users to read posts without signing in
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/cbgevvuvleuwjjmefjza/editor

-- Drop the existing SELECT policy that might be too restrictive
DROP POLICY IF EXISTS "Public can view posts" ON posts;

-- Create a new policy that explicitly allows all users (authenticated AND anonymous)
CREATE POLICY "Enable read access for all users"
ON posts FOR SELECT
TO public, anon, authenticated
USING (true);

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Enable read access for all users';