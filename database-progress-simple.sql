-- Simple Progress Setup - No Triggers Version
-- Run this after database-minimal-setup.sql completed successfully

-- 1. Create student_progress table
CREATE TABLE IF NOT EXISTS student_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES children(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    current_grade TEXT,
    target_grade TEXT,
    progress_percentage INTEGER DEFAULT 0,
    assessment_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    skills_improved TEXT[],
    areas_for_improvement TEXT[],
    session_notes TEXT,
    homework_completion INTEGER DEFAULT 0, -- Percentage
    attendance_rate INTEGER DEFAULT 100, -- Percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create teacher_students relationship table
CREATE TABLE IF NOT EXISTS teacher_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    student_id UUID REFERENCES children(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    hourly_rate DECIMAL(10,2),
    total_hours DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tutor_id, student_id, subject)
);

-- 3. Create sessions table for tracking individual lessons
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_student_id UUID REFERENCES teacher_students(id) ON DELETE CASCADE,
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

-- 4. Create progress_entries table for detailed tracking
CREATE TABLE IF NOT EXISTS progress_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_progress_id UUID REFERENCES student_progress(id) ON DELETE CASCADE,
    entry_date DATE DEFAULT CURRENT_DATE,
    entry_type TEXT CHECK (entry_type IN ('assessment', 'milestone', 'feedback', 'goal_update')),
    description TEXT NOT NULL,
    score DECIMAL(5,2), -- For assessments
    max_score DECIMAL(5,2), -- For assessments
    achievement_level TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS on new tables
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for student_progress
CREATE POLICY "Parents can view their children's progress" ON student_progress
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM children WHERE parent_id = auth.uid()
        )
    );

CREATE POLICY "Tutors can manage progress for their students" ON student_progress
    FOR ALL USING (
        tutor_id IN (
            SELECT id FROM tutors WHERE profile_id = auth.uid()
        )
    );

-- 7. Create RLS policies for teacher_students
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

-- 8. Create RLS policies for sessions
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

-- 9. Create RLS policies for progress_entries
CREATE POLICY "Users can view related progress entries" ON progress_entries
    FOR SELECT USING (
        student_progress_id IN (
            SELECT sp.id FROM student_progress sp
            JOIN children c ON sp.student_id = c.id
            WHERE c.parent_id = auth.uid()
            OR sp.tutor_id IN (
                SELECT id FROM tutors WHERE profile_id = auth.uid()
            )
        )
    );

CREATE POLICY "Tutors can create progress entries" ON progress_entries
    FOR INSERT WITH CHECK (
        student_progress_id IN (
            SELECT sp.id FROM student_progress sp
            WHERE sp.tutor_id IN (
                SELECT id FROM tutors WHERE profile_id = auth.uid()
            )
        )
        AND created_by = auth.uid()
    );

-- 10. Verify tables were created successfully
DO $$
BEGIN
    -- Check if all tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_progress') AND
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_students') AND
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') AND
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'progress_entries') THEN
        
        RAISE NOTICE 'All progress tracking tables created successfully!';
        
    ELSE
        RAISE NOTICE 'Some tables may not have been created properly. Please check the output above.';
    END IF;
END$$;

-- Success message
SELECT 'Progress tracking tables created successfully!' as status;
