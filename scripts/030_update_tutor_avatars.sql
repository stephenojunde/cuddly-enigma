-- Update tutor avatars with local image paths
-- Run this in your Supabase SQL editor to add avatar images to existing tutors

-- First, let's see what tutors exist
-- SELECT id, name, avatar_url FROM tutors WHERE is_featured = true;

-- Update specific tutors with avatar URLs
-- Replace the tutor IDs with the actual IDs from your database

-- Example: Update tutors by name
UPDATE tutors 
SET avatar_url = '/images/SarahJohnson.jpg'
WHERE name ILIKE '%Sarah%Johnson%' OR name ILIKE '%Sarah%';

UPDATE tutors 
SET avatar_url = '/images/MichaelChen.jpg'
WHERE name ILIKE '%Michael%Chen%' OR name ILIKE '%Michael%';

UPDATE tutors 
SET avatar_url = '/images/EmmaWilliams.jpg'
WHERE name ILIKE '%Emma%Williams%' OR name ILIKE '%Emma%';

-- Or update by specific IDs if you know them:
-- UPDATE tutors SET avatar_url = '/images/SarahJohnson.jpg' WHERE id = 'your-tutor-id-here';
-- UPDATE tutors SET avatar_url = '/images/MichaelChen.jpg' WHERE id = 'your-tutor-id-here';
-- UPDATE tutors SET avatar_url = '/images/EmmaWilliams.jpg' WHERE id = 'your-tutor-id-here';

-- Verify the updates
SELECT id, name, avatar_url, is_featured FROM tutors WHERE avatar_url IS NOT NULL;
