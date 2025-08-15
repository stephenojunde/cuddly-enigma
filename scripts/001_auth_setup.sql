-- =============================================
-- AUTHENTICATION & PROFILES SETUP
-- =============================================
-- This script sets up the core authentication and user profile system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
-- This table stores user profile information
-- It's automatically populated when a user signs up

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    user_type TEXT CHECK (user_type IN ('parent', 'teacher', 'school', 'admin')) DEFAULT 'parent',
    phone TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        user_type,
        phone
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'parent'),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profile changes
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- INDEXES
-- =============================================

-- Index on email for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- Index on user_type for filtering
CREATE INDEX IF NOT EXISTS profiles_user_type_idx ON public.profiles(user_type);

-- =============================================
-- SAMPLE DATA (OPTIONAL)
-- =============================================

-- Create a sample admin user (you can remove this if not needed)
-- Note: This will only work if you manually create the auth user first
-- INSERT INTO public.profiles (
--     id,
--     email,
--     first_name,
--     last_name,
--     user_type,
--     is_admin,
--     is_verified
-- ) VALUES (
--     'your-admin-user-id-here',
--     'admin@tutelageservices.co.uk',
--     'Admin',
--     'User',
--     'admin',
--     TRUE,
--     TRUE
-- ) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- VERIFICATION
-- =============================================

-- Verify the setup
DO $$
BEGIN
    -- Check if profiles table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'SUCCESS: profiles table created successfully';
    ELSE
        RAISE EXCEPTION 'ERROR: profiles table was not created';
    END IF;
    
    -- Check if RLS is enabled
    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE tablename = 'profiles' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE 'SUCCESS: Row Level Security is enabled on profiles table';
    ELSE
        RAISE WARNING 'WARNING: Row Level Security might not be enabled on profiles table';
    END IF;
    
    -- Check if trigger exists
    IF EXISTS (
        SELECT FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created'
    ) THEN
        RAISE NOTICE 'SUCCESS: User creation trigger is set up';
    ELSE
        RAISE WARNING 'WARNING: User creation trigger might not be set up';
    END IF;
END $$;