-- staff_achievements.status is a plain text column that no query or UI ever
-- reads or filters on (soft delete already uses deleted_at); drop it.
alter table public.staff_achievements drop column if exists status;

-- staff_achievements.deleted_by should point at user_profiles, like
-- updated_by, instead of auth.users, for consistency with the rest of the
-- audit columns on this table.
alter table public.staff_achievements
  drop constraint if exists staff_achievements_deleted_by_fkey;

alter table public.staff_achievements
  add constraint staff_achievements_deleted_by_fkey
  foreign key (deleted_by) references public.user_profiles(id);
