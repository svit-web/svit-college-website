-- ============================================
-- SVIT DATABASE SEEDING - FINAL CORRECTED VERSION
-- ============================================
-- Verified against actual Supabase schema from types.ts
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 01. TRUSTS
-- ============================================
-- Schema: name, slug, metadata, status, sort_order, logo_url, website_url

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
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  metadata = EXCLUDED.metadata,
  status = EXCLUDED.status,
  updated_at = now();

-- ============================================
-- 02. INSTITUTES
-- ============================================
-- Schema: trust_id, name, slug, metadata, status, sort_order, logo_url, website_url

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
)
ON CONFLICT (slug) DO UPDATE SET
  trust_id = EXCLUDED.trust_id,
  name = EXCLUDED.name,
  metadata = EXCLUDED.metadata,
  status = EXCLUDED.status,
  updated_at = now();

-- ============================================
-- 03. COLLEGES
-- ============================================
-- Schema: institute_id, slug, code, name, logo_url, sort_order, metadata, status, website_url

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
  )
  ON CONFLICT (slug) DO UPDATE SET
    institute_id = EXCLUDED.institute_id,
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    logo_url = EXCLUDED.logo_url,
    sort_order = EXCLUDED.sort_order,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now();

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
  )
  ON CONFLICT (slug) DO UPDATE SET
    institute_id = EXCLUDED.institute_id,
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    logo_url = EXCLUDED.logo_url,
    sort_order = EXCLUDED.sort_order,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now();

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
  )
  ON CONFLICT (slug) DO UPDATE SET
    institute_id = EXCLUDED.institute_id,
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    logo_url = EXCLUDED.logo_url,
    sort_order = EXCLUDED.sort_order,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now();

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
  )
  ON CONFLICT (slug) DO UPDATE SET
    institute_id = EXCLUDED.institute_id,
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    logo_url = EXCLUDED.logo_url,
    sort_order = EXCLUDED.sort_order,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now();

END $$;

-- ============================================
-- 04. DEPARTMENTS
-- ============================================
-- Schema: college_id, name, slug, code, metadata, status, head_of_department_id
-- NO degree_level column! Store in metadata

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
  (v_svit_id, 'Aeronautical Engineering', 'dept-svit-be-aeronautical', 'AE', '{"degree_type": "BE", "degree_level": "UG", "legacy_id": "dept-svit-be-aeronautical"}'::jsonb, 'published'),
  (v_svit_id, 'Mechanical Engineering', 'dept-svit-be-mechanical', 'ME', '{"degree_type": "BE", "degree_level": "UG", "legacy_id": "dept-svit-be-mechanical"}'::jsonb, 'published'),
  (v_svit_id, 'Electrical Engineering', 'dept-svit-be-electrical', 'EE', '{"degree_type": "BE", "degree_level": "UG", "legacy_id": "dept-svit-be-electrical"}'::jsonb, 'published'),
  (v_svit_id, 'Civil Engineering', 'dept-svit-be-civil', 'CE', '{"degree_type": "BE", "degree_level": "UG", "legacy_id": "dept-svit-be-civil"}'::jsonb, 'published'),
  (v_svit_id, 'Computer Engineering', 'dept-svit-be-computer', 'CSE', '{"degree_type": "BE", "degree_level": "UG", "legacy_id": "dept-svit-be-computer"}'::jsonb, 'published'),
  (v_svit_id, 'Computer Science & Design', 'dept-svit-be-csd', 'CSD', '{"degree_type": "BE", "degree_level": "UG", "legacy_id": "dept-svit-be-csd"}'::jsonb, 'published'),
  (v_svit_id, 'Information Technology', 'dept-svit-be-it', 'IT', '{"degree_type": "BE", "degree_level": "UG", "legacy_id": "dept-svit-be-it"}'::jsonb, 'published'),
  (v_svit_id, 'Electronics & Communication', 'dept-svit-be-ec', 'EC', '{"degree_type": "BE", "degree_level": "UG", "legacy_id": "dept-svit-be-ec"}'::jsonb, 'published'),
  (v_svit_id, 'Computer Engineering (PG)', 'dept-svit-me-computer', 'ME-CS', '{"degree_type": "ME", "degree_level": "PG", "legacy_id": "dept-svit-me-computer"}'::jsonb, 'published'),
  (v_svit_id, 'Civil Engineering (PG)', 'dept-svit-me-civil', 'ME-CE', '{"degree_type": "ME", "degree_level": "PG", "legacy_id": "dept-svit-me-civil"}'::jsonb, 'published'),
  (v_svit_id, 'Computer Engineering (Diploma)', 'dept-svit-dip-computer', 'DIP-CS', '{"degree_type": "Diploma", "degree_level": "Diploma", "legacy_id": "dept-svit-dip-computer"}'::jsonb, 'published'),
  (v_svit_id, 'Information Technology (Diploma)', 'dept-svit-dip-it', 'DIP-IT', '{"degree_type": "Diploma", "degree_level": "Diploma", "legacy_id": "dept-svit-dip-it"}'::jsonb, 'published'),
  (v_svit_id, 'Electrical Engineering (Diploma)', 'dept-svit-dip-electrical', 'DIP-EE', '{"degree_type": "Diploma", "degree_level": "Diploma", "legacy_id": "dept-svit-dip-electrical"}'::jsonb, 'published'),
  (v_svit_id, 'Mechanical Engineering (Diploma)', 'dept-svit-dip-mechanical', 'DIP-ME', '{"degree_type": "Diploma", "degree_level": "Diploma", "legacy_id": "dept-svit-dip-mechanical"}'::jsonb, 'published'),
  (v_svit_id, 'Civil Engineering (Diploma)', 'dept-svit-dip-civil', 'DIP-CE', '{"degree_type": "Diploma", "degree_level": "Diploma", "legacy_id": "dept-svit-dip-civil"}'::jsonb, 'published'),
  (v_svit_id, 'Management Studies', 'dept-svit-mba', 'MBA', '{"degree_type": "MBA", "degree_level": "PG", "legacy_id": "dept-svit-mba"}'::jsonb, 'published'),
  (v_svit_id, 'Computer Applications (PG)', 'dept-svit-mca', 'MCA', '{"degree_type": "MCA", "degree_level": "PG", "legacy_id": "dept-svit-mca"}'::jsonb, 'published'),
  (v_svion_id, 'General Nursing', 'dept-svion-gn', 'GNM', '{"degree_level": "UG", "legacy_id": "dept-svion-gn"}'::jsonb, 'published'),
  (v_coa_id, 'Architecture & Design', 'dept-coa-arch', 'ARCH', '{"degree_level": "UG", "legacy_id": "dept-coa-arch"}'::jsonb, 'published'),
  (v_svica_id, 'Computer Applications', 'dept-svica-ca', 'CA', '{"degree_level": "UG", "legacy_id": "dept-svica-ca"}'::jsonb, 'published')
  ON CONFLICT (slug) DO NOTHING;

END $$;

-- ============================================
-- 05. COURSES
-- ============================================
-- Schema: department_id, name, code, degree_level (enum), metadata, status
-- Note: Has degree_level column (enum), duration_years, intake_capacity, eligibility_criteria columns don't exist - use metadata

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
  (v_dept_be_aero, 'Bachelor of Engineering in Aeronautical Engineering', 'BE-AE', 'UG', '{"duration_years": 4, "intake_capacity": 60, "eligibility": "10+2 with PCM", "legacy_id": "prog-svit-be-aeronautical"}'::jsonb, 'published'),
  (v_dept_be_mech, 'Bachelor of Engineering in Mechanical Engineering', 'BE-ME', 'UG', '{"duration_years": 4, "intake_capacity": 120, "eligibility": "10+2 with PCM", "legacy_id": "prog-svit-be-mechanical"}'::jsonb, 'published'),
  (v_dept_be_elec, 'Bachelor of Engineering in Electrical Engineering', 'BE-EE', 'UG', '{"duration_years": 4, "intake_capacity": 60, "eligibility": "10+2 with PCM", "legacy_id": "prog-svit-be-electrical"}'::jsonb, 'published'),
  (v_dept_be_civil, 'Bachelor of Engineering in Civil Engineering', 'BE-CE', 'UG', '{"duration_years": 4, "intake_capacity": 120, "eligibility": "10+2 with PCM", "legacy_id": "prog-svit-be-civil"}'::jsonb, 'published'),
  (v_dept_be_comp, 'Bachelor of Engineering in Computer Engineering', 'BE-CSE', 'UG', '{"duration_years": 4, "intake_capacity": 180, "eligibility": "10+2 with PCM", "legacy_id": "prog-svit-be-computer"}'::jsonb, 'published'),
  (v_dept_be_csd, 'Bachelor of Engineering in Computer Science & Design', 'BE-CSD', 'UG', '{"duration_years": 4, "intake_capacity": 60, "eligibility": "10+2 with PCM", "legacy_id": "prog-svit-be-csd"}'::jsonb, 'published'),
  (v_dept_be_it, 'Bachelor of Engineering in Information Technology', 'BE-IT', 'UG', '{"duration_years": 4, "intake_capacity": 120, "eligibility": "10+2 with PCM", "legacy_id": "prog-svit-be-it"}'::jsonb, 'published'),
  (v_dept_be_ec, 'Bachelor of Engineering in Electronics & Communication', 'BE-EC', 'UG', '{"duration_years": 4, "intake_capacity": 60, "eligibility": "10+2 with PCM", "legacy_id": "prog-svit-be-ec"}'::jsonb, 'published'),
  (v_dept_me_comp, 'Master of Engineering in Software', 'ME-SW', 'PG', '{"duration_years": 2, "intake_capacity": 18, "eligibility": "BE/B.Tech in CS/IT", "legacy_id": "prog-svit-me-software"}'::jsonb, 'published'),
  (v_dept_me_civil, 'Master of Engineering in Structure', 'ME-STRUCT', 'PG', '{"duration_years": 2, "intake_capacity": 18, "eligibility": "BE/B.Tech in Civil", "legacy_id": "prog-svit-me-structure"}'::jsonb, 'published'),
  (v_dept_dip_comp, 'Diploma in Computer Engineering', 'DIP-CS', 'Diploma', '{"duration_years": 3, "intake_capacity": 60, "eligibility": "10th Standard", "legacy_id": "prog-svit-dip-computer"}'::jsonb, 'published'),
  (v_dept_dip_it, 'Diploma in Information Technology', 'DIP-IT', 'Diploma', '{"duration_years": 3, "intake_capacity": 60, "eligibility": "10th Standard", "legacy_id": "prog-svit-dip-it"}'::jsonb, 'published'),
  (v_dept_dip_elec, 'Diploma in Electrical Engineering', 'DIP-EE', 'Diploma', '{"duration_years": 3, "intake_capacity": 60, "eligibility": "10th Standard", "legacy_id": "prog-svit-dip-electrical"}'::jsonb, 'published'),
  (v_dept_dip_mech, 'Diploma in Mechanical Engineering', 'DIP-ME', 'Diploma', '{"duration_years": 3, "intake_capacity": 60, "eligibility": "10th Standard", "legacy_id": "prog-svit-dip-mechanical"}'::jsonb, 'published'),
  (v_dept_dip_civil, 'Diploma in Civil Engineering', 'DIP-CE', 'Diploma', '{"duration_years": 3, "intake_capacity": 60, "eligibility": "10th Standard", "legacy_id": "prog-svit-dip-civil"}'::jsonb, 'published'),
  (v_dept_mba, 'Master in Business Administration', 'MBA', 'PG', '{"duration_years": 2, "intake_capacity": 120, "eligibility": "Graduation with 50%", "legacy_id": "prog-svit-mba"}'::jsonb, 'published'),
  (v_dept_mca, 'Master of Computer Applications', 'MCA', 'PG', '{"duration_years": 2, "intake_capacity": 60, "eligibility": "BCA/B.Sc IT/CS", "legacy_id": "prog-svit-mca"}'::jsonb, 'published'),
  (v_dept_svion_gn, 'General Nursing & Midwifery', 'GNM', 'UG', '{"duration_years": 3, "intake_capacity": 60, "eligibility": "10+2 Science", "legacy_id": "prog-svion-gnm"}'::jsonb, 'published'),
  (v_dept_coa_arch, 'Bachelor of Architecture', 'B.Arch', 'UG', '{"duration_years": 5, "intake_capacity": 40, "eligibility": "10+2 with NATA", "legacy_id": "prog-coa-barch"}'::jsonb, 'published'),
  (v_dept_coa_arch, 'Bachelor of Interior Design', 'BID', 'UG', '{"duration_years": 4, "intake_capacity": 30, "eligibility": "10+2 any stream", "legacy_id": "prog-coa-bid"}'::jsonb, 'published'),
  (v_dept_coa_arch, 'Diploma in Architecture', 'DIP-ARCH', 'Diploma', '{"duration_years": 3, "intake_capacity": 30, "eligibility": "10th Standard", "legacy_id": "prog-coa-diparch"}'::jsonb, 'published'),
  (v_dept_svica_ca, 'Bachelor in Computer Applications', 'BCA', 'UG', '{"duration_years": 3, "intake_capacity": 60, "eligibility": "10+2 with Math", "legacy_id": "prog-svica-bca"}'::jsonb, 'published'),
  (v_dept_svica_ca, 'Bachelor in Science, IT', 'BSc-IT', 'UG', '{"duration_years": 3, "intake_capacity": 60, "eligibility": "10+2 Science", "legacy_id": "prog-svica-bsc-it"}'::jsonb, 'published');

END $$;

-- ============================================
-- 06. COMMITTEES
-- ============================================
-- Schema: college_id, name, slug, metadata, status
-- NO description, vision, mission columns! Store in metadata

DO $$
DECLARE
  v_svit_id uuid;
BEGIN
  SELECT id INTO v_svit_id FROM colleges WHERE slug = 'svit';

  INSERT INTO committees (college_id, name, slug, metadata, status) VALUES
  (
    v_svit_id,
    'Women Development Cell',
    'women-development-cell',
    jsonb_build_object(
      'description', 'Created to ensure a safe working environment for the female fraternity. Organizes programs on women empowerment.',
      'vision', 'To assist women in achieving full potential in education, career and personal life through academic and intellectual growth and personal empowerment.',
      'mission', 'To educate them on gender-related issues, showcase their talent, boost confidence, identify strength areas, and motivate them towards individuality.',
      'key_activities', jsonb_build_array(
        'Creates social awareness among female staff and girl students',
        'Organizes seminars and workshops',
        'Conducts training programs',
        'Promotes general well-being'
      )
    ),
    'published'
  ),
  (
    v_svit_id,
    'Grievance Redressal Cell',
    'grievance-redressal-cell',
    jsonb_build_object(
      'description', 'Functions to enquire into grievances and suggest final action at the institutional level for redressal.',
      'key_activities', jsonb_build_array(
        'Ensures fair and impartial redressal',
        'Develops responsive attitude',
        'Maintains harmonious atmosphere',
        'Resolves grievances with confidentiality'
      )
    ),
    'published'
  ),
  (
    v_svit_id,
    'Sexual Harassment Cell',
    'sexual-harassment-cell',
    jsonb_build_object(
      'description', 'Established per UGC, NAAC, and Supreme Court guidelines to provide a healthy atmosphere.',
      'key_activities', jsonb_build_array(
        'Promotes gender equality',
        'Addresses sexual harassment',
        'Treats complaints with dignity',
        'Maintains confidentiality'
      )
    ),
    'published'
  ),
  (
    v_svit_id,
    'Anti-Ragging Committee',
    'anti-ragging-committee',
    jsonb_build_object(
      'description', 'Ragging in any form is strictly forbidden. The committee punishes students found guilty as per UGC regulations.',
      'key_activities', jsonb_build_array(
        'Awareness programs',
        'Continuous campus vigil',
        'Stringent action against ragging',
        'Regular hostel and bus checks'
      )
    ),
    'published'
  ),
  (
    v_svit_id,
    'Internal Quality Assurance Cell (IQAC)',
    'iqac',
    jsonb_build_object(
      'description', 'Apex body overseeing the internal quality assurance system.',
      'key_activities', jsonb_build_array(
        'Plans and monitors QA activities',
        'Channelizes academic excellence',
        'Develops quality circles',
        'Collects stakeholder feedback'
      )
    ),
    'published'
  );

END $$;

-- ============================================
-- 07. ACCREDITATIONS
-- ============================================
-- Schema: organization, value, received_year, expiry_date, metadata, status

INSERT INTO accreditations (organization, value, received_year, metadata, status) VALUES
(
  'NBA (National Board of Accreditation)',
  'Accredited',
  2020,
  jsonb_build_object(
    'description', 'NBA accreditation is a hallmark of excellence in technical education.',
    'type', 'accreditation'
  ),
  'published'
),
(
  'AICTE (All India Council for Technical Education)',
  'Approved',
  1997,
  jsonb_build_object(
    'description', 'All programs approved by AICTE, the statutory body for technical education.',
    'type', 'approval',
    'document_url', '/document/aicte-approval.pdf'
  ),
  'published'
),
(
  'GTU (Gujarat Technological University)',
  'Affiliated',
  1997,
  jsonb_build_object(
    'description', 'Affiliated with GTU for all engineering and technical programs.',
    'type', 'affiliation'
  ),
  'published'
),
(
  'NIRF (National Institutional Ranking Framework)',
  'Active Participant',
  2016,
  jsonb_build_object(
    'description', 'Active participant demonstrating commitment to academic excellence.',
    'type', 'ranking',
    'document_url', '/img/NIRF2026.pdf'
  ),
  'published'
);

-- ============================================
-- 08. PLACEMENT STATISTICS
-- ============================================
-- Schema: academic_year, total_students, placed_students, average_package, highest_package, recruiters_count, metadata, status
-- NOTE: No college_id column - store college info in metadata

-- SVIT Placement Statistics
INSERT INTO placement_statistics (academic_year, total_students, placed_students, average_package, highest_package, recruiters_count, metadata, status) VALUES
('2020-2021', 185, 152, 430000, 4200000, 120, '{"college": "svit", "placement_percentage": 82.16, "median_package": 400000}'::jsonb, 'published'),
('2021-2022', 197, 168, 450000, 4500000, 140, '{"college": "svit", "placement_percentage": 85.28, "median_package": 420000}'::jsonb, 'published'),
('2022-2023', 201, 175, 435000, 3800000, 160, '{"college": "svit", "placement_percentage": 87.06, "median_package": 410000}'::jsonb, 'published'),
('2023-2024', 204, 180, 425000, 3900000, 180, '{"college": "svit", "placement_percentage": 88.24, "median_package": 400000}'::jsonb, 'published'),
('2024-2025', 214, 195, 430000, 4000000, 190, '{"college": "svit", "placement_percentage": 91.12, "median_package": 405000}'::jsonb, 'published'),
('2025-2026', 226, 211, 430000, 4200000, 200, '{"college": "svit", "placement_percentage": 93.36, "median_package": 410000}'::jsonb, 'published');

-- SVION Placement Statistics
INSERT INTO placement_statistics (academic_year, total_students, placed_students, average_package, highest_package, recruiters_count, metadata, status) VALUES
('2022-2023', 47, 40, 320000, 600000, 30, '{"college": "svion", "placement_percentage": 85.11, "median_package": 310000}'::jsonb, 'published'),
('2023-2024', 55, 48, 325000, 620000, 35, '{"college": "svion", "placement_percentage": 87.27, "median_package": 315000}'::jsonb, 'published'),
('2024-2025', 61, 55, 320000, 600000, 38, '{"college": "svion", "placement_percentage": 90.16, "median_package": 315000}'::jsonb, 'published'),
('2025-2026', 67, 62, 320000, 600000, 40, '{"college": "svion", "placement_percentage": 92.54, "median_package": 320000}'::jsonb, 'published');

-- SVICA Placement Statistics
INSERT INTO placement_statistics (academic_year, total_students, placed_students, average_package, highest_package, recruiters_count, metadata, status) VALUES
('2022-2023', 68, 55, 390000, 1200000, 45, '{"college": "svica", "placement_percentage": 80.88, "median_package": 370000}'::jsonb, 'published'),
('2023-2024', 74, 62, 385000, 1150000, 50, '{"college": "svica", "placement_percentage": 83.78, "median_package": 375000}'::jsonb, 'published'),
('2024-2025', 80, 70, 390000, 1180000, 55, '{"college": "svica", "placement_percentage": 87.50, "median_package": 380000}'::jsonb, 'published'),
('2025-2026', 86, 78, 390000, 1200000, 60, '{"college": "svica", "placement_percentage": 90.70, "median_package": 385000}'::jsonb, 'published');

-- COA Placement Statistics
INSERT INTO placement_statistics (academic_year, total_students, placed_students, average_package, highest_package, recruiters_count, metadata, status) VALUES
('2022-2023', 28, 22, 380000, 900000, 18, '{"college": "svit-coa", "placement_percentage": 78.57, "median_package": 365000}'::jsonb, 'published'),
('2023-2024', 31, 26, 375000, 920000, 20, '{"college": "svit-coa", "placement_percentage": 83.87, "median_package": 370000}'::jsonb, 'published'),
('2024-2025', 34, 30, 380000, 900000, 22, '{"college": "svit-coa", "placement_percentage": 88.24, "median_package": 375000}'::jsonb, 'published'),
('2025-2026', 38, 34, 380000, 900000, 25, '{"college": "svit-coa", "placement_percentage": 89.47, "median_package": 375000}'::jsonb, 'published');

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
-- ✅ 18 Placement Statistics (4 colleges × multiple years)
-- ============================================
