-- The previous scope_aware_write_rls / scope_aware_staff_rls migrations
-- dropped each table's blanket "Auth CRUD" (ALL, true) policy, which used to
-- be the only thing granting the *authenticated* role read access on tables
-- whose only other SELECT policy is scoped "TO anon" only. That silently
-- broke admin-portal reads (logged-in editors) for these tables even though
-- the public/anon-facing site was unaffected. Restore authenticated read.
create policy "Authenticated read achievements" on public.achievements for select to authenticated using (true);
create policy "Authenticated read board_members" on public.board_members for select to authenticated using (true);
create policy "Authenticated read cells" on public.cells for select to authenticated using (true);
create policy "Authenticated read centers" on public.centers for select to authenticated using (true);
create policy "Authenticated read committees" on public.committees for select to authenticated using (true);
create policy "Authenticated read facilities" on public.facilities for select to authenticated using (true);
create policy "Authenticated read gallery_albums" on public.gallery_albums for select to authenticated using (true);
create policy "Authenticated read homepage_sections" on public.homepage_sections for select to authenticated using (true);
create policy "Authenticated read posts" on public.posts for select to authenticated using (true);
create policy "Authenticated read staff_department_assignments" on public.staff_department_assignments for select to authenticated using (true);
create policy "Authenticated read student_clubs" on public.student_clubs for select to authenticated using (true);
