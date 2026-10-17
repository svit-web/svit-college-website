-- SYSTEM_MAP.md gaps audit — Placement & recruiters slice.

-- 1. DEAD: placement_cells.default_student_placeholder_url — added
-- 2026-07-29, never read or written by any app code (only present in the
-- stale generated types.ts) and null on every row. Drop it.
ALTER TABLE public.placement_cells DROP COLUMN IF EXISTS default_student_placeholder_url;

-- 2. DEAD: recruiters.department_id / recruiters.college_codes — added for
-- per-college recruiter filtering but 0/288 rows ever populated, and no
-- query anywhere (public site or admin) reads either column to filter.
-- The public recruiter wall is a single trust-wide list by design (see
-- getRecruiterLogos/getAllRecruiters) — drop the vestigial columns rather
-- than build the filtering feature nobody wired up.
ALTER TABLE public.recruiters DROP COLUMN IF EXISTS department_id;
ALTER TABLE public.recruiters DROP COLUMN IF EXISTS college_codes;

-- 3. DEAD: public.cells table — zero rows, zero references anywhere in
-- src/ (grepped), and not part of the save_placement_content RPC or any
-- read path. A leftover from an earlier modeling attempt; drop it.
DROP TABLE IF EXISTS public.cells;

-- 4. DEAD DATA: placement_cells had 5 rows (overview + 4 legacy per-college
-- rows keyed by college_code). The placement hub was unified in an earlier
-- phase — getPlacementContent() only ever reads college_code = 'overview',
-- and /placement/[college] now just redirects to /placement — so the 4
-- per-college rows are unreachable. Soft-delete them rather than hard-delete
-- (CLAUDE.md: soft delete, not hard delete) in case of future per-college
-- reporting.
UPDATE public.placement_cells
SET deleted_at = now(), status = 'archived'
WHERE college_code <> 'overview' AND deleted_at IS NULL;

-- 5. COSMETIC: placement_cells / placed_students were missing the standard
-- updated_at-refresh trigger that recruiters and cells already have
-- (update_updated_at_column()). Add it for consistency, same pattern as
-- 20261003142316_add_board_members_updated_at_trigger.sql.
CREATE TRIGGER update_placement_cells_modtime
  BEFORE UPDATE ON public.placement_cells
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_placed_students_modtime
  BEFORE UPDATE ON public.placed_students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
