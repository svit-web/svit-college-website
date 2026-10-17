-- Scoped (non-global) admins were locked out of /admin entirely: getAdminUser()
-- (src/app/lib/auth/admin.ts) embeds role:role_id(code, name) on every request,
-- and PostgREST applies the related table's RLS to embeds. 20261003133328 had
-- left roles / user_section_grants / admin_sections readable by global admins
-- only, so for a scoped editor every embedded role code resolved to null, the
-- AUTHORIZED_ROLE_CODES check failed, and the (dashboard) layout redirected to
-- /admin/login forever. "Authenticated users can read roles" was already
-- hotfixed directly on the self-hosted DB — this migration mirrors it (both
-- DBs) and completes the fix for the two tables it missed: section grants are
-- readable by their own user, and admin_sections is a non-sensitive lookup
-- (section codes) needed to resolve the section:section_id(code) embed.

drop policy if exists "Authenticated users can read roles" on public.roles;
create policy "Authenticated users can read roles" on public.roles
  for select
  to authenticated
  using (true);

drop policy if exists "Users can read own section grants" on public.user_section_grants;
create policy "Users can read own section grants" on public.user_section_grants
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Authenticated users can read admin_sections" on public.admin_sections;
create policy "Authenticated users can read admin_sections" on public.admin_sections
  for select
  to authenticated
  using (true);
