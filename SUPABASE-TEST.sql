-- ======================================================================
-- SUPABASE DATABASE VERIFICATION & TESTING SCRIPT
-- Run this in Supabase SQL Editor to verify all tables and RLS policies
-- ======================================================================

-- ======================================================================
-- SECTION 1: TABLE VERIFICATION
-- ======================================================================
-- Check if all required tables exist

SELECT 
    'TABLE VERIFICATION' as check_type,
    table_name,
    'EXISTS ✓' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'members',
    'posts',
    'admin_users',
    'events',
    'moderation_queue',
    'featured_gallery_posts',
    'admin_audit_log'
)
ORDER BY table_name;

-- ======================================================================
-- SECTION 2: COLUMN VERIFICATION
-- ======================================================================
-- Verify critical columns exist in each table

-- Members table columns
SELECT 
    'members_table' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'members'
ORDER BY ordinal_position;

-- Posts table columns
SELECT 
    'posts_table' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;

-- Admin users table columns
SELECT 
    'admin_users_table' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'admin_users'
ORDER BY ordinal_position;

-- ======================================================================
-- SECTION 3: ROW LEVEL SECURITY (RLS) VERIFICATION
-- ======================================================================
-- Check RLS is enabled on all tables

SELECT 
    tablename,
    'RLS Enabled' as status,
    count(*) as policy_count
FROM pg_policies
GROUP BY tablename
ORDER BY tablename;

-- Detailed RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    qual as policy_condition
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ======================================================================
-- SECTION 4: INDEX VERIFICATION
-- ======================================================================
-- Check if performance indexes exist

SELECT 
    'INDEX VERIFICATION' as check_type,
    indexname,
    tablename,
    'EXISTS ✓' as status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('members', 'posts', 'admin_users', 'events', 'moderation_queue', 'admin_audit_log')
ORDER BY tablename, indexname;

-- ======================================================================
-- SECTION 5: STORAGE BUCKET VERIFICATION
-- ======================================================================
-- Check storage buckets

SELECT 
    id as bucket_name,
    public,
    'STORAGE' as type,
    'EXISTS ✓' as status
FROM storage.buckets
WHERE id IN ('member-photos', 'community-media')
ORDER BY id;

-- ======================================================================
-- SECTION 6: SAMPLE DATA CHECKS
-- ======================================================================

-- Count records in each table
SELECT 
    'members' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) > 0 THEN 'HAS DATA ✓' ELSE 'EMPTY' END as status
FROM members
UNION ALL
SELECT 
    'posts' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) > 0 THEN 'HAS DATA ✓' ELSE 'EMPTY' END as status
FROM posts
UNION ALL
SELECT 
    'admin_users' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) > 0 THEN 'HAS DATA ✓' ELSE 'EMPTY' END as status
FROM admin_users
UNION ALL
SELECT 
    'events' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) > 0 THEN 'HAS DATA ✓' ELSE 'EMPTY' END as status
FROM events
UNION ALL
SELECT 
    'moderation_queue' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) > 0 THEN 'HAS DATA ✓' ELSE 'EMPTY' END as status
FROM moderation_queue
UNION ALL
SELECT 
    'featured_gallery_posts' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) > 0 THEN 'HAS DATA ✓' ELSE 'EMPTY' END as status
FROM featured_gallery_posts
UNION ALL
SELECT 
    'admin_audit_log' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) > 0 THEN 'HAS DATA ✓' ELSE 'EMPTY' END as status
FROM admin_audit_log;

-- ======================================================================
-- SECTION 7: RECENT POSTS (Gallery Check)
-- ======================================================================

SELECT 
    'RECENT POSTS' as check_type,
    id,
    text,
    media_url,
    media_type,
    created_at,
    CASE 
        WHEN media_url LIKE 'https://%' THEN 'VALID URL ✓'
        ELSE 'BROKEN/MISSING'
    END as url_status
FROM posts
WHERE media_type = 'image'
ORDER BY created_at DESC
LIMIT 10;

-- ======================================================================
-- SECTION 8: ACTIVE EVENTS CHECK
-- ======================================================================

SELECT 
    'ACTIVE EVENTS' as check_type,
    id,
    title,
    start_date,
    end_date,
    is_active,
    CASE 
        WHEN start_date > NOW() THEN 'UPCOMING'
        WHEN end_date < NOW() THEN 'PAST'
        ELSE 'ONGOING'
    END as event_status
FROM events
WHERE is_active = true
ORDER BY start_date DESC
LIMIT 5;

-- ======================================================================
-- SECTION 9: ADMIN USERS CHECK
-- ======================================================================

SELECT 
    'ADMIN USERS' as check_type,
    email,
    role,
    created_at,
    CASE 
        WHEN role = 'super_admin' THEN 'FULL ACCESS ✓'
        WHEN role = 'moderator' THEN 'MODERATE ACCESS'
        WHEN role = 'editor' THEN 'EDIT ACCESS'
        ELSE 'UNKNOWN'
    END as access_level
FROM admin_users
ORDER BY role, created_at DESC;

-- ======================================================================
-- SECTION 10: AUDIT LOG SAMPLES
-- ======================================================================

SELECT 
    'RECENT ADMIN ACTIONS' as check_type,
    action,
    target_type,
    created_at,
    CASE 
        WHEN action LIKE '%delete%' THEN 'DELETE'
        WHEN action LIKE '%create%' THEN 'CREATE'
        WHEN action LIKE '%update%' THEN 'UPDATE'
        ELSE action
    END as action_type
FROM admin_audit_log
ORDER BY created_at DESC
LIMIT 10;

-- ======================================================================
-- SECTION 11: MODERATION QUEUE STATUS
-- ======================================================================

SELECT 
    'MODERATION QUEUE' as check_type,
    status,
    COUNT(*) as count,
    CASE 
        WHEN status = 'pending' THEN 'NEEDS REVIEW ⚠️'
        WHEN status = 'reviewed' THEN 'REVIEWED'
        WHEN status = 'approved' THEN 'APPROVED ✓'
        WHEN status = 'rejected' THEN 'REJECTED'
    END as action_needed
FROM moderation_queue
GROUP BY status;

-- ======================================================================
-- SECTION 12: CONNECTION TEST (Simple)
-- ======================================================================
-- If this returns a row, database connection is working ✓

SELECT 
    NOW() as current_timestamp,
    'DATABASE CONNECTED ✓' as status;

-- ======================================================================
-- SUMMARY DASHBOARD QUERY
-- ======================================================================
-- Get a quick overview of database health

SELECT 'DATABASE HEALTH CHECK' as section;
SELECT '';

-- Basic stats
WITH stats AS (
    SELECT 'Members' as entity, COUNT(*) as count FROM members
    UNION ALL
    SELECT 'Posts', COUNT(*) FROM posts
    UNION ALL
    SELECT 'Admin Users', COUNT(*) FROM admin_users
    UNION ALL
    SELECT 'Events', COUNT(*) FROM events
    UNION ALL
    SELECT 'Pending Moderation', COUNT(*) FROM moderation_queue WHERE status = 'pending'
    UNION ALL
    SELECT 'Featured Posts', COUNT(*) FROM featured_gallery_posts
)
SELECT 
    entity,
    count,
    CASE 
        WHEN entity = 'Pending Moderation' AND count > 0 THEN '⚠️ ATTENTION NEEDED'
        WHEN count = 0 THEN '(empty)'
        ELSE '✓ OK'
    END as status
FROM stats
ORDER BY 
    CASE entity 
        WHEN 'Members' THEN 1
        WHEN 'Posts' THEN 2
        WHEN 'Admin Users' THEN 3
        WHEN 'Events' THEN 4
        WHEN 'Pending Moderation' THEN 5
        WHEN 'Featured Posts' THEN 6
    END;

-- ======================================================================
-- NOTE: All tests completed. Review results above for any issues.
-- ======================================================================
-- If you see any RED or ERROR messages:
-- 1. Check table creation queries in supabase-setup.sql
-- 2. Verify RLS policies are correctly defined
-- 3. Ensure storage buckets are created
-- 4. Review Supabase project settings for any restrictions
-- ======================================================================