-- ============================================================
-- PHASE 0: Complete Supabase schema setup for Placement Admin
-- Run this entire script in Supabase Dashboard → SQL Editor
-- ============================================================

-- STEP 0A: Create placed_students table
CREATE TABLE IF NOT EXISTS public.placed_students (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  college_code  text          NOT NULL,
  student_name  text          NOT NULL,
  company_name  text          NOT NULL,
  photo_url     text,
  batch_year    text,
  package_lpa   numeric(5,2),
  status        public.content_status NOT NULL DEFAULT 'published',
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE public.placed_students ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.placed_students TO anon, authenticated;
GRANT ALL   ON public.placed_students TO service_role;
GRANT ALL   ON public.placed_students TO authenticated;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='placed_students' AND policyname='Public read placed_students') THEN
    CREATE POLICY "Public read placed_students" ON public.placed_students FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='placed_students' AND policyname='Admin write placed_students') THEN
    CREATE POLICY "Admin write placed_students" ON public.placed_students FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_placed_students_updated_at
  BEFORE UPDATE ON public.placed_students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- STEP 0B: Remove abc123 test college
DELETE FROM public.colleges WHERE slug = 'abc123';


-- STEP 0C: Add missing columns to placement_cells
ALTER TABLE public.placement_cells
  ADD COLUMN IF NOT EXISTS hero_title                   text,
  ADD COLUMN IF NOT EXISTS hero_subtitle                text,
  ADD COLUMN IF NOT EXISTS hero_image_url               text,
  ADD COLUMN IF NOT EXISTS officer_photo_url            text,
  ADD COLUMN IF NOT EXISTS default_student_placeholder_url text;


-- STEP 0D: Seed placement_cells with distinct content per college
INSERT INTO public.placement_cells (college_code, about_text, officer_name, officer_designation, officer_phone, officer_email, hero_title, hero_subtitle)
VALUES
  ('overview',
   'The Central Training & Placement (T&P) Cell at SVIT Group of Institutions facilitates student growth and placement opportunities across all colleges, including Engineering, Architecture, Nursing, and Applied Sciences.',
   'Group T&P Coordinator', 'Central Placement Coordinator', '+91 2692 274760', 'placement@svitvasad.ac.in',
   'SVIT Group — Placements', 'Connecting talent with opportunity across all institutions'),
  ('svit-degree',
   'The T&P Cell at SVIT (Degree) is dedicated to providing students with career counseling, skill development workshops, mock interviews, and campus recruitment drives from tier-1 MNCs and global technology leaders.',
   'Mr. Nilesh Patel', 'Training & Placement Officer', '+91 98765 43210', 'tpo.svit@svitvasad.ac.in',
   'SVIT Degree — Placements', 'Engineering careers shaped by world-class industry partnerships'),
  ('svit-coa',
   'The Placement division at COA helps coordinate design internships, portfolio workshops, architectural firm presentations, and professional placement with leading national and international studios.',
   'Ar. Priya Shah', 'Architecture Placement Head', '+91 98765 43211', 'tpo.coa@svitvasad.ac.in',
   'COA — Placements', 'Designing careers at leading architectural studios'),
  ('svica',
   'The Placement cell at SVICA focuses on linking MCA & BCA students with IT companies, software houses, startup ecosystems, and analytics firms.',
   'Mrs. Hetal Shah', 'Computer Applications T&P Head', '+91 98765 43212', 'tpo.svica@svitvasad.ac.in',
   'SVICA — Placements', 'Launching careers in technology and applied sciences'),
  ('svion',
   'The Placement cell at SVION bridges clinical training with job opportunities in leading multi-speciality hospitals, research organizations, public health groups, and medical healthcare corporations.',
   'Ms. Anjali Sharma', 'Nursing Placement Coordinator', '+91 98765 43213', 'tpo.svion@svitvasad.ac.in',
   'SVION — Placements', 'Compassionate careers in healthcare and nursing')
ON CONFLICT (college_code) DO UPDATE SET
  about_text          = EXCLUDED.about_text,
  officer_name        = EXCLUDED.officer_name,
  officer_designation = EXCLUDED.officer_designation,
  officer_phone       = EXCLUDED.officer_phone,
  officer_email       = EXCLUDED.officer_email,
  hero_title          = EXCLUDED.hero_title,
  hero_subtitle       = EXCLUDED.hero_subtitle;


-- STEP 0E: Seed sample placed students across all colleges
INSERT INTO public.placed_students (college_code, student_name, company_name, batch_year, package_lpa, status)
VALUES
  ('svit-degree', 'Raj Patel',       'Microsoft',  '2024', 18.5, 'published'),
  ('svit-degree', 'Sneha Reddy',     'Amazon',     '2024', 16.0, 'published'),
  ('svit-degree', 'Amit Sharma',     'Google',     '2024', 22.0, 'published'),
  ('svit-degree', 'Pooja Mehta',     'TCS',        '2024',  7.5, 'published'),
  ('svit-degree', 'Rahul Gupta',     'Infosys',    '2024',  8.0, 'published'),
  ('svit-degree', 'Priya Trivedi',   'Wipro',      '2023',  7.0, 'published'),
  ('svit-degree', 'Karan Shah',      'Accenture',  '2023',  9.5, 'published'),
  ('svit-degree', 'Deepa Nair',      'Cognizant',  '2023',  8.5, 'published'),
  ('svit-degree', 'Vikram Joshi',    'L&T Infotech','2023',10.0, 'published'),
  ('svit-degree', 'Anita Desai',     'Tech Mahindra','2023', 9.0,'published'),
  ('svit-coa',    'Nisha Patel',     'Sthapati Studio',   '2024', NULL, 'published'),
  ('svit-coa',    'Aryan Shah',      'HCP Design',         '2024', NULL, 'published'),
  ('svit-coa',    'Riya Mehta',      'INCUBIS Architects', '2023', NULL, 'published'),
  ('svica',       'Dhruv Modi',      'Wipro',      '2024',  7.5, 'published'),
  ('svica',       'Kriti Joshi',     'HCL',        '2024',  8.0, 'published'),
  ('svica',       'Sonu Patel',      'Capgemini',  '2023',  7.0, 'published'),
  ('svion',       'Meena Patel',     'Apollo Hospitals', '2024', NULL, 'published'),
  ('svion',       'Sunita Rao',      'Fortis Healthcare', '2024', NULL, 'published'),
  ('svion',       'Divya Sharma',    'Medanta',          '2023', NULL, 'published')
ON CONFLICT DO NOTHING;


-- STEP 0F: Add college_codes scoping column to recruiters
ALTER TABLE public.recruiters
  ADD COLUMN IF NOT EXISTS college_codes text[] DEFAULT ARRAY['overview'];

-- STEP 0G: Verify tables
SELECT 'placed_students columns:' as info, column_name
FROM information_schema.columns
WHERE table_name = 'placed_students'
UNION ALL
SELECT 'placement_cells columns:', column_name
FROM information_schema.columns
WHERE table_name = 'placement_cells'
ORDER BY 1, 2;
