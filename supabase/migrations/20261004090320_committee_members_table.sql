-- Committee membership as rows, not JSON. committees.metadata.members held
-- an array of {name, role|position, designation, email, phone} objects with
-- no way to link a member to their staff profile or manage members
-- individually. Per ADR 0003 this child table replaces the array: backfilled
-- below, optionally auto-linked to staff_profiles by email, then the JSON
-- key is dropped — content lives in exactly one place.

create table public.committee_members (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  college_id uuid not null references public.colleges(id),
  staff_profile_id uuid references public.staff_profiles(id),
  name text not null,
  position text,
  designation text,
  email text,
  phone text,
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

create index committee_members_committee_idx on public.committee_members (committee_id, sort_order);

alter table public.committee_members enable row level security;

create policy "Anon SELECT" on public.committee_members
  for select to anon using (true);

create policy "Authenticated read committee_members" on public.committee_members
  for select to authenticated using (true);

-- Same policy shape as committees itself (20260921072107): org-scope write
-- via college_id, or an about_us section grant constrained to the college.
create policy "Scoped insert committee_members" on public.committee_members for insert
  with check (public.can_write_scoped_record(null, null, college_id, null) or public.can_write_section('about_us', null, college_id, null));

create policy "Scoped update committee_members" on public.committee_members for update
  using (public.can_write_scoped_record(null, null, college_id, null) or public.can_write_section('about_us', null, college_id, null))
  with check (public.can_write_scoped_record(null, null, college_id, null) or public.can_write_section('about_us', null, college_id, null));

create policy "Scoped delete committee_members" on public.committee_members for delete
  using (public.can_write_scoped_record(null, null, college_id, null) or public.can_write_section('about_us', null, college_id, null));

create trigger update_committee_members_modtime
  before update on public.committee_members
  for each row
  execute function public.update_updated_at_column();

-- Backfill: expand committees.metadata.members into rows. `position`
-- normalizes the legacy split between `position` and `role` keys (46 vs 39
-- rows used one or the other in the live data).
insert into public.committee_members (committee_id, college_id, name, position, designation, email, phone, sort_order, status)
select c.id,
  c.college_id,
  m.value->>'name',
  coalesce(m.value->>'position', m.value->>'role'),
  m.value->>'designation',
  m.value->>'email',
  m.value->>'phone',
  m.ordinality - 1,
  'published'
from public.committees c
cross join lateral jsonb_array_elements(c.metadata->'members') with ordinality as m(value, ordinality)
where c.metadata ? 'members' and jsonb_typeof(c.metadata->'members') = 'array';

-- Auto-link members to staff profiles by exact case-insensitive email match
-- where exactly one live profile matches; ambiguous or email-less members
-- stay External / free-text (CONTEXT.md: Committee member).
update public.committee_members cm
set staff_profile_id = sp.id
from public.staff_profiles sp
where cm.staff_profile_id is null
  and cm.email is not null
  and lower(sp.email) = lower(cm.email)
  and sp.deleted_at is null
  and (select count(*) from public.staff_profiles sp2
       where lower(sp2.email) = lower(cm.email) and sp2.deleted_at is null) = 1;

-- Drop the now-redundant members array from committees.metadata
update public.committees
set metadata = metadata - 'members'
where metadata ? 'members';
