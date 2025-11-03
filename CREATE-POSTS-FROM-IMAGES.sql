-- Create posts for existing local images
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/cbgevvuvleuwjjmefjza/editor
-- This will create 26 gallery posts linked to your local images

INSERT INTO posts (user_id, text, media_url, media_type, created_at)
VALUES
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: 300ceb8b-11ae-4140-af17-6b2b330cdcc2.png', '/images/300ceb8b-11ae-4140-af17-6b2b330cdcc2.png', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: Anybots.jpg', '/images/Anybots.jpg', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: Bob_San.jpg', '/images/Bob_San.jpg', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: Darius_casual.png', '/images/Darius_casual.png', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: Darius_san.jpg', '/images/Darius_san.jpg', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: Figure01.png', '/images/Figure01.png', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: HAL.jpg', '/images/HAL.jpg', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: Humanoid_bending.jpg', '/images/Humanoid_bending.jpg', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: LVRobot_Green_new_Logo.png', '/images/LVRobot_Green_new_Logo.png', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: LVRobot_green_logo.jpg', '/images/LVRobot_green_logo.jpg', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: LVRobot_new_logo.jpg', '/images/LVRobot_new_logo.jpg', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: LVRobotics_Community.jpeg', '/images/LVRobotics_Community.jpeg', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: LVRobotics_head.jpg', '/images/LVRobotics_head.jpg', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: LVRobotics_logo.jpg', '/images/LVRobotics_logo.jpg', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: Pleo.jpg', '/images/Pleo.jpg', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: Robot_Vegas.png', '/images/Robot_Vegas.png', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: Yogi.jpg', '/images/Yogi.jpg', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: community-1.jpg', '/images/community-1.jpg', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: community-2.jpg', '/images/community-2.jpg', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: community-3.jpg', '/images/community-3.jpg', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: humanoid.jpg', '/images/humanoid.jpg', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: jibo.png', '/images/jibo.png', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: little_robot_head_green.png', '/images/little_robot_head_green.png', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: logo.png', '/images/logo.png', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: marcus_sophia.jpg', '/images/marcus_sophia.jpg', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: small_robot_head_grey.png', '/images/small_robot_head_grey.png', 'image', NOW()),
    ('f571cb6e-fc7c-44bf-8203-7e1cc7749073', 'Gallery: unitree_running.jpg', '/images/unitree_running.jpg', 'image', NOW());