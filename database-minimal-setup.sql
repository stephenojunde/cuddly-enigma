-- Minimal Database Setup - Matches Your Existing Structure
-- Run this in your Supabase SQL Editor

-- 1. Update profiles table with missing columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"email": true, "sms": false, "push": true}';

-- 2. Create missing core tables
CREATE TABLE IF NOT EXISTS tutors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subjects TEXT[] NOT NULL,
    levels TEXT[] NOT NULL,
    location TEXT NOT NULL,
    availability TEXT,
    hourly_rate DECIMAL(10,2),
    experience_years INTEGER,
    qualifications TEXT,
    bio TEXT,
    teaching_type TEXT[],
    avatar_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- 3. Create children table (this is what we need for the dashboard)
CREATE TABLE IF NOT EXISTS children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date_of_birth DATE,
    school_year TEXT,
    special_needs TEXT,
    subjects_of_interest TEXT[],
    current_level JSONB DEFAULT '{}',
    target_level JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS on children table
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- 5. Create basic policy for children
CREATE POLICY "Parents can manage their own children" ON children
    FOR ALL USING (parent_id = auth.uid());

-- 6. Test the setup
INSERT INTO children (parent_id, name, date_of_birth, school_year, subjects_of_interest) 
VALUES (
    (SELECT id FROM profiles LIMIT 1),
    'Test Child',
    '2010-01-01',
    'Year 8',
    ARRAY['Mathematics', 'English']
) ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Basic setup completed successfully!' as status;
