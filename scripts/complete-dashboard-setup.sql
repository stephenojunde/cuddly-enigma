-- Complete Database Setup for Dashboard Features
-- Run this script in your Supabase SQL Editor

-- ============================================================================
-- PROGRESS TRACKING TABLES
-- ============================================================================

-- Progress Reports Table
CREATE TABLE IF NOT EXISTS public.progress_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    session_date DATE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    skills_practiced TEXT[],
    strengths TEXT,
    areas_for_improvement TEXT,
    homework_assigned TEXT,
    parent_feedback TEXT,
    tutor_notes TEXT,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    engagement_level INTEGER CHECK (engagement_level >= 1 AND engagement_level <= 5),
    understanding_level INTEGER CHECK (understanding_level >= 1 AND understanding_level <= 5),
    completion_percentage INTEGER CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    next_session_goals TEXT,
    resources_used TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Bookings Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    session_type VARCHAR(50) DEFAULT 'regular' CHECK (session_type IN ('regular', 'trial', 'assessment', 'makeup')),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    session_format VARCHAR(20) DEFAULT 'online' CHECK (session_format IN ('online', 'in-person', 'hybrid')),
    location TEXT, -- For in-person sessions
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled')),
    cancellation_reason TEXT,
    rescheduled_from UUID REFERENCES public.bookings(id),
    session_notes TEXT,
    homework_assigned TEXT,
    materials_needed TEXT[],
    special_requirements TEXT,
    attendance_confirmed BOOLEAN DEFAULT FALSE,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'refunded')),
    session_fee DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Teacher-Student Relationships
CREATE TABLE IF NOT EXISTS public.teacher_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'terminated')),
    hourly_rate DECIMAL(10,2),
    total_hours_completed INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(tutor_id, child_id, subject)
);

-- Sessions Table (For completed sessions tracking)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    actual_duration_minutes INTEGER,
    attendance_status VARCHAR(20) DEFAULT 'present' CHECK (attendance_status IN ('present', 'absent', 'late', 'early_departure')),
    session_quality_rating INTEGER CHECK (session_quality_rating >= 1 AND session_quality_rating <= 5),
    technical_issues TEXT,
    session_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- SCHEDULE MANAGEMENT TABLES
-- ============================================================================

-- Teacher Schedules (Availability)
CREATE TABLE IF NOT EXISTS public.teacher_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    max_students_per_slot INTEGER DEFAULT 1,
    break_duration_minutes INTEGER DEFAULT 15,
    location_preference VARCHAR(20) DEFAULT 'online' CHECK (location_preference IN ('online', 'in-person', 'both')),
    notes TEXT,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Schedule Exceptions (Holidays, sick days, etc.)
CREATE TABLE IF NOT EXISTS public.schedule_exceptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    exception_type VARCHAR(30) NOT NULL CHECK (exception_type IN ('holiday', 'sick_leave', 'personal_leave', 'training', 'conference', 'other')),
    is_available BOOLEAN DEFAULT FALSE,
    start_time TIME,
    end_time TIME,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Progress Reports Indexes
CREATE INDEX IF NOT EXISTS idx_progress_reports_child_id ON public.progress_reports(child_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_tutor_id ON public.progress_reports(tutor_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_session_date ON public.progress_reports(session_date);
CREATE INDEX IF NOT EXISTS idx_progress_reports_subject ON public.progress_reports(subject);

-- Bookings Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_parent_id ON public.bookings(parent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tutor_id ON public.bookings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_child_id ON public.bookings(child_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON public.bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Teacher Students Indexes
CREATE INDEX IF NOT EXISTS idx_teacher_students_tutor_id ON public.teacher_students(tutor_id);
CREATE INDEX IF NOT EXISTS idx_teacher_students_child_id ON public.teacher_students(child_id);
CREATE INDEX IF NOT EXISTS idx_teacher_students_status ON public.teacher_students(status);

-- Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_booking_id ON public.sessions(booking_id);

-- Teacher Schedules Indexes
CREATE INDEX IF NOT EXISTS idx_teacher_schedules_tutor_id ON public.teacher_schedules(tutor_id);
CREATE INDEX IF NOT EXISTS idx_teacher_schedules_day_of_week ON public.teacher_schedules(day_of_week);

-- Schedule Exceptions Indexes
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_tutor_id ON public.schedule_exceptions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_date ON public.schedule_exceptions(exception_date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_exceptions ENABLE ROW LEVEL SECURITY;

-- Progress Reports Policies
CREATE POLICY "Users can view progress reports for their children or students" ON public.progress_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.children c 
            WHERE c.id = progress_reports.child_id 
            AND c.parent_id = auth.uid()
        )
        OR progress_reports.tutor_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.user_type = 'admin'
        )
    );

CREATE POLICY "Tutors can create progress reports for their students" ON public.progress_reports
    FOR INSERT WITH CHECK (
        progress_reports.tutor_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.teacher_students ts 
            WHERE ts.tutor_id = auth.uid() 
            AND ts.child_id = progress_reports.child_id 
            AND ts.status = 'active'
        )
    );

CREATE POLICY "Tutors can update their own progress reports" ON public.progress_reports
    FOR UPDATE USING (progress_reports.tutor_id = auth.uid());

-- Bookings Policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (
        bookings.parent_id = auth.uid()
        OR bookings.tutor_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.user_type = 'admin'
        )
    );

CREATE POLICY "Parents can create bookings for their children" ON public.bookings
    FOR INSERT WITH CHECK (
        bookings.parent_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.children c 
            WHERE c.id = bookings.child_id 
            AND c.parent_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own bookings" ON public.bookings
    FOR UPDATE USING (
        bookings.parent_id = auth.uid()
        OR bookings.tutor_id = auth.uid()
    );

-- Teacher Students Policies
CREATE POLICY "Users can view their teacher-student relationships" ON public.teacher_students
    FOR SELECT USING (
        teacher_students.tutor_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.children c 
            WHERE c.id = teacher_students.child_id 
            AND c.parent_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.user_type = 'admin'
        )
    );

CREATE POLICY "Admins can manage teacher-student relationships" ON public.teacher_students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.user_type = 'admin'
        )
    );

-- Sessions Policies
CREATE POLICY "Users can view sessions for their bookings" ON public.sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings b 
            WHERE b.id = sessions.booking_id 
            AND (b.parent_id = auth.uid() OR b.tutor_id = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.user_type = 'admin'
        )
    );

CREATE POLICY "Tutors can create sessions for their bookings" ON public.sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bookings b 
            WHERE b.id = sessions.booking_id 
            AND b.tutor_id = auth.uid()
        )
    );

-- Teacher Schedules Policies
CREATE POLICY "Tutors can manage their own schedules" ON public.teacher_schedules
    FOR ALL USING (teacher_schedules.tutor_id = auth.uid());

CREATE POLICY "Anyone can view tutor schedules" ON public.teacher_schedules
    FOR SELECT USING (true);

-- Schedule Exceptions Policies
CREATE POLICY "Tutors can manage their own schedule exceptions" ON public.schedule_exceptions
    FOR ALL USING (schedule_exceptions.tutor_id = auth.uid());

CREATE POLICY "Anyone can view schedule exceptions" ON public.schedule_exceptions
    FOR SELECT USING (true);

-- ============================================================================
-- HELPFUL FUNCTIONS
-- ============================================================================

-- Function to get student progress summary
CREATE OR REPLACE FUNCTION get_student_progress_summary(student_id UUID)
RETURNS TABLE (
    total_sessions BIGINT,
    average_rating NUMERIC,
    average_engagement NUMERIC,
    average_understanding NUMERIC,
    average_completion NUMERIC,
    subjects_studied TEXT[],
    recent_session_date DATE,
    total_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_sessions,
        ROUND(AVG(pr.overall_rating), 2) as average_rating,
        ROUND(AVG(pr.engagement_level), 2) as average_engagement,
        ROUND(AVG(pr.understanding_level), 2) as average_understanding,
        ROUND(AVG(pr.completion_percentage), 2) as average_completion,
        ARRAY_AGG(DISTINCT pr.subject) as subjects_studied,
        MAX(pr.session_date) as recent_session_date,
        ROUND(SUM(pr.duration_minutes) / 60.0, 2) as total_hours
    FROM public.progress_reports pr
    WHERE pr.child_id = student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tutor availability for a specific date
CREATE OR REPLACE FUNCTION get_tutor_availability(tutor_uuid UUID, check_date DATE)
RETURNS TABLE (
    time_slot TIME,
    is_available BOOLEAN,
    booking_id UUID
) AS $$
DECLARE
    day_of_week_num INTEGER;
BEGIN
    -- Get day of week (0 = Sunday, 6 = Saturday)
    day_of_week_num := EXTRACT(DOW FROM check_date);
    
    RETURN QUERY
    WITH schedule_slots AS (
        SELECT 
            ts.start_time,
            ts.end_time,
            ts.is_available as schedule_available
        FROM public.teacher_schedules ts
        WHERE ts.tutor_id = tutor_uuid
        AND ts.day_of_week = day_of_week_num
        AND (ts.effective_from IS NULL OR ts.effective_from <= check_date)
        AND (ts.effective_until IS NULL OR ts.effective_until >= check_date)
    ),
    exceptions AS (
        SELECT 
            se.start_time,
            se.end_time,
            se.is_available as exception_available
        FROM public.schedule_exceptions se
        WHERE se.tutor_id = tutor_uuid
        AND se.exception_date = check_date
    ),
    bookings_on_date AS (
        SELECT 
            b.scheduled_time,
            b.duration_minutes,
            b.id as booking_id
        FROM public.bookings b
        WHERE b.tutor_id = tutor_uuid
        AND b.scheduled_date = check_date
        AND b.status NOT IN ('cancelled', 'rescheduled')
    )
    SELECT 
        generate_series(
            '08:00'::TIME,
            '20:00'::TIME,
            INTERVAL '30 minutes'
        )::TIME as time_slot,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM exceptions e 
                WHERE generate_series.generate_series >= e.start_time 
                AND generate_series.generate_series < e.end_time
            ) THEN (
                SELECT e.exception_available 
                FROM exceptions e 
                WHERE generate_series.generate_series >= e.start_time 
                AND generate_series.generate_series < e.end_time
                LIMIT 1
            )
            WHEN EXISTS (
                SELECT 1 FROM schedule_slots ss 
                WHERE generate_series.generate_series >= ss.start_time 
                AND generate_series.generate_series < ss.end_time
            ) THEN (
                SELECT ss.schedule_available 
                FROM schedule_slots ss 
                WHERE generate_series.generate_series >= ss.start_time 
                AND generate_series.generate_series < ss.end_time
                LIMIT 1
            )
            ELSE FALSE
        END AND NOT EXISTS (
            SELECT 1 FROM bookings_on_date bod 
            WHERE generate_series.generate_series >= bod.scheduled_time 
            AND generate_series.generate_series < (bod.scheduled_time + (bod.duration_minutes || ' minutes')::INTERVAL)
        ) as is_available,
        (
            SELECT bod.booking_id 
            FROM bookings_on_date bod 
            WHERE generate_series.generate_series >= bod.scheduled_time 
            AND generate_series.generate_series < (bod.scheduled_time + (bod.duration_minutes || ' minutes')::INTERVAL)
            LIMIT 1
        ) as booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to all tables
CREATE TRIGGER update_progress_reports_updated_at BEFORE UPDATE ON public.progress_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_students_updated_at BEFORE UPDATE ON public.teacher_students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_schedules_updated_at BEFORE UPDATE ON public.teacher_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_exceptions_updated_at BEFORE UPDATE ON public.schedule_exceptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (OPTIONAL)
-- ============================================================================

-- Insert sample teacher schedules (uncomment if you want sample data)
/*
INSERT INTO public.teacher_schedules (tutor_id, day_of_week, start_time, end_time, is_available) 
SELECT 
    p.id,
    generate_series(1, 5) as day_of_week, -- Monday to Friday
    '09:00'::TIME as start_time,
    '17:00'::TIME as end_time,
    TRUE as is_available
FROM public.profiles p 
WHERE p.user_type = 'tutor'
ON CONFLICT DO NOTHING;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables were created
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'progress_reports', 
    'bookings', 
    'teacher_students', 
    'sessions', 
    'teacher_schedules', 
    'schedule_exceptions'
)
ORDER BY tablename;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'progress_reports', 
    'bookings', 
    'teacher_students', 
    'sessions', 
    'teacher_schedules', 
    'schedule_exceptions'
)
ORDER BY tablename;

-- Show all policies created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
    'progress_reports', 
    'bookings', 
    'teacher_students', 
    'sessions', 
    'teacher_schedules', 
    'schedule_exceptions'
)
ORDER BY tablename, policyname;
