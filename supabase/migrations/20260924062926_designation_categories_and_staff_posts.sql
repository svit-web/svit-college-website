-- Compact the faculty designation picker and split "posts" (HOD, Principal,
-- Dean…) out of designations.
--
-- * designations.category groups the picker (teaching / technical /
--   administrative / support); support titles are not offered for faculty.
-- * designations.is_selectable = false hides duplicate, typo and combined
--   "rank & post" titles from the picker. Existing assignments that use them
--   are untouched and still render on the public site.
-- * staff_posts is an admin-editable list of posts. An assignment carries
--   any number of them in post_ids; posts flagged is_department_head (HOD,
--   I/C HOD) may be held by only one person per department.

-- ── designations: category + picker visibility ──────────────────────────

CREATE TYPE public.designation_category AS ENUM ('teaching', 'technical', 'administrative', 'support');

ALTER TABLE public.designations
  ADD COLUMN category public.designation_category,
  ADD COLUMN is_selectable boolean NOT NULL DEFAULT true;

-- Clean replacement for the two inconsistent PE director titles.
INSERT INTO public.designations (title, status)
SELECT 'Director of Physical Education', 'published'
WHERE NOT EXISTS (SELECT 1 FROM public.designations WHERE title = 'Director of Physical Education');

UPDATE public.designations SET category = 'teaching' WHERE title IN (
  'Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Teaching Assistant',
  'Tutor', 'Nursing Tutor', 'Director of Physical Education'
);

UPDATE public.designations SET category = 'technical' WHERE title IN (
  'Senior Lab Technician', 'Lab Technician', 'Junior Lab Technician', 'Lab Attendant',
  'Workshop Attendant', 'Junior Draftsman', 'Chemist', 'Chemical Engineer', 'Computer Operator',
  'Cctv Operator', 'Artist', 'Potter'
);

UPDATE public.designations SET category = 'administrative' WHERE title IN (
  'Office Superintendent', 'Accountant', 'Senior Clerk', 'Junior Clerk', 'Admission Officer',
  'Purchase Officer', 'PA to Principal', 'PA to Chairman', 'Officer On Special Duty', 'Librarian',
  'Senior Library Assistant', 'Library Attendant', 'Physician', 'Asst. Deputy Engineer',
  'Maintenance Supervisor'
);

UPDATE public.designations SET category = 'support' WHERE title IN (
  'Hamal', 'Sweeper', 'Porter', 'Driver', 'Electrician', 'Wireman', 'Junior Wireman', 'Plumber',
  'Gardener', 'Mechanic (C Grade)', 'Maintenance Attendant', 'Maintenance Helper',
  'Maintenance Worker', 'Telephone & Xerox Attendant'
);

-- Duplicates, typos, test data, qualifications and combined rank+post titles.
UPDATE public.designations SET is_selectable = false WHERE category IS NULL;

-- ── staff_posts ─────────────────────────────────────────────────────────

CREATE TABLE public.staff_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  is_department_head boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'published',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX staff_posts_title_live_key ON public.staff_posts (lower(title)) WHERE deleted_at IS NULL;

CREATE TRIGGER update_staff_posts_modtime
  BEFORE UPDATE ON public.staff_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.staff_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read staff_posts" ON public.staff_posts
  FOR SELECT USING (true);

CREATE POLICY "Global write staff_posts" ON public.staff_posts
  FOR ALL TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());

INSERT INTO public.staff_posts (title, is_department_head, sort_order) VALUES
  ('HOD', true, 10),
  ('I/C HOD', true, 20),
  ('Principal', false, 30),
  ('I/C Principal', false, 40),
  ('Dean (R&D)', false, 50),
  ('I/C Administrative Officer', false, 60);

-- ── assignments: posts held ─────────────────────────────────────────────

ALTER TABLE public.staff_department_assignments
  ADD COLUMN post_ids uuid[] NOT NULL DEFAULT '{}';

-- One live department-head post per department. SECURITY DEFINER so the
-- check sees every assignment in the department, not just the rows the
-- acting admin's RLS scope lets them read.
CREATE OR REPLACE FUNCTION public.enforce_single_department_head()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  head_ids uuid[];
  holder text;
BEGIN
  IF NEW.deleted_at IS NOT NULL OR cardinality(NEW.post_ids) = 0 THEN
    RETURN NEW;
  END IF;

  SELECT coalesce(array_agg(id), '{}') INTO head_ids
  FROM staff_posts
  WHERE is_department_head AND deleted_at IS NULL;

  IF NOT (NEW.post_ids && head_ids) THEN
    RETURN NEW;
  END IF;

  SELECT trim(concat_ws(' ', sp.title, sp.first_name, sp.last_name)) INTO holder
  FROM staff_department_assignments a
  JOIN staff_profiles sp ON sp.id = a.staff_id
  WHERE a.department_id = NEW.department_id
    AND a.id <> NEW.id
    AND a.deleted_at IS NULL
    AND sp.deleted_at IS NULL
    AND a.post_ids && head_ids
  LIMIT 1;

  IF holder IS NOT NULL THEN
    RAISE EXCEPTION 'This department already has a head (%). Remove their HOD / I/C HOD post first.', holder
      USING ERRCODE = 'unique_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_single_department_head
  BEFORE INSERT OR UPDATE OF post_ids, department_id, deleted_at ON public.staff_department_assignments
  FOR EACH ROW EXECUTE FUNCTION public.enforce_single_department_head();
