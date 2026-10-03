-- staff_achievements was missing updated_by, unlike every sibling audited
-- table. AdminTrashPage's generic restore handler unconditionally sets
-- updated_by on any table it restores, which would otherwise fail with a
-- missing-column error now that staff_achievements is in its managed list
-- (Phase 2d of the SYSTEM_MAP.md broken-items fix plan).
ALTER TABLE public.staff_achievements
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES public.user_profiles(id);
