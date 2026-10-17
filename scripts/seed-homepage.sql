-- Seed homepage_items with static data from src/data/site.ts
-- Run this in Supabase SQL Editor

-- Clear existing global homepage items (optional)
-- DELETE FROM homepage_items WHERE scope_type = 'global';

-- 1. Hero
INSERT INTO homepage_items (
  item_type, scope_type, eyebrow, title, title_accent, subtitle,
  image_url, link_label, link_href, secondary_link_label, secondary_link_href,
  is_active, status, sort_order
) VALUES (
  'hero', 'global',
  'Est. 2005 · Vasad, Gujarat',
  'Build Your Future.',
  'Shape The World.',
  'SVIT Vasad is a premier institute offering AICTE-approved programmes in engineering, management and applied sciences with 95%+ placement across 200+ recruiting partners.',
  '/assets/campus-hero.jpg',
  'Apply Now',
  '/admissions/inquiry',
  'Explore Courses',
  '/courses',
  true, 'published', 0
);

-- 2. Quick Links
INSERT INTO homepage_items (item_type, scope_type, title, link_href, is_active, status, sort_order) VALUES
  ('quick_link', 'global', 'Engineering', '/courses/engineering', true, 'published', 0),
  ('quick_link', 'global', 'Architecture', '/courses/architecture', true, 'published', 1),
  ('quick_link', 'global', 'MBA', '/courses/mba', true, 'published', 2),
  ('quick_link', 'global', 'MCA', '/courses/mca', true, 'published', 3),
  ('quick_link', 'global', 'B.Sc', '/courses/bsc', true, 'published', 4),
  ('quick_link', 'global', 'BBA', '/courses/bba', true, 'published', 5),
  ('quick_link', 'global', 'Diploma', '/courses/diploma', true, 'published', 6);

-- 3. Hero Highlight Cards
INSERT INTO homepage_items (item_type, scope_type, eyebrow, title, subtitle, image_url, is_active, status, sort_order) VALUES
  ('highlight_card', 'global', 'Campus', '15+ Acre Green Campus', 'Modern academic blocks & landscaped grounds', 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80', true, 'published', 0),
  ('highlight_card', 'global', 'Facilities', 'Advanced Labs & Workshops', 'Industry-grade equipment across departments', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80', true, 'published', 1),
  ('highlight_card', 'global', 'Learning', 'Digital Library', '50,000+ books and online journals', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80', true, 'published', 2),
  ('highlight_card', 'global', 'Student Life', 'Events, Clubs & Sports', 'A vibrant campus culture', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80', true, 'published', 3);

-- 4. Stats
INSERT INTO homepage_items (item_type, scope_type, title, subtitle, is_active, status, sort_order) VALUES
  ('stat', 'global', '20+', 'Years of Excellence', true, 'published', 0),
  ('stat', 'global', '5000+', 'Students', true, 'published', 1),
  ('stat', 'global', '100+', 'Faculty Members', true, 'published', 2),
  ('stat', 'global', '15+', 'Acre Green Campus', true, 'published', 3),
  ('stat', 'global', '95%', 'Placement Record', true, 'published', 4),
  ('stat', 'global', '200+', 'Recruiting Partners', true, 'published', 5);

-- 5. Why Choose Cards
INSERT INTO homepage_items (item_type, scope_type, title, body, icon_name, is_active, status, sort_order) VALUES
  ('why_choose', 'global', 'AICTE-approved programmes', 'Nationally recognised curriculum aligned with industry standards.', 'BadgeCheck', true, 'published', 0),
  ('why_choose', 'global', 'Experienced faculty', '100+ senior mentors with academic and industry backgrounds.', 'GraduationCap', true, 'published', 1),
  ('why_choose', 'global', 'Strong placement record', '95%+ placement across engineering, MBA and MCA programmes.', 'Briefcase', true, 'published', 2),
  ('why_choose', 'global', 'Modern infrastructure', 'Well-equipped labs, digital library and innovation centres.', 'Building2', true, 'published', 3),
  ('why_choose', 'global', 'Vibrant campus life', '50+ clubs, sports and cultural fests all year round.', 'Users', true, 'published', 4),
  ('why_choose', 'global', 'Research & innovation', 'Funded projects, patents and startup incubation support.', 'Lightbulb', true, 'published', 5);

-- 6. Trust Badges
INSERT INTO homepage_items (item_type, scope_type, title, is_active, status, sort_order) VALUES
  ('trust_badge', 'global', 'AICTE Approved', true, 'published', 0),
  ('trust_badge', 'global', 'NAAC Accredited', true, 'published', 1),
  ('trust_badge', 'global', '5000+ Students', true, 'published', 2),
  ('trust_badge', 'global', '15+ Acre Campus', true, 'published', 3);

-- 7. Admissions Promo Card
INSERT INTO homepage_items (
  item_type, scope_type, eyebrow, title, body, link_label, link_href,
  is_active, status, sort_order, metadata
) VALUES (
  'promo_card', 'global',
  'Admissions Open',
  'Your future starts here',
  'Join 5000+ students building careers with SVIT. Merit-based scholarships, hostel accommodation, and dedicated placement support.',
  'View Admissions',
  '/admissions',
  true, 'published', 0,
  '{"slot": "home_admissions"}'::jsonb
);

-- Verify the data
SELECT item_type, count(*)
FROM homepage_items
WHERE scope_type = 'global'
GROUP BY item_type
ORDER BY item_type;
