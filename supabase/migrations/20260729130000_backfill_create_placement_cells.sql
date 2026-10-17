-- Backfill migration: placement_cells has existed in the live database since
-- before this repo's tracked migration history began — it was created
-- directly against the DB, not via a migration (see
-- docs/audits/deferred-issues.md #2). Only ALTER TABLE migrations reference
-- it (20260729131000_add_placed_students_to_placement_cells.sql,
-- 20260729133600_add_default_student_placeholder_url_to_placement_cells.sql),
-- so a from-scratch `supabase db push` could never recreate this table.
--
-- This migration documents the table as it actually exists today (verified
-- against the live schema via `information_schema.columns`, `pg_constraint`,
-- and `pg_policies`), timestamped to run before the first ALTER TABLE that
-- touches it. `IF NOT EXISTS`/idempotent guards make this a no-op wherever
-- the table already exists.

CREATE TABLE IF NOT EXISTS public.placement_cells (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_code text NOT NULL UNIQUE,
  about_text text NOT NULL DEFAULT '',
  officer_name text NOT NULL DEFAULT '',
  officer_designation text NOT NULL DEFAULT 'Training & Placement Officer',
  officer_phone text NOT NULL DEFAULT '',
  officer_email text NOT NULL DEFAULT '',
  officer_photo_url text,
  status content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  default_student_placeholder_url text,
  hero_title text,
  hero_subtitle text
);

ALTER TABLE public.placement_cells ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read placement_cells" ON public.placement_cells;
CREATE POLICY "Public read placement_cells" ON public.placement_cells
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published'::content_status AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Global write placement_cells" ON public.placement_cells;
CREATE POLICY "Global write placement_cells" ON public.placement_cells
  FOR ALL
  TO authenticated
  USING (is_global_admin())
  WITH CHECK (is_global_admin());
