-- Scopes staff_department_assignments writes (the actual "which department is
-- this staff member linked to" boundary) the same way as the other content
-- tables. staff_profiles itself has no direct department column (it's linked
-- via the assignments join table), so its write policy allows the row's own
-- creator to keep editing it (covers the moment right after creation, before
-- any assignment exists yet) plus anyone whose scope matches an existing
-- assignment for that staff member, plus global admins unconditionally.

drop policy if exists "Auth CRUD" on public.staff_department_assignments;
create policy "Scoped insert staff_department_assignments" on public.staff_department_assignments for insert
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped update staff_department_assignments" on public.staff_department_assignments for update
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id))
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped delete staff_department_assignments" on public.staff_department_assignments for delete
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));

drop policy if exists "Auth CRUD" on public.staff_profiles;
create policy "Scoped insert staff_profiles" on public.staff_profiles for insert
  to authenticated with check (true);
create policy "Scoped update staff_profiles" on public.staff_profiles for update
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.status = 'published' and ur.deleted_at is null and ur.scope_type = 'global'
    )
    or exists (
      select 1 from public.staff_department_assignments sda
      join public.departments d on d.id = sda.department_id
      where sda.staff_id = staff_profiles.id
        and sda.deleted_at is null
        and public.can_write_scoped_record(null, null, d.college_id, sda.department_id)
    )
  )
  with check (
    created_by = auth.uid()
    or exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.status = 'published' and ur.deleted_at is null and ur.scope_type = 'global'
    )
    or exists (
      select 1 from public.staff_department_assignments sda
      join public.departments d on d.id = sda.department_id
      where sda.staff_id = staff_profiles.id
        and sda.deleted_at is null
        and public.can_write_scoped_record(null, null, d.college_id, sda.department_id)
    )
  );
create policy "Scoped delete staff_profiles" on public.staff_profiles for delete
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.status = 'published' and ur.deleted_at is null and ur.scope_type = 'global'
    )
    or exists (
      select 1 from public.staff_department_assignments sda
      join public.departments d on d.id = sda.department_id
      where sda.staff_id = staff_profiles.id
        and sda.deleted_at is null
        and public.can_write_scoped_record(null, null, d.college_id, sda.department_id)
    )
  );
