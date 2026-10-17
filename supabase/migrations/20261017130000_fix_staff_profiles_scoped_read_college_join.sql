-- Bug: a department-scoped coordinator (role 'editor', scope_type 'department')
-- saw zero faculty on /admin/staff-wizards no matter how many staff were really
-- assigned to their department, and every one of those staff showed as
-- "Unassigned" even though they had a live staff_department_assignments row.
--
-- Root cause: staff_profiles's "Scoped read/update/delete staff_profiles"
-- policies validate department-level access via
--   EXISTS (SELECT 1 FROM staff_department_assignments sda
--             JOIN departments d ON d.id = sda.department_id
--             JOIN colleges c ON c.id = d.college_id
--             JOIN institutes i ON i.id = c.institute_id
--           WHERE sda.staff_id = staff_profiles.id AND sda.deleted_at IS NULL
--             AND can_write_scoped_record(i.trust_id, c.institute_id, d.college_id, sda.department_id))
--
-- colleges' own "Scoped read colleges" policy calls can_write_scoped_record
-- with a hardcoded NULL department_id (4th arg) -- by design, colleges has no
-- department-tier read access, only global/trust/institute/college. So a
-- department-scoped user can never SELECT a colleges row at all.
--
-- That's fine for colleges itself, but staff_profiles's policy above reaches
-- colleges via a real INNER JOIN, not a scalar subquery -- if colleges' RLS
-- blocks the row, the JOIN silently drops it entirely before
-- can_write_scoped_record is ever called, even though the department match
-- alone (sda.department_id = the user's own grant) would have been sufficient
-- and doesn't need colleges/institutes data at all.
--
-- Contrast with staff_department_assignments's own "Scoped read
-- staff_department_assignments" policy (and courses/departments, the only
-- other tables using this can_write_scoped_record(trust,institute,college,dept)
-- shape): those derive trust_id/institute_id/college_id via *correlated scalar
-- subqueries*, which degrade to NULL (not "row missing") when colleges/
-- institutes RLS blocks them -- and the function's department branch doesn't
-- need those three args to be non-null, only department_id. That's why those
-- three tables work correctly for a department-scoped viewer while
-- staff_profiles didn't.
--
-- Fix: staff_profiles's department check no longer re-derives and re-checks
-- scope itself. It just asks whether a live staff_department_assignments row
-- exists for this staff member that the viewer can read -- reusing that
-- table's own (already correct, already covers global/trust/institute/
-- college/department) RLS instead of duplicating it via a join that breaks
-- for exactly the tier that matters most here.

alter policy "Scoped read staff_profiles" on public.staff_profiles
  using (
    (created_by = auth.uid())
    or (exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.status = 'published'
        and ur.deleted_at is null
        and ur.scope_type = 'global'
    ))
    or (exists (
      select 1 from public.staff_department_assignments sda
      where sda.staff_id = staff_profiles.id
        and sda.deleted_at is null
    ))
  );

alter policy "Scoped update staff_profiles" on public.staff_profiles
  using (
    (created_by = auth.uid())
    or (exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.status = 'published'
        and ur.deleted_at is null
        and ur.scope_type = 'global'
    ))
    or (exists (
      select 1 from public.staff_department_assignments sda
      where sda.staff_id = staff_profiles.id
        and sda.deleted_at is null
    ))
  )
  with check (
    (created_by = auth.uid())
    or (exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.status = 'published'
        and ur.deleted_at is null
        and ur.scope_type = 'global'
    ))
    or (exists (
      select 1 from public.staff_department_assignments sda
      where sda.staff_id = staff_profiles.id
        and sda.deleted_at is null
    ))
  );

alter policy "Scoped delete staff_profiles" on public.staff_profiles
  using (
    (created_by = auth.uid())
    or (exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.status = 'published'
        and ur.deleted_at is null
        and ur.scope_type = 'global'
    ))
    or (exists (
      select 1 from public.staff_department_assignments sda
      where sda.staff_id = staff_profiles.id
        and sda.deleted_at is null
    ))
  );

notify pgrst, 'reload schema';
