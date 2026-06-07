-- ==============================================================
-- LV Robotics — Consolidated setup for a FRESH Supabase project
-- Target project: ubanpswucfkdvixityoe
-- Run this ONCE in the Supabase SQL Editor, then run:
--   1) supabase-events-meetup.sql   (real upcoming + recent past events)
--   2) supabase-events-archive.sql  (older past meetups)
--
-- Idempotent: safe to re-run. Resolves the historical conflict where
-- ADMIN-DATABASE-SETUP.sql defined an incompatible `events` table —
-- this file uses ONLY the site's events schema (slug/status/…).
-- ==============================================================

-- ==============================================================
-- 1. MEMBERS  (membership.html / js/membership.js)
-- ==============================================================
CREATE TABLE IF NOT EXISTS members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    location VARCHAR(255),
    profile_photo_url TEXT,
    experience_level VARCHAR(50),
    interests TEXT[],
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
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at DESC);
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own member profile" ON members;
CREATE POLICY "Users can insert their own member profile"
ON members FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Everyone can view member profiles" ON members;
CREATE POLICY "Everyone can view member profiles"
ON members FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON members;
CREATE POLICY "Users can update their own profile"
ON members FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON members;
CREATE POLICY "Users can delete their own profile"
ON members FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Storage: member profile photos
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

-- ==============================================================
-- 2. COMMUNITY POSTS / BULLETIN  (community.html, bulletin.html)
-- ==============================================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    text TEXT NOT NULL,
    media_url TEXT,
    media_type VARCHAR(20),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view posts" ON posts;
DROP POLICY IF EXISTS "Enable read access for all (posts)" ON posts;
CREATE POLICY "Public can view posts"
ON posts FOR SELECT TO public, anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
CREATE POLICY "Users can insert own posts"
ON posts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Storage: community uploads (per-user folder)
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-media', 'community-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can upload community media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload community media" ON storage.objects;
DROP POLICY IF EXISTS "Upload to own folder" ON storage.objects;
CREATE POLICY "Upload to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'community-media' AND (name LIKE (auth.uid()::text || '/%')));

DROP POLICY IF EXISTS "Delete own media" ON storage.objects;
CREATE POLICY "Delete own media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'community-media' AND (name LIKE (auth.uid()::text || '/%')));

DROP POLICY IF EXISTS "Community media are publicly accessible" ON storage.objects;
CREATE POLICY "Community media are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-media');

-- ==============================================================
-- 3. MODERATOR PROFILES  (optional, community page bios)
-- ==============================================================
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
CREATE INDEX IF NOT EXISTS idx_moderator_profiles_user_id ON moderator_profiles(user_id);
ALTER TABLE moderator_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view moderator profiles" ON moderator_profiles;
CREATE POLICY "Public can view moderator profiles"
ON moderator_profiles FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "Users can manage own profile" ON moderator_profiles;
CREATE POLICY "Users can manage own profile"
ON moderator_profiles FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ==============================================================
-- 4. EVENTS  (homepage + event.html) — SITE schema (authoritative)
-- ==============================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    short_description TEXT,
    description TEXT,
    image_url TEXT,
    category VARCHAR(100),
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location_type VARCHAR(20) DEFAULT 'in_person',
    location_name VARCHAR(255),
    location_address TEXT,
    organizer_name VARCHAR(255),
    moderator VARCHAR(255),
    requirements TEXT,
    gallery_media JSONB DEFAULT '[]'::jsonb,
    registration_required BOOLEAN DEFAULT false,
    registration_url TEXT,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);

CREATE OR REPLACE FUNCTION set_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_events_updated_at ON events;
CREATE TRIGGER trg_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION set_events_updated_at();

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published events" ON events;
CREATE POLICY "Public can view published events"
ON events FOR SELECT TO anon, authenticated
USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated can insert events" ON events;
CREATE POLICY "Authenticated can insert events"
ON events FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update events" ON events;
CREATE POLICY "Authenticated can update events"
ON events FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can delete events" ON events;
CREATE POLICY "Authenticated can delete events"
ON events FOR DELETE TO authenticated
USING (true);

CREATE OR REPLACE FUNCTION increment_event_view(event_id UUID)
RETURNS void AS $$
    UPDATE events SET view_count = COALESCE(view_count, 0) + 1 WHERE id = event_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ==============================================================
-- 5. ADMIN PANEL  (admin.html) — admin tables only, NO events table
-- ==============================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'moderator',
    permissions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view admin roles" ON admin_users;
CREATE POLICY "Public can view admin roles"
ON admin_users FOR SELECT TO public, anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;
CREATE POLICY "Admins can manage admin users"
ON admin_users FOR ALL TO authenticated
USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'super_admin'))
WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'super_admin'));

CREATE TABLE IF NOT EXISTS moderation_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    reviewed_by UUID REFERENCES admin_users(user_id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_moderation_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_post_id ON moderation_queue(post_id);
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view moderation queue" ON moderation_queue;
CREATE POLICY "Admins can view moderation queue"
ON moderation_queue FOR SELECT TO authenticated
USING (auth.uid() IN (SELECT user_id FROM admin_users));

DROP POLICY IF EXISTS "Admins can manage moderation queue" ON moderation_queue;
CREATE POLICY "Admins can manage moderation queue"
ON moderation_queue FOR ALL TO authenticated
USING (auth.uid() IN (SELECT user_id FROM admin_users))
WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE TABLE IF NOT EXISTS featured_gallery_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    featured_by UUID REFERENCES admin_users(user_id) ON DELETE SET NULL,
    featured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_featured_gallery_position ON featured_gallery_posts(position);
ALTER TABLE featured_gallery_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view featured gallery" ON featured_gallery_posts;
CREATE POLICY "Public can view featured gallery"
ON featured_gallery_posts FOR SELECT TO public, anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage featured gallery" ON featured_gallery_posts;
CREATE POLICY "Admins can manage featured gallery"
ON featured_gallery_posts FOR ALL TO authenticated
USING (auth.uid() IN (SELECT user_id FROM admin_users))
WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID NOT NULL REFERENCES admin_users(user_id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(100),
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON admin_audit_log(created_at DESC);
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit log" ON admin_audit_log;
CREATE POLICY "Admins can view audit log"
ON admin_audit_log FOR SELECT TO authenticated
USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'super_admin'));

-- ==============================================================
-- 6. (After signing up) make yourself a super admin — edit email:
-- INSERT INTO admin_users (user_id, email, role, permissions)
-- SELECT id, email, 'super_admin', ARRAY['all'] FROM auth.users
-- WHERE email = 'your-email@example.com'
-- ON CONFLICT (user_id) DO NOTHING;
-- ==============================================================

-- Verify tables exist:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('members','posts','moderator_profiles','events',
                   'admin_users','moderation_queue','featured_gallery_posts','admin_audit_log')
ORDER BY table_name;
