-- Generalizes the can_write_event() pattern into a shared scope-check
-- function, then replaces the blanket "Auth CRUD" (USING true) policies on
-- every department/college/institute/trust-scoped content table with
-- write policies that require the caller's own user_roles scope to match
-- the row being written. Read policies (public/anon SELECT) are untouched --
-- this site's content is meant to be publicly visible; only writes need to
-- be confined to the owning scope.
create or replace function public.can_write_scoped_record(
  p_trust_id uuid default null,
  p_institute_id uuid default null,
  p_college_id uuid default null,
  p_department_id uuid default null
)
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
      and (
        ur.scope_type = 'global'
        or (ur.scope_type = 'trust' and p_trust_id is not null and ur.trust_id = p_trust_id)
        or (ur.scope_type = 'institute' and p_institute_id is not null and ur.institute_id = p_institute_id)
        or (ur.scope_type = 'college' and p_college_id is not null and ur.college_id = p_college_id)
        or (ur.scope_type = 'department' and p_department_id is not null and ur.department_id = p_department_id)
      )
  );
$$;

-- institutes: own id is the institute scope key, trust_id links it to a trust editor
drop policy if exists "Auth CRUD" on public.institutes;
create policy "Scoped insert institutes" on public.institutes for insert
  with check (public.can_write_scoped_record(trust_id, id, null, null));
create policy "Scoped update institutes" on public.institutes for update
  using (public.can_write_scoped_record(trust_id, id, null, null))
  with check (public.can_write_scoped_record(trust_id, id, null, null));
create policy "Scoped delete institutes" on public.institutes for delete
  using (public.can_write_scoped_record(trust_id, id, null, null));

-- colleges: own id is the college scope key, institute_id links it up
drop policy if exists "Auth CRUD" on public.colleges;
create policy "Scoped insert colleges" on public.colleges for insert
  with check (public.can_write_scoped_record(null, institute_id, id, null));
create policy "Scoped update colleges" on public.colleges for update
  using (public.can_write_scoped_record(null, institute_id, id, null))
  with check (public.can_write_scoped_record(null, institute_id, id, null));
create policy "Scoped delete colleges" on public.colleges for delete
  using (public.can_write_scoped_record(null, institute_id, id, null));

-- departments: own id is the department scope key, college_id links it up
drop policy if exists "Auth CRUD" on public.departments;
create policy "Scoped insert departments" on public.departments for insert
  with check (public.can_write_scoped_record(null, null, college_id, id));
create policy "Scoped update departments" on public.departments for update
  using (public.can_write_scoped_record(null, null, college_id, id))
  with check (public.can_write_scoped_record(null, null, college_id, id));
create policy "Scoped delete departments" on public.departments for delete
  using (public.can_write_scoped_record(null, null, college_id, id));

-- courses: department_id only, college resolved via departments
drop policy if exists "Auth CRUD" on public.courses;
create policy "Scoped insert courses" on public.courses for insert
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped update courses" on public.courses for update
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id))
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped delete courses" on public.courses for delete
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));

-- facilities: department_id + institute_id
drop policy if exists "Auth CRUD" on public.facilities;
create policy "Scoped insert facilities" on public.facilities for insert
  with check (public.can_write_scoped_record(null, institute_id,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped update facilities" on public.facilities for update
  using (public.can_write_scoped_record(null, institute_id,
    (select d.college_id from public.departments d where d.id = department_id), department_id))
  with check (public.can_write_scoped_record(null, institute_id,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped delete facilities" on public.facilities for delete
  using (public.can_write_scoped_record(null, institute_id,
    (select d.college_id from public.departments d where d.id = department_id), department_id));

-- department_activities: department_id only
drop policy if exists "Auth CRUD" on public.department_activities;
create policy "Scoped insert department_activities" on public.department_activities for insert
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped update department_activities" on public.department_activities for update
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id))
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped delete department_activities" on public.department_activities for delete
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));

-- achievements: department_id only
drop policy if exists "Auth CRUD" on public.achievements;
create policy "Scoped insert achievements" on public.achievements for insert
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped update achievements" on public.achievements for update
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id))
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped delete achievements" on public.achievements for delete
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));

-- gallery_albums: department_id only
drop policy if exists "Auth CRUD" on public.gallery_albums;
create policy "Scoped insert gallery_albums" on public.gallery_albums for insert
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped update gallery_albums" on public.gallery_albums for update
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id))
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped delete gallery_albums" on public.gallery_albums for delete
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));

-- recruiters: department_id only
drop policy if exists "Auth CRUD" on public.recruiters;
create policy "Scoped insert recruiters" on public.recruiters for insert
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped update recruiters" on public.recruiters for update
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id))
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped delete recruiters" on public.recruiters for delete
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));

-- student_clubs: department_id only
drop policy if exists "Auth CRUD" on public.student_clubs;
create policy "Scoped insert student_clubs" on public.student_clubs for insert
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped update student_clubs" on public.student_clubs for update
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id))
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped delete student_clubs" on public.student_clubs for delete
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));

-- media_folders: department_id only; no existing public SELECT, add authenticated read
drop policy if exists "Auth CRUD" on public.media_folders;
create policy "Authenticated read media_folders" on public.media_folders for select
  to authenticated using (true);
create policy "Scoped insert media_folders" on public.media_folders for insert
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped update media_folders" on public.media_folders for update
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id))
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped delete media_folders" on public.media_folders for delete
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));

-- media_files: department_id only; no existing public SELECT, add authenticated read
drop policy if exists "Auth CRUD" on public.media_files;
create policy "Authenticated read media_files" on public.media_files for select
  to authenticated using (true);
create policy "Scoped insert media_files" on public.media_files for insert
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped update media_files" on public.media_files for update
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id))
  with check (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped delete media_files" on public.media_files for delete
  using (public.can_write_scoped_record(null, null,
    (select d.college_id from public.departments d where d.id = department_id), department_id));

-- posts: department_id only (nullable -- null means global/trust-level post)
drop policy if exists "Auth CRUD" on public.posts;
create policy "Scoped insert posts" on public.posts for insert
  with check (department_id is null
    or public.can_write_scoped_record(null, null,
      (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped update posts" on public.posts for update
  using (department_id is null
    or public.can_write_scoped_record(null, null,
      (select d.college_id from public.departments d where d.id = department_id), department_id))
  with check (department_id is null
    or public.can_write_scoped_record(null, null,
      (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped delete posts" on public.posts for delete
  using (department_id is null
    or public.can_write_scoped_record(null, null,
      (select d.college_id from public.departments d where d.id = department_id), department_id));

-- homepage_sections: department_id only (nullable -- null means site-wide section)
drop policy if exists "Auth CRUD" on public.homepage_sections;
create policy "Scoped insert homepage_sections" on public.homepage_sections for insert
  with check (department_id is null
    or public.can_write_scoped_record(null, null,
      (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped update homepage_sections" on public.homepage_sections for update
  using (department_id is null
    or public.can_write_scoped_record(null, null,
      (select d.college_id from public.departments d where d.id = department_id), department_id))
  with check (department_id is null
    or public.can_write_scoped_record(null, null,
      (select d.college_id from public.departments d where d.id = department_id), department_id));
create policy "Scoped delete homepage_sections" on public.homepage_sections for delete
  using (department_id is null
    or public.can_write_scoped_record(null, null,
      (select d.college_id from public.departments d where d.id = department_id), department_id));

-- homepage_items: college_id + department_id both nullable (null = global)
drop policy if exists "Auth CRUD" on public.homepage_items;
create policy "Scoped insert homepage_items" on public.homepage_items for insert
  with check ((college_id is null and department_id is null)
    or public.can_write_scoped_record(null, null, college_id, department_id));
create policy "Scoped update homepage_items" on public.homepage_items for update
  using ((college_id is null and department_id is null)
    or public.can_write_scoped_record(null, null, college_id, department_id))
  with check ((college_id is null and department_id is null)
    or public.can_write_scoped_record(null, null, college_id, department_id));
create policy "Scoped delete homepage_items" on public.homepage_items for delete
  using ((college_id is null and department_id is null)
    or public.can_write_scoped_record(null, null, college_id, department_id));

-- cells: college_id only
drop policy if exists "Auth CRUD" on public.cells;
create policy "Scoped insert cells" on public.cells for insert
  with check (public.can_write_scoped_record(null, null, college_id, null));
create policy "Scoped update cells" on public.cells for update
  using (public.can_write_scoped_record(null, null, college_id, null))
  with check (public.can_write_scoped_record(null, null, college_id, null));
create policy "Scoped delete cells" on public.cells for delete
  using (public.can_write_scoped_record(null, null, college_id, null));

-- committees: college_id only
drop policy if exists "Auth CRUD" on public.committees;
create policy "Scoped insert committees" on public.committees for insert
  with check (public.can_write_scoped_record(null, null, college_id, null));
create policy "Scoped update committees" on public.committees for update
  using (public.can_write_scoped_record(null, null, college_id, null))
  with check (public.can_write_scoped_record(null, null, college_id, null));
create policy "Scoped delete committees" on public.committees for delete
  using (public.can_write_scoped_record(null, null, college_id, null));

-- centers (Student Corner / co-curricular centres): college_id + institute_id
drop policy if exists "Auth CRUD" on public.centers;
create policy "Scoped insert centers" on public.centers for insert
  with check (public.can_write_scoped_record(null, institute_id, college_id, null));
create policy "Scoped update centers" on public.centers for update
  using (public.can_write_scoped_record(null, institute_id, college_id, null))
  with check (public.can_write_scoped_record(null, institute_id, college_id, null));
create policy "Scoped delete centers" on public.centers for delete
  using (public.can_write_scoped_record(null, institute_id, college_id, null));

-- placed_students: college_id + department_id
drop policy if exists "Auth full access placed_students" on public.placed_students;
drop policy if exists "Admin full access placed_students" on public.placed_students;
create policy "Scoped insert placed_students" on public.placed_students for insert
  with check (public.can_write_scoped_record(null, null, college_id, department_id));
create policy "Scoped update placed_students" on public.placed_students for update
  using (public.can_write_scoped_record(null, null, college_id, department_id))
  with check (public.can_write_scoped_record(null, null, college_id, department_id));
create policy "Scoped delete placed_students" on public.placed_students for delete
  using (public.can_write_scoped_record(null, null, college_id, department_id));

-- board_members: college_id only
drop policy if exists "Auth CRUD" on public.board_members;
create policy "Scoped insert board_members" on public.board_members for insert
  with check (public.can_write_scoped_record(null, null, college_id, null));
create policy "Scoped update board_members" on public.board_members for update
  using (public.can_write_scoped_record(null, null, college_id, null))
  with check (public.can_write_scoped_record(null, null, college_id, null));
create policy "Scoped delete board_members" on public.board_members for delete
  using (public.can_write_scoped_record(null, null, college_id, null));
