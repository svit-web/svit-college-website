-- Two RBAC gaps found during a handover review:
--
-- 1. user_roles_select used current_user_is_editor(), which checks only role
--    code ('admin'/'editor'), not scope_type. Since department/college-scoped
--    admins are also role-code 'editor', ANY scoped admin could read every
--    row of user_roles directly via the API -- the full list of who has what
--    access at every scope, including who the global admins are. Narrow it
--    to "own row or global admin", matching the fact that User Management /
--    /admin/tables/user_roles are already global-only routes in the UI.
--
-- 2. roles_write / user_roles_insert / user_roles_update / user_roles_delete
--    used current_user_is_admin(), which also checks only role code, not
--    scope_type. A user_roles row of (role=admin, scope_type=department) --
--    creatable today, nothing stops it -- would pass current_user_is_admin()
--    and could grant itself/others global admin, even though the app's own
--    useUserScope.ts treats role=admin as globally-scoped regardless of
--    scope_type. Replace with is_global_admin(), which checks scope_type =
--    'global' directly and is already the audited, current standard used by
--    every other table's RLS in this project.
--
-- current_user_is_admin/editor/current_user_is_college_admin_for were the
-- only three policies referencing these functions (verified via pg_policies
-- before writing this migration) and were never in tracked migration history
-- to begin with (applied directly against the live DB). Drop them along with
-- this cleanup instead of backfilling -- is_global_admin() supersedes all
-- three (current_user_is_college_admin_for in particular checked role code
-- 'college_admin', which has never existed as a row in public.roles, so it
-- was always false / dead).

drop policy if exists "user_roles_select" on public.user_roles;
create policy "user_roles_select" on public.user_roles for select
  to authenticated using (user_id = auth.uid() or public.is_global_admin());

drop policy if exists "user_roles_insert" on public.user_roles;
create policy "user_roles_insert" on public.user_roles for insert
  to authenticated with check (public.is_global_admin());

drop policy if exists "user_roles_update" on public.user_roles;
create policy "user_roles_update" on public.user_roles for update
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "user_roles_delete" on public.user_roles;
create policy "user_roles_delete" on public.user_roles for delete
  to authenticated using (public.is_global_admin());

drop policy if exists "roles_write" on public.roles;
create policy "roles_write" on public.roles for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop function if exists public.current_user_is_admin();
drop function if exists public.current_user_is_editor();
drop function if exists public.current_user_is_college_admin_for(uuid);

-- ── Storage: the "media" bucket's update/delete policies let ANY
--    authenticated user modify or delete ANY file, regardless of who
--    uploaded it -- there's no department/college folder convention to
--    scope by, so tighten to "the uploader, or a global admin" instead
--    (storage.objects.owner is auto-populated by Supabase Storage from
--    auth.uid() on upload). Insert/read stay open -- unchanged. ──
drop policy if exists "Allow authenticated update on media bucket" on storage.objects;
create policy "Allow owner or global admin update on media bucket" on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and (owner = auth.uid() or public.is_global_admin()));

drop policy if exists "Allow authenticated delete on media bucket" on storage.objects;
create policy "Allow owner or global admin delete on media bucket" on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and (owner = auth.uid() or public.is_global_admin()));
