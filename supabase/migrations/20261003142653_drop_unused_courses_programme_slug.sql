-- courses.programme_slug was admin-editable (via the generic AdminCrudManager
-- grid) but never read anywhere in routing/lookups: every programme row's
-- value is a byte-for-byte duplicate of its `code` column (the column that
-- programme lookups actually use — see getProgrammeBySlug in
-- src/lib/programmes.functions.ts), and one row even had it NULL. Dead,
-- duplicate data, not a real distinct slug namespace -- drop it.
ALTER TABLE public.courses DROP COLUMN IF EXISTS programme_slug;
