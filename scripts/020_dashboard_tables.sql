-- Dashboard-related tables and functions
-- Run this in your Supabase SQL editor

-- Create children table if not exists
CREATE TABLE IF NOT EXISTS children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  grade VARCHAR(50),
  subjects TEXT[],
  special_needs TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create progress_reports table
CREATE TABLE IF NOT EXISTS progress_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  session_date DATE NOT NULL,
  progress_score INTEGER CHECK (progress_score >= 1 AND progress_score <= 10),
  strengths TEXT,
  areas_for_improvement TEXT,
  homework_assigned TEXT,
  parent_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teacher_schedules table
CREATE TABLE IF NOT EXISTS teacher_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_applications table if not exists
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  cover_letter TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50), -- 'document', 'video', 'link', 'worksheet'
  subject VARCHAR(100),
  grade_level VARCHAR(50),
  file_url TEXT,
  external_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create school_teachers table
CREATE TABLE IF NOT EXISTS school_teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  role VARCHAR(100),
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  target_audience VARCHAR(50) DEFAULT 'all', -- 'all', 'teachers', 'parents', 'students'
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(255),
  event_type VARCHAR(50), -- 'meeting', 'workshop', 'exam', 'holiday'
  is_public BOOLEAN DEFAULT false,
  max_attendees INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dashboard_stats function for admin
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_tutors', (SELECT COUNT(*) FROM tutors WHERE is_active = true),
    'total_bookings', (SELECT COUNT(*) FROM bookings),
    'pending_applications', (SELECT COUNT(*) FROM tutor_applications WHERE status = 'pending'),
    'active_sessions', (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed' AND session_date > NOW()),
    'total_schools', (SELECT COUNT(*) FROM schools),
    'monthly_revenue', (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE created_at >= date_trunc('month', NOW())),
    'user_growth', (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Children policies
CREATE POLICY "Parents can manage their children" ON children
  FOR ALL USING (parent_id = auth.uid());

-- Progress reports policies
CREATE POLICY "Parents can view their children's progress" ON progress_reports
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

CREATE POLICY "Tutors can manage progress for their students" ON progress_reports
  FOR ALL USING (
    tutor_id IN (SELECT id FROM tutors WHERE profile_id = auth.uid())
  );

-- Teacher schedules policies
CREATE POLICY "Tutors can manage their schedules" ON teacher_schedules
  FOR ALL USING (
    tutor_id IN (SELECT id FROM tutors WHERE profile_id = auth.uid())
  );

-- Job applications policies
CREATE POLICY "Tutors can manage their applications" ON job_applications
  FOR ALL USING (
    tutor_id IN (SELECT id FROM tutors WHERE profile_id = auth.uid())
  );

-- Resources policies
CREATE POLICY "Users can view public resources" ON resources
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage their own resources" ON resources
  FOR ALL USING (created_by = auth.uid());

-- School teachers policies
CREATE POLICY "Schools can manage their teachers" ON school_teachers
  FOR ALL USING (
    school_id IN (SELECT id FROM schools WHERE profile_id = auth.uid())
  );

-- Announcements policies
CREATE POLICY "Schools can manage their announcements" ON announcements
  FOR ALL USING (
    school_id IN (SELECT id FROM schools WHERE profile_id = auth.uid())
  );

-- Events policies
CREATE POLICY "Schools can manage their events" ON events
  FOR ALL USING (
    school_id IN (SELECT id FROM schools WHERE profile_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_child_id ON progress_reports(child_id);
CREATE INDEX IF NOT EXISTS idx_teacher_schedules_tutor_id ON teacher_schedules(tutor_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_tutor_id ON job_applications(tutor_id);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject);
CREATE INDEX IF NOT EXISTS idx_announcements_school_id ON announcements(school_id);
CREATE INDEX IF NOT EXISTS idx_events_school_id ON events(school_id);
-- Additio
nal tables for tutor discovery and favorites
CREATE TABLE IF NOT EXISTS favorite_tutors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, tutor_id)
);

-- Enable RLS on favorite_tutors
ALTER TABLE favorite_tutors ENABLE ROW LEVEL SECURITY;

-- RLS Policy for favorite_tutors
CREATE POLICY "Parents can manage their favorite tutors" ON favorite_tutors
  FOR ALL USING (parent_id = auth.uid());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_favorite_tutors_parent_id ON favorite_tutors(parent_id);
CREATE INDEX IF NOT EXISTS idx_favorite_tutors_tutor_id ON favorite_tutors(tutor_id);

-- Add missing columns to tutors table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tutors' AND column_name = 'rating') THEN
    ALTER TABLE tutors ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tutors' AND column_name = 'total_reviews') THEN
    ALTER TABLE tutors ADD COLUMN total_reviews INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tutors' AND column_name = 'avatar_url') THEN
    ALTER TABLE tutors ADD COLUMN avatar_url TEXT;
  END IF;
END $$;