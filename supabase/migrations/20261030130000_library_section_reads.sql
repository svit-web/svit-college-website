-- Let 'library' section holders (e.g. a Librarian) read what /admin/library
-- needs. Logged-in users read facilities/colleges/departments only through the
-- scope-aware "Scoped read …" policies (20261017120000_facilities_college_scoping,
-- 20261014150000_trust_and_institute_scope_cascade); a section-only user has no
-- scope, so:
--   * the library facility row was invisible ("No facility with slug library"),
--     and because UPDATE only reaches rows SELECT can see, saves would silently
--     change nothing even though "Scoped update facilities" allows them;
--   * the Books per college tab (colleges) and Staff department picker
--     (departments) came back empty.
-- These policies are additive (permissive) and only match holders of a
-- 'library' grant, so every other admin's scoped reads are unchanged.

-- The facility rows tagged to a section the user holds — mirrors the
-- admin_section_id branch of "Scoped update facilities".
drop policy if exists "Section read facilities" on public.facilities;
create policy "Section read facilities" on public.facilities
  for select to authenticated
  using (
    admin_section_id is not null
    and public.can_write_section(
      (select s.code from public.admin_sections s where s.id = facilities.admin_section_id)
    )
  );

-- Published colleges/departments are already public (anon read); this only
-- extends that same published view to logged-in library editors.
drop policy if exists "Library section read colleges" on public.colleges;
create policy "Library section read colleges" on public.colleges
  for select to authenticated
  using (status = 'published' and deleted_at is null and public.can_write_section('library'));

drop policy if exists "Library section read departments" on public.departments;
create policy "Library section read departments" on public.departments
  for select to authenticated
  using (status = 'published' and deleted_at is null and public.can_write_section('library'));
