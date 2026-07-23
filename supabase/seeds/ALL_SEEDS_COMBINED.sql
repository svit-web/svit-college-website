-- ============================================
-- SVIT DATABASE SEEDING - ALL SEEDS COMBINED
-- ============================================
-- Run this entire file in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run
--
-- This will populate:
-- - Trusts (1), Institutes (1), Colleges (4)
-- - Departments (21), Courses (25)
-- - Committees (5), Accreditations (4)
-- - Placement Statistics (18 records)
-- ============================================

-- ============================================
-- 01. TRUSTS & INSTITUTES
-- ============================================

INSERT INTO trusts (id, name, slug, description, established_year, metadata, status) VALUES
(
  gen_random_uuid(),
  'New English School Trust (NEST)',
  'svit-group',
  'The New English School Trust (NEST) is the parent trust managing the SVIT Group of institutions in Vasad, Gujarat. Established with a vision to provide quality education across engineering, management, nursing, and architecture.',
  1997,
  '{"short_name": "SVIT Group", "legacy_id": "svit-group"}'::jsonb,
  'published'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO institutes (id, trust_id, name, slug, tagline, logo_url, established_year, metadata, status) VALUES
(
  gen_random_uuid(),
  (SELECT id FROM trusts WHERE slug = 'svit-group'),
  'SVIT Group of Institutions',
  'svit-group-institutions',
  'Excellence in Education Since 1997',
  NULL,
  1997,
  '{"campus_area": "15+ Acres", "location": "Vasad, Gujarat", "legacy_id": "svit-group"}'::jsonb,
  'published'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 02. COLLEGES
-- ============================================

DO $$
DECLARE
  v_institute_id uuid;
BEGIN
  SELECT id INTO v_institute_id FROM institutes WHERE slug = 'svit-group-institutions';

  -- SVIT
  INSERT INTO colleges (id, institute_id, slug, code, name, tagline, logo_url, established_year, sort_order, metadata, status)
  VALUES (
    gen_random_uuid(),
    v_institute_id,
    'svit',
    'SVIT',
    'Sardar Vallabhbhai Patel Institute of Technology',
    'Engineering Tomorrow''s Innovators',
    '/__l5e/assets-v1/6b5fd3d4-843d-4072-8ec4-663e3fe9e57a/svit-logo.jpg',
    2005,
    1,
    jsonb_build_object(
      'hero_kicker', 'Est. 2005 · Vasad, Gujarat',
      'hero_subhead', 'The flagship institute of the SVIT Group — offering AICTE-approved Engineering, Diploma, MBA and MCA programmes with 95%+ placement across 200+ recruiting partners.',
      'full_name', 'Sardar Vallabhbhai Patel Institute of Technology',
      'legacy_id', 'svit'
    ),
    'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    institute_id = EXCLUDED.institute_id,
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    established_year = EXCLUDED.established_year,
    metadata = EXCLUDED.metadata,
    updated_at = now();

  -- SVICA
  INSERT INTO colleges (id, institute_id, slug, code, name, tagline, logo_url, established_year, sort_order, metadata, status)
  VALUES (
    gen_random_uuid(),
    v_institute_id,
    'svica',
    'SVICA',
    'Sardar Vallabhbhai Patel Institute of Computer Applications',
    'Shaping Careers in Computer Applications',
    '/__l5e/assets-v1/3c28feb0-462e-48c1-8a9f-42234f5be279/svica-logo.jpg',
    2005,
    2,
    jsonb_build_object(
      'hero_kicker', 'Computer Applications · SVIT Group',
      'hero_subhead', 'SVICA offers industry-aligned BCA and B.Sc IT programmes with strong foundations in programming, data, and modern software engineering.',
      'full_name', 'Sardar Vallabhbhai Patel Institute of Computer Applications',
      'legacy_id', 'svica'
    ),
    'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    institute_id = EXCLUDED.institute_id,
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    established_year = EXCLUDED.established_year,
    metadata = EXCLUDED.metadata,
    updated_at = now();

  -- SVION
  INSERT INTO colleges (id, institute_id, slug, code, name, tagline, logo_url, established_year, sort_order, metadata, status)
  VALUES (
    gen_random_uuid(),
    v_institute_id,
    'svion',
    'SVION',
    'Sardar Vallabhbhai Patel Institute of Nursing',
    'Nursing Excellence, Compassion in Care',
    '/__l5e/assets-v1/a31711bd-5868-4f73-aa4f-cce55d6d1057/svion-logo.png',
    2005,
    3,
    jsonb_build_object(
      'hero_kicker', 'Nursing · SVIT Group',
      'hero_subhead', 'SVION trains skilled, compassionate nursing professionals through hands-on clinical practice and mentorship by senior healthcare educators.',
      'full_name', 'Sardar Vallabhbhai Patel Institute of Nursing',
      'legacy_id', 'svion'
    ),
    'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    institute_id = EXCLUDED.institute_id,
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    established_year = EXCLUDED.established_year,
    metadata = EXCLUDED.metadata,
    updated_at = now();

  -- COA
  INSERT INTO colleges (id, institute_id, slug, code, name, tagline, logo_url, established_year, sort_order, metadata, status)
  VALUES (
    gen_random_uuid(),
    v_institute_id,
    'svit-coa',
    'COA',
    'College of Architecture',
    'Designing Spaces, Building Futures',
    '/__l5e/assets-v1/d3a378f3-5f40-476f-ba85-f2a98b40730e/coa-svit-logo.png',
    2005,
    4,
    jsonb_build_object(
      'hero_kicker', 'Architecture · SVIT Group',
      'hero_subhead', 'A COA-approved architecture school with design studios, workshops, and heritage & sustainability electives that shape thoughtful, responsible architects.',
      'full_name', 'College of Architecture, SVIT Vasad',
      'legacy_id', 'svit-coa'
    ),
    'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    institute_id = EXCLUDED.institute_id,
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    established_year = EXCLUDED.established_year,
    metadata = EXCLUDED.metadata,
    updated_at = now();

END $$;

-- ============================================
-- 03. DEPARTMENTS
-- ============================================

DO $$
DECLARE
  v_svit_id uuid;
  v_svica_id uuid;
  v_svion_id uuid;
  v_coa_id uuid;
BEGIN
  SELECT id INTO v_svit_id FROM colleges WHERE slug = 'svit';
  SELECT id INTO v_svica_id FROM colleges WHERE slug = 'svica';
  SELECT id INTO v_svion_id FROM colleges WHERE slug = 'svion';
  SELECT id INTO v_coa_id FROM colleges WHERE slug = 'svit-coa';

  -- SVIT BE Departments
  INSERT INTO departments (college_id, name, slug, code, degree_level, sort_order, metadata, status) VALUES
  (v_svit_id, 'Aeronautical Engineering', 'dept-svit-be-aeronautical', 'AE', 'UG', 1, '{"degree_type": "BE", "legacy_id": "dept-svit-be-aeronautical"}'::jsonb, 'published'),
  (v_svit_id, 'Mechanical Engineering', 'dept-svit-be-mechanical', 'ME', 'UG', 2, '{"degree_type": "BE", "legacy_id": "dept-svit-be-mechanical"}'::jsonb, 'published'),
  (v_svit_id, 'Electrical Engineering', 'dept-svit-be-electrical', 'EE', 'UG', 3, '{"degree_type": "BE", "legacy_id": "dept-svit-be-electrical"}'::jsonb, 'published'),
  (v_svit_id, 'Civil Engineering', 'dept-svit-be-civil', 'CE', 'UG', 4, '{"degree_type": "BE", "legacy_id": "dept-svit-be-civil"}'::jsonb, 'published'),
  (v_svit_id, 'Computer Engineering', 'dept-svit-be-computer', 'CSE', 'UG', 5, '{"degree_type": "BE", "legacy_id": "dept-svit-be-computer"}'::jsonb, 'published'),
  (v_svit_id, 'Computer Science & Design', 'dept-svit-be-csd', 'CSD', 'UG', 6, '{"degree_type": "BE", "legacy_id": "dept-svit-be-csd"}'::jsonb, 'published'),
  (v_svit_id, 'Information Technology', 'dept-svit-be-it', 'IT', 'UG', 7, '{"degree_type": "BE", "legacy_id": "dept-svit-be-it"}'::jsonb, 'published'),
  (v_svit_id, 'Electronics & Communication', 'dept-svit-be-ec', 'EC', 'UG', 8, '{"degree_type": "BE", "legacy_id": "dept-svit-be-ec"}'::jsonb, 'published'),
  (v_svit_id, 'Computer Engineering (PG)', 'dept-svit-me-computer', 'ME-CS', 'PG', 9, '{"degree_type": "ME", "legacy_id": "dept-svit-me-computer"}'::jsonb, 'published'),
  (v_svit_id, 'Civil Engineering (PG)', 'dept-svit-me-civil', 'ME-CE', 'PG', 10, '{"degree_type": "ME", "legacy_id": "dept-svit-me-civil"}'::jsonb, 'published'),
  (v_svit_id, 'Computer Engineering (Diploma)', 'dept-svit-dip-computer', 'DIP-CS', 'Diploma', 11, '{"degree_type": "Diploma", "legacy_id": "dept-svit-dip-computer"}'::jsonb, 'published'),
  (v_svit_id, 'Information Technology (Diploma)', 'dept-svit-dip-it', 'DIP-IT', 'Diploma', 12, '{"degree_type": "Diploma", "legacy_id": "dept-svit-dip-it"}'::jsonb, 'published'),
  (v_svit_id, 'Electrical Engineering (Diploma)', 'dept-svit-dip-electrical', 'DIP-EE', 'Diploma', 13, '{"degree_type": "Diploma", "legacy_id": "dept-svit-dip-electrical"}'::jsonb, 'published'),
  (v_svit_id, 'Mechanical Engineering (Diploma)', 'dept-svit-dip-mechanical', 'DIP-ME', 'Diploma', 14, '{"degree_type": "Diploma", "legacy_id": "dept-svit-dip-mechanical"}'::jsonb, 'published'),
  (v_svit_id, 'Civil Engineering (Diploma)', 'dept-svit-dip-civil', 'DIP-CE', 'Diploma', 15, '{"degree_type": "Diploma", "legacy_id": "dept-svit-dip-civil"}'::jsonb, 'published'),
  (v_svit_id, 'Management Studies', 'dept-svit-mba', 'MBA', 'PG', 16, '{"degree_type": "MBA", "legacy_id": "dept-svit-mba"}'::jsonb, 'published'),
  (v_svit_id, 'Computer Applications (PG)', 'dept-svit-mca', 'MCA', 'PG', 17, '{"degree_type": "MCA", "legacy_id": "dept-svit-mca"}'::jsonb, 'published'),
  (v_svion_id, 'General Nursing', 'dept-svion-gn', 'GNM', 'UG', 1, '{"legacy_id": "dept-svion-gn"}'::jsonb, 'published'),
  (v_coa_id, 'Architecture & Design', 'dept-coa-arch', 'ARCH', 'UG', 1, '{"legacy_id": "dept-coa-arch"}'::jsonb, 'published'),
  (v_svica_id, 'Computer Applications', 'dept-svica-ca', 'CA', 'UG', 1, '{"legacy_id": "dept-svica-ca"}'::jsonb, 'published')
  ON CONFLICT (slug) DO NOTHING;

END $$;

-- Continue in next message due to length...
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
-- Seed committees table
-- Run order: 05
-- Data source: src/data/aboutPage.ts (committees array)

-- ============================================
-- COMMITTEES
-- ============================================

DO $$
DECLARE
  v_svit_id uuid;
BEGIN
  -- Get SVIT college ID (committees are at college level)
  SELECT id INTO v_svit_id FROM colleges WHERE slug = 'svit';

  INSERT INTO committees (college_id, name, slug, description, vision, mission, sort_order, metadata, status) VALUES
  (
    v_svit_id,
    'Women Development Cell',
    'women-development-cell',
    'Created to ensure a safe working environment for the female fraternity. Organizes programs on women empowerment.',
    'To assist women in achieving full potential in education, career and personal life through academic and intellectual growth and personal empowerment.',
    'To educate them on gender-related issues, showcase their talent, boost confidence, identify strength areas, and motivate them towards individuality.',
    1,
    jsonb_build_object(
      'key_activities', jsonb_build_array(
        'Creates social awareness among female staff and girl students about relevant issues',
        'Organizes seminars and workshops for general awareness and orientation',
        'Conducts training programs and creates awareness about self-employment schemes',
        'Promotes general well-being of female students and staff'
      )
    ),
    'published'
  ),
  (
    v_svit_id,
    'Grievance Redressal Cell',
    'grievance-redressal-cell',
    'Functions to enquire into grievances and suggest final action at the institutional level for redressal.',
    NULL,
    NULL,
    2,
    jsonb_build_object(
      'key_activities', jsonb_build_array(
        'Ensures fair, impartial and consistent redressal of issues faced by students',
        'Develops a responsive and accountable attitude among students',
        'Maintains harmonious atmosphere in the college campus',
        'Resolves grievances with complete confidentiality',
        'Handles: physical harassment, mental harassment, complaints against teaching/administrative staff, accommodation/hostel, and transportation issues'
      )
    ),
    'published'
  ),
  (
    v_svit_id,
    'Sexual Harassment Cell',
    'sexual-harassment-cell',
    'Established per UGC, NAAC, and Supreme Court guidelines to provide a healthy and congenial atmosphere for all staff and students.',
    NULL,
    NULL,
    3,
    jsonb_build_object(
      'key_activities', jsonb_build_array(
        'Promotes gender equality and removal of gender bias',
        'Addresses sexual harassment and gender-based violence',
        'Treats all complaints with dignity and respect',
        'Maintains complete confidentiality of complaints'
      )
    ),
    'published'
  ),
  (
    v_svit_id,
    'Anti-Ragging Committee',
    'anti-ragging-committee',
    'Ragging in any form is strictly forbidden. The committee punishes students found guilty as per UGC regulations.',
    NULL,
    NULL,
    4,
    jsonb_build_object(
      'key_activities', jsonb_build_array(
        'Awareness programs on dehumanizing effects of ragging',
        'Continuous watch and vigil across campus',
        'Stringent action against ragging incidents',
        'Regular checks of hostels, buses, canteens, and classrooms',
        'Follows Supreme Court guidelines — Civil Appeal No. 887 of 2009'
      )
    ),
    'published'
  ),
  (
    v_svit_id,
    'Internal Quality Assurance Cell (IQAC)',
    'iqac',
    'Apex body overseeing the internal quality assurance system with appropriate structures and processes.',
    NULL,
    NULL,
    5,
    jsonb_build_object(
      'key_activities', jsonb_build_array(
        'Plans, guides, and monitors Quality Assurance and Quality Enhancement activities',
        'Channelizes efforts towards academic excellence',
        'Develops quality circles within the institute',
        'Collects feedback from all stakeholders',
        'Organizes workshops and seminars on quality improvement'
      )
    ),
    'published'
  );

END $$;
-- Seed accreditations table
-- Run order: 06
-- Data source: src/data/aboutPage.ts (accreditation.recognitions)

-- ============================================
-- ACCREDITATIONS
-- ============================================

DO $$
BEGIN
  INSERT INTO accreditations (organization, value, received_year, expiry_date, metadata, status) VALUES
  (
    'NBA (National Board of Accreditation), New Delhi',
    'Accredited',
    2020,
    NULL,
    jsonb_build_object(
      'description', 'SVIT is accredited by NBA (National Board of Accreditation), New Delhi. The NBA accreditation is a hallmark of excellence in technical education, ensuring that programs meet global standards of quality.',
      'type', 'accreditation'
    ),
    'published'
  ),
  (
    'AICTE (All India Council for Technical Education)',
    'Approved',
    1997,
    NULL,
    jsonb_build_object(
      'description', 'All programs offered by SVIT are approved by the All India Council for Technical Education (AICTE), the statutory body for technical education in India.',
      'type', 'approval',
      'document_url', '/document/aicte-approval.pdf'
    ),
    'published'
  ),
  (
    'GTU (Gujarat Technological University)',
    'Affiliated',
    1997,
    NULL,
    jsonb_build_object(
      'description', 'SVIT is affiliated with Gujarat Technological University (GTU) for all its engineering and technical programs.',
      'type', 'affiliation'
    ),
    'published'
  ),
  (
    'NIRF (National Institutional Ranking Framework)',
    'Active Participant',
    2016,
    NULL,
    jsonb_build_object(
      'description', 'SVIT actively participates in the National Institutional Ranking Framework (NIRF) and has consistently demonstrated its commitment to academic excellence, research, and overall institutional development.',
      'type', 'ranking',
      'document_url', '/img/NIRF2026.pdf'
    ),
    'published'
  );

END $$;
-- Seed placement_statistics table
-- Run order: 07
-- Data source: src/data/placement.ts

-- ============================================
-- PLACEMENT STATISTICS
-- ============================================

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

  -- SVIT Placement Statistics
  INSERT INTO placement_statistics (college_id, academic_year, students_registered, students_placed, placement_percentage, highest_package_inr, average_package_inr, median_package_inr, companies_visited, sort_order, metadata, status) VALUES
  (v_svit_id, '2020-2021', 185, 152, 82.16, 4200000, 430000, 400000, 120, 1, '{"legacy_year": "2020"}'::jsonb, 'published'),
  (v_svit_id, '2021-2022', 197, 168, 85.28, 4500000, 450000, 420000, 140, 2, '{"legacy_year": "2021"}'::jsonb, 'published'),
  (v_svit_id, '2022-2023', 201, 175, 87.06, 3800000, 435000, 410000, 160, 3, '{"legacy_year": "2022"}'::jsonb, 'published'),
  (v_svit_id, '2023-2024', 204, 180, 88.24, 3900000, 425000, 400000, 180, 4, '{"legacy_year": "2023"}'::jsonb, 'published'),
  (v_svit_id, '2024-2025', 214, 195, 91.12, 4000000, 430000, 405000, 190, 5, '{"legacy_year": "2024"}'::jsonb, 'published'),
  (v_svit_id, '2025-2026', 226, 211, 93.36, 4200000, 430000, 410000, 200, 6, '{"legacy_year": "2025"}'::jsonb, 'published');

  -- SVION Placement Statistics
  INSERT INTO placement_statistics (college_id, academic_year, students_registered, students_placed, placement_percentage, highest_package_inr, average_package_inr, median_package_inr, companies_visited, sort_order, metadata, status) VALUES
  (v_svion_id, '2022-2023', 47, 40, 85.11, 600000, 320000, 310000, 30, 1, '{"legacy_year": "2022"}'::jsonb, 'published'),
  (v_svion_id, '2023-2024', 55, 48, 87.27, 620000, 325000, 315000, 35, 2, '{"legacy_year": "2023"}'::jsonb, 'published'),
  (v_svion_id, '2024-2025', 61, 55, 90.16, 600000, 320000, 315000, 38, 3, '{"legacy_year": "2024"}'::jsonb, 'published'),
  (v_svion_id, '2025-2026', 67, 62, 92.54, 600000, 320000, 320000, 40, 4, '{"legacy_year": "2025"}'::jsonb, 'published');

  -- SVICA Placement Statistics
  INSERT INTO placement_statistics (college_id, academic_year, students_registered, students_placed, placement_percentage, highest_package_inr, average_package_inr, median_package_inr, companies_visited, sort_order, metadata, status) VALUES
  (v_svica_id, '2022-2023', 68, 55, 80.88, 1200000, 390000, 370000, 45, 1, '{"legacy_year": "2022"}'::jsonb, 'published'),
  (v_svica_id, '2023-2024', 74, 62, 83.78, 1150000, 385000, 375000, 50, 2, '{"legacy_year": "2023"}'::jsonb, 'published'),
  (v_svica_id, '2024-2025', 80, 70, 87.50, 1180000, 390000, 380000, 55, 3, '{"legacy_year": "2024"}'::jsonb, 'published'),
  (v_svica_id, '2025-2026', 86, 78, 90.70, 1200000, 390000, 385000, 60, 4, '{"legacy_year": "2025"}'::jsonb, 'published');

  -- COA Placement Statistics
  INSERT INTO placement_statistics (college_id, academic_year, students_registered, students_placed, placement_percentage, highest_package_inr, average_package_inr, median_package_inr, companies_visited, sort_order, metadata, status) VALUES
  (v_coa_id, '2022-2023', 28, 22, 78.57, 900000, 380000, 365000, 18, 1, '{"legacy_year": "2022"}'::jsonb, 'published'),
  (v_coa_id, '2023-2024', 31, 26, 83.87, 920000, 375000, 370000, 20, 2, '{"legacy_year": "2023"}'::jsonb, 'published'),
  (v_coa_id, '2024-2025', 34, 30, 88.24, 900000, 380000, 375000, 22, 3, '{"legacy_year": "2024"}'::jsonb, 'published'),
  (v_coa_id, '2025-2026', 38, 34, 89.47, 900000, 380000, 375000, 25, 4, '{"legacy_year": "2025"}'::jsonb, 'published');

END $$;
