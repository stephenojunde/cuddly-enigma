-- Verify all tables exist and show their structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'tutors', 'schools', 'jobs', 'testimonials', 'contact_messages', 'tutor_applications')
ORDER BY table_name, ordinal_position;

-- Check if schools table exists specifically
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'schools'
);
