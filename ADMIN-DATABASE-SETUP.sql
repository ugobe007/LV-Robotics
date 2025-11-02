-- LV Robotics Admin Panel Database Setup
-- Run this in Supabase SQL Editor to create necessary tables for the admin panel

-- ==============================
-- ADMIN USERS TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'moderator', -- 'super_admin' | 'moderator' | 'editor'
    permissions TEXT[], -- Array of permission strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view admin roles (for display purposes)
DROP POLICY IF EXISTS "Public can view admin roles" ON admin_users;
CREATE POLICY "Public can view admin roles"
ON admin_users FOR SELECT
TO public, anon, authenticated
USING (true);

-- Only admins can modify admin table (via service role)
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;
CREATE POLICY "Admins can manage admin users"
ON admin_users FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'super_admin'))
WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'super_admin'));

-- ==============================
-- EVENTS TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    image_url TEXT,
    registration_url TEXT,
    max_attendees INTEGER,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can view active events
DROP POLICY IF EXISTS "Public can view active events" ON events;
CREATE POLICY "Public can view active events"
ON events FOR SELECT
TO public, anon, authenticated
USING (is_active = true);

-- Admins can view all events
DROP POLICY IF EXISTS "Admins can view all events" ON events;
CREATE POLICY "Admins can view all events"
ON events FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Admins can manage events
DROP POLICY IF EXISTS "Admins can manage events" ON events;
CREATE POLICY "Admins can manage events"
ON events FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM admin_users))
WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- ==============================
-- MODERATION QUEUE TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS moderation_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason VARCHAR(255), -- 'inappropriate' | 'spam' | 'harassment' | 'other'
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'reviewed' | 'approved' | 'rejected'
    reviewed_by UUID REFERENCES admin_users(user_id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_post_id ON moderation_queue(post_id);
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- Only admins can view moderation queue
DROP POLICY IF EXISTS "Admins can view moderation queue" ON moderation_queue;
CREATE POLICY "Admins can view moderation queue"
ON moderation_queue FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Admins can manage moderation queue
DROP POLICY IF EXISTS "Admins can manage moderation queue" ON moderation_queue;
CREATE POLICY "Admins can manage moderation queue"
ON moderation_queue FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM admin_users))
WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- ==============================
-- FEATURED GALLERY POSTS TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS featured_gallery_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    featured_by UUID NOT NULL REFERENCES admin_users(user_id) ON DELETE SET NULL,
    featured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_featured_gallery_position ON featured_gallery_posts(position);
ALTER TABLE featured_gallery_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view featured posts
DROP POLICY IF EXISTS "Public can view featured gallery" ON featured_gallery_posts;
CREATE POLICY "Public can view featured gallery"
ON featured_gallery_posts FOR SELECT
TO public, anon, authenticated
USING (true);

-- Only admins can manage featured gallery
DROP POLICY IF EXISTS "Admins can manage featured gallery" ON featured_gallery_posts;
CREATE POLICY "Admins can manage featured gallery"
ON featured_gallery_posts FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM admin_users))
WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- ==============================
-- ADMIN AUDIT LOG TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID NOT NULL REFERENCES admin_users(user_id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL, -- 'delete_post' | 'ban_user' | 'approve_event' | etc
    target_type VARCHAR(100), -- 'post' | 'user' | 'event' | etc
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON admin_audit_log(created_at DESC);
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit log
DROP POLICY IF EXISTS "Admins can view audit log" ON admin_audit_log;
CREATE POLICY "Admins can view audit log"
ON admin_audit_log FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'super_admin'));

-- ==============================
-- SETUP: Add admin user
-- ==============================
-- Replace YOUR_EMAIL with your actual email address
-- INSERT INTO admin_users (user_id, email, role, permissions)
-- SELECT id, email, 'super_admin', ARRAY['all']
-- FROM auth.users
-- WHERE email = 'your-email@example.com'
-- ON CONFLICT (user_id) DO NOTHING;

-- ==============================
-- VERIFICATION QUERIES
-- ==============================
-- Check if tables were created:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_users', 'events', 'moderation_queue', 'featured_gallery_posts', 'admin_audit_log');

-- Check if admin user was added:
-- SELECT id, email, role FROM admin_users;