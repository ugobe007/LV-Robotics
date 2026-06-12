-- ==============================================================
-- LV Robotics — Meetup calendar sync schema
-- Run ONCE in the Supabase SQL Editor (project ubanpswucfkdvixityoe).
-- Adds the columns the meetup-sync Edge Function needs to upsert
-- Meetup events idempotently into the existing `events` table.
-- Idempotent: safe to re-run.
-- ==============================================================

-- Stable Meetup identifier for conflict-free upserts.
ALTER TABLE events ADD COLUMN IF NOT EXISTS meetup_event_id TEXT;

-- Where a row came from: 'manual' (hand-entered) or 'meetup' (synced).
ALTER TABLE events ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Last time the sync touched this row.
ALTER TABLE events ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE;

-- One row per Meetup event. UNIQUE enables ON CONFLICT upserts.
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_meetup_event_id
    ON events (meetup_event_id)
    WHERE meetup_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_source ON events (source);

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'events'
  AND column_name IN ('meetup_event_id', 'source', 'synced_at')
ORDER BY column_name;
