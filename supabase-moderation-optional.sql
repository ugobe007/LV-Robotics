-- Optional: Moderation Queue Table
-- Only create this if you plan to use the moderation features
-- This table requires the 'posts' and 'admin_users' tables to exist first

-- Check if you need this table:
-- - Do you have a bulletin board or community posts feature?
-- - Do you need content moderation?
-- If NO, you can disable the moderation section in admin.html instead

-- OPTION 1: Create the table (if posts table exists)
CREATE TABLE IF NOT EXISTS moderation_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID, -- Will reference posts(id) if posts table exists
    reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason VARCHAR(255), -- 'inappropriate' | 'spam' | 'harassment' | 'other'
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'reviewed' | 'approved' | 'rejected'
    reviewed_by UUID, -- Will reference admin_users(user_id) if admin_users exists
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_post_id ON moderation_queue(post_id);
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own reports
DROP POLICY IF EXISTS "Users can view moderation queue" ON moderation_queue;
CREATE POLICY "Users can view moderation queue"
ON moderation_queue FOR SELECT
TO authenticated
USING (true); -- Simplified - adjust based on your needs

-- Allow authenticated users to insert reports
DROP POLICY IF EXISTS "Users can report content" ON moderation_queue;
CREATE POLICY "Users can report content"
ON moderation_queue FOR INSERT
TO authenticated
WITH CHECK (true);

-- If you have admin_users table, add this policy:
-- DROP POLICY IF EXISTS "Admins can manage moderation queue" ON moderation_queue;
-- CREATE POLICY "Admins can manage moderation queue"
-- ON moderation_queue FOR ALL
-- TO authenticated
-- USING (auth.uid() IN (SELECT user_id FROM admin_users))
-- WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- OPTION 2: If you don't need moderation, disable it in the admin panel
-- See instructions below to comment out the moderation section
