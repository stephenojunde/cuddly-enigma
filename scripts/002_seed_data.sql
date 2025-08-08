-- Verify schools table exists before inserting data
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schools') THEN
        RAISE EXCEPTION 'Schools table does not exist. Please run 001_create_tables.sql first.';
    END IF;
END $$;

-- Insert sample schools
INSERT INTO public.schools (name, address, postcode, phone, email, school_type, description, is_partner) VALUES
('Greenfield Primary School', '123 Oak Street, London', 'SW1A 1AA', '020 7946 0958', 'admin@greenfield.sch.uk', 'primary', 'A vibrant primary school committed to excellence in education.', true),
('Riverside Secondary Academy', '456 River Road, Manchester', 'M1 1AA', '0161 234 5678', 'info@riverside.ac.uk', 'secondary', 'Outstanding secondary school with focus on STEM subjects.', true),
('Oakwood Special School', '789 Park Lane, Birmingham', 'B1 1AA', '0121 496 0000', 'contact@oakwood.sch.uk', 'special', 'Specialized education for children with additional needs.', true),
('Little Stars Nursery', '321 Garden Close, Bristol', 'BS1 1AA', '0117 926 0000', 'hello@littlestars.co.uk', 'nursery', 'Nurturing environment for early years development.', false);

-- Insert sample jobs (with proper school references)
INSERT INTO public.jobs (school_id, title, description, requirements, location, salary_min, salary_max, contract_type, subject, level, start_date, application_deadline, is_active) VALUES
((SELECT id FROM public.schools WHERE name = 'Greenfield Primary School' LIMIT 1), 'Primary Teacher - Year 3', 'We are seeking an enthusiastic and dedicated Year 3 teacher to join our team. The successful candidate will be responsible for delivering high-quality education to children aged 7-8 years.', 'QTS required, experience with Key Stage 1 preferred, strong classroom management skills', 'London', 25000, 35000, 'permanent', 'Primary', 'KS1', '2025-09-01', '2025-03-15', true),
((SELECT id FROM public.schools WHERE name = 'Riverside Secondary Academy' LIMIT 1), 'Secondary Science Teacher', 'Join our outstanding Science department as a qualified Science teacher. You will teach across KS3 and KS4, with opportunities for KS5 teaching.', 'QTS in Science subject, degree in relevant science field, experience with GCSE curriculum', 'Manchester', 28000, 45000, 'temporary', 'Science', 'KS3/KS4', '2025-04-01', '2025-02-28', true),
((SELECT id FROM public.schools WHERE name = 'Oakwood Special School' LIMIT 1), 'SEN Teaching Assistant', 'Support children with special educational needs in a caring and inclusive environment. Full training provided.', 'Experience working with children, patience and empathy, willingness to learn', 'Birmingham', 18000, 22000, 'permanent', 'SEN', 'All', '2025-03-01', '2025-02-15', true);

-- Insert sample tutors
INSERT INTO public.tutors (name, email, phone, subjects, levels, location, availability, hourly_rate, experience_years, qualifications, bio, teaching_type, rating, total_reviews, is_verified, is_active) VALUES
('Dr. Sarah Johnson', 'sarah.johnson@email.com', '07700 900123', ARRAY['Mathematics', 'Physics'], ARRAY['GCSE', 'A-Level'], 'London', 'Monday to Friday, 4 PM - 8 PM', 45.00, 8, 'PhD in Physics, PGCE, QTS', 'Experienced tutor specializing in Maths and Physics. I help students build confidence and achieve their academic goals through personalized teaching methods.', ARRAY['online', 'in-person'], 4.8, 24, true, true),
('James Mitchell', 'james.mitchell@email.com', '07700 900124', ARRAY['English Literature', 'English Language'], ARRAY['GCSE', 'A-Level'], 'Manchester', 'Weekdays after 3 PM, Weekends', 35.00, 5, 'BA English Literature, PGCE', 'Passionate English tutor with a focus on developing strong analytical and writing skills. I make literature come alive for my students.', ARRAY['online', 'in-person'], 4.9, 18, true, true),
('Emma Thompson', 'emma.thompson@email.com', '07700 900125', ARRAY['Chemistry', 'Biology'], ARRAY['GCSE', 'A-Level'], 'Birmingham', 'Flexible hours including weekends', 40.00, 6, 'MSc Chemistry, QTS', 'Enthusiastic science tutor who believes in making complex concepts simple and engaging. Excellent track record with exam preparation.', ARRAY['online', 'in-person'], 4.7, 31, true, true),
('Michael Brown', 'michael.brown@email.com', '07700 900126', ARRAY['History', 'Geography'], ARRAY['GCSE', 'A-Level'], 'Leeds', 'Evenings and weekends', 30.00, 4, 'BA History, PGCE', 'History and Geography specialist with a passion for making the past and present world fascinating for students.', ARRAY['online', 'in-person'], 4.6, 15, true, true),
('Lisa Wilson', 'lisa.wilson@email.com', '07700 900127', ARRAY['Primary Subjects'], ARRAY['KS1', 'KS2'], 'Bristol', 'After school hours and weekends', 25.00, 10, 'BA Primary Education, QTS', 'Experienced primary school teacher offering support across all subjects for Key Stage 1 and 2 students.', ARRAY['in-person'], 4.9, 42, true, true);

-- Insert sample testimonials
INSERT INTO public.testimonials (name, role, location, content, rating, is_featured, is_approved) VALUES
('Sarah Peterson', 'Parent', 'London', 'Tutelage Services helped my son significantly improve his Maths grades. The tutor was excellent and very supportive!', 5, true, true),
('Mr. John Smith', 'Headteacher', 'Manchester', 'We rely on Tutelage Services for our supply teaching needs. They always provide high-quality, vetted professionals.', 5, true, true),
('Emily Roberts', 'Teacher', 'Birmingham', 'Finding a teaching job through Tutelage Services was seamless. Their team was incredibly helpful and supportive.', 5, true, true),
('David Lewis', 'Parent', 'Bristol', 'The personalized approach to tutoring made a huge difference for my daughter. Highly recommend!', 5, false, true),
('Ms. Angela Brown', 'School Administrator', 'Leeds', 'Tutelage Services understands the unique staffing challenges schools face and consistently delivers.', 4, false, true),
('Mark Taylor', 'Tutor', 'London', 'I appreciate the clear communication and support I received throughout my job search with Tutelage Services.', 5, false, true);
