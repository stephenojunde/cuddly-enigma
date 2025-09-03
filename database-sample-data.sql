-- Sample Data for Progress Tracking
-- Run this AFTER database-progress-simple.sql completes successfully

-- Insert sample data (only if data doesn't already exist)
DO $$
DECLARE
    sample_child_id UUID;
    sample_tutor_id UUID;
    sample_ts_id UUID;
    sample_progress_id UUID;
BEGIN
    -- Get a sample child and tutor if they exist
    SELECT id INTO sample_child_id FROM children LIMIT 1;
    SELECT id INTO sample_tutor_id FROM tutors LIMIT 1;
    
    IF sample_child_id IS NOT NULL AND sample_tutor_id IS NOT NULL THEN
        RAISE NOTICE 'Found sample child: % and tutor: %', sample_child_id, sample_tutor_id;
        
        -- Create teacher-student relationship
        INSERT INTO teacher_students (tutor_id, student_id, subject, hourly_rate)
        VALUES (sample_tutor_id, sample_child_id, 'Mathematics', 25.00)
        ON CONFLICT (tutor_id, student_id, subject) DO NOTHING
        RETURNING id INTO sample_ts_id;
        
        -- Get the ID if it already existed
        IF sample_ts_id IS NULL THEN
            SELECT id INTO sample_ts_id FROM teacher_students 
            WHERE tutor_id = sample_tutor_id AND student_id = sample_child_id 
            LIMIT 1;
        END IF;
        
        RAISE NOTICE 'Teacher-student relationship ID: %', sample_ts_id;
        
        -- Create student progress record
        INSERT INTO student_progress (student_id, tutor_id, subject, current_grade, target_grade, progress_percentage)
        VALUES (sample_child_id, sample_tutor_id, 'Mathematics', 'Grade 4', 'Grade 6', 65)
        ON CONFLICT DO NOTHING
        RETURNING id INTO sample_progress_id;
        
        RAISE NOTICE 'Student progress ID: %', sample_progress_id;
        
        -- Create sample session
        IF sample_ts_id IS NOT NULL THEN
            INSERT INTO sessions (teacher_student_id, date, start_time, end_time, duration_minutes, topic, status)
            VALUES (sample_ts_id, CURRENT_DATE, '14:00', '15:00', 60, 'Fractions and Decimals', 'completed')
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'Sample session created';
        END IF;
        
        -- Create sample progress entry
        IF sample_progress_id IS NOT NULL THEN
            INSERT INTO progress_entries (student_progress_id, entry_type, description, score, max_score, created_by)
            VALUES (sample_progress_id, 'assessment', 'Fraction Assessment', 8.5, 10.0, 
                   (SELECT parent_id FROM children WHERE id = sample_child_id))
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'Sample progress entry created';
        END IF;
        
        RAISE NOTICE 'Sample data creation completed successfully!';
    ELSE
        RAISE NOTICE 'No sample child or tutor found. Please add some data first using the Children Management page.';
    END IF;
END$$;

SELECT 'Sample data script completed!' as status;
