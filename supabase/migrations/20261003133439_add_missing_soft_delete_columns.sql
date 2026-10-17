-- Phase 2a of the SYSTEM_MAP.md broken-items fix plan: placed_students and
-- scholarships are the only two tables in their domains with no deleted_at/
-- deleted_by, which is why their admin "delete" actions are hard DELETEs
-- with no recovery path. Add the standard soft-delete columns so the app
-- code (Phase 2c) and the Trash UI (Phase 2d) can treat them like every
-- other content table.

ALTER TABLE public.placed_students
  ADD COLUMN deleted_at timestamptz,
  ADD COLUMN deleted_by uuid REFERENCES public.user_profiles(id);

ALTER TABLE public.scholarships
  ADD COLUMN deleted_at timestamptz,
  ADD COLUMN deleted_by uuid REFERENCES public.user_profiles(id);
