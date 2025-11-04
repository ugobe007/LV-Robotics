-- LV Robotics Events Table with Multi-Platform Publishing
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/tzitghqmrmsxddysxhvc/editor

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Basic Event Info
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE, -- URL-friendly version for event pages
    description TEXT,
    short_description VARCHAR(500), -- For social media/cards
    
    -- Date & Time
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) DEFAULT 'America/Los_Angeles',
    
    -- Location
    location_name VARCHAR(255),
    location_address TEXT,
    location_type VARCHAR(50), -- 'in-person', 'virtual', 'hybrid'
    virtual_link TEXT,
    
    -- Registration
    registration_required BOOLEAN DEFAULT false,
    registration_url TEXT,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    
    -- Media
    image_url TEXT,
    banner_url TEXT,
    
    -- Categorization
    category VARCHAR(100), -- 'workshop', 'competition', 'meetup', 'social', 'conference'
    tags TEXT[], -- Array of tags for filtering
    
    -- Publishing
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'cancelled', 'completed'
    is_featured BOOLEAN DEFAULT false,
    publish_date TIMESTAMP WITH TIME ZONE,
    
    -- Multi-Platform Publishing Tracking
    platforms JSONB DEFAULT '{}', -- Stores publishing status for each platform
    -- Example: {"splashthat": {"published": true, "url": "..."}, "meetup": {"published": false}}
    
    -- SEO & Social
    meta_title VARCHAR(255),
    meta_description TEXT,
    og_image TEXT, -- Open Graph image for social sharing
    
    -- Organizer
    organizer_name VARCHAR(255),
    organizer_email VARCHAR(255),
    contact_email VARCHAR(255),
    
    -- Additional Info
    requirements TEXT, -- Prerequisites or what to bring
    agenda JSONB, -- Structured schedule
    sponsors TEXT[], -- List of sponsor names/logos
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured) WHERE is_featured = true;

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_events_search ON events USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published events
DROP POLICY IF EXISTS "Public can view published events" ON events;
CREATE POLICY "Public can view published events"
ON events FOR SELECT
TO public, anon, authenticated
USING (status = 'published' OR status = 'completed');

-- Policy: Authenticated users can insert events (will be auto-approved by admins)
DROP POLICY IF EXISTS "Authenticated can create events" ON events;
CREATE POLICY "Authenticated can create events"
ON events FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Authenticated users can update their events (or admins can update any)
DROP POLICY IF EXISTS "Users can update events" ON events;
CREATE POLICY "Users can update events"
ON events FOR UPDATE
TO authenticated
USING (true) -- Admin check will be done in application layer
WITH CHECK (true);

-- Policy: Authenticated users can delete events
DROP POLICY IF EXISTS "Users can delete events" ON events;
CREATE POLICY "Users can delete events"
ON events FOR DELETE
TO authenticated
USING (true); -- Admin check will be done in application layer

-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for event images
DROP POLICY IF EXISTS "Authenticated can upload event images" ON storage.objects;
CREATE POLICY "Authenticated can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Event images are publicly accessible" ON storage.objects;
CREATE POLICY "Event images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Authenticated can delete event images" ON storage.objects;
CREATE POLICY "Authenticated can delete event images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images');

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
    -- Ensure uniqueness by appending a number if needed
    WHILE EXISTS (SELECT 1 FROM events WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000)::TEXT;
    END LOOP;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_slug ON events;
CREATE TRIGGER trigger_auto_slug
BEFORE INSERT OR UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION auto_generate_slug();

-- Create a view for upcoming events
CREATE OR REPLACE VIEW upcoming_events AS
SELECT *
FROM events
WHERE status = 'published'
  AND start_date > NOW()
ORDER BY start_date ASC;

-- Create a view for past events
CREATE OR REPLACE VIEW past_events AS
SELECT *
FROM events
WHERE status IN ('published', 'completed')
  AND start_date <= NOW()
ORDER BY start_date DESC;

-- Create event attendees table (optional, for tracking registrations)
CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    status VARCHAR(50) DEFAULT 'registered', -- 'registered', 'checked-in', 'cancelled', 'waitlist'
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checked_in_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    UNIQUE(event_id, email)
);

CREATE INDEX IF NOT EXISTS idx_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_attendees_user ON event_attendees(user_id);

-- Enable RLS for attendees
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own registrations
DROP POLICY IF EXISTS "Users view own registrations" ON event_attendees;
CREATE POLICY "Users view own registrations"
ON event_attendees FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Users can register for events
DROP POLICY IF EXISTS "Users can register for events" ON event_attendees;
CREATE POLICY "Users can register for events"
ON event_attendees FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Policy: Users can cancel their own registrations
DROP POLICY IF EXISTS "Users can cancel registrations" ON event_attendees;
CREATE POLICY "Users can cancel registrations"
ON event_attendees FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

COMMENT ON TABLE events IS 'Stores all LV Robotics events with multi-platform publishing support';
COMMENT ON COLUMN events.platforms IS 'JSONB object tracking publishing status across platforms (SplashThat, Meetup, LinkedIn, X, Facebook)';
COMMENT ON COLUMN events.slug IS 'URL-friendly identifier auto-generated from title';
