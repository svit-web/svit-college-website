-- Dedicated centre pages: /campus-life/centre-of-excellence (centers.slug =
-- 'coe') and /campus-life/nss-ncc (slug = 'nss-ncc').
--
-- The page core (name, subtitle, description, highlights, photo album) stays
-- on the existing centers row. The CoE currently has a single lab, so the lab
-- is described by that row itself — no labs table. Repeatable lists live in
-- three new child tables, keyed by center_id so any centre can use them:
--   center_equipment  — Equipment Details
--   center_programs   — Training & Certification Programmes
--   center_members    — Coordinators / Team (a staff profile or a free-text person)
-- MoUs, events and achievements already have their own tables; they gain a
-- nullable center_id so the admin can tag a row to a centre page.
--
-- Writes on the child tables follow the parent centre's own write rule
-- (20261014150000_trust_and_institute_scope_cascade.sql): scoped admins of the
-- centre's institute/college, or the 'campus_life' section grant.

create or replace function public.can_write_center(p_center_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.centers c
    where c.id = p_center_id
      and (
        public.can_write_scoped_record(
          (select i.trust_id from public.institutes i where i.id = c.institute_id),
          c.institute_id, c.college_id, null
        )
        or public.can_write_section('campus_life', c.institute_id, c.college_id, null)
      )
  );
$$;

create table public.center_equipment (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  name text not null,
  make_model text,
  quantity integer check (quantity is null or quantity >= 0),
  specifications text,
  description text,
  image_url text,
  sort_order integer not null default 0,
  status content_status not null default 'published',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id)
);

create table public.center_programs (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  title text not null,
  program_type text not null default 'training'
    check (program_type in ('training', 'certification', 'workshop', 'internship', 'other')),
  certifying_body text,
  duration text,
  eligibility text,
  mode text,
  description text,
  registration_url text,
  sort_order integer not null default 0,
  status content_status not null default 'published',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id)
);

-- staff_id links a faculty/staff profile (name, photo and profile link come
-- from it); otherwise name/photo_url describe the person directly (student
-- volunteers, NCC officers, external mentors). role is the label shown on the
-- card, e.g. "Coordinator", "Programme Officer", "Student Lead".
create table public.center_members (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  staff_id uuid references public.staff_profiles(id) on delete set null,
  name text,
  role text not null,
  member_group text not null default 'faculty'
    check (member_group in ('faculty', 'student', 'external')),
  email text,
  photo_url text,
  sort_order integer not null default 0,
  status content_status not null default 'published',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  constraint center_members_person_check check (staff_id is not null or nullif(trim(name), '') is not null)
);

create index center_equipment_list_idx on public.center_equipment (center_id, sort_order)
  where deleted_at is null;
create index center_programs_list_idx on public.center_programs (center_id, sort_order)
  where deleted_at is null;
create index center_members_list_idx on public.center_members (center_id, member_group, sort_order)
  where deleted_at is null;

alter table public.center_equipment enable row level security;
alter table public.center_programs enable row level security;
alter table public.center_members enable row level security;

create policy "Public read published center_equipment" on public.center_equipment
  for select to anon, authenticated
  using ((status = 'published' and deleted_at is null) or public.can_write_center(center_id));
create policy "Centre write center_equipment" on public.center_equipment
  for all to authenticated
  using (public.can_write_center(center_id))
  with check (public.can_write_center(center_id));

create policy "Public read published center_programs" on public.center_programs
  for select to anon, authenticated
  using ((status = 'published' and deleted_at is null) or public.can_write_center(center_id));
create policy "Centre write center_programs" on public.center_programs
  for all to authenticated
  using (public.can_write_center(center_id))
  with check (public.can_write_center(center_id));

create policy "Public read published center_members" on public.center_members
  for select to anon, authenticated
  using ((status = 'published' and deleted_at is null) or public.can_write_center(center_id));
create policy "Centre write center_members" on public.center_members
  for all to authenticated
  using (public.can_write_center(center_id))
  with check (public.can_write_center(center_id));

create trigger update_center_equipment_modtime
  before update on public.center_equipment
  for each row execute function public.update_updated_at_column();
create trigger update_center_programs_modtime
  before update on public.center_programs
  for each row execute function public.update_updated_at_column();
create trigger update_center_members_modtime
  before update on public.center_members
  for each row execute function public.update_updated_at_column();

create trigger audit_center_equipment_trigger
  after insert or delete or update on public.center_equipment
  for each row execute function public.process_audit_log();
create trigger audit_center_programs_trigger
  after insert or delete or update on public.center_programs
  for each row execute function public.process_audit_log();
create trigger audit_center_members_trigger
  after insert or delete or update on public.center_members
  for each row execute function public.process_audit_log();

-- Tag existing MoUs / events / achievements to a centre page. Existing RLS on
-- those tables is unchanged; the column only decides where a row also shows.
alter table public.mous add column if not exists center_id uuid
  references public.centers(id) on delete set null;
alter table public.events add column if not exists center_id uuid
  references public.centers(id) on delete set null;
alter table public.achievements add column if not exists center_id uuid
  references public.centers(id) on delete set null;

create index if not exists mous_center_idx on public.mous (center_id) where center_id is not null;
create index if not exists events_center_idx on public.events (center_id) where center_id is not null;
create index if not exists achievements_center_idx on public.achievements (center_id)
  where center_id is not null;
