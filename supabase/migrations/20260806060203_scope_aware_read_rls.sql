-- Extends the college/department write scoping from
-- 20260805051746_scope_aware_write_rls.sql to reads: a college-scoped admin
-- should only ever fetch their own college's rows, and a department-scoped
-- admin only their own department's rows, on the Academics + Staff tables
-- that back the sidebar's scope-following sections (Colleges, Departments,
-- Courses, Facilities/Labs, Dept Activities, Societies, Staff Profiles).
-- The public/anon-facing site is unaffected -- every table here keeps an
-- unscoped `to anon` read policy so the published website keeps working;
-- only the `authenticated` (admin portal) read is being narrowed.
--
-- Read access reuses can_write_scoped_record() rather than a parallel
-- function: for these tables the read boundary and the write boundary are
-- identical (if you can't manage a row, you shouldn't see it in the admin
-- portal either).

-- colleges: own id is the scope key
drop policy if exists "Public read colleges" on public.colleges;
create policy "Anon read colleges" on public.colleges for select
  to anon using (true);
create policy "Scoped read colleges" on public.colleges for select
  to authenticated using (public.can_write_scoped_record(null, institute_id, id, null));

-- departments: own id is the scope key, college_id links it up
drop policy if exists "Public read departments" on public.departments;
create policy "Anon read departments" on public.departments for select
  to anon using (true);
create policy "Scoped read departments" on public.departments for select
  to authenticated using (public.can_write_scoped_record(null, null, college_id, id));

-- courses: department_id only, college resolved via departments
drop policy if exists "Public read courses" on public.courses;
create policy "Anon read courses" on public.courses for select
  to anon using (true);
create policy "Scoped read courses" on public.courses for select
  to authenticated using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = courses.department_id), department_id));

-- facilities (also backs the /admin/labs page): department_id + institute_id
drop policy if exists "Authenticated read facilities" on public.facilities;
create policy "Scoped read facilities" on public.facilities for select
  to authenticated using (public.can_write_scoped_record(null, institute_id,
    (select d.college_id from public.departments d where d.id = facilities.department_id), department_id));

-- department_activities: department_id only; previously granted to the
-- "public" pseudo-role (anon + authenticated) in one policy -- split it.
drop policy if exists "Anon SELECT" on public.department_activities;
create policy "Anon read department_activities" on public.department_activities for select
  to anon using (true);
create policy "Scoped read department_activities" on public.department_activities for select
  to authenticated using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_activities.department_id), department_id));

-- centers (Societies): college_id + institute_id
drop policy if exists "Authenticated read centers" on public.centers;
create policy "Scoped read centers" on public.centers for select
  to authenticated using (public.can_write_scoped_record(null, institute_id, college_id, null));

-- staff_profiles: no direct department column -- mirror the write policy's
-- three-way check (own draft row, global admin, or scope match through the
-- staff_department_assignments join table).
drop policy if exists "Public read staff_profiles" on public.staff_profiles;
create policy "Anon read staff_profiles" on public.staff_profiles for select
  to anon using (true);
create policy "Scoped read staff_profiles" on public.staff_profiles for select
  to authenticated using (
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

-- staff_department_assignments: department_id only
drop policy if exists "Authenticated read staff_department_assignments" on public.staff_department_assignments;
create policy "Scoped read staff_department_assignments" on public.staff_department_assignments for select
  to authenticated using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = staff_department_assignments.department_id), department_id));
