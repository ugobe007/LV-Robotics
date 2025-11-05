-- Create community-media storage bucket for gallery uploads
-- This bucket stores photos and videos uploaded by admins for the community gallery

-- Note: Storage buckets are usually created via the Supabase Dashboard UI
-- Go to: Storage → Create a new bucket → Name: "community-media"

-- If you want to create it via SQL (requires proper permissions):
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('community-media', 'community-media', true)
-- ON CONFLICT (id) DO NOTHING;

-- Set storage bucket to be publicly accessible
-- This allows images/videos to be viewed without authentication

-- RLS Policies for storage:
-- 1. Allow public read access
-- CREATE POLICY "Public can view community media"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'community-media');

-- 2. Allow authenticated users to upload
-- CREATE POLICY "Authenticated can upload community media"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'community-media');

-- 3. Allow authenticated users to delete their own uploads
-- CREATE POLICY "Authenticated can delete own community media"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'community-media' AND owner = auth.uid());

-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "Create bucket"
-- 3. Name: "community-media"
-- 4. Public bucket: YES (checked)
-- 5. Click "Create bucket"
-- 6. The bucket is now ready for uploads!

-- Optional: Create posts table if it doesn't exist (for tracking uploads)
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT,
    media_url TEXT,
    media_type VARCHAR(50), -- 'image' or 'video'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow public to view posts
CREATE POLICY IF NOT EXISTS "Public can view posts"
ON posts FOR SELECT
TO public
USING (true);

-- Allow authenticated users to create posts
CREATE POLICY IF NOT EXISTS "Authenticated can create posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to delete their own posts
CREATE POLICY IF NOT EXISTS "Users can delete own posts"
ON posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
