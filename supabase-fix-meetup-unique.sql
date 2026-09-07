-- ==============================================================
-- LV Robotics — Fix Meetup Event Unique Constraint & Index
-- Run in Supabase SQL Editor (Project: ubanpswucfkdvixityoe)
-- ==============================================================

-- 1. Ensure columns exist
ALTER TABLE events ADD COLUMN IF NOT EXISTS meetup_event_id TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
ALTER TABLE events ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE;

-- 2. Drop existing partial index if present to avoid name conflict
DROP INDEX IF EXISTS idx_events_meetup_event_id;

-- 3. Add explicit UNIQUE constraint on meetup_event_id for PostgREST on_conflict upserts
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_meetup_event_id_key;
ALTER TABLE events ADD CONSTRAINT events_meetup_event_id_key UNIQUE (meetup_event_id);

-- 4. Re-create index for fast source lookups
CREATE INDEX IF NOT EXISTS idx_events_source ON events (source);

-- Verify setup
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
  AND column_name IN ('meetup_event_id', 'source', 'synced_at');
