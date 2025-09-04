-- DBS (Disclosure and Barring Service) Tables for UK Tutoring Platform
-- Execute this script in your Supabase dashboard SQL editor

-- 1. Create DBS checks table
CREATE TABLE IF NOT EXISTS dbs_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL,
    dbs_type TEXT NOT NULL CHECK (dbs_type IN ('basic', 'standard', 'enhanced', 'enhanced_barred')),
    issue_date DATE NOT NULL,
    expiry_date DATE, -- DBS checks don't technically expire but we track renewal recommendations (3 years)
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired', 'rejected')),
    document_url TEXT, -- URL to uploaded certificate
    verified_by UUID REFERENCES profiles(id), -- Admin who verified
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create DBS renewal reminders table
CREATE TABLE IF NOT EXISTS dbs_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dbs_check_id UUID REFERENCES dbs_checks(id) ON DELETE CASCADE,
    reminder_date DATE NOT NULL,
    reminder_type TEXT CHECK (reminder_type IN ('90_days', '30_days', 'expired')),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE dbs_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dbs_reminders ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for dbs_checks
CREATE POLICY "Tutors can view their own DBS checks" ON dbs_checks
    FOR SELECT USING (
        tutor_id IN (
            SELECT id FROM tutors WHERE profile_id = auth.uid()
        )
    );

CREATE POLICY "Tutors can insert their own DBS checks" ON dbs_checks
    FOR INSERT WITH CHECK (
        tutor_id IN (
            SELECT id FROM tutors WHERE profile_id = auth.uid()
        )
    );

CREATE POLICY "Tutors can update their own pending DBS checks" ON dbs_checks
    FOR UPDATE USING (
        tutor_id IN (
            SELECT id FROM tutors WHERE profile_id = auth.uid()
        )
        AND status = 'pending'
    );

CREATE POLICY "Admins can manage all DBS checks" ON dbs_checks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

CREATE POLICY "Parents can view verified DBS status" ON dbs_checks
    FOR SELECT USING (
        status = 'verified' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND user_type = 'parent'
        )
    );

-- 5. Create function to automatically set expiry date (3 years from issue)
CREATE OR REPLACE FUNCTION set_dbs_expiry()
RETURNS TRIGGER AS $$
BEGIN
    -- Set expiry date to 3 years from issue date
    NEW.expiry_date := NEW.issue_date + INTERVAL '3 years';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for expiry date
CREATE TRIGGER set_dbs_expiry_trigger
    BEFORE INSERT OR UPDATE ON dbs_checks
    FOR EACH ROW
    EXECUTE FUNCTION set_dbs_expiry();

-- 7. Add DBS status to tutors table
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS dbs_status TEXT DEFAULT 'pending' CHECK (dbs_status IN ('pending', 'verified', 'expired', 'rejected'));

-- 8. Create function to update tutor DBS status
CREATE OR REPLACE FUNCTION update_tutor_dbs_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update tutor's DBS status when DBS check status changes
    UPDATE tutors 
    SET dbs_status = NEW.status 
    WHERE id = NEW.tutor_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger to sync tutor DBS status
CREATE TRIGGER update_tutor_dbs_status_trigger
    AFTER INSERT OR UPDATE ON dbs_checks
    FOR EACH ROW
    EXECUTE FUNCTION update_tutor_dbs_status();

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dbs_checks_tutor_id ON dbs_checks(tutor_id);
CREATE INDEX IF NOT EXISTS idx_dbs_checks_status ON dbs_checks(status);
CREATE INDEX IF NOT EXISTS idx_dbs_checks_expiry_date ON dbs_checks(expiry_date);
CREATE INDEX IF NOT EXISTS idx_dbs_reminders_check_id ON dbs_reminders(dbs_check_id);

-- 11. Create storage bucket for DBS certificates
-- Note: You'll need to create this manually in the Supabase dashboard
-- Go to Storage -> Create new bucket -> name: "dbs-certificates" -> private

-- 12. Storage policies (create these after creating the bucket)
-- CREATE POLICY "Tutors can upload their DBS certificates" ON storage.objects
--     FOR INSERT WITH CHECK (
--         bucket_id = 'dbs-certificates' 
--         AND auth.uid()::text = (storage.foldername(name))[1]
--     );

-- CREATE POLICY "Tutors can view their own DBS certificates" ON storage.objects
--     FOR SELECT USING (
--         bucket_id = 'dbs-certificates' 
--         AND auth.uid()::text = (storage.foldername(name))[1]
--     );

-- CREATE POLICY "Admins can view all DBS certificates" ON storage.objects
--     FOR SELECT USING (
--         bucket_id = 'dbs-certificates' 
--         AND EXISTS (
--             SELECT 1 FROM profiles 
--             WHERE id = auth.uid() 
--             AND user_type = 'admin'
--         )
--     );

SELECT 'DBS tables and functions created successfully!' as status;
