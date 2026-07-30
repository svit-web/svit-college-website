-- ============================================================
-- SVIT PLACEMENT — PROPER FK ARCHITECTURE
-- Run this in Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/agezrfclusigfqysbxwb/editor
-- ============================================================

-- STEP 1: Drop old broken table (if exists)
DROP TABLE IF EXISTS public.placed_students CASCADE;

-- STEP 2: Create placed_students with real FKs to colleges + departments
CREATE TABLE public.placed_students (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id    uuid        NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  department_id uuid        REFERENCES public.departments(id) ON DELETE SET NULL,
  student_name  text        NOT NULL,
  company_name  text        NOT NULL,
  photo_url     text,
  batch_year    text,
  package_lpa   numeric(5,2),
  status        text        NOT NULL DEFAULT 'published'
                            CHECK (status IN ('draft','published','archived')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX placed_students_college_id_idx    ON public.placed_students (college_id, status);
CREATE INDEX placed_students_department_id_idx ON public.placed_students (department_id);
CREATE INDEX placed_students_batch_year_idx    ON public.placed_students (batch_year DESC NULLS LAST);

ALTER TABLE public.placed_students ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.placed_students TO anon, authenticated;
GRANT ALL   ON public.placed_students TO service_role;
GRANT ALL   ON public.placed_students TO authenticated;

CREATE POLICY "Public read placed_students"
  ON public.placed_students FOR SELECT USING (status = 'published');

CREATE POLICY "Admin full access placed_students"
  ON public.placed_students FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER placed_students_updated_at
  BEFORE UPDATE ON public.placed_students
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- STEP 3: Seed sample placed students via FK join on college slug + dept name
INSERT INTO public.placed_students
  (college_id, department_id, student_name, company_name, batch_year, package_lpa, status)
SELECT
  c.id,
  d.id,
  s.student_name,
  s.company_name,
  s.batch_year,
  s.package_lpa,
  'published'
FROM (VALUES
  ('svit-degree','Computer Engineering',   'Raj Patel',    'Microsoft',        '2024', 18.5::numeric),
  ('svit-degree','Computer Engineering',   'Amit Sharma',  'Google',           '2024', 22.0::numeric),
  ('svit-degree','Information Technology', 'Sneha Reddy',  'Amazon',           '2024', 16.0::numeric),
  ('svit-degree','Information Technology', 'Rahul Gupta',  'Infosys',          '2024',  8.0::numeric),
  ('svit-degree','Computer Engineering',   'Priya Trivedi','Wipro',            '2023',  7.0::numeric),
  ('svit-degree','Computer Engineering',   'Karan Shah',   'Accenture',        '2023',  9.5::numeric),
  ('svit-degree','Information Technology', 'Deepa Nair',   'Cognizant',        '2023',  8.5::numeric),
  ('svit-degree','Mechanical Engineering', 'Vikram Joshi', 'L&T Infotech',     '2023', 10.0::numeric),
  ('svit-degree','Civil Engineering',      'Anita Desai',  'Tech Mahindra',    '2023',  9.0::numeric),
  ('svit-coa',   NULL,                     'Nisha Patel',  'Sthapati Studio',  '2024', NULL::numeric),
  ('svit-coa',   NULL,                     'Aryan Shah',   'HCP Design',       '2024', NULL::numeric),
  ('svit-coa',   NULL,                     'Riya Mehta',   'INCUBIS Architects','2023',NULL::numeric),
  ('svica',      NULL,                     'Dhruv Modi',   'Wipro',            '2024',  7.5::numeric),
  ('svica',      NULL,                     'Kriti Joshi',  'HCL',              '2024',  8.0::numeric),
  ('svica',      NULL,                     'Sonu Patel',   'Capgemini',        '2023',  7.0::numeric),
  ('svion',      NULL,                     'Meena Patel',  'Apollo Hospitals', '2024', NULL::numeric),
  ('svion',      NULL,                     'Sunita Rao',   'Fortis Healthcare','2024', NULL::numeric),
  ('svion',      NULL,                     'Divya Sharma', 'Medanta',          '2023', NULL::numeric)
) AS s(college_slug, dept_name, student_name, company_name, batch_year, package_lpa)
JOIN public.colleges c ON c.slug = s.college_slug
LEFT JOIN public.departments d
  ON d.college_id = c.id
  AND lower(trim(d.name)) = lower(trim(s.dept_name));

-- STEP 4: placement_cells columns
ALTER TABLE public.placement_cells
  ADD COLUMN IF NOT EXISTS hero_title                    text,
  ADD COLUMN IF NOT EXISTS hero_subtitle                 text,
  ADD COLUMN IF NOT EXISTS officer_photo_url             text,
  ADD COLUMN IF NOT EXISTS default_student_placeholder_url text;

-- STEP 5: recruiters college scoping
ALTER TABLE public.recruiters
  ADD COLUMN IF NOT EXISTS college_codes text[] DEFAULT NULL;

-- STEP 6: Remove test data
DELETE FROM public.colleges WHERE slug = 'abc123';

-- STEP 7: Seed placement_cells
INSERT INTO public.placement_cells (college_code, about_text, hero_title, hero_subtitle, officer_name, officer_designation, officer_phone, officer_email)
VALUES
  ('overview',  'The Central T&P Cell at SVIT Group facilitates placement across Engineering, Architecture, Applied Sciences and Nursing.','SVIT Group — Placements','Connecting talent with opportunity across all institutions','Group T&P Coordinator','Central Placement Coordinator','+91 2692 274760','placement@svitvasad.ac.in'),
  ('svit-degree','The T&P Cell at SVIT (Degree) runs career workshops, mock interviews and campus drives from MNCs and global tech leaders.','SVIT Degree — Placements','Engineering careers shaped by world-class industry partnerships','Mr. Nilesh Patel','Training & Placement Officer','+91 98765 43210','tpo.svit@svitvasad.ac.in'),
  ('svit-coa',  'COA Placement coordinates design internships and placements with leading architectural studios.','COA — Placements','Designing careers at leading architectural studios','Ar. Priya Shah','Architecture Placement Head','+91 98765 43211','tpo.coa@svitvasad.ac.in'),
  ('svica',     'SVICA Placement connects MCA & BCA students with IT companies, startups and analytics firms.','SVICA — Placements','Launching careers in technology and applied sciences','Mrs. Hetal Shah','Computer Applications T&P Head','+91 98765 43212','tpo.svica@svitvasad.ac.in'),
  ('svion',     'SVION Placement bridges nursing students with hospitals, research orgs and healthcare corporations.','SVION — Placements','Compassionate careers in healthcare and nursing','Ms. Anjali Sharma','Nursing Placement Coordinator','+91 98765 43213','tpo.svion@svitvasad.ac.in')
ON CONFLICT (college_code) DO UPDATE SET
  about_text=EXCLUDED.about_text,
  hero_title=COALESCE(placement_cells.hero_title,EXCLUDED.hero_title),
  hero_subtitle=COALESCE(placement_cells.hero_subtitle,EXCLUDED.hero_subtitle),
  officer_name=COALESCE(placement_cells.officer_name,EXCLUDED.officer_name),
  officer_designation=COALESCE(placement_cells.officer_designation,EXCLUDED.officer_designation),
  officer_phone=COALESCE(placement_cells.officer_phone,EXCLUDED.officer_phone),
  officer_email=COALESCE(placement_cells.officer_email,EXCLUDED.officer_email);

-- VERIFY
SELECT 'placed_students' AS tbl, COUNT(*) FROM public.placed_students
UNION ALL SELECT 'placement_cells', COUNT(*) FROM public.placement_cells;
