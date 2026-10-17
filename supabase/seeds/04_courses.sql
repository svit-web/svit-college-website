-- Seed courses (programs) and branches table
-- Run order: 04 (depends on departments)
-- Data source: src/data/academics.ts (programs array)

-- ============================================
-- COURSES (Programs/Branches)
-- ============================================
-- Note: The courses table stores program/branch information
-- Branches table appears to be for specializations within courses

DO $$
DECLARE
  -- Department IDs
  v_dept_be_aero uuid;
  v_dept_be_mech uuid;
  v_dept_be_elec uuid;
  v_dept_be_civil uuid;
  v_dept_be_comp uuid;
  v_dept_be_csd uuid;
  v_dept_be_it uuid;
  v_dept_be_ec uuid;
  v_dept_me_comp uuid;
  v_dept_me_civil uuid;
  v_dept_dip_comp uuid;
  v_dept_dip_it uuid;
  v_dept_dip_elec uuid;
  v_dept_dip_mech uuid;
  v_dept_dip_civil uuid;
  v_dept_mba uuid;
  v_dept_mca uuid;
  v_dept_svion_gn uuid;
  v_dept_coa_arch uuid;
  v_dept_svica_ca uuid;
BEGIN
  -- Fetch all department IDs
  SELECT id INTO v_dept_be_aero FROM departments WHERE slug = 'dept-svit-be-aeronautical';
  SELECT id INTO v_dept_be_mech FROM departments WHERE slug = 'dept-svit-be-mechanical';
  SELECT id INTO v_dept_be_elec FROM departments WHERE slug = 'dept-svit-be-electrical';
  SELECT id INTO v_dept_be_civil FROM departments WHERE slug = 'dept-svit-be-civil';
  SELECT id INTO v_dept_be_comp FROM departments WHERE slug = 'dept-svit-be-computer';
  SELECT id INTO v_dept_be_csd FROM departments WHERE slug = 'dept-svit-be-csd';
  SELECT id INTO v_dept_be_it FROM departments WHERE slug = 'dept-svit-be-it';
  SELECT id INTO v_dept_be_ec FROM departments WHERE slug = 'dept-svit-be-ec';
  SELECT id INTO v_dept_me_comp FROM departments WHERE slug = 'dept-svit-me-computer';
  SELECT id INTO v_dept_me_civil FROM departments WHERE slug = 'dept-svit-me-civil';
  SELECT id INTO v_dept_dip_comp FROM departments WHERE slug = 'dept-svit-dip-computer';
  SELECT id INTO v_dept_dip_it FROM departments WHERE slug = 'dept-svit-dip-it';
  SELECT id INTO v_dept_dip_elec FROM departments WHERE slug = 'dept-svit-dip-electrical';
  SELECT id INTO v_dept_dip_mech FROM departments WHERE slug = 'dept-svit-dip-mechanical';
  SELECT id INTO v_dept_dip_civil FROM departments WHERE slug = 'dept-svit-dip-civil';
  SELECT id INTO v_dept_mba FROM departments WHERE slug = 'dept-svit-mba';
  SELECT id INTO v_dept_mca FROM departments WHERE slug = 'dept-svit-mca';
  SELECT id INTO v_dept_svion_gn FROM departments WHERE slug = 'dept-svion-gn';
  SELECT id INTO v_dept_coa_arch FROM departments WHERE slug = 'dept-coa-arch';
  SELECT id INTO v_dept_svica_ca FROM departments WHERE slug = 'dept-svica-ca';

  -- SVIT · BE Programs
  INSERT INTO courses (department_id, name, slug, code, degree_level, duration_years, intake_capacity, eligibility_criteria, sort_order, metadata, status) VALUES
  (v_dept_be_aero, 'Bachelor of Engineering in Aeronautical Engineering', 'prog-svit-be-aeronautical', 'BE-AE', 'UG', 4, 60, '10+2 with Physics, Chemistry and Mathematics', 1, '{"legacy_id": "prog-svit-be-aeronautical"}'::jsonb, 'published'),
  (v_dept_be_mech, 'Bachelor of Engineering in Mechanical Engineering', 'prog-svit-be-mechanical', 'BE-ME', 'UG', 4, 120, '10+2 with Physics, Chemistry and Mathematics', 2, '{"legacy_id": "prog-svit-be-mechanical"}'::jsonb, 'published'),
  (v_dept_be_elec, 'Bachelor of Engineering in Electrical Engineering', 'prog-svit-be-electrical', 'BE-EE', 'UG', 4, 60, '10+2 with Physics, Chemistry and Mathematics', 3, '{"legacy_id": "prog-svit-be-electrical"}'::jsonb, 'published'),
  (v_dept_be_civil, 'Bachelor of Engineering in Civil Engineering', 'prog-svit-be-civil', 'BE-CE', 'UG', 4, 120, '10+2 with Physics, Chemistry and Mathematics', 4, '{"legacy_id": "prog-svit-be-civil"}'::jsonb, 'published'),
  (v_dept_be_comp, 'Bachelor of Engineering in Computer Engineering', 'prog-svit-be-computer', 'BE-CSE', 'UG', 4, 180, '10+2 with Physics, Chemistry and Mathematics', 5, '{"legacy_id": "prog-svit-be-computer"}'::jsonb, 'published'),
  (v_dept_be_csd, 'Bachelor of Engineering in Computer Science & Design Engineering', 'prog-svit-be-csd', 'BE-CSD', 'UG', 4, 60, '10+2 with Physics, Chemistry and Mathematics', 6, '{"legacy_id": "prog-svit-be-csd"}'::jsonb, 'published'),
  (v_dept_be_it, 'Bachelor of Engineering in Information Technology Engineering', 'prog-svit-be-it', 'BE-IT', 'UG', 4, 120, '10+2 with Physics, Chemistry and Mathematics', 7, '{"legacy_id": "prog-svit-be-it"}'::jsonb, 'published'),
  (v_dept_be_ec, 'Bachelor of Engineering in Electronics & Communication Engineering', 'prog-svit-be-ec', 'BE-EC', 'UG', 4, 60, '10+2 with Physics, Chemistry and Mathematics', 8, '{"legacy_id": "prog-svit-be-ec"}'::jsonb, 'published');

  -- SVIT · ME Programs
  INSERT INTO courses (department_id, name, slug, code, degree_level, duration_years, intake_capacity, eligibility_criteria, sort_order, metadata, status) VALUES
  (v_dept_me_comp, 'Master of Engineering in Software', 'prog-svit-me-software', 'ME-SW', 'PG', 2, 18, 'BE/B.Tech in Computer/IT Engineering', 9, '{"legacy_id": "prog-svit-me-software"}'::jsonb, 'published'),
  (v_dept_me_civil, 'Master of Engineering in Structure', 'prog-svit-me-structure', 'ME-STRUCT', 'PG', 2, 18, 'BE/B.Tech in Civil Engineering', 10, '{"legacy_id": "prog-svit-me-structure"}'::jsonb, 'published');

  -- SVIT · Diploma Programs
  INSERT INTO courses (department_id, name, slug, code, degree_level, duration_years, intake_capacity, eligibility_criteria, sort_order, metadata, status) VALUES
  (v_dept_dip_comp, 'Diploma in Computer Engineering', 'prog-svit-dip-computer', 'DIP-CS', 'Diploma', 3, 60, '10th Standard (SSC)', 11, '{"legacy_id": "prog-svit-dip-computer"}'::jsonb, 'published'),
  (v_dept_dip_it, 'Diploma in Information Technology Engineering', 'prog-svit-dip-it', 'DIP-IT', 'Diploma', 3, 60, '10th Standard (SSC)', 12, '{"legacy_id": "prog-svit-dip-it"}'::jsonb, 'published'),
  (v_dept_dip_elec, 'Diploma in Electrical Engineering', 'prog-svit-dip-electrical', 'DIP-EE', 'Diploma', 3, 60, '10th Standard (SSC)', 13, '{"legacy_id": "prog-svit-dip-electrical"}'::jsonb, 'published'),
  (v_dept_dip_mech, 'Diploma in Mechanical Engineering', 'prog-svit-dip-mechanical', 'DIP-ME', 'Diploma', 3, 60, '10th Standard (SSC)', 14, '{"legacy_id": "prog-svit-dip-mechanical"}'::jsonb, 'published'),
  (v_dept_dip_civil, 'Diploma in Civil Engineering', 'prog-svit-dip-civil', 'DIP-CE', 'Diploma', 3, 60, '10th Standard (SSC)', 15, '{"legacy_id": "prog-svit-dip-civil"}'::jsonb, 'published');

  -- SVIT · MBA
  INSERT INTO courses (department_id, name, slug, code, degree_level, duration_years, intake_capacity, eligibility_criteria, sort_order, metadata, status) VALUES
  (v_dept_mba, 'Master in Business Administration', 'prog-svit-mba', 'MBA', 'PG', 2, 120, 'Graduation in any discipline with 50% marks', 16, '{"legacy_id": "prog-svit-mba"}'::jsonb, 'published');

  -- SVIT · MCA
  INSERT INTO courses (department_id, name, slug, code, degree_level, duration_years, intake_capacity, eligibility_criteria, sort_order, metadata, status) VALUES
  (v_dept_mca, 'Master of Computer Applications', 'prog-svit-mca', 'MCA', 'PG', 2, 60, 'BCA/B.Sc (IT/CS) or equivalent with Mathematics at 10+2 level', 17, '{"legacy_id": "prog-svit-mca"}'::jsonb, 'published');

  -- SVION Programs
  INSERT INTO courses (department_id, name, slug, code, degree_level, duration_years, intake_capacity, eligibility_criteria, sort_order, metadata, status) VALUES
  (v_dept_svion_gn, 'General Nursing & Midwifery', 'prog-svion-gnm', 'GNM', 'UG', 3, 60, '10+2 with Science (Physics, Chemistry, Biology)', 1, '{"legacy_id": "prog-svion-gnm"}'::jsonb, 'published');

  -- COA Programs
  INSERT INTO courses (department_id, name, slug, code, degree_level, duration_years, intake_capacity, eligibility_criteria, sort_order, metadata, status) VALUES
  (v_dept_coa_arch, 'Bachelor of Architecture', 'prog-coa-barch', 'B.Arch', 'UG', 5, 40, '10+2 with 50% marks in Physics, Chemistry, Mathematics and NATA qualified', 1, '{"legacy_id": "prog-coa-barch"}'::jsonb, 'published'),
  (v_dept_coa_arch, 'Bachelor of Interior Design', 'prog-coa-bid', 'BID', 'UG', 4, 30, '10+2 in any stream with 50% marks', 2, '{"legacy_id": "prog-coa-bid"}'::jsonb, 'published'),
  (v_dept_coa_arch, 'Diploma in Architecture', 'prog-coa-diparch', 'DIP-ARCH', 'Diploma', 3, 30, '10th Standard (SSC)', 3, '{"legacy_id": "prog-coa-diparch"}'::jsonb, 'published');

  -- SVICA Programs
  INSERT INTO courses (department_id, name, slug, code, degree_level, duration_years, intake_capacity, eligibility_criteria, sort_order, metadata, status) VALUES
  (v_dept_svica_ca, 'Bachelor in Computer Applications (BCA)', 'prog-svica-bca', 'BCA', 'UG', 3, 60, '10+2 in any stream with Mathematics', 1, '{"legacy_id": "prog-svica-bca"}'::jsonb, 'published'),
  (v_dept_svica_ca, 'Bachelor in Science, IT', 'prog-svica-bsc-it', 'BSc-IT', 'UG', 3, 60, '10+2 in Science stream with Mathematics', 2, '{"legacy_id": "prog-svica-bsc-it"}'::jsonb, 'published');

END $$;
