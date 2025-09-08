-- Script to create the first admin user
-- You'll need to run this after creating a regular user account

-- First, sign up for a regular account through your website, then run this script
-- Replace 'your-email@example.com' with the email you used to sign up

-- Update the user to be an admin
UPDATE public.profiles 
SET 
  is_admin = true,
  user_type = 'admin'
WHERE email = 'your-email@example.com';

-- Verify the admin user was created
SELECT 
  id, 
  email, 
  full_name, 
  user_type, 
  is_admin,
  created_at
FROM public.profiles 
WHERE is_admin = true;

-- Optional: Create an admin invite for another admin user
-- INSERT INTO public.admin_invites (
--   email,
--   invite_code,
--   expires_at,
--   created_by
-- ) VALUES (
--   'another-admin@example.com',
--   'ADMIN_INVITE_' || substr(md5(random()::text), 1, 8),
--   NOW() + INTERVAL '7 days',
--   (SELECT id FROM public.profiles WHERE is_admin = true LIMIT 1)
-- );
