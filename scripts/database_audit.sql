-- =====================================================
-- COMPLETE DATABASE AUDIT SCRIPT FOR SUPABASE
-- Run this in your Supabase SQL Editor to get full database details
-- =====================================================

-- 1. LIST ALL TABLES WITH THEIR SCHEMAS
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE schemaname IN ('public', 'auth', 'storage')
ORDER BY schemaname, tablename;

-- 2. GET DETAILED TABLE STRUCTURE (COLUMNS, DATA TYPES, CONSTRAINTS)
SELECT 
    t.table_schema,
    t.table_name,
    c.column_name,
    c.ordinal_position,
    c.column_default,
    c.is_nullable,
    c.data_type,
    c.character_maximum_length,
    c.numeric_precision,
    c.numeric_scale,
    c.udt_name
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
WHERE t.table_schema IN ('public', 'auth', 'storage')
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_schema, t.table_name, c.ordinal_position;

-- 3. LIST ALL FOREIGN KEY CONSTRAINTS
SELECT
    tc.table_schema,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema IN ('public', 'auth', 'storage')
ORDER BY tc.table_schema, tc.table_name, tc.constraint_name;

-- 4. LIST ALL PRIMARY KEY CONSTRAINTS
SELECT
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    kcu.ordinal_position
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema IN ('public', 'auth', 'storage')
ORDER BY tc.table_schema, tc.table_name, kcu.ordinal_position;

-- 5. LIST ALL UNIQUE CONSTRAINTS
SELECT
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema IN ('public', 'auth', 'storage')
ORDER BY tc.table_schema, tc.table_name, tc.constraint_name;

-- 6. LIST ALL CHECK CONSTRAINTS
SELECT
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
    AND tc.table_schema = cc.constraint_schema
WHERE tc.constraint_type = 'CHECK'
    AND tc.table_schema IN ('public', 'auth', 'storage')
ORDER BY tc.table_schema, tc.table_name, tc.constraint_name;

-- 7. LIST ALL INDEXES
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname IN ('public', 'auth', 'storage')
ORDER BY schemaname, tablename, indexname;

-- 8. LIST ALL TRIGGERS
SELECT
    trigger_schema,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema IN ('public', 'auth', 'storage')
ORDER BY trigger_schema, event_object_table, trigger_name;

-- 9. LIST ALL FUNCTIONS/PROCEDURES
SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_catalog.pg_get_function_result(p.oid) AS return_type,
    pg_catalog.pg_get_function_arguments(p.oid) AS arguments,
    CASE p.prokind
        WHEN 'f' THEN 'function'
        WHEN 'p' THEN 'procedure'
        WHEN 'a' THEN 'aggregate'
        WHEN 'w' THEN 'window'
    END AS function_type
FROM pg_catalog.pg_proc p
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname IN ('public', 'auth', 'storage')
ORDER BY n.nspname, p.proname;

-- 10. LIST ALL RLS (ROW LEVEL SECURITY) POLICIES
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname IN ('public', 'auth', 'storage')
ORDER BY schemaname, tablename, policyname;

-- 11. CHECK RLS STATUS ON TABLES
SELECT
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables
WHERE schemaname IN ('public', 'auth', 'storage')
    AND rowsecurity = true
ORDER BY schemaname, tablename;

-- 12. LIST ALL SEQUENCES
SELECT
    schemaname,
    sequencename,
    data_type,
    start_value,
    min_value,
    max_value,
    increment_by,
    cycle,
    cache_size,
    last_value
FROM pg_sequences
WHERE schemaname IN ('public', 'auth', 'storage')
ORDER BY schemaname, sequencename;

-- 13. LIST ALL VIEWS
SELECT
    table_schema,
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema IN ('public', 'auth', 'storage')
ORDER BY table_schema, table_name;

-- 14. LIST ALL ENUMS/CUSTOM TYPES
SELECT
    n.nspname AS schema_name,
    t.typname AS type_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname IN ('public', 'auth', 'storage')
GROUP BY n.nspname, t.typname
ORDER BY n.nspname, t.typname;

-- 15. GET STORAGE BUCKETS (IF ANY)
SELECT
    id,
    name,
    owner,
    created_at,
    updated_at,
    public,
    avif_autodetection,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- 16. COUNT RECORDS IN ALL TABLES
SELECT 
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM (SELECT 1 FROM pg_tables WHERE schemaname = t.schemaname AND tablename = t.tablename) AS x) as table_exists,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = t.schemaname AND tablename = t.tablename) > 0 
        THEN (
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = t.schemaname 
            AND table_name = t.tablename
        )
        ELSE 0 
    END as record_count_placeholder
FROM pg_tables t
WHERE t.schemaname IN ('public', 'auth', 'storage')
ORDER BY t.schemaname, t.tablename;

-- 17. SHOW ALL TABLE PERMISSIONS/GRANTS
SELECT
    table_schema,
    table_name,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges
WHERE table_schema IN ('public', 'auth', 'storage')
ORDER BY table_schema, table_name, grantee, privilege_type;

-- 18. LIST ALL EXTENSIONS
SELECT
    extname,
    extversion,
    extrelocatable,
    extnamespace::regnamespace AS schema_name
FROM pg_extension
ORDER BY extname;

-- =====================================================
-- SUMMARY QUERY - QUICK OVERVIEW
-- =====================================================
SELECT 
    'Tables in public schema' as item_type,
    COUNT(*)::text as count
FROM pg_tables 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Functions in public schema' as item_type,
    COUNT(*)::text as count
FROM pg_proc p
LEFT JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'

UNION ALL

SELECT 
    'RLS Policies' as item_type,
    COUNT(*)::text as count
FROM pg_policies
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Foreign Key Constraints' as item_type,
    COUNT(*)::text as count
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public'

UNION ALL

SELECT 
    'Storage Buckets' as item_type,
    COUNT(*)::text as count
FROM storage.buckets;
