-- Seed colleges table with complete data
-- Run order: 02 (depends on trusts/institutes)
-- Data source: src/data/colleges.ts

-- ============================================
-- COLLEGES
-- ============================================
-- Note: Updating existing records and ensuring all 4 colleges are present

-- First, let's ensure we have the institute_id to reference
DO $$
DECLARE
  v_institute_id uuid;
BEGIN
  SELECT id INTO v_institute_id FROM institutes WHERE slug = 'svit-group-institutions';

  -- SVIT - Main Engineering College
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
    logo_url = EXCLUDED.logo_url,
    established_year = EXCLUDED.established_year,
    sort_order = EXCLUDED.sort_order,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now();

  -- SVICA - Computer Applications
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
    logo_url = EXCLUDED.logo_url,
    established_year = EXCLUDED.established_year,
    sort_order = EXCLUDED.sort_order,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now();

  -- SVION - Nursing
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
    logo_url = EXCLUDED.logo_url,
    established_year = EXCLUDED.established_year,
    sort_order = EXCLUDED.sort_order,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now();

  -- COA - Architecture
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
    logo_url = EXCLUDED.logo_url,
    established_year = EXCLUDED.established_year,
    sort_order = EXCLUDED.sort_order,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    updated_at = now();

END $$;
