-- =============================================================================
-- Entry model, part 2 of 3: RLS.
--   1. Scope-aware write policies on events (department/college admins).
--   2. can_write_entry_album() + additional policies on gallery_albums/gallery_media
--      so whoever can write an Entry can write its Entry album and photos.
--
-- Requires part 1 (album_id columns, gallery_albums.owner_table / show_in_public_gallery).
-- Existing policies are NOT removed; everything here is an extra OR-branch
-- (permissive policies are OR-ed together by Postgres).
--
-- Live helpers used (signatures checked 2026-09-23, all SECURITY DEFINER,
-- search_path ''):
--   is_global_admin()
--   can_write_scoped_record(p_trust_id, p_institute_id, p_college_id, p_department_id)
--     -> true for a global role, or a role whose scope id matches the given id.
--   can_write_section(p_section_code, p_institute_id, p_college_id, p_department_id)
-- There is no get_user_scope() in the live DB. There is an unused can_write_event()
-- (college admins only for college-scoped events); it is deliberately NOT used,
-- see the plan doc.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. events: scoped writes, alongside "Global insert/update/delete events"
--    (is_global_admin() OR can_write_section('news_events')).
--
--    Same pattern as facilities/centers: can_write_scoped_record(null, null,
--    college_id, department_id).
--    - department admin: rows whose department_id is theirs.
--    - college admin: rows whose college_id is theirs, i.e. college-scoped events
--      AND department events in their college (events_before_write fills college_id
--      from the department BEFORE the WITH CHECK is evaluated).
--    - Global/trust/institute-scoped events (college_id and department_id NULL)
--      stay writable only by global admins / news_events editors.
--    events has no institute_id column, so institute-scoped roles get nothing new.
--    Featuring is still restricted to global admins by events_enforce_featured_rules.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Scoped insert events" ON public.events;
CREATE POLICY "Scoped insert events" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, department_id));

DROP POLICY IF EXISTS "Scoped update events" ON public.events;
CREATE POLICY "Scoped update events" ON public.events
  FOR UPDATE TO authenticated
  USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, department_id))
  WITH CHECK (public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, department_id));

DROP POLICY IF EXISTS "Scoped delete events" ON public.events;
CREATE POLICY "Scoped delete events" ON public.events
  FOR DELETE TO authenticated
  USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, department_id));

-- -----------------------------------------------------------------------------
-- 2a. can_write_entry_album(album): may the current user write this Entry album?
--
--     True if global admin, OR campus_life section editor (matches the existing
--     gallery policies), OR the user can write an Entry row that links to this
--     album, per that table's own live write policy:
--       facilities    can_write_scoped_record(null, institute_id, dept.college_id, department_id)
--                     OR admin_section_id-tagged section grant
--       centers       can_write_scoped_record(null, institute_id, college_id, null)
--                     OR can_write_section('campus_life', institute_id, college_id, null)
--       events        can_write_section('news_events') OR the scoped policy above
--       posts         can_write_section('news_events')
--       sports, student_clubs   campus_life -> already covered by the top-level branch
--       achievements  global admin only -> already covered by is_global_admin()
--
--     SECURITY DEFINER so it can read the Entry tables regardless of the caller's
--     SELECT policies; auth.uid() inside the nested helpers is still the caller.
-- -----------------------------------------------------------------------------
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
  );
$$;

COMMENT ON FUNCTION public.can_write_entry_album(uuid) IS
  'True if the current user may write the given Entry album: global admin, campus_life editor, or someone who can write an Entry row (facilities/centers/events/posts; sports/clubs/achievements are covered by the first two) whose album_id is this album.';

-- -----------------------------------------------------------------------------
-- 2b. is_any_admin(): the user holds any active admin-panel role
--     (the 4 role codes getAdminUser() authorizes).
--     Needed only for creating a NEW Entry album: at INSERT time no Entry row can
--     point at the album yet (the FK needs the album to exist first), so
--     can_write_entry_album() is necessarily false for a scoped admin.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_any_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND ur.status = 'published'
      AND ur.deleted_at IS NULL
      AND r.code IN ('admin', 'editor', 'department_admin', 'college_admin')
  );
$$;

-- -----------------------------------------------------------------------------
-- 2c. gallery_albums: extra policies for Entry albums only (owner_table set).
--     Existing "Global insert/update/delete gallery_albums"
--     (is_global_admin() OR can_write_section('campus_life')) stay as they are.
--
--     INSERT: any admin may create an Entry album, but only as a hidden one
--     (show_in_public_gallery = false). It is inert until the Entry links it, and
--     from then on UPDATE requires can_write_entry_album().
--     TODO(review): this lets a scoped admin create orphan hidden albums. If that is
--     not acceptable, add gallery_albums.owner_id and check the owner row instead.
--
--     No extra DELETE policy: Entry albums are soft-deleted (UPDATE deleted_at);
--     hard purge stays with global admins, as in the Trash page.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Entry album insert gallery_albums" ON public.gallery_albums;
CREATE POLICY "Entry album insert gallery_albums" ON public.gallery_albums
  FOR INSERT TO authenticated
  WITH CHECK (
    owner_table IS NOT NULL
    AND show_in_public_gallery = false
    AND public.is_any_admin()
  );

DROP POLICY IF EXISTS "Entry album update gallery_albums" ON public.gallery_albums;
CREATE POLICY "Entry album update gallery_albums" ON public.gallery_albums
  FOR UPDATE TO authenticated
  USING (owner_table IS NOT NULL AND public.can_write_entry_album(id))
  WITH CHECK (owner_table IS NOT NULL AND public.can_write_entry_album(id));

-- -----------------------------------------------------------------------------
-- 2d. gallery_media: photos in an Entry album. Existing "Global write gallery_media"
--     (ALL, is_global_admin() OR can_write_section('campus_life')) stays.
--     DELETE is included: removing a single photo from an album editor is routine.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Entry album insert gallery_media" ON public.gallery_media;
CREATE POLICY "Entry album insert gallery_media" ON public.gallery_media
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.gallery_albums a WHERE a.id = album_id AND a.owner_table IS NOT NULL)
    AND public.can_write_entry_album(album_id)
  );

DROP POLICY IF EXISTS "Entry album update gallery_media" ON public.gallery_media;
CREATE POLICY "Entry album update gallery_media" ON public.gallery_media
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.gallery_albums a WHERE a.id = album_id AND a.owner_table IS NOT NULL)
    AND public.can_write_entry_album(album_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.gallery_albums a WHERE a.id = album_id AND a.owner_table IS NOT NULL)
    AND public.can_write_entry_album(album_id)
  );

DROP POLICY IF EXISTS "Entry album delete gallery_media" ON public.gallery_media;
CREATE POLICY "Entry album delete gallery_media" ON public.gallery_media
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.gallery_albums a WHERE a.id = album_id AND a.owner_table IS NOT NULL)
    AND public.can_write_entry_album(album_id)
  );
