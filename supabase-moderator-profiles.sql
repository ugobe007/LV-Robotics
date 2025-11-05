-- Moderator Profiles Table
-- Stores optional profile information for moderators/admins

CREATE TABLE IF NOT EXISTS moderator_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    bio TEXT,
    email VARCHAR(255),
    linkedin VARCHAR(500),
    twitter VARCHAR(500),
    github VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_moderator_profiles_user_id ON moderator_profiles(user_id);

-- Enable RLS
ALTER TABLE moderator_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view all moderator profiles (public info)
DROP POLICY IF EXISTS "Public can view moderator profiles" ON moderator_profiles;
CREATE POLICY "Public can view moderator profiles"
ON moderator_profiles FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert/update their own profile
DROP POLICY IF EXISTS "Users can manage own profile" ON moderator_profiles;
CREATE POLICY "Users can manage own profile"
ON moderator_profiles FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add helpful comment
COMMENT ON TABLE moderator_profiles IS 'Optional profiles for moderators and admins to display on community pages';
