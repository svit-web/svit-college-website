-- =============================================================================
-- Entry model, part 1 of 3: schema (Card photo, detail page flag, Entry album,
-- event type, club events, scope widening, achievements 'sports', sports table
-- alignment).
--
-- See docs/adr/0001-entry-card-photo-and-album.md, docs/adr/0002-one-events-table.md
-- and docs/audits/2026-09-23-entry-model-drift.md. Plan and judgment calls are in
-- docs/audits/2026-09-23-entry-model-migration-plan.md.
--
-- Written against the live schema as of 2026-09-23 (after Phase 1 junk trashing).
-- Idempotent where practical: safe to re-run while the draft is being reviewed.
--
-- Does NOT touch events.is_featured (events_enforce_featured_rules would raise for a
-- session with auth.uid() NULL if is_featured changed).
-- Does NOT touch logo_url / photo_url / avatar_url / officer_photo_url /
-- coach_image_url / gallery_albums.cover_image_url (different concepts).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. Card photo: rename in place (no add-then-drop), add where missing.
--    No function, view, trigger, RLS policy or FK references these columns
--    (drift doc §2/§6); process_audit_log() uses to_jsonb(row), so it is rename-safe.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('events',       'featured_image_url'),
      ('posts',        'featured_image_url'),
      ('achievements', 'featured_image_url'),
      ('sports',       'cover_image_url')
    ) AS t(tbl, old_col)
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = r.tbl AND column_name = r.old_col
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = r.tbl AND column_name = 'card_photo_url'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I RENAME COLUMN %I TO card_photo_url', r.tbl, r.old_col);
    END IF;
  END LOOP;
END $$;

-- facilities / centers / student_clubs never had a Card photo column.
-- (student_clubs.logo_url stays: a logo is not a Card photo.)
ALTER TABLE public.facilities    ADD COLUMN IF NOT EXISTS card_photo_url text;
ALTER TABLE public.centers       ADD COLUMN IF NOT EXISTS card_photo_url text;
ALTER TABLE public.student_clubs ADD COLUMN IF NOT EXISTS card_photo_url text;

-- -----------------------------------------------------------------------------
-- B. has_detail_page (default false). Not on posts: News always has a page.
--    Backfill runs only in the same block that adds the column, so a re-run never
--    overwrites values an admin has changed since.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  -- events: every currently published event keeps its detail page.
  -- Only has_detail_page is written; is_featured is untouched, so the featured
  -- trigger does not raise.
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='events' AND column_name='has_detail_page') THEN
    ALTER TABLE public.events ADD COLUMN has_detail_page boolean NOT NULL DEFAULT false;
    UPDATE public.events SET has_detail_page = true WHERE status = 'published';
  END IF;

  -- facilities: campus + building rows (department_id IS NULL) have pages today;
  -- labs (department_id NOT NULL) stay false.
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='facilities' AND column_name='has_detail_page') THEN
    ALTER TABLE public.facilities ADD COLUMN has_detail_page boolean NOT NULL DEFAULT false;
    UPDATE public.facilities SET has_detail_page = true WHERE department_id IS NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='centers' AND column_name='has_detail_page') THEN
    ALTER TABLE public.centers ADD COLUMN has_detail_page boolean NOT NULL DEFAULT false;
    UPDATE public.centers SET has_detail_page = true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='student_clubs' AND column_name='has_detail_page') THEN
    ALTER TABLE public.student_clubs ADD COLUMN has_detail_page boolean NOT NULL DEFAULT false;
    UPDATE public.student_clubs SET has_detail_page = true;
  END IF;
END $$;

-- sports / achievements: no detail pages exist today, so they stay at false.
ALTER TABLE public.sports       ADD COLUMN IF NOT EXISTS has_detail_page boolean NOT NULL DEFAULT false;
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS has_detail_page boolean NOT NULL DEFAULT false;

-- -----------------------------------------------------------------------------
-- C. Entry album link: Entry.album_id -> gallery_albums(id) ON DELETE SET NULL.
--    gallery_media.album_id is already ON DELETE CASCADE, so a hard delete of an
--    album removes its photos. Trash/restore/purge cascading from the Entry to its
--    album is NOT in this migration (see plan doc: needs per-table triggers).
-- -----------------------------------------------------------------------------
ALTER TABLE public.events        ADD COLUMN IF NOT EXISTS album_id uuid REFERENCES public.gallery_albums(id) ON DELETE SET NULL;
ALTER TABLE public.facilities    ADD COLUMN IF NOT EXISTS album_id uuid REFERENCES public.gallery_albums(id) ON DELETE SET NULL;
ALTER TABLE public.centers       ADD COLUMN IF NOT EXISTS album_id uuid REFERENCES public.gallery_albums(id) ON DELETE SET NULL;
ALTER TABLE public.sports        ADD COLUMN IF NOT EXISTS album_id uuid REFERENCES public.gallery_albums(id) ON DELETE SET NULL;
ALTER TABLE public.achievements  ADD COLUMN IF NOT EXISTS album_id uuid REFERENCES public.gallery_albums(id) ON DELETE SET NULL;
ALTER TABLE public.student_clubs ADD COLUMN IF NOT EXISTS album_id uuid REFERENCES public.gallery_albums(id) ON DELETE SET NULL;
ALTER TABLE public.posts         ADD COLUMN IF NOT EXISTS album_id uuid REFERENCES public.gallery_albums(id) ON DELETE SET NULL;

-- Lookups by album_id are used by can_write_entry_album() (part 2).
CREATE INDEX IF NOT EXISTS idx_events_album_id        ON public.events (album_id)        WHERE album_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_facilities_album_id    ON public.facilities (album_id)    WHERE album_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_centers_album_id       ON public.centers (album_id)       WHERE album_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sports_album_id        ON public.sports (album_id)        WHERE album_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_achievements_album_id  ON public.achievements (album_id)  WHERE album_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_student_clubs_album_id ON public.student_clubs (album_id) WHERE album_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_album_id         ON public.posts (album_id)         WHERE album_id IS NOT NULL;

-- Which table owns an Entry album. NULL = standalone album (the 2 legacy albums,
-- both soft-deleted in Phase 1).
ALTER TABLE public.gallery_albums ADD COLUMN IF NOT EXISTS owner_table text;
ALTER TABLE public.gallery_albums DROP CONSTRAINT IF EXISTS gallery_albums_owner_table_check;
ALTER TABLE public.gallery_albums ADD CONSTRAINT gallery_albums_owner_table_check
  CHECK (owner_table IS NULL OR owner_table IN (
    'events', 'facilities', 'centers', 'sports', 'achievements', 'student_clubs', 'posts'
  ));

-- Existing albums keep true. The app sets false when it creates an Entry album
-- (Entry albums are hidden from /gallery by default).
ALTER TABLE public.gallery_albums ADD COLUMN IF NOT EXISTS show_in_public_gallery boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.gallery_albums.owner_table IS
  'Table whose row owns this Entry album (the row with album_id = this id). NULL for standalone gallery albums.';
COMMENT ON COLUMN public.gallery_albums.show_in_public_gallery IS
  'Whether the album is listed on /gallery. App sets false for new Entry albums.';

-- -----------------------------------------------------------------------------
-- D. Event type (fixed list; adding a type is a code change, ADR 0002).
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  CREATE TYPE public.event_type_enum AS ENUM (
    'fest', 'cultural', 'technical', 'sports', 'workshop', 'seminar',
    'expert_session', 'sttp', 'fdp', 'industrial_visit', 'competition', 'other'
  );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Nullable: the existing rows are not guess-mapped from `tag`; admins fill it in.
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_type public.event_type_enum;

COMMENT ON COLUMN public.events.tag IS
  'DEPRECATED: free-text label superseded by events.event_type. Kept until app code stops reading it; drop in a later cleanup migration.';

-- -----------------------------------------------------------------------------
-- E. Club events: events.club_id (was added then reverted on 2026-07-29).
-- -----------------------------------------------------------------------------
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS club_id uuid REFERENCES public.student_clubs(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_events_club_id ON public.events (club_id) WHERE club_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- F. Scope widening.
-- -----------------------------------------------------------------------------

-- F1. events: drop the redundant check_content_scope (global/department only),
--     but only after asserting events_scope_consistency is present and still
--     covers every scope level. Live definition checked 2026-09-23:
--       ((scope_type IN (global,trust,institute)) AND college_id IS NULL AND department_id IS NULL)
--       OR (scope_type = college AND college_id IS NOT NULL AND department_id IS NULL)
--       OR (scope_type = department AND department_id IS NOT NULL)
DO $$
DECLARE
  def text;
BEGIN
  SELECT pg_get_constraintdef(oid) INTO def
  FROM pg_constraint
  WHERE conrelid = 'public.events'::regclass AND conname = 'events_scope_consistency';

  IF def IS NULL
     OR def NOT LIKE '%''global''::scope_level%'
     OR def NOT LIKE '%''college''::scope_level%'
     OR def NOT LIKE '%''department''::scope_level%' THEN
    RAISE EXCEPTION 'events_scope_consistency missing or changed (%); refusing to drop check_content_scope', def;
  END IF;
END $$;

ALTER TABLE public.events DROP CONSTRAINT IF EXISTS check_content_scope;

-- F2. posts / gallery_albums / achievements have NO college_id column today, so a
--     'college' scope needs one. Add it (FK -> colleges, same as events.college_id
--     but with ON DELETE CASCADE to match these tables' department_id FKs), then
--     widen check_content_scope.
--     Live expression (identical on all three, checked 2026-09-23):
--       ((scope_type = 'global' AND department_id IS NULL)
--        OR (scope_type = 'department' AND department_id IS NOT NULL))
--     New: same two branches (global additionally requires college_id IS NULL,
--     which every existing row satisfies since the column is new) plus a college branch.
ALTER TABLE public.posts          ADD COLUMN IF NOT EXISTS college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE;
ALTER TABLE public.gallery_albums ADD COLUMN IF NOT EXISTS college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE;
ALTER TABLE public.achievements   ADD COLUMN IF NOT EXISTS college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['posts', 'gallery_albums', 'achievements'] LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS check_content_scope', t);
    EXECUTE format($f$
      ALTER TABLE public.%I ADD CONSTRAINT check_content_scope CHECK (
        (scope_type = 'global'::public.scope_level AND department_id IS NULL AND college_id IS NULL)
        OR (scope_type = 'college'::public.scope_level AND college_id IS NOT NULL AND department_id IS NULL)
        OR (scope_type = 'department'::public.scope_level AND department_id IS NOT NULL)
      )$f$, t);
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- G. achievements.category: add 'sports'.
-- -----------------------------------------------------------------------------
ALTER TABLE public.achievements DROP CONSTRAINT IF EXISTS achievements_category_check;
ALTER TABLE public.achievements ADD CONSTRAINT achievements_category_check
  CHECK (category = ANY (ARRAY['student', 'faculty', 'college', 'department', 'sports']));

-- -----------------------------------------------------------------------------
-- J. sports alignment with the other content tables.
-- -----------------------------------------------------------------------------

-- J1. status text -> content_status (draft,published,archived). All 10 live rows
--     are 'published' (checked 2026-09-23); anything unexpected aborts the cast.
--     The sports_public_read policy compares status to a text literal, so it must be
--     dropped before the type change and recreated after.
DO $$
BEGIN
  IF (SELECT data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name='sports' AND column_name='status') = 'text' THEN

    IF EXISTS (SELECT 1 FROM public.sports
               WHERE status NOT IN ('draft', 'published', 'archived')) THEN
      RAISE EXCEPTION 'sports.status has values outside content_status; fix them first';
    END IF;

    DROP POLICY IF EXISTS sports_public_read ON public.sports;
    ALTER TABLE public.sports ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE public.sports ALTER COLUMN status TYPE public.content_status
      USING status::public.content_status;
    -- Same default as facilities/centers/student_clubs/achievements.
    ALTER TABLE public.sports ALTER COLUMN status SET DEFAULT 'published'::public.content_status;
  END IF;
END $$;

DROP POLICY IF EXISTS sports_public_read ON public.sports;
CREATE POLICY sports_public_read ON public.sports
  FOR SELECT
  USING (deleted_at IS NULL AND status = 'published'::public.content_status AND is_active = true);

-- J2. Audit FKs: auth.users -> user_profiles (like every other table).
--     Verified 2026-09-23: user_profiles.id is itself FK -> auth.users(id)
--     (user_profiles_id_fkey, ON DELETE CASCADE), so the ids are the same values,
--     and all 10 sports rows have NULL created_by/updated_by/deleted_by.
--     Any id not present in user_profiles is nulled defensively before re-pointing.
UPDATE public.sports SET created_by = NULL
  WHERE created_by IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = created_by);
UPDATE public.sports SET updated_by = NULL
  WHERE updated_by IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = updated_by);
UPDATE public.sports SET deleted_by = NULL
  WHERE deleted_by IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = deleted_by);

ALTER TABLE public.sports DROP CONSTRAINT IF EXISTS sports_created_by_fkey;
ALTER TABLE public.sports DROP CONSTRAINT IF EXISTS sports_updated_by_fkey;
ALTER TABLE public.sports DROP CONSTRAINT IF EXISTS sports_deleted_by_fkey;
ALTER TABLE public.sports ADD CONSTRAINT sports_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.sports ADD CONSTRAINT sports_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.sports ADD CONSTRAINT sports_deleted_by_fkey
  FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;
