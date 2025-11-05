-- Add moderator field to events table
-- Optional field to specify who is leading/moderating the event

ALTER TABLE events ADD COLUMN IF NOT EXISTS moderator VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN events.moderator IS 'Optional: Person leading or moderating this event';

-- This field is optional and backward compatible
-- Existing events will have NULL for this field
