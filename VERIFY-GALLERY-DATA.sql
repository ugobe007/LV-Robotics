-- Check current gallery posts
SELECT id, text, media_url, media_type, created_at FROM posts WHERE media_type = 'image' ORDER BY created_at DESC;

-- If the above shows empty or broken URLs, run this to populate with working test images:
-- IMPORTANT: Only run if the query above shows no images or broken URLs

DELETE FROM posts WHERE media_type = 'image';

INSERT INTO posts (text, media_url, media_type, user_id, created_at) VALUES
    ('Amazing robotics workshop in action', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=675&fit=crop', 'image', NULL, now() - interval '5 days'),
    ('Collaborative team building moment', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=675&fit=crop', 'image', NULL, now() - interval '4 days'),
    ('Innovation and creativity combined', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=675&fit=crop', 'image', NULL, now() - interval '3 days'),
    ('Community engagement at its finest', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=675&fit=crop', 'image', NULL, now() - interval '2 days'),
    ('Robotics competition highlight', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=675&fit=crop', 'image', NULL, now() - interval '1 day');

-- Verify the new images were inserted
SELECT COUNT(*) as total_images FROM posts WHERE media_type = 'image';
SELECT id, text, media_url, media_type FROM posts WHERE media_type = 'image' ORDER BY created_at DESC;