-- MoUs per department: mous.department_name was free text, so a MoU couldn't be
-- shown on its department's page or managed by that department.
--   * department_id links a MoU to its department; college_id is derived from
--     it (same idea as events_before_write) so college admins are scoped too.
--     A MoU with no department is institute-wide.
--   * Writes open up from global admins to: the department or college that owns
--     the MoU (and trust/institute admins above them), plus anyone holding the
--     'placement' section grant. A global grant covers every MoU, a college or
--     department grant only that part. Institute-wide MoUs stay with global
--     admins and global placement grants.
-- Reads are unchanged: the public and every admin can read all MoUs.
-- department_name stays for now as the source of the backfill below; the admin
-- form no longer edits it.

alter table public.mous
  add column if not exists department_id uuid references public.departments(id) on delete set null,
  add column if not exists college_id uuid references public.colleges(id) on delete set null;

create index if not exists mous_department_idx on public.mous (department_id)
  where department_id is not null;
create index if not exists mous_college_idx on public.mous (college_id)
  where college_id is not null;

create or replace function public.mous_before_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.department_id is not null then
    select d.college_id into new.college_id from public.departments d where d.id = new.department_id;
  end if;
  return new;
end;
$$;

drop trigger if exists mous_before_write_trigger on public.mous;
create trigger mous_before_write_trigger
  before insert or update on public.mous
  for each row execute function public.mous_before_write();

-- Existing rows: the only department_name values in use are these three.
update public.mous m
set department_id = d.id
from public.departments d
where m.department_id is null
  and d.deleted_at is null
  and d.code = case m.department_name
    when 'MCA' then 'MCA'
    when 'Computer' then 'CE'
    when 'Electrical' then 'EE'
  end;

drop policy if exists "Global write mous" on public.mous;
drop policy if exists "Scoped write mous" on public.mous;
create policy "Scoped write mous" on public.mous for all to authenticated
  using (
    public.is_global_admin()
    or public.can_write_section('placement', null, college_id, department_id)
    or (
      department_id is not null
      and public.can_write_scoped_record(
        (select i.trust_id from public.colleges c join public.institutes i on i.id = c.institute_id where c.id = mous.college_id),
        (select c.institute_id from public.colleges c where c.id = mous.college_id),
        college_id,
        department_id
      )
    )
  )
  with check (
    public.is_global_admin()
    or public.can_write_section('placement', null, college_id, department_id)
    or (
      department_id is not null
      and public.can_write_scoped_record(
        (select i.trust_id from public.colleges c join public.institutes i on i.id = c.institute_id where c.id = mous.college_id),
        (select c.institute_id from public.colleges c where c.id = mous.college_id),
        college_id,
        department_id
      )
    )
  );

notify pgrst, 'reload schema';
