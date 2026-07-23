-- Master seed script - Run all seeds in order
-- This script executes all seed files in the correct dependency order
-- Run this from Supabase SQL Editor or via: psql < supabase/seeds/00_run_all.sql

-- ============================================
-- EXECUTION ORDER
-- ============================================
-- 01. Trusts and Institutes (foundation)
-- 02. Colleges (depends on institutes)
-- 03. Departments (depends on colleges)
-- 04. Courses/Programs (depends on departments)
-- 05. Committees (depends on colleges)
-- 06. Accreditations (standalone)
-- 07. Placement Statistics (depends on colleges)

\echo '================================'
\echo 'Starting SVIT Database Seeding'
\echo '================================'

\echo ''
\echo '[1/7] Seeding trusts and institutes...'
\i supabase/seeds/01_trusts_institutes.sql

\echo ''
\echo '[2/7] Seeding colleges...'
\i supabase/seeds/02_colleges.sql

\echo ''
\echo '[3/7] Seeding departments...'
\i supabase/seeds/03_departments.sql

\echo ''
\echo '[4/7] Seeding courses...'
\i supabase/seeds/04_courses.sql

\echo ''
\echo '[5/7] Seeding committees...'
\i supabase/seeds/05_committees.sql

\echo ''
\echo '[6/7] Seeding accreditations...'
\i supabase/seeds/06_accreditations.sql

\echo ''
\echo '[7/7] Seeding placement statistics...'
\i supabase/seeds/07_placement_statistics.sql

\echo ''
\echo '================================'
\echo 'Seeding Complete!'
\echo '================================'
\echo ''
\echo 'Summary:'
\echo '- Trusts: 1'
\echo '- Institutes: 1'
\echo '- Colleges: 4 (SVIT, SVICA, SVION, COA)'
\echo '- Departments: 21'
\echo '- Courses: 25'
\echo '- Committees: 5'
\echo '- Accreditations: 4'
\echo '- Placement Records: 18 (across 4 colleges)'
\echo ''
