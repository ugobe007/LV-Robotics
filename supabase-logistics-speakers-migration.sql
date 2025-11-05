-- Migration: Add venue logistics and speakers/partners fields
-- Date: 2025
-- Description: Adds fields for single-day events with venue logistics, curfew times, and speaker information

-- Add curfew time field (venue time restriction)
ALTER TABLE events ADD COLUMN IF NOT EXISTS curfew_time TIME;

-- Add venue logistics fields
ALTER TABLE events ADD COLUMN IF NOT EXISTS food_drinks VARCHAR(50);
ALTER TABLE events ADD COLUMN IF NOT EXISTS av_equipment VARCHAR(50);

-- Add speaker and partner fields
ALTER TABLE events ADD COLUMN IF NOT EXISTS topic VARCHAR(100);
ALTER TABLE events ADD COLUMN IF NOT EXISTS speakers TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS speaker_bios TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS partners TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS resources TEXT;

-- Add comments for documentation
COMMENT ON COLUMN events.curfew_time IS 'Hard stop time if venue has curfew restrictions';
COMMENT ON COLUMN events.food_drinks IS 'Food/drinks status: provided, needed, or none';
COMMENT ON COLUMN events.av_equipment IS 'AV equipment status: provided, needed, or none';
COMMENT ON COLUMN events.topic IS 'Event topic/industry focus (e.g., space, healthcare, defense)';
COMMENT ON COLUMN events.speakers IS 'Comma-separated list of speaker names';
COMMENT ON COLUMN events.speaker_bios IS 'Biographical information for speakers';
COMMENT ON COLUMN events.partners IS 'Partner organizations or sponsors';
COMMENT ON COLUMN events.resources IS 'Background materials, links, slides, papers, etc.';

-- Note: This migration maintains backward compatibility. All new fields are optional/nullable.
-- Events created before this migration will have NULL values for these fields.
