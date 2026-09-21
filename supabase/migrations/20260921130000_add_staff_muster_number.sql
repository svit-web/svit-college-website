-- Muster number: the college-assigned sequence number of a staff member (0-based).
-- Used only to order staff on public listings; never displayed. Nullable = unassigned.
-- Uniqueness is per college and enforced in the admin form / CSV import, not in the DB
-- (a person's college is derived from staff_department_assignments and may be absent).
alter table public.staff_profiles
  add column if not exists muster_number integer;

alter table public.staff_profiles
  drop constraint if exists staff_profiles_muster_number_nonneg;
alter table public.staff_profiles
  add constraint staff_profiles_muster_number_nonneg check (muster_number is null or muster_number >= 0);
