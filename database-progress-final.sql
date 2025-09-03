-- Minimal Progress Tables Setup
-- Run this after database-minimal-setup.sql completed successfully

-- Drop existing tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS progress_entries CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS teacher_students CASCADE;
DROP TABLE IF EXISTS student_progress CASCADE;
DROP TABLE IF EXISTS progress_reports CASCADE;

-- 1. Create progress_reports table (matching what the page.tsx expects)
CREATE TABLE progress_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    session_date DATE DEFAULT CURRENT_DATE,
    progress_notes TEXT,
    skills_improved TEXT[],
    areas_for_improvement TEXT[],
    homework_completion INTEGER DEFAULT 0, -- Percentage
    attendance_rate INTEGER DEFAULT 100, -- Percentage
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create bookings table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    session_date DATE NOT NULL,
    session_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create teacher_students table (for relationships)
CREATE TABLE teacher_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    student_id UUID REFERENCES children(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    hourly_rate DECIMAL(10,2),
    total_hours DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tutor_id, student_id, subject)
);

-- 4. Create sessions table (for detailed tracking)
CREATE TABLE sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_student_id UUID REFERENCES teacher_students(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    topic TEXT,
    session_notes TEXT,
    homework_assigned TEXT,
    student_feedback TEXT,
    tutor_feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create teacher_schedules table (for tutor availability)
CREATE TABLE teacher_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    max_students INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tutor_id, day_of_week, start_time)
);

-- 5. Enable RLS on all tables
ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_schedules ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for progress_reports
CREATE POLICY "Parents can view their children's progress reports" ON progress_reports
    FOR SELECT USING (
        child_id IN (
            SELECT id FROM children WHERE parent_id = auth.uid()
        )
    );

CREATE POLICY "Tutors can manage progress reports for their students" ON progress_reports
    FOR ALL USING (
        tutor_id IN (
            SELECT id FROM tutors WHERE profile_id = auth.uid()
        )
    );

-- 7. Create RLS policies for bookings
CREATE POLICY "Users can manage their own bookings" ON bookings
    FOR ALL USING (
        parent_id = auth.uid() OR 
        tutor_id IN (
            SELECT id FROM tutors WHERE profile_id = auth.uid()
        )
    );

-- 8. Create RLS policies for teacher_students
CREATE POLICY "Tutors can manage their student relationships" ON teacher_students
    FOR ALL USING (
        tutor_id IN (
            SELECT id FROM tutors WHERE profile_id = auth.uid()
        )
    );

CREATE POLICY "Parents can view their children's tutors" ON teacher_students
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM children WHERE parent_id = auth.uid()
        )
    );

-- 9. Create RLS policies for sessions
CREATE POLICY "Tutors can manage their sessions" ON sessions
    FOR ALL USING (
        teacher_student_id IN (
            SELECT id FROM teacher_students 
            WHERE tutor_id IN (
                SELECT id FROM tutors WHERE profile_id = auth.uid()
            )
        )
    );

CREATE POLICY "Parents can view their children's sessions" ON sessions
    FOR SELECT USING (
        teacher_student_id IN (
            SELECT ts.id FROM teacher_students ts
            JOIN children c ON ts.student_id = c.id
            WHERE c.parent_id = auth.uid()
        )
    );

-- 10. Create RLS policies for teacher_schedules
CREATE POLICY "Tutors can manage their own schedules" ON teacher_schedules
    FOR ALL USING (
        tutor_id IN (
            SELECT id FROM tutors WHERE profile_id = auth.uid()
        )
    );

-- 11. Success verification
SELECT 
    'progress_reports' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'progress_reports') 
         THEN 'Created' ELSE 'Failed' END as status
UNION ALL
SELECT 
    'bookings' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') 
         THEN 'Created' ELSE 'Failed' END as status
UNION ALL
SELECT 
    'teacher_students' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_students') 
         THEN 'Created' ELSE 'Failed' END as status
UNION ALL
SELECT 
    'sessions' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') 
         THEN 'Created' ELSE 'Failed' END as status
UNION ALL
SELECT 
    'teacher_schedules' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_schedules') 
         THEN 'Created' ELSE 'Failed' END as status;
