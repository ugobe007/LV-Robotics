-- Add gallery_media column to events table
-- Run this in Supabase SQL Editor after the main events setup
-- This allows multiple photos/videos to be attached to each event

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS gallery_media JSONB DEFAULT '[]';

-- Add comment for documentation
COMMENT ON COLUMN events.gallery_media IS 'Array of media objects with url, type (image/video), and filename';

-- Example gallery_media structure:
-- [
--   {"url": "https://...", "type": "image", "filename": "photo1.jpg"},
--   {"url": "https://...", "type": "video", "filename": "demo.mp4"}
-- ]
