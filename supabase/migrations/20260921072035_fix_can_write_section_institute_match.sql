-- A table with no institute_id column passes NULL for p_institute_id. Since this
-- deployment has exactly one institute, an institute-scoped grant should apply to
-- such institute-wide content unconditionally rather than never matching.
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
        or (ug.scope_type = 'institute' and (p_institute_id is null or ug.institute_id = p_institute_id))
        or (ug.scope_type = 'college' and p_college_id is not null and ug.college_id = p_college_id)
        or (ug.scope_type = 'department' and p_department_id is not null and ug.department_id = p_department_id)
      )
  );
$$;
