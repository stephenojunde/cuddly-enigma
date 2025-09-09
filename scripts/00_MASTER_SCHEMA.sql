-- =====================================================
-- CLEAN CONSOLIDATED DATABASE SCHEMA FOR TUTELAGE SERVICES
-- This script reflects the ACTUAL database structure as of September 2025
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. CORE USER MANAGEMENT
-- =====================================================

-- Profiles table (main user table)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    user_type TEXT DEFAULT 'parent' CHECK (user_type IN ('parent', 'teacher', 'school', 'admin')),
    phone TEXT,
    avatar_url TEXT,
    location TEXT,
    bio TEXT,
    date_of_birth DATE,
    address TEXT,
    emergency_contact TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    notification_settings JSONB DEFAULT '{"sms": false, "push": true, "email": true}'::jsonb,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin invites for controlled admin access
CREATE TABLE IF NOT EXISTS public.admin_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    invite_code TEXT NOT NULL UNIQUE,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. SCHOOLS AND EDUCATION ENTITIES
-- =====================================================

-- Schools table
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    postcode TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    school_type TEXT,
    description TEXT,
    logo_url TEXT,
    is_partner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs posted by schools
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location TEXT NOT NULL,
    salary_min NUMERIC,
    salary_max NUMERIC,
    contract_type TEXT,
    subject TEXT,
    level TEXT,
    start_date DATE,
    application_deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job applications
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    cover_letter TEXT NOT NULL,
    experience TEXT NOT NULL,
    qualifications TEXT NOT NULL,
    availability TEXT NOT NULL,
    cv_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- School announcements
CREATE TABLE IF NOT EXISTS public.school_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    announcement_type TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- School events
CREATE TABLE IF NOT EXISTS public.school_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id),
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- School resources
CREATE TABLE IF NOT EXISTS public.school_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id),
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT,
    resource_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TUTORING SYSTEM
-- =====================================================

-- Tutors table
CREATE TABLE IF NOT EXISTS public.tutors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subjects TEXT[] NOT NULL,
    levels TEXT[] NOT NULL,
    location TEXT NOT NULL,
    availability TEXT,
    hourly_rate NUMERIC,
    experience_years INTEGER,
    qualifications TEXT,
    bio TEXT,
    teaching_type TEXT[],
    avatar_url TEXT,
    rating NUMERIC DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    dbs_status TEXT DEFAULT 'pending' CHECK (dbs_status IN ('pending', 'verified', 'expired', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutor applications
CREATE TABLE IF NOT EXISTS public.tutor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subjects TEXT[] NOT NULL,
    qualifications TEXT NOT NULL,
    experience TEXT NOT NULL,
    cv_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutor availability scheduling
CREATE TABLE IF NOT EXISTS public.tutor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    max_sessions_per_slot INTEGER DEFAULT 1,
    slot_duration_minutes INTEGER DEFAULT 60,
    break_duration_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availability exceptions (holidays, unavailable dates)
CREATE TABLE IF NOT EXISTS public.availability_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    exception_type VARCHAR DEFAULT 'unavailable' CHECK (exception_type IN ('unavailable', 'available', 'limited')),
    start_time TIME,
    end_time TIME,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Children/Students table
CREATE TABLE IF NOT EXISTS public.children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.profiles(id),
    name TEXT NOT NULL,
    date_of_birth DATE,
    school_year TEXT,
    special_needs TEXT,
    subjects_of_interest TEXT[],
    current_level JSONB DEFAULT '{}'::jsonb,
    target_level JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teacher-Student relationships
CREATE TABLE IF NOT EXISTS public.teacher_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID REFERENCES public.tutors(id),
    student_id UUID REFERENCES public.children(id),
    subject TEXT NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'paused')),
    hourly_rate NUMERIC,
    total_hours NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. BOOKING AND SESSION MANAGEMENT
-- =====================================================

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES public.profiles(id),
    tutor_id UUID REFERENCES public.tutors(id),
    child_id UUID NOT NULL REFERENCES public.children(id),
    subject VARCHAR NOT NULL,
    session_type VARCHAR DEFAULT 'regular' CHECK (session_type IN ('regular', 'trial', 'assessment', 'makeup')),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    session_format VARCHAR DEFAULT 'online' CHECK (session_format IN ('online', 'in_person', 'hybrid')),
    location TEXT,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    cancellation_reason TEXT,
    rescheduled_from UUID REFERENCES public.bookings(id),
    session_notes TEXT,
    homework_assigned TEXT,
    materials_needed TEXT[],
    special_requirements TEXT,
    attendance_confirmed BOOLEAN DEFAULT FALSE,
    session_fee NUMERIC,
    booking_reference VARCHAR,
    parent_confirmed BOOLEAN DEFAULT FALSE,
    tutor_confirmed BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    confirmation_email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table (completed sessions)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    teacher_student_id UUID REFERENCES public.teacher_students(id),
    booking_id UUID REFERENCES public.bookings(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    topic TEXT,
    session_notes TEXT,
    homework_assigned TEXT,
    student_feedback TEXT,
    tutor_feedback TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Auth session fields (inherited from Supabase)
    factor_id UUID,
    aal USER-DEFINED,
    not_after TIMESTAMP WITH TIME ZONE,
    refreshed_at TIMESTAMP WITHOUT TIME ZONE,
    user_agent TEXT,
    ip INET,
    tag TEXT
);

-- Progress reports
CREATE TABLE IF NOT EXISTS public.progress_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES public.children(id),
    tutor_id UUID REFERENCES public.tutors(id),
    subject TEXT NOT NULL,
    session_date DATE DEFAULT CURRENT_DATE,
    progress_notes TEXT,
    skills_improved TEXT[],
    areas_for_improvement TEXT[],
    homework_completion INTEGER DEFAULT 0,
    attendance_rate INTEGER DEFAULT 100,
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. COMMUNICATION SYSTEM
-- =====================================================

-- Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participants UUID[] NOT NULL,
    conversation_type VARCHAR DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'group', 'booking_related')),
    title VARCHAR,
    booking_id UUID REFERENCES public.bookings(id),
    is_active BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id),
    sender_id UUID REFERENCES public.profiles(id),
    recipient_id UUID REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'general' CHECK (message_type IN ('text', 'image', 'file', 'system', 'general')),
    subject TEXT,
    topic TEXT NOT NULL,
    extension TEXT NOT NULL,
    payload JSONB,
    event TEXT,
    reply_to UUID REFERENCES public.messages(id),
    is_read BOOLEAN DEFAULT FALSE,
    private BOOLEAN DEFAULT FALSE,
    inserted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'booking', 'payment', 'system', 'reminder')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact messages from public website
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. REVIEWS AND FEEDBACK
-- =====================================================

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID REFERENCES public.tutors(id),
    reviewer_id UUID REFERENCES public.profiles(id),
    booking_id UUID REFERENCES public.bookings(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials for website
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    is_featured BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. DBS AND SECURITY
-- =====================================================

-- DBS checks for tutors
CREATE TABLE IF NOT EXISTS public.dbs_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID REFERENCES public.tutors(id),
    certificate_number TEXT NOT NULL,
    dbs_type TEXT NOT NULL CHECK (dbs_type IN ('basic', 'standard', 'enhanced')),
    issue_date DATE NOT NULL,
    expiry_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired', 'rejected')),
    document_url TEXT,
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DBS reminders
CREATE TABLE IF NOT EXISTS public.dbs_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dbs_check_id UUID REFERENCES public.dbs_checks(id),
    reminder_date DATE NOT NULL,
    reminder_type TEXT CHECK (reminder_type IN ('30_days', '7_days', 'expired')),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. ADMIN AND SYSTEM MANAGEMENT
-- =====================================================

-- Activity logs for audit trails
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error logs for system monitoring
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content reports for moderation
CREATE TABLE IF NOT EXISTS public.content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT NOT NULL CHECK (content_type IN ('review', 'message', 'profile', 'job')),
    content_id UUID NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'fake', 'other')),
    description TEXT,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. INDEXES FOR PERFORMANCE
-- =====================================================

-- User and profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Booking and session indexes
CREATE INDEX IF NOT EXISTS idx_bookings_parent_id ON public.bookings(parent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tutor_id ON public.bookings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_child_id ON public.bookings(child_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON public.bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Tutor indexes
CREATE INDEX IF NOT EXISTS idx_tutors_profile_id ON public.tutors(profile_id);
CREATE INDEX IF NOT EXISTS idx_tutors_is_active ON public.tutors(is_active);
CREATE INDEX IF NOT EXISTS idx_tutors_location ON public.tutors(location);
CREATE INDEX IF NOT EXISTS idx_tutors_subjects ON public.tutors USING GIN(subjects);

-- Message and conversation indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations USING GIN(participants);

-- DBS and security indexes
CREATE INDEX IF NOT EXISTS idx_dbs_checks_tutor_id ON public.dbs_checks(tutor_id);
CREATE INDEX IF NOT EXISTS idx_dbs_checks_status ON public.dbs_checks(status);
CREATE INDEX IF NOT EXISTS idx_dbs_checks_expiry_date ON public.dbs_checks(expiry_date);

-- =====================================================
-- 10. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all user tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dbs_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SCRIPT COMPLETE
-- =====================================================
-- This consolidated script represents your actual database structure
-- Run this on a fresh database to recreate your current setup
-- =====================================================
