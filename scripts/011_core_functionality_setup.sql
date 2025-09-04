-- Core Functionality Setup - Missing Tables and Features
-- Execute this script in your Supabase SQL Editor
-- This script adds the essential missing functionality identified in the audit

-- ============================================================================
-- 1. CHILDREN TABLE (Required for parent-child relationships)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    school_year VARCHAR(50),
    special_needs TEXT,
    subjects_of_interest TEXT[],
    learning_style VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. ENHANCED BOOKINGS TABLE (Complete booking workflow)
-- ============================================================================
-- Drop existing bookings table if it exists (we'll recreate with full functionality)
DROP TABLE IF EXISTS public.bookings CASCADE;

CREATE TABLE public.bookings (
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
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled')),
    cancellation_reason TEXT,
    rescheduled_from UUID REFERENCES public.bookings(id),
    session_notes TEXT,
    homework_assigned TEXT,
    materials_needed TEXT[],
    special_requirements TEXT,
    attendance_confirmed BOOLEAN DEFAULT FALSE,
    session_fee DECIMAL(10,2),
    booking_reference VARCHAR(20) UNIQUE, -- Auto-generated booking reference
    
    -- Confirmation and communication
    parent_confirmed BOOLEAN DEFAULT FALSE,
    tutor_confirmed BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    confirmation_email_sent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. REAL-TIME MESSAGING SYSTEM
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participants UUID[] NOT NULL, -- Array of user IDs
    conversation_type VARCHAR(20) DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'group', 'booking_related')),
    title VARCHAR(255), -- For group conversations
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL, -- For booking-related conversations
    is_active BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    content TEXT NOT NULL,
    attachment_url TEXT,
    reply_to UUID REFERENCES public.messages(id), -- For threaded replies
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. COMPREHENSIVE REVIEW & RATING SYSTEM
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Parent who is reviewing
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    
    -- Rating categories (1-5 scale)
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    teaching_quality INTEGER CHECK (teaching_quality >= 1 AND teaching_quality <= 5),
    communication INTEGER CHECK (communication >= 1 AND communication <= 5),
    punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
    preparation INTEGER CHECK (preparation >= 1 AND preparation <= 5),
    
    -- Written feedback
    review_title VARCHAR(255),
    review_content TEXT,
    what_went_well TEXT,
    areas_for_improvement TEXT,
    would_recommend BOOLEAN,
    
    -- Review management
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    moderated_by UUID REFERENCES public.profiles(id),
    moderation_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. NOTIFICATION SYSTEM
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
        'booking_request', 'booking_confirmed', 'booking_cancelled', 'booking_reminder',
        'message_received', 'review_received', 'review_published',
        'system_announcement', 'profile_update', 'dbs_expiry'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT, -- Link to relevant page
    related_entity_id UUID, -- ID of related booking, message, etc.
    related_entity_type VARCHAR(50), -- 'booking', 'message', 'review', etc.
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. TUTOR AVAILABILITY SCHEDULE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tutor_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    max_sessions_per_slot INTEGER DEFAULT 1,
    slot_duration_minutes INTEGER DEFAULT 60,
    break_duration_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- For one-off availability exceptions (holidays, sick days, etc.)
CREATE TABLE IF NOT EXISTS public.availability_exceptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    exception_type VARCHAR(20) DEFAULT 'unavailable' CHECK (exception_type IN ('unavailable', 'limited', 'extended')),
    start_time TIME,
    end_time TIME,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. SESSION TRACKING (For completed lessons)
-- ============================================================================
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
    homework_assigned TEXT,
    next_session_goals TEXT,
    materials_used TEXT[],
    student_engagement_level INTEGER CHECK (student_engagement_level >= 1 AND student_engagement_level <= 5),
    learning_objectives_met BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Children Policies
CREATE POLICY "Parents can manage their own children" ON public.children
    FOR ALL USING (parent_id = auth.uid());

CREATE POLICY "Tutors can view children they teach" ON public.children
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings b 
            WHERE b.child_id = children.id 
            AND b.tutor_id = auth.uid()
        )
    );

-- Bookings Policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (
        parent_id = auth.uid() OR tutor_id = auth.uid()
    );

CREATE POLICY "Parents can create bookings for their children" ON public.bookings
    FOR INSERT WITH CHECK (
        parent_id = auth.uid() AND 
        EXISTS (
            SELECT 1 FROM public.children c 
            WHERE c.id = bookings.child_id 
            AND c.parent_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own bookings" ON public.bookings
    FOR UPDATE USING (parent_id = auth.uid() OR tutor_id = auth.uid());

-- Conversations Policies
CREATE POLICY "Users can view conversations they're part of" ON public.conversations
    FOR SELECT USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create conversations they're part of" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

-- Messages Policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = messages.conversation_id 
            AND auth.uid() = ANY(c.participants)
        )
    );

CREATE POLICY "Users can send messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = messages.conversation_id 
            AND auth.uid() = ANY(c.participants)
        )
    );

-- Reviews Policies
CREATE POLICY "Anyone can view approved reviews" ON public.reviews
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Parents can create reviews for their bookings" ON public.reviews
    FOR INSERT WITH CHECK (
        reviewer_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.bookings b 
            WHERE b.id = reviews.booking_id 
            AND b.parent_id = auth.uid()
            AND b.status = 'completed'
        )
    );

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Tutor Availability Policies
CREATE POLICY "Tutors can manage their own availability" ON public.tutor_availability
    FOR ALL USING (tutor_id = auth.uid());

CREATE POLICY "Anyone can view tutor availability" ON public.tutor_availability
    FOR SELECT USING (true);

-- Availability Exceptions Policies
CREATE POLICY "Tutors can manage their own availability exceptions" ON public.availability_exceptions
    FOR ALL USING (tutor_id = auth.uid());

-- Sessions Policies
CREATE POLICY "Users can view sessions for their bookings" ON public.sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings b 
            WHERE b.id = sessions.booking_id 
            AND (b.parent_id = auth.uid() OR b.tutor_id = auth.uid())
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

-- ============================================================================
-- 10. INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON public.children(parent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_parent_id ON public.bookings(parent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tutor_id ON public.bookings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_child_id ON public.bookings(child_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON public.bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_tutor_id ON public.reviews(tutor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON public.reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON public.reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_tutor_availability_tutor_id ON public.tutor_availability(tutor_id);
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_tutor_id ON public.availability_exceptions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_booking_id ON public.sessions(booking_id);

-- ============================================================================
-- 11. UTILITY FUNCTIONS
-- ============================================================================

-- Function to generate unique booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
    reference TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        reference := 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD((EXTRACT(EPOCH FROM NOW())::INTEGER % 10000)::TEXT, 4, '0');
        
        -- Check if reference exists
        IF NOT EXISTS (SELECT 1 FROM public.bookings WHERE booking_reference = reference) THEN
            RETURN reference;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            -- Fallback to UUID-based reference
            reference := 'BK' || REPLACE(gen_random_uuid()::TEXT, '-', '')::TEXT;
            EXIT;
        END IF;
    END LOOP;
    
    RETURN reference;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate booking reference
CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_reference IS NULL THEN
        NEW.booking_reference := generate_booking_reference();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_booking_reference
    BEFORE INSERT ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION set_booking_reference();

-- Function to update review aggregates on tutors table
CREATE OR REPLACE FUNCTION update_tutor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.tutors 
    SET 
        rating = (
            SELECT ROUND(AVG(overall_rating), 2) 
            FROM public.reviews 
            WHERE tutor_id = NEW.tutor_id 
            AND is_approved = true
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM public.reviews 
            WHERE tutor_id = NEW.tutor_id 
            AND is_approved = true
        )
    WHERE profile_id = NEW.tutor_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tutor_rating
    AFTER INSERT OR UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_tutor_rating();

-- ============================================================================
-- 12. SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample availability for existing tutors (if any exist)
-- This is safe to run even if no tutors exist yet
INSERT INTO public.tutor_availability (tutor_id, day_of_week, start_time, end_time)
SELECT 
    p.id,
    generate_series(1, 5) as day_of_week, -- Monday to Friday
    '09:00'::TIME,
    '17:00'::TIME
FROM public.profiles p 
WHERE p.user_type = 'teacher'
ON CONFLICT DO NOTHING;

-- Create a system notification function for admin messages
CREATE OR REPLACE FUNCTION create_system_notification(
    target_user_id UUID,
    notification_title TEXT,
    notification_message TEXT,
    notification_type TEXT DEFAULT 'system_announcement',
    action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id, notification_type, title, message, action_url
    ) VALUES (
        target_user_id, notification_type, notification_title, notification_message, action_url
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger for tables that need it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_children_updated_at
    BEFORE UPDATE ON public.children
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_tutor_availability_updated_at
    BEFORE UPDATE ON public.tutor_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- This script has created all the core missing functionality:
-- ✅ Children management for parents
-- ✅ Complete booking workflow with confirmations
-- ✅ Real-time messaging system with conversations
-- ✅ Comprehensive review and rating system
-- ✅ Notification system for all user interactions
-- ✅ Tutor availability and scheduling
-- ✅ Session tracking for completed lessons
-- ✅ All necessary RLS policies for security
-- ✅ Performance indexes
-- ✅ Utility functions and triggers
-- 
-- Next steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Implement UI components for booking system
-- 3. Build messaging interface
-- 4. Create review submission forms
-- 5. Add notification management
