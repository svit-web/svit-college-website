-- save_placement_content: stop hardcoding placed_students.status='published'.
--
-- The admin TnP hub now offers a per-card Visibility (draft/published)
-- toggle, so the RPC has to pass the status through instead of forcing
-- 'published' — which also had two silent-clobber side effects this fixes:
--
--   1. A student drafted via /admin/tables/placed_students was force-
--      published again by the next hub save.
--   2. Worse: the hub loads only published rows, so that draft row wasn't
--      in the payload and the end-of-save sweep SOFT-DELETED it. The sweep
--      now only touches rows the hub can load (students: draft/published;
--      recruiters: published — the hub has no draft concept for those).
--
-- Recruiters keep force-published upserts (unchanged semantics; the hub's
-- recruiters tab is a quick curator and /admin/recruiters is the full
-- editor). Missing or unrecognized student status → 'published', so older
-- frontends that don't send a status are unaffected.

CREATE OR REPLACE FUNCTION public.save_placement_content(p_cell jsonb, p_students jsonb, p_recruiters jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_student jsonb;
  v_recruiter jsonb;
  v_college_id uuid;
  v_kept_student_ids uuid[] := ARRAY[]::uuid[];
  v_kept_recruiter_ids uuid[] := ARRAY[]::uuid[];
  v_index int;
  v_now timestamptz := clock_timestamp();
  v_uid uuid := auth.uid();
BEGIN
  -- 1 ── overview row: hero, about, officer, and everything JSON-shaped
  INSERT INTO public.placement_cells (
    college_code, hero_title, hero_subtitle, about_text,
    officer_name, officer_designation, officer_phone, officer_email, officer_photo_url,
    status, metadata, created_by, updated_by
  ) VALUES (
    'overview',
    p_cell->>'heroTitle',
    p_cell->>'heroSubtitle',
    p_cell->>'aboutText',
    p_cell->'officer'->>'name',
    p_cell->'officer'->>'designation',
    p_cell->'officer'->>'phone',
    p_cell->'officer'->>'email',
    p_cell->'officer'->>'photo',
    'published',
    jsonb_build_object(
      'highestPackage', p_cell->>'highestPackage',
      'averagePackage', p_cell->>'averagePackage',
      'sectionConfig', p_cell->>'sectionConfig',
      'graphicalData', p_cell->>'graphicalData'
    ),
    v_uid,
    v_uid
  )
  ON CONFLICT (college_code) DO UPDATE SET
    hero_title = EXCLUDED.hero_title,
    hero_subtitle = EXCLUDED.hero_subtitle,
    about_text = EXCLUDED.about_text,
    officer_name = EXCLUDED.officer_name,
    officer_designation = EXCLUDED.officer_designation,
    officer_phone = EXCLUDED.officer_phone,
    officer_email = EXCLUDED.officer_email,
    officer_photo_url = EXCLUDED.officer_photo_url,
    status = EXCLUDED.status,
    metadata = EXCLUDED.metadata,
    updated_by = v_uid;

  -- 2 ── placed_students: update existing, insert new, soft-delete removed
  FOR v_student IN SELECT * FROM jsonb_array_elements(p_students)
  LOOP
    SELECT id INTO v_college_id FROM public.colleges
      WHERE slug = (v_student->>'collegeId') AND deleted_at IS NULL;
    IF v_college_id IS NULL THEN
      RAISE EXCEPTION '"%" is tagged to an unknown college (%)',
        v_student->>'studentName', COALESCE(v_student->>'collegeId', 'none');
    END IF;

    IF (v_student->>'id') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      UPDATE public.placed_students SET
        college_id = v_college_id,
        student_name = v_student->>'studentName',
        company_name = v_student->>'companyName',
        batch_year = NULLIF(v_student->>'batchYear', ''),
        photo_url = v_student->>'photo',
        status = CASE WHEN v_student->>'status' IN ('draft', 'archived')
                      THEN v_student->>'status' ELSE 'published' END
      WHERE id = (v_student->>'id')::uuid;
      v_kept_student_ids := v_kept_student_ids || (v_student->>'id')::uuid;
    ELSE
      INSERT INTO public.placed_students (college_id, student_name, company_name, batch_year, photo_url, status)
      VALUES (
        v_college_id, v_student->>'studentName', v_student->>'companyName',
        NULLIF(v_student->>'batchYear', ''), v_student->>'photo',
        CASE WHEN v_student->>'status' IN ('draft', 'archived')
             THEN v_student->>'status' ELSE 'published' END
      )
      RETURNING id INTO v_college_id; -- reuse var; value unused below
    END IF;
  END LOOP;

  -- Only sweep rows the hub could have loaded (draft/published): an
  -- archived-not-deleted row made outside the hub is none of the hub's
  -- business and must survive a hub save.
  UPDATE public.placed_students
    SET deleted_at = v_now, deleted_by = v_uid
    WHERE deleted_at IS NULL
      AND status IN ('draft', 'published')
      AND NOT (id = ANY(v_kept_student_ids));

  -- 3 ── recruiters: same update / insert / soft-delete cycle, index = sort_order
  v_index := 0;
  FOR v_recruiter IN SELECT * FROM jsonb_array_elements(p_recruiters)
  LOOP
    IF (v_recruiter->>'id') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      UPDATE public.recruiters SET
        company_name = v_recruiter->>'companyName',
        logo_url = v_recruiter->>'logo',
        sort_order = v_index,
        status = 'published',
        updated_by = v_uid
      WHERE id = (v_recruiter->>'id')::uuid;
      v_kept_recruiter_ids := v_kept_recruiter_ids || (v_recruiter->>'id')::uuid;
    ELSE
      INSERT INTO public.recruiters (company_name, logo_url, sort_order, status, created_by, updated_by)
      VALUES (v_recruiter->>'companyName', v_recruiter->>'logo', v_index, 'published', v_uid, v_uid);
    END IF;
    v_index := v_index + 1;
  END LOOP;

  -- Published-only for recruiters: the hub never loads drafts, so a row
  -- drafted via /admin/recruiters must not be swept just because the hub
  -- didn't send it.
  UPDATE public.recruiters
    SET deleted_at = v_now, deleted_by = v_uid
    WHERE deleted_at IS NULL
      AND status = 'published'
      AND NOT (id = ANY(v_kept_recruiter_ids));
END;
$function$;
