-- ==============================================================
-- LV Robotics — Real Meetup events sync
-- Replaces the placeholder seed data with real events pulled from
-- https://www.meetup.com/las-vegas-robotics-meetup/
-- Run in the Supabase SQL Editor for project tzitghqmrmsxddysxhvc.
-- Safe to re-run (idempotent via slug ON CONFLICT).
-- Requires the events table from supabase-events-setup.sql.
-- ==============================================================

-- 1) Remove the placeholder/test events
DELETE FROM events
WHERE slug IN (
    'intro-to-robotics-workshop-2026',
    'community-robotics-meetup-2026',
    'fall-robot-showcase-competition-2026',
    'drink-with-robots',
    'lv-robotics-meetup-2026-07-23'
);

-- 2) Past events (current_attendees holds the Meetup attendee count)
INSERT INTO events (slug, title, short_description, description, category, status,
                    start_date, location_type, location_name, location_address,
                    organizer_name, current_attendees)
VALUES
(
    'lunar-robots',
    'Lunar Robots',
    'Exploring robotics built for the Moon and beyond.',
    E'A look at how robotics is powering the next era of lunar and space exploration, with the LV Robotics community.',
    'Meetup', 'published',
    '2026-05-21 17:30:00-07',
    'in_person', 'Pololu Robotics & Electronics', '920 Pilot Rd, Las Vegas, NV 89119',
    'Bob', 51
),
(
    'robot-builders',
    'Robot Builders',
    'Hands-on night with the makers building robots in Las Vegas.',
    E'A builders'' showcase and discussion night for the people designing and assembling robots across Southern Nevada.',
    'Meetup', 'published',
    '2026-03-26 17:30:00-07',
    'in_person', 'Desert Research Institute', '755 E Flamingo Rd, Las Vegas, NV 89119',
    'Bob', 51
),
(
    'robots-in-space',
    'Robots in Space',
    'How autonomous machines are exploring the final frontier.',
    E'A community session on the robotics and autonomous systems driving modern space exploration.',
    'Meetup', 'published',
    '2025-10-23 17:00:00-07',
    'in_person', 'Desert Research Institute', '755 E Flamingo Rd, Las Vegas, NV 89119',
    'Bob', 64
),
(
    'robots-in-healthcare',
    'Robots in Healthcare — AI Embodied Robots as Care Providers',
    'AI-embodied robots stepping into healthcare and caregiving roles.',
    E'An exploration of how AI-embodied robots are being deployed as care providers, and what it means for the future of healthcare.',
    'Meetup', 'published',
    '2025-08-21 17:30:00-07',
    'in_person', 'International Innovation Center - Las Vegas', '300 S 4th St, Suite 180, Las Vegas, NV 89101',
    'Bob', 81
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    status = EXCLUDED.status,
    start_date = EXCLUDED.start_date,
    location_type = EXCLUDED.location_type,
    location_name = EXCLUDED.location_name,
    location_address = EXCLUDED.location_address,
    organizer_name = EXCLUDED.organizer_name,
    current_attendees = EXCLUDED.current_attendees;

-- 3) Next / upcoming event — July 23, 2026 (a Thursday, matching the usual cadence)
--    Theme: Robots at Work. TODO: set the venue once confirmed.
INSERT INTO events (slug, title, short_description, description, category, is_featured, status,
                    start_date, location_type, location_name, location_address,
                    organizer_name, registration_required, registration_url)
VALUES
(
    'robots-at-work',
    'Robots at Work',
    'How automation and robotics are transforming industries across Southern Nevada — from warehouses and construction to hospitality and logistics.',
    E'Robots are moving off the lab bench and onto the job. Join the Las Vegas Robotics Meetup for a night exploring how automation and embodied AI are reshaping real-world work — warehouses, construction, logistics, manufacturing, and the Las Vegas service economy.\n\nExpect talks, live demos, and plenty of time to connect with the engineers, founders, and operators building the robot workforce. RSVP on Meetup to save your spot.',
    'Meetup', true, 'published',
    '2026-07-23 17:30:00-07',
    'in_person', 'Desert Research Institute', '755 E Flamingo Rd, Las Vegas, NV 89119',
    'Bob', true, 'https://www.meetup.com/las-vegas-robotics-meetup/events/'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    start_date = EXCLUDED.start_date,
    location_type = EXCLUDED.location_type,
    location_name = EXCLUDED.location_name,
    location_address = EXCLUDED.location_address,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured,
    registration_url = EXCLUDED.registration_url;
