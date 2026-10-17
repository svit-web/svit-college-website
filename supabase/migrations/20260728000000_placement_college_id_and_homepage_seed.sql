-- =============================================================================
-- Migration: placement_statistics college_id + homepage_items seed
-- Date: 2026-07-28
-- =============================================================================

-- ── 1. Add college_id to placement_statistics ────────────────────────────────
-- Replaces the messy metadata.colleges JSONB nesting with a proper FK.
-- One row = one academic year + one college.

ALTER TABLE placement_statistics
  ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(id) ON DELETE SET NULL;

-- ── 2. Make recruiters.logo_url nullable ─────────────────────────────────────
-- Logos are uploaded to storage separately after row creation.

ALTER TABLE recruiters
  ALTER COLUMN logo_url DROP NOT NULL;

-- ── 3. Seed homepage_items ───────────────────────────────────────────────────
-- All items use scope_type = 'global'. The homepage reads these via
-- getGlobalHomepageItems() filtered by item_type.

-- Hero
INSERT INTO homepage_items (scope_type, item_type, eyebrow, title, title_accent, subtitle, link_label, link_href, secondary_link_label, secondary_link_href, sort_order, is_active, status, metadata)
VALUES (
  'global', 'hero',
  'Est. 2005 · Vasad, Gujarat',
  'Build Your Future.',
  'Shape The World.',
  'SVIT Vasad is a premier AICTE-approved institute offering programmes in engineering, computer applications, nursing and architecture — with 95%+ placements across 200+ recruiting partners.',
  'Apply Now', '/admissions/inquiry',
  'Explore Courses', '/courses',
  10, true, 'published', '{}'
);

-- Quick links (chips in hero)
INSERT INTO homepage_items (scope_type, item_type, title, link_href, sort_order, is_active, status, metadata) VALUES
  ('global', 'quick_link', 'Admissions 2026-27',   '/admissions/inquiry',  20, true, 'published', '{}'),
  ('global', 'quick_link', 'View Departments',      '/departments',         21, true, 'published', '{}'),
  ('global', 'quick_link', 'Campus Gallery',        '/gallery',             22, true, 'published', '{}'),
  ('global', 'quick_link', 'Placement Record',      '/placement',           23, true, 'published', '{}');

-- Stats strip
INSERT INTO homepage_items (scope_type, item_type, title, subtitle, sort_order, is_active, status, metadata) VALUES
  ('global', 'stat', '2000+',   'Alumni',              30, true, 'published', '{}'),
  ('global', 'stat', '95%+',    'Placement Rate',      31, true, 'published', '{}'),
  ('global', 'stat', '200+',    'Recruiting Partners', 32, true, 'published', '{}'),
  ('global', 'stat', '15 Acres','Campus',              33, true, 'published', '{}'),
  ('global', 'stat', '250+',    'Faculty',             34, true, 'published', '{}'),
  ('global', 'stat', '33+',     'Programmes',          35, true, 'published', '{}');

-- Why SVIT cards
INSERT INTO homepage_items (scope_type, item_type, title, body, icon_name, sort_order, is_active, status, metadata) VALUES
  ('global', 'why_choose', 'Industry-Ready Curriculum',
   'AICTE-approved programmes designed in consultation with industry leaders — practical, current and career-focused.',
   'Briefcase', 40, true, 'published', '{}'),
  ('global', 'why_choose', 'Expert Faculty',
   'Over 250 qualified professors and industry practitioners who bring real-world expertise into the classroom.',
   'GraduationCap', 41, true, 'published', '{}'),
  ('global', 'why_choose', 'Strong Placement Record',
   '95%+ placements every year with offers from 200+ companies including top-tier MNCs and core engineering firms.',
   'Award', 42, true, 'published', '{}'),
  ('global', 'why_choose', 'Modern Infrastructure',
   '15-acre campus with state-of-the-art labs, a well-stocked library, sports facilities and dedicated research centres.',
   'Building2', 43, true, 'published', '{}'),
  ('global', 'why_choose', 'Research & Innovation',
   'Active research centres and industry MOUs provide students and faculty with real project and publication opportunities.',
   'Lightbulb', 44, true, 'published', '{}'),
  ('global', 'why_choose', 'Holistic Development',
   'Student clubs, cultural events, hackathons and sports ensure well-rounded growth beyond the classroom.',
   'Users', 45, true, 'published', '{}');

-- Trust badges
INSERT INTO homepage_items (scope_type, item_type, title, sort_order, is_active, status, metadata) VALUES
  ('global', 'trust_badge', 'AICTE Approved',  50, true, 'published', '{}'),
  ('global', 'trust_badge', 'NBA Accredited',  51, true, 'published', '{}'),
  ('global', 'trust_badge', 'GTU Affiliated',  52, true, 'published', '{}'),
  ('global', 'trust_badge', 'ISO Certified',   53, true, 'published', '{}');

-- CTA banner promo
INSERT INTO homepage_items (scope_type, item_type, title, subtitle, link_label, link_href, secondary_link_label, secondary_link_href, sort_order, is_active, status, metadata)
VALUES (
  'global', 'promo_card',
  'Ready to Join SVIT?',
  'Applications are open for the academic year 2026-27. Take the first step towards your future.',
  'Apply Now', '/admissions/inquiry',
  'Contact Us', '/contact',
  60, true, 'published',
  '{"slot": "home_cta_banner"}'
);
