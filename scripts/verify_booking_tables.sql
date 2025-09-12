-- Quick verification script to check if booking-related tables exist
-- Run this in your Supabase SQL editor to verify table structure

-- Check if tables exist
SELECT 
    schemaname,
    tablename
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('bookings', 'children', 'tutors', 'profiles')
ORDER BY tablename;

-- Check bookings table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'bookings'
ORDER BY ordinal_position;

-- Check if there are any bookings (sample query)
SELECT COUNT(*) as booking_count FROM public.bookings;

-- Check if there are any children records
SELECT COUNT(*) as children_count FROM public.children;

-- Check if there are any tutors records
SELECT COUNT(*) as tutors_count FROM public.tutors;

-- Check foreign key constraints
SELECT
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'bookings'
    AND tc.table_schema = 'public';
