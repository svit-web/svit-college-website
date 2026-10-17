-- ============================================
-- SVIT DATABASE SEEDING - VERIFIED AGAINST ACTUAL SCHEMA
-- ============================================
-- Date: 2026-07-22
-- Verified using Supabase MCP list_tables with verbose=true
-- NO unique constraints exist, so NO ON CONFLICT clauses
-- ============================================

-- ============================================
-- 01. TRUSTS
-- ============================================
-- Columns: name, slug, logo_url, website_url, sort_order, metadata, status

INSERT INTO trusts (name, slug, metadata, status, sort_order) VALUES
(
  'New English School Trust (NEST)',
  'svit-group',
  jsonb_build_object(
    'short_name', 'SVIT Group',
    'description', 'The New English School Trust (NEST) is the parent trust managing the SVIT Group of institutions in Vasad, Gujarat.',
    'established_year', 1997,
    'legacy_id', 'svit-group'
  ),
  'published',
  1
);

-- ============================================
-- 02. INSTITUTES
-- ============================================
-- Columns: trust_id, name, slug, logo_url, website_url, sort_order, metadata, status

INSERT INTO institutes (trust_id, name, slug, metadata, status, sort_order) VALUES
(
  (SELECT id FROM trusts WHERE slug = 'svit-group'),
  'SVIT Group of Institutions',
  'svit-group-institutions',
  jsonb_build_object(
    'tagline', 'Excellence in Education Since 1997',
    'campus_area', '15+ Acres',
    'location', 'Vasad, Gujarat',
    'established_year', 1997,
    'legacy_id', 'svit-group'
  ),
  'published',
  1
);

-- ============================================
-- 03. COLLEGES
-- ============================================
-- Columns: institute_id, slug, code, name, logo_url, website_url, sort_order, metadata, status

DO $$
DECLARE
  v_institute_id uuid;
BEGIN
  SELECT id INTO v_institute_id FROM institutes WHERE slug = 'svit-group-institutions';

  -- SVIT
  INSERT INTO colleges (institute_id, slug, code, name, logo_url, sort_order, metadata, status)
  VALUES (
    v_institute_id,
    'svit',
    'SVIT',
    'Sardar Vallabhbhai Patel Institute of Technology',
    '/__l5e/assets-v1/6b5fd3d4-843d-4072-8ec4-663e3fe9e57a/svit-logo.jpg',
    1,
    jsonb_build_object(
      'tagline', 'Engineering Tomorrow''s Innovators',
      'hero_kicker', 'Est. 2005 · Vasad, Gujarat',
      'hero_subhead', 'The flagship institute of the SVIT Group — offering AICTE-approved Engineering, Diploma, MBA and MCA programmes with 95%+ placement across 200+ recruiting partners.',
      'established_year', 2005,
      'legacy_id', 'svit'
    ),
    'published'
  );

  -- SVICA
  INSERT INTO colleges (institute_id, slug, code, name, logo_url, sort_order, metadata, status)
  VALUES (
    v_institute_id,
    'svica',
    'SVICA',
    'Sardar Vallabhbhai Patel Institute of Computer Applications',
    '/__l5e/assets-v1/3c28feb0-462e-48c1-8a9f-42234f5be279/svica-logo.jpg',
    2,
    jsonb_build_object(
      'tagline', 'Shaping Careers in Computer Applications',
      'hero_kicker', 'Computer Applications · SVIT Group',
      'hero_subhead', 'SVICA offers industry-aligned BCA and B.Sc IT programmes with strong foundations in programming, data, and modern software engineering.',
      'established_year', 2005,
      'legacy_id', 'svica'
    ),
    'published'
  );

  -- SVION
  INSERT INTO colleges (institute_id, slug, code, name, logo_url, sort_order, metadata, status)
  VALUES (
    v_institute_id,
    'svion',
    'SVION',
    'Sardar Vallabhbhai Patel Institute of Nursing',
    '/__l5e/assets-v1/a31711bd-5868-4f73-aa4f-cce55d6d1057/svion-logo.png',
    3,
    jsonb_build_object(
      'tagline', 'Nursing Excellence, Compassion in Care',
      'hero_kicker', 'Nursing · SVIT Group',
      'hero_subhead', 'SVION trains skilled, compassionate nursing professionals through hands-on clinical practice and mentorship by senior healthcare educators.',
      'established_year', 2005,
      'legacy_id', 'svion'
    ),
    'published'
  );

  -- COA
  INSERT INTO colleges (institute_id, slug, code, name, logo_url, sort_order, metadata, status)
  VALUES (
    v_institute_id,
    'svit-coa',
    'COA',
    'College of Architecture',
    '/__l5e/assets-v1/d3a378f3-5f40-476f-ba85-f2a98b40730e/coa-svit-logo.png',
    4,
    jsonb_build_object(
      'tagline', 'Designing Spaces, Building Futures',
      'hero_kicker', 'Architecture · SVIT Group',
      'hero_subhead', 'A COA-approved architecture school with design studios, workshops, and heritage & sustainability electives that shape thoughtful, responsible architects.',
      'established_year', 2005,
      'legacy_id', 'svit-coa'
    ),
    'published'
  );

END $$;

-- ============================================
-- 04. DEPARTMENTS
-- ============================================
-- Columns: college_id, name, slug, code, head_of_department_id, metadata, status

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

  -- SVIT Departments
  INSERT INTO departments (college_id, name, slug, code, metadata, status) VALUES
  (v_svit_id, 'Aeronautical Engineering', 'dept-svit-be-aeronautical', 'AE', '{"degree_type": "BE", "degree_level": "UG"}'::jsonb, 'published'),
  (v_svit_id, 'Mechanical Engineering', 'dept-svit-be-mechanical', 'ME', '{"degree_type": "BE", "degree_level": "UG"}'::jsonb, 'published'),
  (v_svit_id, 'Electrical Engineering', 'dept-svit-be-electrical', 'EE', '{"degree_type": "BE", "degree_level": "UG"}'::jsonb, 'published'),
  (v_svit_id, 'Civil Engineering', 'dept-svit-be-civil', 'CE', '{"degree_type": "BE", "degree_level": "UG"}'::jsonb, 'published'),
  (v_svit_id, 'Computer Engineering', 'dept-svit-be-computer', 'CSE', '{"degree_type": "BE", "degree_level": "UG"}'::jsonb, 'published'),
  (v_svit_id, 'Computer Science & Design', 'dept-svit-be-csd', 'CSD', '{"degree_type": "BE", "degree_level": "UG"}'::jsonb, 'published'),
  (v_svit_id, 'Information Technology', 'dept-svit-be-it', 'IT', '{"degree_type": "BE", "degree_level": "UG"}'::jsonb, 'published'),
  (v_svit_id, 'Electronics & Communication', 'dept-svit-be-ec', 'EC', '{"degree_type": "BE", "degree_level": "UG"}'::jsonb, 'published'),
  (v_svit_id, 'Computer Engineering (PG)', 'dept-svit-me-computer', 'ME-CS', '{"degree_type": "ME", "degree_level": "PG"}'::jsonb, 'published'),
  (v_svit_id, 'Civil Engineering (PG)', 'dept-svit-me-civil', 'ME-CE', '{"degree_type": "ME", "degree_level": "PG"}'::jsonb, 'published'),
  (v_svit_id, 'Computer Engineering (Diploma)', 'dept-svit-dip-computer', 'DIP-CS', '{"degree_type": "Diploma", "degree_level": "Diploma"}'::jsonb, 'published'),
  (v_svit_id, 'Information Technology (Diploma)', 'dept-svit-dip-it', 'DIP-IT', '{"degree_type": "Diploma", "degree_level": "Diploma"}'::jsonb, 'published'),
  (v_svit_id, 'Electrical Engineering (Diploma)', 'dept-svit-dip-electrical', 'DIP-EE', '{"degree_type": "Diploma", "degree_level": "Diploma"}'::jsonb, 'published'),
  (v_svit_id, 'Mechanical Engineering (Diploma)', 'dept-svit-dip-mechanical', 'DIP-ME', '{"degree_type": "Diploma", "degree_level": "Diploma"}'::jsonb, 'published'),
  (v_svit_id, 'Civil Engineering (Diploma)', 'dept-svit-dip-civil', 'DIP-CE', '{"degree_type": "Diploma", "degree_level": "Diploma"}'::jsonb, 'published'),
  (v_svit_id, 'Management Studies', 'dept-svit-mba', 'MBA', '{"degree_type": "MBA", "degree_level": "PG"}'::jsonb, 'published'),
  (v_svit_id, 'Computer Applications (PG)', 'dept-svit-mca', 'MCA', '{"degree_type": "MCA", "degree_level": "PG"}'::jsonb, 'published'),
  (v_svion_id, 'General Nursing', 'dept-svion-gn', 'GNM', '{"degree_level": "UG"}'::jsonb, 'published'),
  (v_coa_id, 'Architecture & Design', 'dept-coa-arch', 'ARCH', '{"degree_level": "UG"}'::jsonb, 'published'),
  (v_svica_id, 'Computer Applications', 'dept-svica-ca', 'CA', '{"degree_level": "UG"}'::jsonb, 'published');

END $$;

-- ============================================
-- 05. COURSES
-- ============================================
-- Columns: department_id, name, code, degree_level (enum), metadata, status

DO $$
DECLARE
  v_dept_be_aero uuid; v_dept_be_mech uuid; v_dept_be_elec uuid; v_dept_be_civil uuid;
  v_dept_be_comp uuid; v_dept_be_csd uuid; v_dept_be_it uuid; v_dept_be_ec uuid;
  v_dept_me_comp uuid; v_dept_me_civil uuid; v_dept_dip_comp uuid; v_dept_dip_it uuid;
  v_dept_dip_elec uuid; v_dept_dip_mech uuid; v_dept_dip_civil uuid; v_dept_mba uuid;
  v_dept_mca uuid; v_dept_svion_gn uuid; v_dept_coa_arch uuid; v_dept_svica_ca uuid;
BEGIN
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

  INSERT INTO courses (department_id, name, code, degree_level, metadata, status) VALUES
  (v_dept_be_aero, 'Bachelor of Engineering in Aeronautical Engineering', 'BE-AE', 'UG', '{"duration_years": 4, "intake": 60, "eligibility": "10+2 with PCM"}'::jsonb, 'published'),
  (v_dept_be_mech, 'Bachelor of Engineering in Mechanical Engineering', 'BE-ME', 'UG', '{"duration_years": 4, "intake": 120, "eligibility": "10+2 with PCM"}'::jsonb, 'published'),
  (v_dept_be_elec, 'Bachelor of Engineering in Electrical Engineering', 'BE-EE', 'UG', '{"duration_years": 4, "intake": 60, "eligibility": "10+2 with PCM"}'::jsonb, 'published'),
  (v_dept_be_civil, 'Bachelor of Engineering in Civil Engineering', 'BE-CE', 'UG', '{"duration_years": 4, "intake": 120, "eligibility": "10+2 with PCM"}'::jsonb, 'published'),
  (v_dept_be_comp, 'Bachelor of Engineering in Computer Engineering', 'BE-CSE', 'UG', '{"duration_years": 4, "intake": 180, "eligibility": "10+2 with PCM"}'::jsonb, 'published'),
  (v_dept_be_csd, 'Bachelor of Engineering in Computer Science & Design', 'BE-CSD', 'UG', '{"duration_years": 4, "intake": 60, "eligibility": "10+2 with PCM"}'::jsonb, 'published'),
  (v_dept_be_it, 'Bachelor of Engineering in Information Technology', 'BE-IT', 'UG', '{"duration_years": 4, "intake": 120, "eligibility": "10+2 with PCM"}'::jsonb, 'published'),
  (v_dept_be_ec, 'Bachelor of Engineering in Electronics & Communication', 'BE-EC', 'UG', '{"duration_years": 4, "intake": 60, "eligibility": "10+2 with PCM"}'::jsonb, 'published'),
  (v_dept_me_comp, 'Master of Engineering in Software', 'ME-SW', 'PG', '{"duration_years": 2, "intake": 18, "eligibility": "BE/B.Tech in CS/IT"}'::jsonb, 'published'),
  (v_dept_me_civil, 'Master of Engineering in Structure', 'ME-STRUCT', 'PG', '{"duration_years": 2, "intake": 18, "eligibility": "BE/B.Tech in Civil"}'::jsonb, 'published'),
  (v_dept_dip_comp, 'Diploma in Computer Engineering', 'DIP-CS', 'Diploma', '{"duration_years": 3, "intake": 60, "eligibility": "10th Standard"}'::jsonb, 'published'),
  (v_dept_dip_it, 'Diploma in Information Technology', 'DIP-IT', 'Diploma', '{"duration_years": 3, "intake": 60, "eligibility": "10th Standard"}'::jsonb, 'published'),
  (v_dept_dip_elec, 'Diploma in Electrical Engineering', 'DIP-EE', 'Diploma', '{"duration_years": 3, "intake": 60, "eligibility": "10th Standard"}'::jsonb, 'published'),
  (v_dept_dip_mech, 'Diploma in Mechanical Engineering', 'DIP-ME', 'Diploma', '{"duration_years": 3, "intake": 60, "eligibility": "10th Standard"}'::jsonb, 'published'),
  (v_dept_dip_civil, 'Diploma in Civil Engineering', 'DIP-CE', 'Diploma', '{"duration_years": 3, "intake": 60, "eligibility": "10th Standard"}'::jsonb, 'published'),
  (v_dept_mba, 'Master in Business Administration', 'MBA', 'PG', '{"duration_years": 2, "intake": 120, "eligibility": "Graduation with 50%"}'::jsonb, 'published'),
  (v_dept_mca, 'Master of Computer Applications', 'MCA', 'PG', '{"duration_years": 2, "intake": 60, "eligibility": "BCA/B.Sc IT/CS"}'::jsonb, 'published'),
  (v_dept_svion_gn, 'General Nursing & Midwifery', 'GNM', 'UG', '{"duration_years": 3, "intake": 60, "eligibility": "10+2 Science"}'::jsonb, 'published'),
  (v_dept_coa_arch, 'Bachelor of Architecture', 'B.Arch', 'UG', '{"duration_years": 5, "intake": 40, "eligibility": "10+2 with NATA"}'::jsonb, 'published'),
  (v_dept_coa_arch, 'Bachelor of Interior Design', 'BID', 'UG', '{"duration_years": 4, "intake": 30, "eligibility": "10+2 any stream"}'::jsonb, 'published'),
  (v_dept_coa_arch, 'Diploma in Architecture', 'DIP-ARCH', 'Diploma', '{"duration_years": 3, "intake": 30, "eligibility": "10th Standard"}'::jsonb, 'published'),
  (v_dept_svica_ca, 'Bachelor in Computer Applications', 'BCA', 'UG', '{"duration_years": 3, "intake": 60, "eligibility": "10+2 with Math"}'::jsonb, 'published'),
  (v_dept_svica_ca, 'Bachelor in Science, IT', 'BSc-IT', 'UG', '{"duration_years": 3, "intake": 60, "eligibility": "10+2 Science"}'::jsonb, 'published');

END $$;

-- ============================================
-- 06. COMMITTEES
-- ============================================
-- Columns: college_id, name, slug, metadata, status

DO $$
DECLARE
  v_svit_id uuid;
BEGIN
  SELECT id INTO v_svit_id FROM colleges WHERE slug = 'svit';

  INSERT INTO committees (college_id, name, slug, metadata, status) VALUES
  (v_svit_id, 'Women Development Cell', 'women-development-cell', '{"description": "Ensures safe working environment for female fraternity", "vision": "Assist women in achieving full potential", "mission": "Educate on gender issues and boost confidence", "key_activities": ["Social awareness", "Seminars and workshops", "Training programs", "Well-being promotion"]}'::jsonb, 'published'),
  (v_svit_id, 'Grievance Redressal Cell', 'grievance-redressal-cell', '{"description": "Enquires into grievances and suggests redressal", "key_activities": ["Fair redressal", "Responsive attitude", "Harmonious atmosphere", "Confidential resolution"]}'::jsonb, 'published'),
  (v_svit_id, 'Sexual Harassment Cell', 'sexual-harassment-cell', '{"description": "Provides healthy atmosphere per UGC guidelines", "key_activities": ["Promotes gender equality", "Addresses harassment", "Treats with dignity", "Maintains confidentiality"]}'::jsonb, 'published'),
  (v_svit_id, 'Anti-Ragging Committee', 'anti-ragging-committee', '{"description": "Ragging strictly forbidden, punishes guilty students", "key_activities": ["Awareness programs", "Campus vigil", "Stringent action", "Regular checks"]}'::jsonb, 'published'),
  (v_svit_id, 'Internal Quality Assurance Cell (IQAC)', 'iqac', '{"description": "Apex body overseeing quality assurance", "key_activities": ["Plans QA activities", "Academic excellence", "Quality circles", "Stakeholder feedback"]}'::jsonb, 'published');

END $$;

-- ============================================
-- 07. ACCREDITATIONS
-- ============================================
-- Columns: organization, value, received_year, expiry_date, metadata, status

INSERT INTO accreditations (organization, value, received_year, metadata, status) VALUES
('NBA (National Board of Accreditation)', 'Accredited', 2020, '{"description": "Hallmark of excellence in technical education", "type": "accreditation"}'::jsonb, 'published'),
('AICTE (All India Council for Technical Education)', 'Approved', 1997, '{"description": "Statutory body for technical education", "type": "approval", "document_url": "/document/aicte-approval.pdf"}'::jsonb, 'published'),
('GTU (Gujarat Technological University)', 'Affiliated', 1997, '{"description": "Affiliated for all engineering programs", "type": "affiliation"}'::jsonb, 'published'),
('NIRF (National Institutional Ranking Framework)', 'Active Participant', 2016, '{"description": "Demonstrates commitment to excellence", "type": "ranking", "document_url": "/img/NIRF2026.pdf"}'::jsonb, 'published');

-- ============================================
-- 08. PLACEMENT STATISTICS
-- ============================================
-- Columns: academic_year, total_students, placed_students, average_package, highest_package, recruiters_count, metadata, status

-- SVIT Placement Statistics
INSERT INTO placement_statistics (academic_year, total_students, placed_students, average_package, highest_package, recruiters_count, metadata, status) VALUES
('2020-2021', 185, 152, 430000, 4200000, 120, '{"college": "svit", "placement_percentage": 82.16}'::jsonb, 'published'),
('2021-2022', 197, 168, 450000, 4500000, 140, '{"college": "svit", "placement_percentage": 85.28}'::jsonb, 'published'),
('2022-2023', 201, 175, 435000, 3800000, 160, '{"college": "svit", "placement_percentage": 87.06}'::jsonb, 'published'),
('2023-2024', 204, 180, 425000, 3900000, 180, '{"college": "svit", "placement_percentage": 88.24}'::jsonb, 'published'),
('2024-2025', 214, 195, 430000, 4000000, 190, '{"college": "svit", "placement_percentage": 91.12}'::jsonb, 'published'),
('2025-2026', 226, 211, 430000, 4200000, 200, '{"college": "svit", "placement_percentage": 93.36}'::jsonb, 'published');

-- SVION Placement Statistics
INSERT INTO placement_statistics (academic_year, total_students, placed_students, average_package, highest_package, recruiters_count, metadata, status) VALUES
('2022-2023', 47, 40, 320000, 600000, 30, '{"college": "svion", "placement_percentage": 85.11}'::jsonb, 'published'),
('2023-2024', 55, 48, 325000, 620000, 35, '{"college": "svion", "placement_percentage": 87.27}'::jsonb, 'published'),
('2024-2025', 61, 55, 320000, 600000, 38, '{"college": "svion", "placement_percentage": 90.16}'::jsonb, 'published'),
('2025-2026', 67, 62, 320000, 600000, 40, '{"college": "svion", "placement_percentage": 92.54}'::jsonb, 'published');

-- SVICA Placement Statistics
INSERT INTO placement_statistics (academic_year, total_students, placed_students, average_package, highest_package, recruiters_count, metadata, status) VALUES
('2022-2023', 68, 55, 390000, 1200000, 45, '{"college": "svica", "placement_percentage": 80.88}'::jsonb, 'published'),
('2023-2024', 74, 62, 385000, 1150000, 50, '{"college": "svica", "placement_percentage": 83.78}'::jsonb, 'published'),
('2024-2025', 80, 70, 390000, 1180000, 55, '{"college": "svica", "placement_percentage": 87.50}'::jsonb, 'published'),
('2025-2026', 86, 78, 390000, 1200000, 60, '{"college": "svica", "placement_percentage": 90.70}'::jsonb, 'published');

-- COA Placement Statistics
INSERT INTO placement_statistics (academic_year, total_students, placed_students, average_package, highest_package, recruiters_count, metadata, status) VALUES
('2022-2023', 28, 22, 380000, 900000, 18, '{"college": "svit-coa", "placement_percentage": 78.57}'::jsonb, 'published'),
('2023-2024', 31, 26, 375000, 920000, 20, '{"college": "svit-coa", "placement_percentage": 83.87}'::jsonb, 'published'),
('2024-2025', 34, 30, 380000, 900000, 22, '{"college": "svit-coa", "placement_percentage": 88.24}'::jsonb, 'published'),
('2025-2026', 38, 34, 380000, 900000, 25, '{"college": "svit-coa", "placement_percentage": 89.47}'::jsonb, 'published');

-- ============================================
-- COMPLETE ✅
-- ============================================
-- Summary:
-- ✅ 1 Trust (NEST)
-- ✅ 1 Institute (SVIT Group)
-- ✅ 4 Colleges (SVIT, SVICA, SVION, COA)
-- ✅ 21 Departments
-- ✅ 23 Courses/Programs
-- ✅ 5 Committees
-- ✅ 4 Accreditations
-- ✅ 18 Placement Statistics
-- ============================================
