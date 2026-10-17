-- Staff with zero active department assignments are invisible to scoped admins
-- (RLS on staff_profiles resolves scope via a join through staff_department_assignments),
-- so a department/college coordinator has no way to even discover them, let alone
-- claim one into their own department or delete a junk entry. These two
-- SECURITY DEFINER functions expose just enough to let any admin with a published
-- role fix that, without widening the base RLS policies.

create or replace function public.list_unassigned_staff()
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
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select sp.id, sp.title, sp.first_name, sp.middle_name, sp.last_name,
         sp.employee_code, sp.email, sp.photo_url, sp.status::text, sp.created_at
  from public.staff_profiles sp
  where sp.deleted_at is null
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
  order by sp.created_at;
$$;

grant execute on function public.list_unassigned_staff() to authenticated;

create or replace function public.delete_unassigned_staff(p_staff_id uuid)
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
    raise exception 'Staff member already has a department assignment — use the normal delete flow';
  end if;

  update public.staff_profiles
  set deleted_at = now(), deleted_by = auth.uid()
  where id = p_staff_id and deleted_at is null;
end;
$$;

grant execute on function public.delete_unassigned_staff(uuid) to authenticated;
