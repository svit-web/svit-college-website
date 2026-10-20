-- can_write_entry_album() (20260923140100_entry_model_rls.sql) gates gallery_media
-- writes and gallery_albums visibility updates for every Entry table — but its
-- EXISTS branches only ever covered facilities/centers/events/posts. At the time
-- it was written, achievements was "global admin only" and student_clubs/sports
-- were "covered by the campus_life branch" (see that migration's own comment) —
-- true then, but achievements and student_clubs both later gained real scoped
-- (college/department) write RLS (student_clubs always had it per that same
-- migration; achievements' "Global insert achievements" policy embeds
-- can_write_scoped_record too) and this function was never updated to match.
--
-- Net effect, found via live testing as a department-scoped admin: a dept admin
-- can create an achievement, can create its hidden Entry album (is_any_admin),
-- can link album_id to the achievement (their own scoped UPDATE policy on
-- achievements) — but the photo upload itself then fails outright with
-- "new row violates row-level security policy for table gallery_media", because
-- can_write_entry_album() has no idea an achievement can point at this album.
-- Same gap for student_clubs. sports is unaffected — it stays genuinely
-- global/campus_life-only (no scoped write policy exists on sports itself,
-- matching /admin/sports being a global-only route).
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
          public.can_write_scoped_record(NULL::uuid, f.institute_id, d.college_id, f.department_id)
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
      SELECT 1 FROM public.achievements a
      WHERE a.album_id = target_album_id
        AND (
          public.can_write_scoped_record(NULL::uuid, NULL::uuid, a.college_id, a.department_id)
          OR (public.can_write_section('sports') AND a.category = 'sports')
        )
    )
    OR EXISTS (
      SELECT 1 FROM public.student_clubs sc
      LEFT JOIN public.departments d ON d.id = sc.department_id
      WHERE sc.album_id = target_album_id
        AND public.can_write_scoped_record(NULL::uuid, NULL::uuid, d.college_id, sc.department_id)
    )
  );
$$;

COMMENT ON FUNCTION public.can_write_entry_album(uuid) IS
  'True if the current user may write the given Entry album: global admin, campus_life editor, or someone who can write an Entry row (facilities/centers/events/posts/achievements/student_clubs; sports is covered by the campus_life branch) whose album_id is this album.';
