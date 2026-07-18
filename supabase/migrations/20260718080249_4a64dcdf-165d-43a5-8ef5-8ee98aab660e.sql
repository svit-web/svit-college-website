
-- Enums
CREATE TYPE public.scope_level AS ENUM ('global','trust','institute','college','department');
CREATE TYPE public.content_status AS ENUM ('draft','published','archived');

-- Unified homepage content
CREATE TABLE public.homepage_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type public.scope_level NOT NULL DEFAULT 'global',
  department_id uuid,
  item_type text NOT NULL,
  eyebrow text,
  title text NOT NULL,
  title_accent text,
  subtitle text,
  body text,
  image_url text,
  icon_name text,
  link_href text,
  link_label text,
  secondary_link_href text,
  secondary_link_label text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  status public.content_status NOT NULL DEFAULT 'published',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX homepage_items_lookup_idx ON public.homepage_items (scope_type, item_type, is_active, sort_order);
GRANT SELECT ON public.homepage_items TO anon, authenticated;
GRANT ALL ON public.homepage_items TO service_role;
ALTER TABLE public.homepage_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active published homepage items"
  ON public.homepage_items FOR SELECT
  USING (is_active = true AND status = 'published');

-- Colleges
CREATE TABLE public.colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  short_code text NOT NULL,
  name text NOT NULL,
  tagline text,
  logo_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.colleges TO anon, authenticated;
GRANT ALL ON public.colleges TO service_role;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read colleges" ON public.colleges FOR SELECT USING (true);

-- Recruiters
CREATE TABLE public.recruiters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.recruiters TO anon, authenticated;
GRANT ALL ON public.recruiters TO service_role;
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read recruiters" ON public.recruiters FOR SELECT USING (true);

-- Events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  tag text,
  start_date date,
  description text,
  registration_link text,
  status public.content_status NOT NULL DEFAULT 'published',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published events"
  ON public.events FOR SELECT USING (status = 'published');

-- Posts
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text,
  featured_image_url text,
  published_at timestamptz,
  status public.content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.posts TO anon, authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published posts"
  ON public.posts FOR SELECT USING (status = 'published');

-- ============ SEED DATA ============

-- Colleges
INSERT INTO public.colleges (slug, short_code, name, tagline, logo_url, sort_order) VALUES
('svit','SVIT','Sardar Vallabhbhai Patel Institute of Technology','Engineering Tomorrow''s Innovators','/__l5e/assets-v1/6b5fd3d4-843d-4072-8ec4-663e3fe9e57a/svit-logo.jpg',1),
('svica','SVICA','Sardar Vallabhbhai Patel Institute of Computer Applications','Shaping Careers in Computer Applications','/__l5e/assets-v1/3c28feb0-462e-48c1-8a9f-42234f5be279/svica-logo.jpg',2),
('svion','SVION','Sardar Vallabhbhai Patel Institute of Nursing','Nursing Excellence, Compassion in Care','/__l5e/assets-v1/a31711bd-5868-4f73-aa4f-cce55d6d1057/svion-logo.png',3),
('svit-coa','COA','College of Architecture','Designing Spaces, Building Futures','/__l5e/assets-v1/d3a378f3-5f40-476f-ba85-f2a98b40730e/coa-svit-logo.png',4);

-- Recruiters
INSERT INTO public.recruiters (name, sort_order) VALUES
('TCS',1),('Infosys',2),('Wipro',3),('L&T',4),('Reliance',5),('Adani',6),
('Cognizant',7),('Accenture',8),('HCL',9),('Tech Mahindra',10),('Capgemini',11),('IBM',12);

-- Events
INSERT INTO public.events (title, tag, start_date, description, sort_order) VALUES
('Ananya 2026 Cultural Fest','Culture','2026-02-12','Three days of music, dance, drama and food across the campus greens.',1),
('TechFest — National Symposium','Tech','2026-03-08','Hackathons, tech talks and workshops with industry leaders.',2),
('Placement Drive — TCS, Infosys, Wipro','Placement','2026-01-20','Campus placement drive for 2026 graduating batch.',3),
('Sportlon Annual Sports Meet','Sports','2025-11-25','Inter-department sports and athletics tournament.',4);

-- Homepage: HERO
INSERT INTO public.homepage_items (item_type, eyebrow, title, title_accent, subtitle, image_url, link_label, link_href, secondary_link_label, secondary_link_href, sort_order)
VALUES ('hero','Est. 2005 · Vasad, Gujarat','Build Your Future.','Shape The World.',
'SVIT Vasad is a premier institute offering AICTE-approved programmes in engineering, management and applied sciences with 95%+ placement across 200+ recruiting partners.',
NULL,'Apply Now','/admissions/inquiry','Explore Courses','/courses',0);

-- Quick links
INSERT INTO public.homepage_items (item_type, title, link_href, sort_order) VALUES
('quick_link','Engineering','/courses/engineering',1),
('quick_link','Architecture','/courses/architecture',2),
('quick_link','MBA','/courses/mba',3),
('quick_link','MCA','/courses/mca',4),
('quick_link','B.Sc','/courses/bsc',5),
('quick_link','BBA','/courses/bba',6),
('quick_link','Diploma','/courses/diploma',7);

-- Highlight cards
INSERT INTO public.homepage_items (item_type, eyebrow, title, subtitle, image_url, sort_order) VALUES
('highlight_card','Campus','15+ Acre Green Campus','Modern academic blocks & landscaped grounds','https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',1),
('highlight_card','Facilities','Advanced Labs & Workshops','Industry-grade equipment across departments','https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',2),
('highlight_card','Learning','Digital Library','50,000+ books and online journals','https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',3),
('highlight_card','Student Life','Events, Clubs & Sports','A vibrant campus culture','https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',4);

-- Carousel slides
INSERT INTO public.homepage_items (item_type, eyebrow, title, subtitle, link_label, link_href, sort_order) VALUES
('carousel_slide','Admissions 2026-27','Where Excellence Meets Innovation','AICTE-approved programmes across engineering, management and applied sciences.','Apply Now','/admissions/inquiry',1),
('carousel_slide','15+ Acre Green Campus','Learn in an Inspiring Environment','State-of-the-art labs, digital library, sports facilities and comfortable hostels.','Explore Campus','/campus',2),
('carousel_slide','95% Placement Record','Careers That Take Off','200+ recruiting partners including TCS, Infosys, L&T, Adani and Reliance.','See Placements','/placement/svit',3);

-- Stats
INSERT INTO public.homepage_items (item_type, title, subtitle, sort_order) VALUES
('stat','20+','Years of Excellence',1),
('stat','5000+','Students',2),
('stat','100+','Faculty Members',3),
('stat','15+','Acre Green Campus',4),
('stat','95%','Placement Record',5),
('stat','200+','Recruiting Partners',6);

-- Why choose
INSERT INTO public.homepage_items (item_type, icon_name, title, body, sort_order) VALUES
('why_choose','BadgeCheck','AICTE-approved programmes','Nationally recognised curriculum aligned with industry standards.',1),
('why_choose','GraduationCap','Experienced faculty','100+ senior mentors with academic and industry backgrounds.',2),
('why_choose','Briefcase','Strong placement record','95%+ placement across engineering, MBA and MCA programmes.',3),
('why_choose','Building2','Modern infrastructure','Well-equipped labs, digital library and innovation centres.',4),
('why_choose','Users','Vibrant campus life','50+ clubs, sports and cultural fests all year round.',5),
('why_choose','Lightbulb','Research & innovation','Funded projects, patents and startup incubation support.',6);

-- Trust badges
INSERT INTO public.homepage_items (item_type, icon_name, title, sort_order) VALUES
('trust_badge','BadgeCheck','AICTE Approved',1),
('trust_badge','BadgeCheck','NAAC Accredited',2),
('trust_badge','BadgeCheck','5000+ Students',3),
('trust_badge','BadgeCheck','15+ Acre Campus',4);

-- Promo cards (admissions + CTA banner)
INSERT INTO public.homepage_items (item_type, eyebrow, title, body, link_label, link_href, secondary_link_label, secondary_link_href, metadata, sort_order) VALUES
('promo_card','Admissions Open','Your future starts here',
'Join 5000+ students building careers with SVIT. Merit-based scholarships, hostel accommodation, and dedicated placement support.',
'View Admissions','/admissions',NULL,NULL,'{"slot":"home_admissions"}'::jsonb,1),
('promo_card','Admissions Open 2026-27','Begin your journey at SVIT Vasad',
'Join 5000+ students shaping careers in engineering, management and applied sciences. Applications now open across all programmes.',
'Apply Now','/admissions/inquiry','Download Brochure','/downloads','{"slot":"home_cta_banner"}'::jsonb,2);
