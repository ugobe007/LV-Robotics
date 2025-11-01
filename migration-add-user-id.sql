-- LV Robotics Migration: Add user_id to members and posts tables
-- SAFE migration - preserves existing data
-- Run this in Supabase SQL Editor

-- ==============================
-- MEMBERS TABLE MIGRATION
-- ==============================

-- Step 1: Add user_id column if it doesn't exist
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Step 2: Create temporary index for checking duplicates
CREATE INDEX IF NOT EXISTS idx_members_email_temp ON members(email);

-- Step 3: Update user_id by matching email with auth.users
-- This assumes members were created from auth signups with same email
UPDATE members m
SET user_id = au.id
FROM auth.users au
WHERE m.email = au.email AND m.user_id IS NULL;

-- Step 4: For any members without matching auth account, log them
-- (You may need to manually create accounts for these users)
SELECT id, email, user_id FROM members WHERE user_id IS NULL LIMIT 10;

-- Step 5: Add NOT NULL and UNIQUE constraints only after data is populated
-- Check if any nulls remain - if so, handle manually before proceeding
-- ALTER TABLE members ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE members ADD CONSTRAINT members_user_id_unique UNIQUE(user_id);

-- Step 6: Add foreign key constraint if doesn't exist
ALTER TABLE members
ADD CONSTRAINT IF NOT EXISTS members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 7: Create index on user_id
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);

-- ==============================
-- POSTS TABLE MIGRATION
-- ==============================

-- Step 1: Add updated_at column if it doesn't exist
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 2: Add user_id column if it doesn't exist
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS user_id_new UUID;

-- Step 3: Migrate data from author field if user_id is empty
-- Try to match by email if possible, otherwise use current auth.uid() or mark for review
UPDATE posts p
SET user_id_new = au.id
FROM auth.users au
WHERE p.user_id IS NULL 
  AND p.author IS NOT NULL
  AND au.email LIKE (p.author || '%');

-- Step 4: Check for posts that couldn't be mapped
SELECT id, author, user_id, created_at FROM posts 
WHERE user_id IS NULL AND author IS NOT NULL 
LIMIT 20;

-- Step 5: Rename columns (if migration successful)
-- ALTER TABLE posts DROP COLUMN IF EXISTS user_id;
-- ALTER TABLE posts RENAME COLUMN user_id_new TO user_id;

-- Step 6: Add NOT NULL constraint and foreign key after data migration
-- ALTER TABLE posts ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE posts ADD CONSTRAINT IF NOT EXISTS posts_user_id_fkey 
-- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 7: Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- ==============================
-- UPDATE RLS POLICIES
-- ==============================

-- Members table policies
DROP POLICY IF EXISTS "Enable insert for anon users" ON members;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON members;
CREATE POLICY "Users can insert their own member profile" 
ON members FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable read access for all users" ON members;
CREATE POLICY "Everyone can view member profiles" 
ON members FOR SELECT 
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON members;
CREATE POLICY "Users can update their own profile" 
ON members FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON members;
CREATE POLICY "Users can delete their own profile" 
ON members FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Posts table policies
DROP POLICY IF EXISTS "Enable insert for anon users (posts)" ON posts;
DROP POLICY IF EXISTS "Enable insert for authenticated (posts)" ON posts;
DROP POLICY IF EXISTS "Insert by owner with rate limit (posts)" ON posts;
CREATE POLICY "Users can insert own posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable read access for all (posts)" ON posts;
CREATE POLICY "Public can view posts"
ON posts FOR SELECT
TO public, anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Update own posts" ON posts;
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Delete own posts" ON posts;
CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==============================
-- CLEANUP (run after verifying data)
-- ==============================

-- Drop old author column once user_id_new is renamed to user_id
-- ALTER TABLE posts DROP COLUMN IF EXISTS author;

-- ==============================
-- VERIFICATION QUERIES (run after each step)
-- ==============================

-- Check members with user_id
SELECT COUNT(*) as members_with_user_id FROM members WHERE user_id IS NOT NULL;
SELECT COUNT(*) as members_without_user_id FROM members WHERE user_id IS NULL;

-- Check posts with user_id
SELECT COUNT(*) as posts_with_user_id FROM posts WHERE user_id IS NOT NULL;
SELECT COUNT(*) as posts_without_user_id FROM posts WHERE user_id IS NULL;

-- Check for orphaned data that needs manual review
SELECT * FROM members WHERE user_id IS NULL;
SELECT * FROM posts WHERE user_id IS NULL AND author IS NOT NULL;