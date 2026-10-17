-- Fixes found during a correctness pass over 20260806090000/090500: a full
-- sweep of pg_policies turned up several tables still on their original
-- blanket "Auth CRUD" (ALL, true) policy that the earlier audit missed
-- because they aren't wired into any sidebar nav item directly (designations,
-- homepage_widgets, inquiry_forms, menus, permissions, redirects,
-- role_permissions, seo_metadata, placement_cells) or that need genuinely
-- scoped (not blanket-open, not blanket-locked) treatment (staff_achievements,
-- inquiry_submissions).

-- ── Website CMS / System reference tables: lock writes to global admins.
--    Where the table had no standalone read policy at all (redirects,
--    permissions, role_permissions, seo_metadata for authenticated users),
--    add one back so reads don't silently break for every portal user. ──

drop policy if exists "Auth CRUD" on public.designations;
create policy "Global write designations" on public.designations for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "Auth CRUD" on public.homepage_widgets;
create policy "Authenticated read homepage_widgets" on public.homepage_widgets for select to authenticated using (true);
create policy "Global write homepage_widgets" on public.homepage_widgets for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "Auth CRUD" on public.inquiry_forms;
create policy "Global write inquiry_forms" on public.inquiry_forms for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "Auth CRUD" on public.menus;
create policy "Global write menus" on public.menus for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "Auth CRUD" on public.redirects;
create policy "Authenticated read redirects" on public.redirects for select to authenticated using (true);
create policy "Global write redirects" on public.redirects for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "Auth CRUD" on public.permissions;
create policy "Authenticated read permissions" on public.permissions for select to authenticated using (true);
create policy "Global write permissions" on public.permissions for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "Auth CRUD" on public.role_permissions;
create policy "Authenticated read role_permissions" on public.role_permissions for select to authenticated using (true);
create policy "Global write role_permissions" on public.role_permissions for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "Auth CRUD" on public.seo_metadata;
create policy "Authenticated read seo_metadata" on public.seo_metadata for select to authenticated using (true);
create policy "Global write seo_metadata" on public.seo_metadata for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

-- placement_cells: backs the T&P Master Hub (Website CMS, global-only)
drop policy if exists "Auth CRUD placement_cells" on public.placement_cells;
create policy "Global write placement_cells" on public.placement_cells for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

-- ── inquiry_submissions: contains prospective-student PII. Public insert
--    (the site's inquiry form) already has its own policy and is untouched.
--    Viewing/managing submissions is System/Inquiries-Inbox territory --
--    global-only for read too, not just write (deliberately stricter than
--    the general "reads stay open" pattern used elsewhere, matching how
--    audit_logs was already treated). ──
drop policy if exists "Auth CRUD" on public.inquiry_submissions;
create policy "Global read inquiry_submissions" on public.inquiry_submissions for select
  to authenticated using (public.is_global_admin());
create policy "Global update inquiry_submissions" on public.inquiry_submissions for update
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy "Global delete inquiry_submissions" on public.inquiry_submissions for delete
  to authenticated using (public.is_global_admin());

-- ── staff_achievements: was open to *any* authenticated user for any staff
--    member. Staff & Faculty is scope-following, not global-only or
--    unrestricted -- mirror staff_profiles' write policy (global OR scope
--    match via the staff's department assignment). Reads stay open (already
--    the case, matches the rest of Staff & Faculty's read-open behaviour). ──
drop policy if exists "Authenticated users can manage staff_achievements" on public.staff_achievements;
create policy "Scoped write staff_achievements" on public.staff_achievements for all
  to authenticated using (
    public.is_global_admin()
    or exists (
      select 1 from public.staff_department_assignments sda
      join public.departments d on d.id = sda.department_id
      where sda.staff_id = staff_achievements.staff_id
        and sda.deleted_at is null
        and public.can_write_scoped_record(null, null, d.college_id, sda.department_id)
    )
  )
  with check (
    public.is_global_admin()
    or exists (
      select 1 from public.staff_department_assignments sda
      join public.departments d on d.id = sda.department_id
      where sda.staff_id = staff_achievements.staff_id
        and sda.deleted_at is null
        and public.can_write_scoped_record(null, null, d.college_id, sda.department_id)
    )
  );
