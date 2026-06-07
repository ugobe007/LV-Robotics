-- ==============================================================
-- LV Robotics — Events Table
-- Run this in the Supabase SQL Editor for the project used by the
-- site (see SUPABASE_URL in js/main.js: tzitghqmrmsxddysxhvc).
-- Safe to run multiple times (idempotent).
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
    status VARCHAR(20) NOT NULL DEFAULT 'draft',  -- 'draft' | 'published' | 'archived'

    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,

    location_type VARCHAR(20) DEFAULT 'in_person', -- 'in_person' | 'virtual' | 'hybrid'
    location_name VARCHAR(255),
    location_address TEXT,

    organizer_name VARCHAR(255),
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

-- Indexes for the homepage query (status + upcoming start_date) and detail lookups
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);

-- Keep updated_at fresh
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

-- ----------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can read PUBLISHED events
DROP POLICY IF EXISTS "Public can view published events" ON events;
CREATE POLICY "Public can view published events"
ON events FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Authenticated users (admins/organizers) can manage events
DROP POLICY IF EXISTS "Authenticated can insert events" ON events;
CREATE POLICY "Authenticated can insert events"
ON events FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update events" ON events;
CREATE POLICY "Authenticated can update events"
ON events FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can delete events" ON events;
CREATE POLICY "Authenticated can delete events"
ON events FOR DELETE
TO authenticated
USING (true);

-- Optional: safely increment view_count for anonymous visitors without
-- granting broad UPDATE rights. event.html can call this via rpc('increment_event_view').
CREATE OR REPLACE FUNCTION increment_event_view(event_id UUID)
RETURNS void AS $$
    UPDATE events SET view_count = COALESCE(view_count, 0) + 1 WHERE id = event_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ----------------------------------------------------------------
-- Seed: real upcoming events (edit freely in Supabase afterwards)
-- ----------------------------------------------------------------
INSERT INTO events (slug, title, short_description, description, category, is_featured, status,
                    start_date, end_date, location_type, location_name, location_address,
                    organizer_name, registration_required, registration_url)
VALUES
(
    'intro-to-robotics-workshop-2026',
    'Intro to Robotics Workshop',
    'A hands-on introduction to building and programming your first robot.',
    E'Join LV Robotics for a beginner-friendly, hands-on workshop covering the fundamentals of robotics: mechanical design, electronics, and programming.\n\nNo experience required — all materials provided. Walk away having built and programmed a working robot.',
    'Workshop', true, 'published',
    '2026-07-18 14:00:00-07', '2026-07-18 17:00:00-07',
    'in_person', 'Tech Center Downtown', '300 S 4th St, Las Vegas, NV 89101',
    'LV Robotics', true, 'membership.html'
),
(
    'community-robotics-meetup-2026',
    'Community Robotics Meetup',
    'Network with Las Vegas makers, founders, and engineers building the future.',
    E'Our monthly community meetup brings together robotics enthusiasts of every level. Share projects, swap ideas, and connect with the people building the robot economy in Las Vegas.\n\nLightning demos welcome — bring what you are working on!',
    'Meetup', false, 'published',
    '2026-08-08 18:00:00-07', '2026-08-08 20:00:00-07',
    'in_person', 'Tech Center Downtown', '300 S 4th St, Las Vegas, NV 89101',
    'LV Robotics', false, NULL
),
(
    'fall-robot-showcase-competition-2026',
    'Fall Robot Showcase & Competition',
    'A full day of demos, competitions, and prizes for builders across the valley.',
    E'Cap off the season with our Fall Robot Showcase & Competition. Watch live demos, cheer on combat and autonomy challenges, and celebrate the best builds from the LV Robotics community.\n\nOpen to spectators and competitors alike.',
    'Competition', true, 'published',
    '2026-09-12 13:00:00-07', '2026-09-12 18:00:00-07',
    'in_person', 'Las Vegas Community Center', '3130 McLeod Dr, Las Vegas, NV 89121',
    'LV Robotics', true, 'membership.html'
)
ON CONFLICT (slug) DO NOTHING;
