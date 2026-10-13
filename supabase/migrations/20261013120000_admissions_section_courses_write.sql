-- Admissions section grant (admin_sections 'admissions', already used by
-- scholarships — see 20261003133328_harden_rls_and_grants.sql) now also
-- unlocks editing admissions fields (intake, fees_per_semester, duration,
-- eligibility, brochure_file_url) on regular courses, via the new
-- Admissions ▸ Details admin tab. Restricted to non-programme rows
-- (is_programme = false and department_id is not null) — programme
-- landing-page rows stay writable only by scoped/global admins as before.
drop policy if exists "Scoped update courses" on public.courses;
create policy "Scoped update courses" on public.courses for update
  using (public.can_write_scoped_record(null, null,
      (select d.college_id from public.departments d where d.id = department_id), department_id)
    or (public.can_write_section('admissions') and is_programme = false and department_id is not null))
  with check (public.can_write_scoped_record(null, null,
      (select d.college_id from public.departments d where d.id = department_id), department_id)
    or (public.can_write_section('admissions') and is_programme = false and department_id is not null));
