-- Website CMS, Campus Life, T&P/Recruiters, and System are admin/global-only
-- sections in the portal UI (see src/lib/admin-sections.ts). Two problems
-- fixed here:
--
-- 1. Several of these tables (achievements, gallery_albums, recruiters,
--    student_clubs, media_folders, media_files, posts, homepage_sections,
--    homepage_items, board_members, placed_students, events) currently have
--    college/department-*scoped* write policies from
--    20260805051746_scope_aware_write_rls.sql -- i.e. a college/department
--    admin could still write to them directly via the API even though the
--    UI hides the section entirely. Locked to global-only.
--
-- 2. A larger set of tables (pages, menu_items, testimonials,
--    accreditations, downloads, gallery_media, club_events, mous,
--    content_categories, sports, audit_logs, user_profiles) never got a
--    scoping migration at all and still carry their original blanket
--    "Auth CRUD" (ALL, true) policy -- open to *any* authenticated user,
--    not just global admins. Locked to global-only, with reads kept open
--    (matching this project's established read-open/write-scoped
--    philosophy) except where noted below.
--
-- `centers`, `cells`, `committees` are intentionally left untouched --
-- Societies is a college-scoped Academics item, not global-only.
-- `trusts`/`institutes` are also untouched -- trust-level scoping is out of
-- scope for this change.

create or replace function public.is_global_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.status = 'published'
      and ur.deleted_at is null
      and ur.scope_type = 'global'
  );
$$;

-- ── Tables previously scoped to college/department writes, now global-only ──

drop policy if exists "Scoped insert achievements" on public.achievements;
drop policy if exists "Scoped update achievements" on public.achievements;
drop policy if exists "Scoped delete achievements" on public.achievements;
create policy "Global insert achievements" on public.achievements for insert
  to authenticated with check (public.is_global_admin());
create policy "Global update achievements" on public.achievements for update
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy "Global delete achievements" on public.achievements for delete
  to authenticated using (public.is_global_admin());

drop policy if exists "Scoped insert gallery_albums" on public.gallery_albums;
drop policy if exists "Scoped update gallery_albums" on public.gallery_albums;
drop policy if exists "Scoped delete gallery_albums" on public.gallery_albums;
create policy "Global insert gallery_albums" on public.gallery_albums for insert
  to authenticated with check (public.is_global_admin());
create policy "Global update gallery_albums" on public.gallery_albums for update
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy "Global delete gallery_albums" on public.gallery_albums for delete
  to authenticated using (public.is_global_admin());

drop policy if exists "Scoped insert recruiters" on public.recruiters;
drop policy if exists "Scoped update recruiters" on public.recruiters;
drop policy if exists "Scoped delete recruiters" on public.recruiters;
create policy "Global insert recruiters" on public.recruiters for insert
  to authenticated with check (public.is_global_admin());
create policy "Global update recruiters" on public.recruiters for update
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy "Global delete recruiters" on public.recruiters for delete
  to authenticated using (public.is_global_admin());

drop policy if exists "Scoped insert student_clubs" on public.student_clubs;
drop policy if exists "Scoped update student_clubs" on public.student_clubs;
drop policy if exists "Scoped delete student_clubs" on public.student_clubs;
create policy "Global insert student_clubs" on public.student_clubs for insert
  to authenticated with check (public.is_global_admin());
create policy "Global update student_clubs" on public.student_clubs for update
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy "Global delete student_clubs" on public.student_clubs for delete
  to authenticated using (public.is_global_admin());

drop policy if exists "Scoped insert media_folders" on public.media_folders;
drop policy if exists "Scoped update media_folders" on public.media_folders;
drop policy if exists "Scoped delete media_folders" on public.media_folders;
create policy "Global insert media_folders" on public.media_folders for insert
  to authenticated with check (public.is_global_admin());
create policy "Global update media_folders" on public.media_folders for update
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy "Global delete media_folders" on public.media_folders for delete
  to authenticated using (public.is_global_admin());

drop policy if exists "Scoped insert media_files" on public.media_files;
drop policy if exists "Scoped update media_files" on public.media_files;
drop policy if exists "Scoped delete media_files" on public.media_files;
create policy "Global insert media_files" on public.media_files for insert
  to authenticated with check (public.is_global_admin());
create policy "Global update media_files" on public.media_files for update
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy "Global delete media_files" on public.media_files for delete
  to authenticated using (public.is_global_admin());

drop policy if exists "Scoped insert posts" on public.posts;
drop policy if exists "Scoped update posts" on public.posts;
drop policy if exists "Scoped delete posts" on public.posts;
create policy "Global insert posts" on public.posts for insert
  to authenticated with check (public.is_global_admin());
create policy "Global update posts" on public.posts for update
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy "Global delete posts" on public.posts for delete
  to authenticated using (public.is_global_admin());

drop policy if exists "Scoped insert homepage_sections" on public.homepage_sections;
drop policy if exists "Scoped update homepage_sections" on public.homepage_sections;
drop policy if exists "Scoped delete homepage_sections" on public.homepage_sections;
create policy "Global insert homepage_sections" on public.homepage_sections for insert
  to authenticated with check (public.is_global_admin());
create policy "Global update homepage_sections" on public.homepage_sections for update
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy "Global delete homepage_sections" on public.homepage_sections for delete
  to authenticated using (public.is_global_admin());

drop policy if exists "Scoped insert homepage_items" on public.homepage_items;
drop policy if exists "Scoped update homepage_items" on public.homepage_items;
drop policy if exists "Scoped delete homepage_items" on public.homepage_items;
create policy "Global insert homepage_items" on public.homepage_items for insert
  to authenticated with check (public.is_global_admin());
create policy "Global update homepage_items" on public.homepage_items for update
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy "Global delete homepage_items" on public.homepage_items for delete
  to authenticated using (public.is_global_admin());

drop policy if exists "Scoped insert board_members" on public.board_members;
drop policy if exists "Scoped update board_members" on public.board_members;
drop policy if exists "Scoped delete board_members" on public.board_members;
create policy "Global insert board_members" on public.board_members for insert
  to authenticated with check (public.is_global_admin());
create policy "Global update board_members" on public.board_members for update
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy "Global delete board_members" on public.board_members for delete
  to authenticated using (public.is_global_admin());

drop policy if exists "Scoped insert placed_students" on public.placed_students;
drop policy if exists "Scoped update placed_students" on public.placed_students;
drop policy if exists "Scoped delete placed_students" on public.placed_students;
create policy "Global insert placed_students" on public.placed_students for insert
  to authenticated with check (public.is_global_admin());
create policy "Global update placed_students" on public.placed_students for update
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy "Global delete placed_students" on public.placed_students for delete
  to authenticated using (public.is_global_admin());

-- events: replace the college/department-aware can_write_event() check
drop policy if exists "Scoped insert events" on public.events;
drop policy if exists "Scoped update events" on public.events;
drop policy if exists "Scoped delete events" on public.events;
create policy "Global insert events" on public.events for insert
  to authenticated with check (public.is_global_admin());
create policy "Global update events" on public.events for update
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy "Global delete events" on public.events for delete
  to authenticated using (public.is_global_admin());

-- sports: previously any signed-in user (not even scope-checked)
drop policy if exists "sports_admin_all" on public.sports;
create policy "Global admin write sports" on public.sports for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

-- ── Tables that never had any scoping -- still on the original blanket
--    "Auth CRUD" (ALL, true) policy. Reads stay open to authenticated
--    (mirrors the existing read-open/write-scoped philosophy); writes lock
--    to global admins. ──

drop policy if exists "Auth CRUD" on public.pages;
create policy "Authenticated read pages" on public.pages for select to authenticated using (true);
create policy "Global write pages" on public.pages for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "Auth CRUD" on public.menu_items;
create policy "Authenticated read menu_items" on public.menu_items for select to authenticated using (true);
create policy "Global write menu_items" on public.menu_items for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "Auth CRUD" on public.testimonials;
create policy "Authenticated read testimonials" on public.testimonials for select to authenticated using (true);
create policy "Global write testimonials" on public.testimonials for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "Auth CRUD" on public.accreditations;
create policy "Authenticated read accreditations" on public.accreditations for select to authenticated using (true);
create policy "Global write accreditations" on public.accreditations for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "Auth CRUD" on public.downloads;
create policy "Authenticated read downloads" on public.downloads for select to authenticated using (true);
create policy "Global write downloads" on public.downloads for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "Auth CRUD" on public.content_categories;
create policy "Authenticated read content_categories" on public.content_categories for select to authenticated using (true);
create policy "Global write content_categories" on public.content_categories for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "Auth CRUD" on public.gallery_media;
create policy "Authenticated read gallery_media" on public.gallery_media for select to authenticated using (true);
create policy "Global write gallery_media" on public.gallery_media for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "Auth CRUD" on public.club_events;
create policy "Authenticated read club_events" on public.club_events for select to authenticated using (true);
create policy "Global write club_events" on public.club_events for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "Auth CRUD" on public.mous;
create policy "Authenticated read mous" on public.mous for select to authenticated using (true);
create policy "Global write mous" on public.mous for all
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

-- ── System tables with self-row / self-action exceptions ──

-- user_profiles: every authorized portal user must keep reading (and may
-- update) their own profile row for the admin header/sidebar to work;
-- managing *other* users' profiles stays global-only.
drop policy if exists "Auth CRUD" on public.user_profiles;
create policy "Read own or global profile" on public.user_profiles for select
  to authenticated using (id = auth.uid() or public.is_global_admin());
create policy "Update own or global profile" on public.user_profiles for update
  to authenticated using (id = auth.uid() or public.is_global_admin())
  with check (id = auth.uid() or public.is_global_admin());
create policy "Global insert profiles" on public.user_profiles for insert
  to authenticated with check (public.is_global_admin());
create policy "Global delete profiles" on public.user_profiles for delete
  to authenticated using (public.is_global_admin());

-- audit_logs: every authorized portal user must keep being able to record
-- an entry for their *own* scoped action (AdminCrudManager logs every
-- insert/update/delete); viewing/editing the log itself stays global-only.
drop policy if exists "Auth CRUD" on public.audit_logs;
create policy "Authenticated insert own audit_logs" on public.audit_logs for insert
  to authenticated with check (user_id = auth.uid());
create policy "Global read audit_logs" on public.audit_logs for select
  to authenticated using (public.is_global_admin());
create policy "Global update audit_logs" on public.audit_logs for update
  to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy "Global delete audit_logs" on public.audit_logs for delete
  to authenticated using (public.is_global_admin());
