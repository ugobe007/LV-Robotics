-- LV Robotics Members Table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/cbgevvuvleuwjjmefjza/editor

-- Create members table (idempotent)
CREATE TABLE IF NOT EXISTS members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    location VARCHAR(255),
    profile_photo_url TEXT,
    experience_level VARCHAR(50),
    interests TEXT[], -- Array of interests
    bio TEXT,
    skills TEXT,
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    referral_source VARCHAR(255),
    email_consent BOOLEAN DEFAULT false,
    privacy_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_members_email ON members(email);

-- Create index on created_at for sorting
CREATE INDEX idx_members_created_at ON members(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Re-create policies idempotently
DROP POLICY IF EXISTS "Enable insert for anon users" ON members;
CREATE POLICY "Enable insert for anon users" 
ON members FOR INSERT 
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON members;
CREATE POLICY "Enable insert for authenticated users" 
ON members FOR INSERT 
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON members;
CREATE POLICY "Enable read access for all users" 
ON members FOR SELECT 
TO anon, authenticated
USING (true);

-- Create storage bucket for profile photos (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can upload member photos" ON storage.objects;
CREATE POLICY "Anyone can upload member photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'member-photos');

DROP POLICY IF EXISTS "Member photos are publicly accessible" ON storage.objects;
CREATE POLICY "Member photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'member-photos');

-- ==============================
-- Community Posts & Storage
-- ==============================

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    author VARCHAR(255) DEFAULT 'Anonymous',
    text TEXT,
    media_url TEXT,
    media_type VARCHAR(20), -- 'image' | 'video' | 'link' | null
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for latest-first queries
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Enable RLS and allow public read/insert
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Replace anon insert with authenticated-only
DROP POLICY IF EXISTS "Enable insert for anon users (posts)" ON posts;
DROP POLICY IF EXISTS "Enable insert for authenticated (posts)" ON posts;
CREATE POLICY "Insert by owner with rate limit (posts)"
ON posts FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() AND (
    SELECT COUNT(*) FROM posts p
    WHERE p.user_id = auth.uid() AND p.created_at > NOW() - INTERVAL '30 seconds'
  ) < 3
);

CREATE POLICY "Enable read access for all (posts)"
ON posts FOR SELECT TO anon, authenticated
USING (true);

-- Allow deletes by owner
CREATE POLICY "Delete own posts"
ON posts FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Create storage bucket for community uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-media', 'community-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow inserts/selects to community-media bucket
-- Restrict community media uploads to authenticated users
DROP POLICY IF EXISTS "Anyone can upload community media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload community media" ON storage.objects;
CREATE POLICY "Upload to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'community-media'
  AND (name LIKE (auth.uid()::text || '/%'))
);

-- Allow deletes of own files
CREATE POLICY "Delete own media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'community-media'
  AND (name LIKE (auth.uid()::text || '/%'))
);

CREATE POLICY "Community media are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-media');

-- ==============================
-- Maintenance: Deduplicate posts
-- Keeps the most recent row per (user_id, COALESCE(media_url, text)) key
-- Safe to run periodically in Supabase SQL Editor
-- ==============================
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, COALESCE(media_url, text)
           ORDER BY created_at DESC
         ) AS rn
  FROM posts
)
DELETE FROM posts p
USING ranked r
WHERE p.id = r.id AND r.rn > 1;
