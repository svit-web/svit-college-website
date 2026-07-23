-- Seed trusts and institutes tables
-- Run order: 01 (foundational)
-- Data source: src/data/academics.ts

-- ============================================
-- TRUSTS
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
);

-- ============================================
-- INSTITUTES
-- ============================================
-- Note: Institutes table appears to be for grouping colleges under a trust
-- For SVIT Group, all colleges are under one institute umbrella
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
);
