-- =====================================================
-- DYNAMIC DATA FIXES - SUBJECTS AND FEATURED TUTORS
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Add is_featured column to tutors table if it doesn't exist
ALTER TABLE public.tutors 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- 2. Create subjects reference table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT CHECK (category IN ('STEM', 'Humanities', 'Languages', 'Arts', 'Vocational', 'Other')),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create teaching levels reference table
CREATE TABLE IF NOT EXISTS public.teaching_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Insert common subjects
INSERT INTO public.subjects (name, category, sort_order) VALUES
-- STEM Subjects
('Mathematics', 'STEM', 1),
('Physics', 'STEM', 2),
('Chemistry', 'STEM', 3),
('Biology', 'STEM', 4),
('Computer Science', 'STEM', 5),
('Engineering', 'STEM', 6),
('Statistics', 'STEM', 7),

-- Humanities
('English Literature', 'Humanities', 10),
('English Language', 'Humanities', 11),
('History', 'Humanities', 12),
('Geography', 'Humanities', 13),
('Philosophy', 'Humanities', 14),
('Psychology', 'Humanities', 15),
('Sociology', 'Humanities', 16),
('Economics', 'Humanities', 17),

-- Languages
('French', 'Languages', 20),
('Spanish', 'Languages', 21),
('German', 'Languages', 22),
('Italian', 'Languages', 23),
('Mandarin', 'Languages', 24),
('Japanese', 'Languages', 25),
('Arabic', 'Languages', 26),

-- Arts
('Art', 'Arts', 30),
('Music', 'Arts', 31),
('Drama', 'Arts', 32),
('Dance', 'Arts', 33),
('Media Studies', 'Arts', 34),

-- Vocational
('Business Studies', 'Vocational', 40),
('Accounting', 'Vocational', 41),
('Law', 'Vocational', 42),
('Health & Social Care', 'Vocational', 43)

ON CONFLICT (name) DO NOTHING;

-- 5. Insert teaching levels
INSERT INTO public.teaching_levels (name, description, sort_order) VALUES
('Primary', 'Primary school level (Ages 4-11)', 1),
('KS1', 'Key Stage 1 (Ages 5-7)', 2),
('KS2', 'Key Stage 2 (Ages 7-11)', 3),
('KS3', 'Key Stage 3 (Ages 11-14)', 4),
('GCSE', 'GCSE Level (Ages 14-16)', 5),
('A-Level', 'A-Level (Ages 16-18)', 6),
('University', 'University/Higher Education', 7),
('Adult', 'Adult Education', 8),
('Professional', 'Professional Development', 9)

ON CONFLICT (name) DO NOTHING;

-- 6. Mark some existing tutors as featured (if any exist)
-- This will make a few random tutors featured for testing and add placeholder avatars
UPDATE public.tutors 
SET is_featured = TRUE,
    avatar_url = CASE 
        WHEN id = (SELECT id FROM public.tutors WHERE is_active = TRUE ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        WHEN id = (SELECT id FROM public.tutors WHERE is_active = TRUE ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'https://images.unsplash.com/photo-1494790108755-2616b612b566?w=150&h=150&fit=crop&crop=face'  
        WHEN id = (SELECT id FROM public.tutors WHERE is_active = TRUE ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        ELSE 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'
    END
WHERE id IN (
    SELECT id 
    FROM public.tutors 
    WHERE is_active = TRUE 
    LIMIT 3
);

-- 7. Add placeholder avatars for all tutors without images
UPDATE public.tutors 
SET avatar_url = CASE 
    WHEN avatar_url IS NULL OR avatar_url = '' THEN
        CASE (RANDOM() * 10)::INTEGER
            WHEN 0 THEN 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
            WHEN 1 THEN 'https://images.unsplash.com/photo-1494790108755-2616b612b566?w=150&h=150&fit=crop&crop=face'
            WHEN 2 THEN 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            WHEN 3 THEN 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'
            WHEN 4 THEN 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face'
            WHEN 5 THEN 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=150&h=150&fit=crop&crop=face'
            WHEN 6 THEN 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
            WHEN 7 THEN 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face'
            WHEN 8 THEN 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face'
            ELSE 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop&crop=face'
        END
    ELSE avatar_url
END
WHERE avatar_url IS NULL OR avatar_url = '';

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tutors_is_featured ON public.tutors(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_subjects_category ON public.subjects(category);
CREATE INDEX IF NOT EXISTS idx_subjects_active ON public.subjects(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_teaching_levels_active ON public.teaching_levels(is_active) WHERE is_active = TRUE;

-- 8. Enable RLS on new tables
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_levels ENABLE ROW LEVEL SECURITY;

-- 9. Create policies for subjects and teaching levels (readable by everyone)
CREATE POLICY "Subjects are viewable by everyone" ON public.subjects FOR SELECT USING (is_active = true);
CREATE POLICY "Teaching levels are viewable by everyone" ON public.teaching_levels FOR SELECT USING (is_active = true);

-- 10. Grant access to authenticated users
GRANT SELECT ON public.subjects TO authenticated;
GRANT SELECT ON public.teaching_levels TO authenticated;

-- Show results
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as subjects_added FROM public.subjects;
SELECT COUNT(*) as levels_added FROM public.teaching_levels;
SELECT COUNT(*) as featured_tutors FROM public.tutors WHERE is_featured = TRUE;
