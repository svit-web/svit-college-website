-- Seed departments table
-- Run order: 03 (depends on colleges)
-- Data source: src/data/academics.ts

-- ============================================
-- DEPARTMENTS
-- ============================================
-- Note: degree_type_id is stored in metadata as degreeTypes are not a separate table
-- Departments link to colleges and contain degree type information in metadata

DO $$
DECLARE
  v_svit_id uuid;
  v_svica_id uuid;
  v_svion_id uuid;
  v_coa_id uuid;
BEGIN
  -- Get college IDs
  SELECT id INTO v_svit_id FROM colleges WHERE slug = 'svit';
  SELECT id INTO v_svica_id FROM colleges WHERE slug = 'svica';
  SELECT id INTO v_svion_id FROM colleges WHERE slug = 'svion';
  SELECT id INTO v_coa_id FROM colleges WHERE slug = 'svit-coa';

  -- SVIT · BE (Bachelor of Engineering) Departments
  INSERT INTO departments (college_id, name, slug, code, degree_level, sort_order, metadata, status) VALUES
  (v_svit_id, 'Aeronautical Engineering', 'dept-svit-be-aeronautical', 'AE', 'UG', 1, '{"degree_type": "BE", "legacy_id": "dept-svit-be-aeronautical"}'::jsonb, 'published'),
  (v_svit_id, 'Mechanical Engineering', 'dept-svit-be-mechanical', 'ME', 'UG', 2, '{"degree_type": "BE", "legacy_id": "dept-svit-be-mechanical"}'::jsonb, 'published'),
  (v_svit_id, 'Electrical Engineering', 'dept-svit-be-electrical', 'EE', 'UG', 3, '{"degree_type": "BE", "legacy_id": "dept-svit-be-electrical"}'::jsonb, 'published'),
  (v_svit_id, 'Civil Engineering', 'dept-svit-be-civil', 'CE', 'UG', 4, '{"degree_type": "BE", "legacy_id": "dept-svit-be-civil"}'::jsonb, 'published'),
  (v_svit_id, 'Computer Engineering', 'dept-svit-be-computer', 'CSE', 'UG', 5, '{"degree_type": "BE", "legacy_id": "dept-svit-be-computer"}'::jsonb, 'published'),
  (v_svit_id, 'Computer Science & Design', 'dept-svit-be-csd', 'CSD', 'UG', 6, '{"degree_type": "BE", "legacy_id": "dept-svit-be-csd"}'::jsonb, 'published'),
  (v_svit_id, 'Information Technology', 'dept-svit-be-it', 'IT', 'UG', 7, '{"degree_type": "BE", "legacy_id": "dept-svit-be-it"}'::jsonb, 'published'),
  (v_svit_id, 'Electronics & Communication', 'dept-svit-be-ec', 'EC', 'UG', 8, '{"degree_type": "BE", "legacy_id": "dept-svit-be-ec"}'::jsonb, 'published');

  -- SVIT · ME (Master of Engineering) Departments
  INSERT INTO departments (college_id, name, slug, code, degree_level, sort_order, metadata, status) VALUES
  (v_svit_id, 'Computer Engineering (PG)', 'dept-svit-me-computer', 'ME-CS', 'PG', 9, '{"degree_type": "ME", "legacy_id": "dept-svit-me-computer"}'::jsonb, 'published'),
  (v_svit_id, 'Civil Engineering (PG)', 'dept-svit-me-civil', 'ME-CE', 'PG', 10, '{"degree_type": "ME", "legacy_id": "dept-svit-me-civil"}'::jsonb, 'published');

  -- SVIT · Diploma Departments
  INSERT INTO departments (college_id, name, slug, code, degree_level, sort_order, metadata, status) VALUES
  (v_svit_id, 'Computer Engineering (Diploma)', 'dept-svit-dip-computer', 'DIP-CS', 'Diploma', 11, '{"degree_type": "Diploma", "legacy_id": "dept-svit-dip-computer"}'::jsonb, 'published'),
  (v_svit_id, 'Information Technology (Diploma)', 'dept-svit-dip-it', 'DIP-IT', 'Diploma', 12, '{"degree_type": "Diploma", "legacy_id": "dept-svit-dip-it"}'::jsonb, 'published'),
  (v_svit_id, 'Electrical Engineering (Diploma)', 'dept-svit-dip-electrical', 'DIP-EE', 'Diploma', 13, '{"degree_type": "Diploma", "legacy_id": "dept-svit-dip-electrical"}'::jsonb, 'published'),
  (v_svit_id, 'Mechanical Engineering (Diploma)', 'dept-svit-dip-mechanical', 'DIP-ME', 'Diploma', 14, '{"degree_type": "Diploma", "legacy_id": "dept-svit-dip-mechanical"}'::jsonb, 'published'),
  (v_svit_id, 'Civil Engineering (Diploma)', 'dept-svit-dip-civil', 'DIP-CE', 'Diploma', 15, '{"degree_type": "Diploma", "legacy_id": "dept-svit-dip-civil"}'::jsonb, 'published');

  -- SVIT · MBA
  INSERT INTO departments (college_id, name, slug, code, degree_level, sort_order, metadata, status) VALUES
  (v_svit_id, 'Management Studies', 'dept-svit-mba', 'MBA', 'PG', 16, '{"degree_type": "MBA", "legacy_id": "dept-svit-mba"}'::jsonb, 'published');

  -- SVIT · MCA
  INSERT INTO departments (college_id, name, slug, code, degree_level, sort_order, metadata, status) VALUES
  (v_svit_id, 'Computer Applications (PG)', 'dept-svit-mca', 'MCA', 'PG', 17, '{"degree_type": "MCA", "legacy_id": "dept-svit-mca"}'::jsonb, 'published');

  -- SVION - Nursing (no degree-type grouping)
  INSERT INTO departments (college_id, name, slug, code, degree_level, sort_order, metadata, status) VALUES
  (v_svion_id, 'General Nursing', 'dept-svion-gn', 'GNM', 'UG', 1, '{"legacy_id": "dept-svion-gn"}'::jsonb, 'published');

  -- COA - Architecture (no degree-type grouping)
  INSERT INTO departments (college_id, name, slug, code, degree_level, sort_order, metadata, status) VALUES
  (v_coa_id, 'Architecture & Design', 'dept-coa-arch', 'ARCH', 'UG', 1, '{"legacy_id": "dept-coa-arch"}'::jsonb, 'published');

  -- SVICA - Computer Applications (no degree-type grouping)
  INSERT INTO departments (college_id, name, slug, code, degree_level, sort_order, metadata, status) VALUES
  (v_svica_id, 'Computer Applications', 'dept-svica-ca', 'CA', 'UG', 1, '{"legacy_id": "dept-svica-ca"}'::jsonb, 'published');

END $$;
