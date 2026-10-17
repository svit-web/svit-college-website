-- can_write_scoped_record(trust_id, institute_id, college_id, department_id)
-- supports the full global > trust > institute > college > department scope
-- ladder, but every "Scoped *" RLS policy below the institutes table itself
-- hardcoded trust_id (and, for departments/courses/staff_department_assignments/
-- staff_profiles, institute_id too) to NULL instead of threading the row's
-- real ancestry through. Confirmed live during the 2026-10-14 testing pass:
-- a trust-scoped admin saw 0 rows on /admin/tables/colleges, not because RLS
-- denied them by design but because the policy never gave trust-scope a
-- chance to match. institutes itself already threads trust_id correctly
-- (see 20260805051746_scope_aware_write_rls.sql) -- this migration brings
-- every table below it in line with that same cascade.
--
-- Fix: replace every hardcoded NULL::uuid for trust_id/institute_id with a
-- subquery that resolves it via the table's actual FK chain up to
-- institutes. All other clauses (section-grant OR branches, admissions
-- carve-out, admin_section_id check) are left exactly as they were.

-- colleges: institute_id is direct; trust_id resolves via institutes
drop policy if exists "Scoped insert colleges" on public.colleges;
create policy "Scoped insert colleges" on public.colleges for insert
  with check (can_write_scoped_record(
    (select trust_id from public.institutes where id = colleges.institute_id),
    institute_id, id, null
  ));
drop policy if exists "Scoped update colleges" on public.colleges;
create policy "Scoped update colleges" on public.colleges for update
  using (can_write_scoped_record(
    (select trust_id from public.institutes where id = colleges.institute_id),
    institute_id, id, null
  ))
  with check (can_write_scoped_record(
    (select trust_id from public.institutes where id = colleges.institute_id),
    institute_id, id, null
  ));
drop policy if exists "Scoped delete colleges" on public.colleges;
create policy "Scoped delete colleges" on public.colleges for delete
  using (can_write_scoped_record(
    (select trust_id from public.institutes where id = colleges.institute_id),
    institute_id, id, null
  ));
drop policy if exists "Scoped read colleges" on public.colleges;
create policy "Scoped read colleges" on public.colleges for select
  to authenticated
  using (can_write_scoped_record(
    (select trust_id from public.institutes where id = colleges.institute_id),
    institute_id, id, null
  ));

-- centers: institute_id is direct; trust_id resolves via institutes
drop policy if exists "Scoped insert centers" on public.centers;
create policy "Scoped insert centers" on public.centers for insert
  with check (
    can_write_scoped_record(
      (select trust_id from public.institutes where id = centers.institute_id),
      institute_id, college_id, null
    )
    or can_write_section('campus_life', institute_id, college_id, null)
  );
drop policy if exists "Scoped update centers" on public.centers;
create policy "Scoped update centers" on public.centers for update
  using (
    can_write_scoped_record(
      (select trust_id from public.institutes where id = centers.institute_id),
      institute_id, college_id, null
    )
    or can_write_section('campus_life', institute_id, college_id, null)
  )
  with check (
    can_write_scoped_record(
      (select trust_id from public.institutes where id = centers.institute_id),
      institute_id, college_id, null
    )
    or can_write_section('campus_life', institute_id, college_id, null)
  );
drop policy if exists "Scoped delete centers" on public.centers;
create policy "Scoped delete centers" on public.centers for delete
  using (
    can_write_scoped_record(
      (select trust_id from public.institutes where id = centers.institute_id),
      institute_id, college_id, null
    )
    or can_write_section('campus_life', institute_id, college_id, null)
  );
drop policy if exists "Scoped read centers" on public.centers;
create policy "Scoped read centers" on public.centers for select
  to authenticated
  using (can_write_scoped_record(
    (select trust_id from public.institutes where id = centers.institute_id),
    institute_id, college_id, null
  ));

-- facilities: institute_id is direct; trust_id resolves via institutes
drop policy if exists "Scoped insert facilities" on public.facilities;
create policy "Scoped insert facilities" on public.facilities for insert
  with check (
    can_write_scoped_record(
      (select trust_id from public.institutes where id = facilities.institute_id),
      institute_id,
      (select d.college_id from public.departments d where d.id = facilities.department_id),
      department_id
    )
    or (admin_section_id is not null and can_write_section(
      (select admin_sections.code from public.admin_sections where admin_sections.id = facilities.admin_section_id)
    ))
  );
drop policy if exists "Scoped update facilities" on public.facilities;
create policy "Scoped update facilities" on public.facilities for update
  using (
    can_write_scoped_record(
      (select trust_id from public.institutes where id = facilities.institute_id),
      institute_id,
      (select d.college_id from public.departments d where d.id = facilities.department_id),
      department_id
    )
    or (admin_section_id is not null and can_write_section(
      (select admin_sections.code from public.admin_sections where admin_sections.id = facilities.admin_section_id)
    ))
  )
  with check (
    can_write_scoped_record(
      (select trust_id from public.institutes where id = facilities.institute_id),
      institute_id,
      (select d.college_id from public.departments d where d.id = facilities.department_id),
      department_id
    )
    or (admin_section_id is not null and can_write_section(
      (select admin_sections.code from public.admin_sections where admin_sections.id = facilities.admin_section_id)
    ))
  );
drop policy if exists "Scoped delete facilities" on public.facilities;
create policy "Scoped delete facilities" on public.facilities for delete
  using (
    can_write_scoped_record(
      (select trust_id from public.institutes where id = facilities.institute_id),
      institute_id,
      (select d.college_id from public.departments d where d.id = facilities.department_id),
      department_id
    )
    or (admin_section_id is not null and can_write_section(
      (select admin_sections.code from public.admin_sections where admin_sections.id = facilities.admin_section_id)
    ))
  );
drop policy if exists "Scoped read facilities" on public.facilities;
create policy "Scoped read facilities" on public.facilities for select
  to authenticated
  using (can_write_scoped_record(
    (select trust_id from public.institutes where id = facilities.institute_id),
    institute_id,
    (select d.college_id from public.departments d where d.id = facilities.department_id),
    department_id
  ));

-- departments: college_id is direct; institute_id + trust_id resolve via colleges -> institutes
drop policy if exists "Scoped insert departments" on public.departments;
create policy "Scoped insert departments" on public.departments for insert
  with check (can_write_scoped_record(
    (select i.trust_id from public.colleges c join public.institutes i on i.id = c.institute_id where c.id = departments.college_id),
    (select c.institute_id from public.colleges c where c.id = departments.college_id),
    college_id, id
  ));
drop policy if exists "Scoped update departments" on public.departments;
create policy "Scoped update departments" on public.departments for update
  using (can_write_scoped_record(
    (select i.trust_id from public.colleges c join public.institutes i on i.id = c.institute_id where c.id = departments.college_id),
    (select c.institute_id from public.colleges c where c.id = departments.college_id),
    college_id, id
  ))
  with check (can_write_scoped_record(
    (select i.trust_id from public.colleges c join public.institutes i on i.id = c.institute_id where c.id = departments.college_id),
    (select c.institute_id from public.colleges c where c.id = departments.college_id),
    college_id, id
  ));
drop policy if exists "Scoped delete departments" on public.departments;
create policy "Scoped delete departments" on public.departments for delete
  using (can_write_scoped_record(
    (select i.trust_id from public.colleges c join public.institutes i on i.id = c.institute_id where c.id = departments.college_id),
    (select c.institute_id from public.colleges c where c.id = departments.college_id),
    college_id, id
  ));
drop policy if exists "Scoped read departments" on public.departments;
create policy "Scoped read departments" on public.departments for select
  to authenticated
  using (can_write_scoped_record(
    (select i.trust_id from public.colleges c join public.institutes i on i.id = c.institute_id where c.id = departments.college_id),
    (select c.institute_id from public.colleges c where c.id = departments.college_id),
    college_id, id
  ));

-- courses: department_id is direct; college_id/institute_id/trust_id resolve via departments -> colleges -> institutes
drop policy if exists "Scoped insert courses" on public.courses;
create policy "Scoped insert courses" on public.courses for insert
  with check (can_write_scoped_record(
    (select i.trust_id from public.departments d join public.colleges c on c.id = d.college_id join public.institutes i on i.id = c.institute_id where d.id = courses.department_id),
    (select c.institute_id from public.departments d join public.colleges c on c.id = d.college_id where d.id = courses.department_id),
    (select d.college_id from public.departments d where d.id = courses.department_id),
    department_id
  ));
drop policy if exists "Scoped delete courses" on public.courses;
create policy "Scoped delete courses" on public.courses for delete
  using (can_write_scoped_record(
    (select i.trust_id from public.departments d join public.colleges c on c.id = d.college_id join public.institutes i on i.id = c.institute_id where d.id = courses.department_id),
    (select c.institute_id from public.departments d join public.colleges c on c.id = d.college_id where d.id = courses.department_id),
    (select d.college_id from public.departments d where d.id = courses.department_id),
    department_id
  ));
drop policy if exists "Scoped read courses" on public.courses;
create policy "Scoped read courses" on public.courses for select
  to authenticated
  using (can_write_scoped_record(
    (select i.trust_id from public.departments d join public.colleges c on c.id = d.college_id join public.institutes i on i.id = c.institute_id where d.id = courses.department_id),
    (select c.institute_id from public.departments d join public.colleges c on c.id = d.college_id where d.id = courses.department_id),
    (select d.college_id from public.departments d where d.id = courses.department_id),
    department_id
  ));
drop policy if exists "Scoped update courses" on public.courses;
create policy "Scoped update courses" on public.courses for update
  using (
    can_write_scoped_record(
      (select i.trust_id from public.departments d join public.colleges c on c.id = d.college_id join public.institutes i on i.id = c.institute_id where d.id = courses.department_id),
      (select c.institute_id from public.departments d join public.colleges c on c.id = d.college_id where d.id = courses.department_id),
      (select d.college_id from public.departments d where d.id = courses.department_id),
      department_id
    )
    or (can_write_section('admissions') and is_programme = false and department_id is not null)
  )
  with check (
    can_write_scoped_record(
      (select i.trust_id from public.departments d join public.colleges c on c.id = d.college_id join public.institutes i on i.id = c.institute_id where d.id = courses.department_id),
      (select c.institute_id from public.departments d join public.colleges c on c.id = d.college_id where d.id = courses.department_id),
      (select d.college_id from public.departments d where d.id = courses.department_id),
      department_id
    )
    or (can_write_section('admissions') and is_programme = false and department_id is not null)
  );

-- staff_department_assignments: department_id is direct; college_id/institute_id/trust_id resolve the same way as courses
drop policy if exists "Scoped insert staff_department_assignments" on public.staff_department_assignments;
create policy "Scoped insert staff_department_assignments" on public.staff_department_assignments for insert
  with check (can_write_scoped_record(
    (select i.trust_id from public.departments d join public.colleges c on c.id = d.college_id join public.institutes i on i.id = c.institute_id where d.id = staff_department_assignments.department_id),
    (select c.institute_id from public.departments d join public.colleges c on c.id = d.college_id where d.id = staff_department_assignments.department_id),
    (select d.college_id from public.departments d where d.id = staff_department_assignments.department_id),
    department_id
  ));
drop policy if exists "Scoped update staff_department_assignments" on public.staff_department_assignments;
create policy "Scoped update staff_department_assignments" on public.staff_department_assignments for update
  using (can_write_scoped_record(
    (select i.trust_id from public.departments d join public.colleges c on c.id = d.college_id join public.institutes i on i.id = c.institute_id where d.id = staff_department_assignments.department_id),
    (select c.institute_id from public.departments d join public.colleges c on c.id = d.college_id where d.id = staff_department_assignments.department_id),
    (select d.college_id from public.departments d where d.id = staff_department_assignments.department_id),
    department_id
  ))
  with check (can_write_scoped_record(
    (select i.trust_id from public.departments d join public.colleges c on c.id = d.college_id join public.institutes i on i.id = c.institute_id where d.id = staff_department_assignments.department_id),
    (select c.institute_id from public.departments d join public.colleges c on c.id = d.college_id where d.id = staff_department_assignments.department_id),
    (select d.college_id from public.departments d where d.id = staff_department_assignments.department_id),
    department_id
  ));
drop policy if exists "Scoped delete staff_department_assignments" on public.staff_department_assignments;
create policy "Scoped delete staff_department_assignments" on public.staff_department_assignments for delete
  using (can_write_scoped_record(
    (select i.trust_id from public.departments d join public.colleges c on c.id = d.college_id join public.institutes i on i.id = c.institute_id where d.id = staff_department_assignments.department_id),
    (select c.institute_id from public.departments d join public.colleges c on c.id = d.college_id where d.id = staff_department_assignments.department_id),
    (select d.college_id from public.departments d where d.id = staff_department_assignments.department_id),
    department_id
  ));
drop policy if exists "Scoped read staff_department_assignments" on public.staff_department_assignments;
create policy "Scoped read staff_department_assignments" on public.staff_department_assignments for select
  to authenticated
  using (can_write_scoped_record(
    (select i.trust_id from public.departments d join public.colleges c on c.id = d.college_id join public.institutes i on i.id = c.institute_id where d.id = staff_department_assignments.department_id),
    (select c.institute_id from public.departments d join public.colleges c on c.id = d.college_id where d.id = staff_department_assignments.department_id),
    (select d.college_id from public.departments d where d.id = staff_department_assignments.department_id),
    department_id
  ));

-- staff_profiles: scope check lives inside an EXISTS over staff_department_assignments
-- joined to departments; extend that join up through colleges/institutes so
-- trust_id and institute_id can match too, same ancestry as above.
drop policy if exists "Scoped read staff_profiles" on public.staff_profiles;
create policy "Scoped read staff_profiles" on public.staff_profiles for select
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.status = 'published' and ur.deleted_at is null
        and ur.scope_type = 'global'
    )
    or exists (
      select 1
      from public.staff_department_assignments sda
      join public.departments d on d.id = sda.department_id
      join public.colleges c on c.id = d.college_id
      join public.institutes i on i.id = c.institute_id
      where sda.staff_id = staff_profiles.id
        and sda.deleted_at is null
        and can_write_scoped_record(i.trust_id, c.institute_id, d.college_id, sda.department_id)
    )
  );
drop policy if exists "Scoped update staff_profiles" on public.staff_profiles;
create policy "Scoped update staff_profiles" on public.staff_profiles for update
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.status = 'published' and ur.deleted_at is null
        and ur.scope_type = 'global'
    )
    or exists (
      select 1
      from public.staff_department_assignments sda
      join public.departments d on d.id = sda.department_id
      join public.colleges c on c.id = d.college_id
      join public.institutes i on i.id = c.institute_id
      where sda.staff_id = staff_profiles.id
        and sda.deleted_at is null
        and can_write_scoped_record(i.trust_id, c.institute_id, d.college_id, sda.department_id)
    )
  )
  with check (
    created_by = auth.uid()
    or exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.status = 'published' and ur.deleted_at is null
        and ur.scope_type = 'global'
    )
    or exists (
      select 1
      from public.staff_department_assignments sda
      join public.departments d on d.id = sda.department_id
      join public.colleges c on c.id = d.college_id
      join public.institutes i on i.id = c.institute_id
      where sda.staff_id = staff_profiles.id
        and sda.deleted_at is null
        and can_write_scoped_record(i.trust_id, c.institute_id, d.college_id, sda.department_id)
    )
  );
drop policy if exists "Scoped delete staff_profiles" on public.staff_profiles;
create policy "Scoped delete staff_profiles" on public.staff_profiles for delete
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.status = 'published' and ur.deleted_at is null
        and ur.scope_type = 'global'
    )
    or exists (
      select 1
      from public.staff_department_assignments sda
      join public.departments d on d.id = sda.department_id
      join public.colleges c on c.id = d.college_id
      join public.institutes i on i.id = c.institute_id
      where sda.staff_id = staff_profiles.id
        and sda.deleted_at is null
        and can_write_scoped_record(i.trust_id, c.institute_id, d.college_id, sda.department_id)
    )
  );
