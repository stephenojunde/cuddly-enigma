-- Check all tables exist
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Count records in each table
SELECT 'schools' as table_name, COUNT(*) as record_count FROM public.schools
UNION ALL
SELECT 'tutors' as table_name, COUNT(*) as record_count FROM public.tutors
UNION ALL
SELECT 'jobs' as table_name, COUNT(*) as record_count FROM public.jobs
UNION ALL
SELECT 'testimonials' as table_name, COUNT(*) as record_count FROM public.testimonials
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM public.profiles
UNION ALL
SELECT 'contact_messages' as table_name, COUNT(*) as record_count FROM public.contact_messages
UNION ALL
SELECT 'tutor_applications' as table_name, COUNT(*) as record_count FROM public.tutor_applications;
