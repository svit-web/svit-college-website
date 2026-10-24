-- list_unassigned_staff() only ever surfaced live (non-deleted) unassigned staff, so a
-- trashed staff profile with no active department assignment was invisible everywhere
-- except /admin/trash to a global admin. Let any admin with a published role opt into
-- seeing trashed-and-unassigned staff too, and restore them from here.

drop function if exists public.list_unassigned_staff();

create or replace function public.list_unassigned_staff(p_include_deleted boolean default false)
returns table (
  id uuid,
  title text,
  first_name text,
  middle_name text,
  last_name text,
  employee_code text,
  email text,
  photo_url text,
  status text,
  created_at timestamptz,
  deleted_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select sp.id, sp.title, sp.first_name, sp.middle_name, sp.last_name,
         sp.employee_code, sp.email, sp.photo_url, sp.status::text, sp.created_at, sp.deleted_at
  from public.staff_profiles sp
  where (sp.deleted_at is null or p_include_deleted)
    and not exists (
      select 1 from public.staff_department_assignments sda
      where sda.staff_id = sp.id and sda.deleted_at is null
    )
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.status = 'published'
        and ur.deleted_at is null
    )
  order by sp.deleted_at is not null, sp.created_at;
$$;

grant execute on function public.list_unassigned_staff(boolean) to authenticated;

create or replace function public.restore_unassigned_staff(p_staff_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.status = 'published'
      and ur.deleted_at is null
  ) then
    raise exception 'Not authorized';
  end if;

  if exists (
    select 1 from public.staff_department_assignments sda
    where sda.staff_id = p_staff_id and sda.deleted_at is null
  ) then
    raise exception 'Staff member already has a department assignment — use the normal restore flow';
  end if;

  update public.staff_profiles
  set deleted_at = null, deleted_by = null, status = 'published'
  where id = p_staff_id and deleted_at is not null;
end;
$$;

grant execute on function public.restore_unassigned_staff(uuid) to authenticated;
