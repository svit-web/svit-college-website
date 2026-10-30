-- Librarian: a section-only admin role for the Central Library, modelled on
-- Sports Secretary (20261008140000_sports_secretary_role.sql). A user whose
-- only role is 'librarian' gets scope level 'section' in the app and sees just
-- the routes the 'library' section grant unlocks (/admin/library and Downloads,
-- see ROUTE_SECTION_MAP in src/lib/admin-sections.ts).
--
-- Rights come from the 'library' user_section_grants row (global scope — the
-- library tables' policies call can_write_section('library') without a scope).
-- The role itself grants no writes: is_global_admin() and
-- can_write_scoped_record() only count admin/editor/department_admin/
-- college_admin, so a department-scoped librarian row never widens access.

insert into public.roles (code, name)
values ('librarian', 'Librarian')
on conflict (code) do nothing;

insert into public.admin_sections (code, name)
values ('library', 'Library')
on conflict (code) do nothing;

-- is_any_admin() gates creating an Entry album (gallery_albums insert), which
-- the Central Library photo editor needs the first time a photo is added.
create or replace function public.is_any_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and ur.status = 'published'
      and ur.deleted_at is null
      and r.code in ('admin', 'editor', 'department_admin', 'college_admin', 'sports_secretary', 'librarian')
  );
$$;
