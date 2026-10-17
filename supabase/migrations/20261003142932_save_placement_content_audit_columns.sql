-- COSMETIC gap: save_placement_content() (the RPC savePlacementContent calls)
-- never populated placement_cells.created_by/updated_by or
-- recruiters.created_by/updated_by/deleted_by, even though AdminCrudManager's
-- generic /admin/recruiters editor does set them. Most recruiter/cell edits
-- happen through the T&P hub, which is why these audit columns sat at 0%
-- populated. Thread auth.uid() through, same as the placed_students
-- soft-delete branch already does.
CREATE OR REPLACE FUNCTION public.save_placement_content(
  p_cell jsonb,
  p_students jsonb,
  p_recruiters jsonb
) RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
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
      'sectionConfig', p_cell->'sectionConfig',
      'graphicalData', p_cell->'graphicalData'
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
        status = 'published'
      WHERE id = (v_student->>'id')::uuid;
      v_kept_student_ids := v_kept_student_ids || (v_student->>'id')::uuid;
    ELSE
      INSERT INTO public.placed_students (college_id, student_name, company_name, batch_year, photo_url, status)
      VALUES (
        v_college_id, v_student->>'studentName', v_student->>'companyName',
        NULLIF(v_student->>'batchYear', ''), v_student->>'photo', 'published'
      )
      RETURNING id INTO v_college_id; -- reuse var; value unused below
    END IF;
  END LOOP;

  UPDATE public.placed_students
    SET deleted_at = v_now, deleted_by = v_uid
    WHERE deleted_at IS NULL
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

  UPDATE public.recruiters
    SET deleted_at = v_now, deleted_by = v_uid
    WHERE deleted_at IS NULL
      AND NOT (id = ANY(v_kept_recruiter_ids));
END;
$$;

REVOKE ALL ON FUNCTION public.save_placement_content(jsonb, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_placement_content(jsonb, jsonb, jsonb) TO authenticated;
