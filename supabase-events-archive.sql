-- ==============================================================
-- LV Robotics — Full past meetup archive
-- Adds the remaining historical meetups from
-- https://www.meetup.com/las-vegas-robotics-meetup/ (events: 16).
-- Skips the cancelled June 26 duplicate and the duplicate
-- "Robot Hustle" listing. Run in the Supabase SQL Editor for
-- project tzitghqmrmsxddysxhvc. Requires the events table.
-- Idempotent via slug ON CONFLICT.
-- current_attendees holds the Meetup attendee count.
-- ==============================================================

INSERT INTO events (slug, title, short_description, description, category, status,
                    start_date, location_type, location_name, location_address,
                    organizer_name, current_attendees)
VALUES
(
    'robots-in-the-sky',
    'Robots in the Sky',
    'Drones and Physical AI — autonomy and drones at work across Las Vegas.',
    E'Drones and Physical AI: what happens when you give AI the ability to physically control a robot or a drone. Featuring John Almasi (Advanced Drone Solutions) on scalable drone cleaning and inspection, and Akshay Bajaj (HostEasy) on agentic AI for the physical world — exploring the Human-to-Machine Quotient (H2MQ) for automation.',
    'Meetup', 'published',
    '2025-06-26 17:30:00-07',
    'in_person', 'Desert Research Institute', '755 E Flamingo Rd, Las Vegas, NV 89119',
    'Bob & Darius', 28
),
(
    'rise-of-the-robot',
    'Rise of the Robot',
    'Lifelike humanoid robots and their relationship to people.',
    E'Exploring lifelike robot creations and their relationship to people — what happens when your next colleague is a robot? From Figure and Atlas to social humanoids, a look at where humanoid robotics is heading. Hosted at the AAA20 Group grand opening.',
    'Meetup', 'published',
    '2025-04-24 17:30:00-07',
    'in_person', 'AAA20 Group', '680 Pilot Rd, Suite E, Las Vegas, NV 89119',
    'Bob & Darius', 54
),
(
    'robotlab-happy-hour',
    'RobotLAB Happy Hour',
    'An automated happy hour hosted by RobotLAB, featuring ChefBot.',
    E'RobotLAB extended an invitation to the LV Robotics community for an automated happy hour featuring ChefBot.',
    'Meetup', 'published',
    '2025-03-28 16:00:00-07',
    'in_person', 'RobotLAB', '6000 S Eastern Ave, Ste 7C, Las Vegas, NV 89119',
    'RobotLAB', 6
),
(
    'robot-hustle',
    'Robot Hustle',
    'Robot startups night with Amplibotics, RobotLAB, and a BattleBots GINZU appearance.',
    E'A night of robot startups and demos featuring Amplibotics (remote-control robots for data collection), RobotLAB (robot automation and integration), and a BattleBots GINZU appearance — plus early talk of a robot "maker passport" for access to local labs and the launch of the Robot Hustle podcast.',
    'Meetup', 'published',
    '2025-02-26 17:30:00-08',
    'in_person', 'Pololu Robotics & Electronics', '920 Pilot Rd, Las Vegas, NV 89119',
    'Bob & Darius', 9
),
(
    'get-a-grip-robot-manipulation',
    'Get a Grip — Robot Manipulation',
    'Robot hands, manipulation, and haptics — how robots handle objects with dexterity.',
    E'How robots handle objects and dexterity. Robot hands (end effectors) are advancing fast — haptics and spatial awareness are critical for delicate manipulation and agile reflexes. A look at advancements in the design and function of robot hands and manipulators.',
    'Meetup', 'published',
    '2024-10-17 17:30:00-07',
    'in_person', 'Pololu Robotics & Electronics', '920 Pilot Rd, Las Vegas, NV 89119',
    'Bob & Darius', 15
),
(
    'inductive-automation-ai',
    'Inductive Automation + AI, the Next Frontier',
    'The intersection of web technology, automation, and robotics.',
    E'An engaging session on the intersection of web technology and robotics — computer programming, new technology, and robots, with networking for professionals and startup enthusiasts.',
    'Meetup', 'published',
    '2024-09-19 17:30:00-07',
    'in_person', '1545 E Pama Ln', '1545 E Pama Ln, Las Vegas, NV 89119',
    'Bob & Darius', 9
),
(
    'robots-in-the-house',
    'Robots in the House',
    'Our 4th meetup — live demos of unique robots from across the country.',
    E'The 4th LV Robotics Meetup, showcasing unique robots and live demos. Robots came from all over the country as part of efforts to debut new robots, their underlying technologies, and the growing list of AI applications that manage them.',
    'Meetup', 'published',
    '2024-08-22 17:00:00-07',
    'in_person', 'Pololu Robotics & Electronics', '920 Pilot Rd, Las Vegas, NV 89119',
    'Bob', 41
),
(
    'cobot-vs-robot',
    'COBOT vs ROBOT',
    'The limits of humans working safely alongside robots.',
    E'Exploring the limits of humans working safely in the same space as robots, and how those limits are changing. Demonstrations across three engagement levels: August Robotics (autonomous commercial robots), Pleo (the robot dinosaur), and a FIRST Robotics high-school team.',
    'Meetup', 'published',
    '2024-06-27 17:00:00-07',
    'in_person', 'Debra March Center', '2200 Via Inspirada #114, Henderson, NV 89044',
    'Bob & Darius', 49
),
(
    'robotics-startup-culture',
    'Building a Robotics Startup Culture',
    'How to build a robotics startup culture, with Pololu and Ocado (Haddington Dynamics).',
    E'A guest talk on how to build a robotics startup culture, plus local community leaders discussing showcase robots made for fairs and festivals. Featuring host Pololu (electronic modules for robots and motion control) and Ocado / Haddington Dynamics (low-cost robot arms making automation accessible).',
    'Meetup', 'published',
    '2024-05-30 17:00:00-07',
    'in_person', 'Pololu Robotics & Electronics', '920 Pilot Rd, Las Vegas, NV 89119',
    'Bob & Darius', 72
),
(
    'inaugural-meetup',
    'The Inaugural LV Robotics Meetup',
    'Where it all began — the very first Las Vegas Robotics Meetup.',
    E'The inaugural Las Vegas Robotics Meetup — a gathering for everyone from hobbyists and students to professionals and enthusiasts, kicking off a community dedicated to shaping the future of robotics in Las Vegas.',
    'Meetup', 'published',
    '2024-04-25 17:00:00-07',
    'in_person', '1545 E Pama Ln', '1545 E Pama Ln, Las Vegas, NV 89119',
    'Bob & Darius', 60
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
