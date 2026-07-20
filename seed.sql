-- Seed script for populating test data into Supabase Cloud tables
-- Run this directly in the Supabase SQL Editor (https://supabase.com/dashboard/project/mzlvjgtsrepzxynntbtt/sql)

-- 1. Colleges
INSERT INTO public.colleges (slug, short_code, name, tagline, logo_url, sort_order) VALUES
('svit','SVIT','Sardar Vallabhbhai Patel Institute of Technology','Engineering Tomorrow''s Innovators','/__l5e/assets-v1/6b5fd3d4-843d-4072-8ec4-663e3fe9e57a/svit-logo.jpg',1),
('svica','SVICA','Sardar Vallabhbhai Patel Institute of Computer Applications','Shaping Careers in Computer Applications','/__l5e/assets-v1/3c28feb0-462e-48c1-8a9f-42234f5be279/svica-logo.jpg',2),
('svion','SVION','Sardar Vallabhbhai Patel Institute of Nursing','Nursing Excellence, Compassion in Care','/__l5e/assets-v1/a31711bd-5868-4f73-aa4f-cce55d6d1057/svion-logo.png',3),
('svit-coa','COA','College of Architecture','Designing Spaces, Building Futures','/__l5e/assets-v1/d3a378f3-5f40-476f-ba85-f2a98b40730e/coa-svit-logo.png',4)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  logo_url = EXCLUDED.logo_url;

-- 2. Recruiters
INSERT INTO public.recruiters (name, sort_order) VALUES
('TCS',1),('Infosys',2),('Wipro',3),('L&T',4),('Reliance',5),('Adani',6),
('Cognizant',7),('Accenture',8),('HCL',9),('Tech Mahindra',10),('Capgemini',11),('IBM',12)
ON CONFLICT DO NOTHING;

-- 3. Events
INSERT INTO public.events (title, tag, start_date, description, sort_order, status) VALUES
('Ananya 2026 Cultural Fest','Culture','2026-02-12','Three days of music, dance, drama and food across the campus greens.',1, 'published'),
('TechFest — National Symposium','Tech','2026-03-08','Hackathons, tech talks and workshops with industry leaders.',2, 'published'),
('Placement Drive — TCS, Infosys, Wipro','Placement','2026-01-20','Campus placement drive for 2026 graduating batch.',3, 'published'),
('Sportlon Annual Sports Meet','Sports','2025-11-25','Inter-department sports and athletics tournament.',4, 'published')
ON CONFLICT DO NOTHING;

-- 4. Homepage Items
INSERT INTO public.homepage_items (item_type, eyebrow, title, title_accent, subtitle, link_label, link_href, secondary_link_label, secondary_link_href, sort_order, is_active, status)
VALUES 
('hero','Est. 2005 · Vasad, Gujarat','Build Your Future.','Shape The World.',
'SVIT Vasad is a premier institute offering AICTE-approved programmes in engineering, management and applied sciences with 95%+ placement across 200+ recruiting partners.',
'Apply Now','/admissions/inquiry','Explore Courses','/courses',0, true, 'published'),
('stat','20+','Years of Excellence',NULL,NULL,NULL,NULL,NULL,NULL,1, true, 'published'),
('stat','5000+','Students',NULL,NULL,NULL,NULL,NULL,NULL,2, true, 'published'),
('stat','95%','Placement Record',NULL,NULL,NULL,NULL,NULL,NULL,3, true, 'published')
ON CONFLICT DO NOTHING;
