-- Open achievements and student_clubs to department/college-scoped editors.
-- Both tables were locked to is_global_admin() OR can_write_section('campus_life')
-- (see 20260806065601_global_only_write_rls.sql, 20260921072107_section_scoped_write_policies.sql,
-- 20261003143433_wire_campus_life_section_to_achievements_v2.sql) with no scope
-- branch at all, even though both tables carry department_id (achievements also
-- carries college_id + scope_type). Add can_write_scoped_record(...) as a third
-- OR condition, matching the pattern already used by events/facilities.

-- achievements: has college_id directly, same shape as events.
drop policy if exists "Global insert achievements" on public.achievements;
create policy "Global insert achievements" on public.achievements for insert
  to authenticated with check (
    public.is_global_admin()
    or public.can_write_section('campus_life')
    or public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, department_id)
  );

drop policy if exists "Global update achievements" on public.achievements;
create policy "Global update achievements" on public.achievements for update
  to authenticated
  using (
    public.is_global_admin()
    or public.can_write_section('campus_life')
    or public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, department_id)
  )
  with check (
    public.is_global_admin()
    or public.can_write_section('campus_life')
    or public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, department_id)
  );

drop policy if exists "Global delete achievements" on public.achievements;
create policy "Global delete achievements" on public.achievements for delete
  to authenticated
  using (
    public.is_global_admin()
    or public.can_write_section('campus_life')
    or public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, department_id)
  );

-- student_clubs: department_id only, resolve college_id via departments join
-- (same pattern facilities already uses for its own scoped policies).
drop policy if exists "Global insert student_clubs" on public.student_clubs;
create policy "Global insert student_clubs" on public.student_clubs for insert
  to authenticated with check (
    public.is_global_admin()
    or public.can_write_section('campus_life')
    or public.can_write_scoped_record(
         NULL::uuid, NULL::uuid,
         (select d.college_id from public.departments d where d.id = student_clubs.department_id),
         department_id
       )
  );

drop policy if exists "Global update student_clubs" on public.student_clubs;
create policy "Global update student_clubs" on public.student_clubs for update
  to authenticated
  using (
    public.is_global_admin()
    or public.can_write_section('campus_life')
    or public.can_write_scoped_record(
         NULL::uuid, NULL::uuid,
         (select d.college_id from public.departments d where d.id = student_clubs.department_id),
         department_id
       )
  )
  with check (
    public.is_global_admin()
    or public.can_write_section('campus_life')
    or public.can_write_scoped_record(
         NULL::uuid, NULL::uuid,
         (select d.college_id from public.departments d where d.id = student_clubs.department_id),
         department_id
       )
  );

drop policy if exists "Global delete student_clubs" on public.student_clubs;
create policy "Global delete student_clubs" on public.student_clubs for delete
  to authenticated
  using (
    public.is_global_admin()
    or public.can_write_section('campus_life')
    or public.can_write_scoped_record(
         NULL::uuid, NULL::uuid,
         (select d.college_id from public.departments d where d.id = student_clubs.department_id),
         department_id
       )
  );
