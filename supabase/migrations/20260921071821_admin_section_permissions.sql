-- Section-level admin permissions: orthogonal to the existing global/trust/institute/college/department scope tree.
create table public.admin_sections (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  status public.content_status not null default 'published',
  metadata jsonb not null default '{}'::jsonb
);

insert into public.admin_sections (code, name) values
  ('home_page', 'Home Page'),
  ('news_events', 'News & Events'),
  ('admissions', 'Admissions'),
  ('placement', 'Training & Placement'),
  ('about_us', 'About Us'),
  ('library', 'Library'),
  ('campus_life', 'Campus Management');

create table public.user_section_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  section_id uuid not null references public.admin_sections(id),
  scope_type public.scope_level not null default 'institute',
  trust_id uuid,
  institute_id uuid,
  college_id uuid,
  department_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  status public.content_status not null default 'published',
  metadata jsonb not null default '{}'::jsonb,
  constraint section_scope_fkey_check check (
    (scope_type = 'global' and trust_id is null and institute_id is null and college_id is null and department_id is null)
    or (scope_type = 'trust' and trust_id is not null and institute_id is null and college_id is null and department_id is null)
    or (scope_type = 'institute' and institute_id is not null and trust_id is null and college_id is null and department_id is null)
    or (scope_type = 'college' and college_id is not null and trust_id is null and institute_id is null and department_id is null)
    or (scope_type = 'department' and department_id is not null and trust_id is null and institute_id is null and college_id is null)
  ),
  constraint unique_user_section_scope unique (user_id, section_id, scope_type, trust_id, institute_id, college_id, department_id)
);

create index user_section_grants_user_id_idx on public.user_section_grants (user_id) where deleted_at is null;

create or replace function public.can_write_section(
  p_section_code text,
  p_institute_id uuid default null,
  p_college_id uuid default null,
  p_department_id uuid default null
) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_section_grants ug
    join public.admin_sections s on s.id = ug.section_id
    where ug.user_id = auth.uid()
      and ug.status = 'published' and ug.deleted_at is null
      and s.code = p_section_code and s.deleted_at is null
      and (
        ug.scope_type = 'global'
        or (ug.scope_type = 'institute' and p_institute_id is not null and ug.institute_id = p_institute_id)
        or (ug.scope_type = 'college' and p_college_id is not null and ug.college_id = p_college_id)
        or (ug.scope_type = 'department' and p_department_id is not null and ug.department_id = p_department_id)
      )
  );
$$;

alter table public.admin_sections enable row level security;
alter table public.user_section_grants enable row level security;

create policy "Authenticated read admin_sections" on public.admin_sections
  for select to authenticated using (true);
create policy "Global admin write admin_sections" on public.admin_sections
  for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

create policy "Authenticated read user_section_grants" on public.user_section_grants
  for select to authenticated using (true);
create policy "Global admin write user_section_grants" on public.user_section_grants
  for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
