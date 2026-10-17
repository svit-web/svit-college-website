-- Facilities: add college_id so a college-scoped admin can own a facility
-- (campus or building type) outright, instead of every facility only being
-- writable by a global or institute-scoped admin. Nullable — a facility
-- with no college_id is institute-wide shared infrastructure, same as
-- before this migration. department_id (laboratory type, set from the Labs
-- page) is unaffected.
ALTER TABLE public.facilities
  ADD COLUMN college_id uuid REFERENCES public.colleges(id) ON DELETE SET NULL;

CREATE INDEX idx_facilities_college_id ON public.facilities USING btree (college_id);

-- can_write_entry_album's facilities branch only checked the department-
-- derived college_id — a college-owned facility (new college_id column,
-- no department_id) could write the facility row itself but not its own
-- photo album. Mirror the same coalesce fallback here.
CREATE OR REPLACE FUNCTION public.can_write_entry_album(target_album_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT target_album_id IS NOT NULL AND (
    public.is_global_admin()
    OR public.can_write_section('campus_life')
    OR EXISTS (
      SELECT 1
      FROM public.facilities f
      LEFT JOIN public.departments d ON d.id = f.department_id
      WHERE f.album_id = target_album_id
        AND (
          public.can_write_scoped_record(NULL::uuid, f.institute_id, COALESCE(f.college_id, d.college_id), f.department_id)
          OR (
            f.admin_section_id IS NOT NULL
            AND public.can_write_section(
              (SELECT s.code FROM public.admin_sections s WHERE s.id = f.admin_section_id)
            )
          )
        )
    )
    OR EXISTS (
      SELECT 1 FROM public.centers c
      WHERE c.album_id = target_album_id
        AND (
          public.can_write_scoped_record(NULL::uuid, c.institute_id, c.college_id, NULL::uuid)
          OR public.can_write_section('campus_life', c.institute_id, c.college_id, NULL::uuid)
        )
    )
    OR EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.album_id = target_album_id
        AND (
          public.can_write_section('news_events')
          OR public.can_write_scoped_record(NULL::uuid, NULL::uuid, e.college_id, e.department_id)
        )
    )
    OR EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.album_id = target_album_id
        AND public.can_write_section('news_events')
    )
    OR EXISTS (
      SELECT 1 FROM public.sports sp
      WHERE sp.album_id = target_album_id
        AND public.can_write_section('sports')
    )
    OR EXISTS (
      SELECT 1 FROM public.achievements a
      WHERE a.album_id = target_album_id
        AND a.category = 'sports'
        AND public.can_write_section('sports')
    )
  );
$$;

-- Re-point the 4 scope-aware policies at college_id directly, falling back
-- to the department's college (laboratory rows) when it's not set — same
-- fallback shape the institute_id COALESCE already used.
DROP POLICY IF EXISTS "Scoped insert facilities" ON public.facilities;
CREATE POLICY "Scoped insert facilities" ON public.facilities FOR INSERT WITH CHECK (
  public.can_write_scoped_record(
    (SELECT i.trust_id FROM public.institutes i
     WHERE i.id = COALESCE(facilities.institute_id, (
       SELECT c.institute_id FROM public.departments d JOIN public.colleges c ON c.id = d.college_id
       WHERE d.id = facilities.department_id
     ))),
    COALESCE(facilities.institute_id, (
      SELECT c.institute_id FROM public.departments d JOIN public.colleges c ON c.id = d.college_id
      WHERE d.id = facilities.department_id
    )),
    COALESCE(facilities.college_id, (
      SELECT d.college_id FROM public.departments d WHERE d.id = facilities.department_id
    )),
    facilities.department_id
  )
  OR (admin_section_id IS NOT NULL AND public.can_write_section(
    (SELECT s.code FROM public.admin_sections s WHERE s.id = facilities.admin_section_id)
  ))
);

DROP POLICY IF EXISTS "Scoped update facilities" ON public.facilities;
CREATE POLICY "Scoped update facilities" ON public.facilities FOR UPDATE USING (
  public.can_write_scoped_record(
    (SELECT i.trust_id FROM public.institutes i
     WHERE i.id = COALESCE(facilities.institute_id, (
       SELECT c.institute_id FROM public.departments d JOIN public.colleges c ON c.id = d.college_id
       WHERE d.id = facilities.department_id
     ))),
    COALESCE(facilities.institute_id, (
      SELECT c.institute_id FROM public.departments d JOIN public.colleges c ON c.id = d.college_id
      WHERE d.id = facilities.department_id
    )),
    COALESCE(facilities.college_id, (
      SELECT d.college_id FROM public.departments d WHERE d.id = facilities.department_id
    )),
    facilities.department_id
  )
  OR (admin_section_id IS NOT NULL AND public.can_write_section(
    (SELECT s.code FROM public.admin_sections s WHERE s.id = facilities.admin_section_id)
  ))
) WITH CHECK (
  public.can_write_scoped_record(
    (SELECT i.trust_id FROM public.institutes i
     WHERE i.id = COALESCE(facilities.institute_id, (
       SELECT c.institute_id FROM public.departments d JOIN public.colleges c ON c.id = d.college_id
       WHERE d.id = facilities.department_id
     ))),
    COALESCE(facilities.institute_id, (
      SELECT c.institute_id FROM public.departments d JOIN public.colleges c ON c.id = d.college_id
      WHERE d.id = facilities.department_id
    )),
    COALESCE(facilities.college_id, (
      SELECT d.college_id FROM public.departments d WHERE d.id = facilities.department_id
    )),
    facilities.department_id
  )
  OR (admin_section_id IS NOT NULL AND public.can_write_section(
    (SELECT s.code FROM public.admin_sections s WHERE s.id = facilities.admin_section_id)
  ))
);

DROP POLICY IF EXISTS "Scoped delete facilities" ON public.facilities;
CREATE POLICY "Scoped delete facilities" ON public.facilities FOR DELETE USING (
  public.can_write_scoped_record(
    (SELECT i.trust_id FROM public.institutes i
     WHERE i.id = COALESCE(facilities.institute_id, (
       SELECT c.institute_id FROM public.departments d JOIN public.colleges c ON c.id = d.college_id
       WHERE d.id = facilities.department_id
     ))),
    COALESCE(facilities.institute_id, (
      SELECT c.institute_id FROM public.departments d JOIN public.colleges c ON c.id = d.college_id
      WHERE d.id = facilities.department_id
    )),
    COALESCE(facilities.college_id, (
      SELECT d.college_id FROM public.departments d WHERE d.id = facilities.department_id
    )),
    facilities.department_id
  )
  OR (admin_section_id IS NOT NULL AND public.can_write_section(
    (SELECT s.code FROM public.admin_sections s WHERE s.id = facilities.admin_section_id)
  ))
);

DROP POLICY IF EXISTS "Scoped read facilities" ON public.facilities;
CREATE POLICY "Scoped read facilities" ON public.facilities FOR SELECT TO authenticated USING (
  public.can_write_scoped_record(
    (SELECT i.trust_id FROM public.institutes i
     WHERE i.id = COALESCE(facilities.institute_id, (
       SELECT c.institute_id FROM public.departments d JOIN public.colleges c ON c.id = d.college_id
       WHERE d.id = facilities.department_id
     ))),
    COALESCE(facilities.institute_id, (
      SELECT c.institute_id FROM public.departments d JOIN public.colleges c ON c.id = d.college_id
      WHERE d.id = facilities.department_id
    )),
    COALESCE(facilities.college_id, (
      SELECT d.college_id FROM public.departments d WHERE d.id = facilities.department_id
    )),
    facilities.department_id
  )
);
