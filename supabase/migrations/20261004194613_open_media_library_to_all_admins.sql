-- Media Library (media_files/media_folders) was is_global_admin()-only for
-- insert/update, despite the table already carrying scope_type/department_id
-- columns clearly meant for scoped use. Opening it to any admin (upload,
-- create folders, rename, move, re-caption) while keeping permanent delete
-- global-admin-only, per a design discussion: the Library is meant to be a
-- shared, website-content resource (not personal/sensitive), so there's no
-- reason to restrict who can add to or organize it — only who can destroy
-- from it.

drop policy "Global insert media_files" on public.media_files;
create policy "Any admin insert media_files" on public.media_files
  for insert with check (public.is_any_admin());

drop policy "Global update media_files" on public.media_files;
create policy "Any admin update media_files" on public.media_files
  for update using (public.is_any_admin()) with check (public.is_any_admin());

drop policy "Global insert media_folders" on public.media_folders;
create policy "Any admin insert media_folders" on public.media_folders
  for insert with check (public.is_any_admin());

drop policy "Global update media_folders" on public.media_folders;
create policy "Any admin update media_folders" on public.media_folders
  for update using (public.is_any_admin()) with check (public.is_any_admin());

-- Delete policies ("Global delete media_files"/"Global delete media_folders",
-- both is_global_admin()) are intentionally left untouched — permanent
-- removal stays global-admin-only.
