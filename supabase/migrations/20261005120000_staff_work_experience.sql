-- Replace the generic staff_achievements.type='experience' rows with a proper
-- LinkedIn-style work-experience entity: position, organization, start/end
-- month+year, a "Currently Working" flag, and an industry-vs-teaching
-- category so the two can be totalled separately on the department staff
-- listing. Also adds staff_profiles.middle_name.
--
-- Scope note: qualification/award/patent/publication/research/activity stay
-- as free-text staff_achievements rows — only "experience" is being pulled
-- out into structured data.

-- 1. Faculty name: optional middle name, shown between first and last.
alter table public.staff_profiles
  add column if not exists middle_name text;

-- 2. New table.
create table public.staff_work_experience (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff_profiles(id) on delete cascade,
  category text not null check (category = any (array['industry', 'teaching'])),
  position text not null,
  organization text not null,
  start_month smallint not null check (start_month between 1 and 12),
  start_year smallint not null check (start_year >= 1950),
  end_month smallint check (end_month between 1 and 12),
  end_year smallint,
  is_current boolean not null default false,
  description text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamp with time zone,
  deleted_by uuid references public.user_profiles(id),
  -- "Currently Working" and an end date are mutually exclusive, and when an
  -- entry has ended, both halves of the end date must be present.
  constraint staff_work_experience_end_shape check (
    (is_current and end_month is null and end_year is null)
    or (not is_current and end_month is not null and end_year is not null)
  ),
  -- end date can't be before the start date (month+year granularity).
  constraint staff_work_experience_end_after_start check (
    is_current or (end_year, end_month) >= (start_year, start_month)
  ),
  -- start date can't be in the future.
  constraint staff_work_experience_start_not_future check (
    (start_year, start_month) <= (
      extract(year from now())::smallint, extract(month from now())::smallint
    )
  )
);

create index idx_staff_work_experience_staff_id on public.staff_work_experience using btree (staff_id);

create trigger update_staff_work_experience_modtime
  before update on public.staff_work_experience
  for each row execute function public.update_updated_at_column();

alter table public.staff_work_experience enable row level security;

create policy "Anon SELECT" on public.staff_work_experience
  for select to anon using (deleted_at is null);

create policy "Authenticated users can read staff_work_experience" on public.staff_work_experience
  for select to authenticated using (deleted_at is null);

create policy "Scoped write staff_work_experience" on public.staff_work_experience
  to authenticated
  using (
    public.is_global_admin()
    or exists (
      select 1 from public.staff_department_assignments sda
      join public.departments d on d.id = sda.department_id
      where sda.staff_id = staff_work_experience.staff_id
        and sda.deleted_at is null
        and public.can_write_scoped_record(null::uuid, null::uuid, d.college_id, sda.department_id)
    )
  )
  with check (
    public.is_global_admin()
    or exists (
      select 1 from public.staff_department_assignments sda
      join public.departments d on d.id = sda.department_id
      where sda.staff_id = staff_work_experience.staff_id
        and sda.deleted_at is null
        and public.can_write_scoped_record(null::uuid, null::uuid, d.college_id, sda.department_id)
    )
  );

-- 3. Backfill from the legacy staff_achievements rows. Legacy import rows
-- look like title="<Position> at <Organization>" with extra = {from, to}
-- dates as "DD-MM-YYYY ..."; empty "to" means still ongoing. A handful of
-- rows don't match this shape (free-typed test data, or a swapped from/to
-- pair) — those are left in staff_achievements and reported separately for
-- manual re-entry instead of being force-migrated.
with parsed as (
  select distinct on (sa.staff_id, sa.title, sa.extra)
    sa.id as source_id,
    sa.staff_id,
    trim((regexp_match(sa.title, '^(.*?)\s+at\s+(.*)$'))[1]) as position,
    trim((regexp_match(sa.title, '^(.*?)\s+at\s+(.*)$'))[2]) as organization,
    to_date(left(sa.extra->>'from', 10), 'DD-MM-YYYY') as start_date,
    case
      when coalesce(sa.extra->>'to', '') = '' then null
      else to_date(left(sa.extra->>'to', 10), 'DD-MM-YYYY')
    end as end_date
  from public.staff_achievements sa
  where sa.type = 'experience'
    and sa.deleted_at is null
    and sa.title ~* '^.+\sat\s.+$'
    and coalesce(sa.extra->>'from', '') <> ''
),
classified as (
  select
    *,
    case
      when position ~* 'professor|lecturer|teach|tutor|faculty|\bhod\b|head|principal|\bdpe\b'
        then 'teaching'
      else 'industry'
    end as category
  from parsed
  where start_date >= '1950-01-01'
    and start_date <= now()
    and (end_date is null or end_date >= start_date)
)
insert into public.staff_work_experience (
  staff_id, category, position, organization,
  start_month, start_year, end_month, end_year, is_current
)
select
  staff_id,
  category,
  position,
  organization,
  extract(month from start_date)::smallint,
  extract(year from start_date)::smallint,
  case when end_date is null then null else extract(month from end_date)::smallint end,
  case when end_date is null then null else extract(year from end_date)::smallint end,
  end_date is null
from classified;

-- 4. Soft-delete every migrated staff_achievements row (the ones that fed
-- staff_work_experience above). Rows that didn't parse are left alone.
with parsed_ids as (
  select sa.id
  from public.staff_achievements sa
  where sa.type = 'experience'
    and sa.deleted_at is null
    and sa.title ~* '^.+\sat\s.+$'
    and coalesce(sa.extra->>'from', '') <> ''
    and to_date(left(sa.extra->>'from', 10), 'DD-MM-YYYY') >= '1950-01-01'
    and to_date(left(sa.extra->>'from', 10), 'DD-MM-YYYY') <= now()
    and (
      coalesce(sa.extra->>'to', '') = ''
      or to_date(left(sa.extra->>'to', 10), 'DD-MM-YYYY') >= to_date(left(sa.extra->>'from', 10), 'DD-MM-YYYY')
    )
)
update public.staff_achievements
set deleted_at = now()
where id in (select id from parsed_ids);

-- 5. "experience" stays a legal staff_achievements.type value — the CHECK
-- constraint applies to every row regardless of deleted_at, and the rows
-- migrated in step 4 keep type='experience' after being soft-deleted, so
-- the value can't be dropped without rewriting history. New rows of this
-- type simply can't be created any more because the admin UI no longer
-- offers it (see AdminStaffWizardsPage.tsx / staff-achievements-import.ts).
-- The few rows that didn't auto-migrate (still live, type='experience')
-- are flagged in docs/audits/staff-work-experience-migration-report.md for
-- manual re-entry as proper staff_work_experience rows.

-- 6. joining_year/past_experience_years are superseded by work-experience
-- entries (current SVIT employment is now just a "Currently Working" entry).
alter table public.staff_profiles
  drop column if exists joining_year,
  drop column if exists past_experience_years;
