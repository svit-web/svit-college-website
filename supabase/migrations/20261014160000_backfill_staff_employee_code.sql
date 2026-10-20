-- Faculty seed files (08_diploma_faculty.sql, 09_faculty_svica.sql, 09_faculty_svion.sql,
-- 09_faculty_svit-coa.sql, 09_faculty_svit.sql) only ever wrote employee_code into the
-- staff_profiles.metadata jsonb, never into the real employee_code column. The admin Staff
-- Wizards UI and the public /staff/[code] route both read the column, so these rows show a
-- blank employee code and never resolve by code. Backfill from metadata for existing rows.
UPDATE staff_profiles
SET employee_code = metadata->>'employee_code'
WHERE employee_code IS NULL AND metadata->>'employee_code' IS NOT NULL;
