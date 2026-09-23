-- home_page
drop policy "Global insert homepage_items" on public.homepage_items;
create policy "Global insert homepage_items" on public.homepage_items for insert
  with check (public.is_global_admin() or public.can_write_section('home_page'));
drop policy "Global update homepage_items" on public.homepage_items;
create policy "Global update homepage_items" on public.homepage_items for update
  using (public.is_global_admin() or public.can_write_section('home_page'))
  with check (public.is_global_admin() or public.can_write_section('home_page'));
drop policy "Global delete homepage_items" on public.homepage_items;
create policy "Global delete homepage_items" on public.homepage_items for delete
  using (public.is_global_admin() or public.can_write_section('home_page'));

drop policy "Global insert homepage_sections" on public.homepage_sections;
create policy "Global insert homepage_sections" on public.homepage_sections for insert
  with check (public.is_global_admin() or public.can_write_section('home_page'));
drop policy "Global update homepage_sections" on public.homepage_sections;
create policy "Global update homepage_sections" on public.homepage_sections for update
  using (public.is_global_admin() or public.can_write_section('home_page'))
  with check (public.is_global_admin() or public.can_write_section('home_page'));
drop policy "Global delete homepage_sections" on public.homepage_sections;
create policy "Global delete homepage_sections" on public.homepage_sections for delete
  using (public.is_global_admin() or public.can_write_section('home_page'));

-- news_events
drop policy "Global insert events" on public.events;
create policy "Global insert events" on public.events for insert
  with check (public.is_global_admin() or public.can_write_section('news_events'));
drop policy "Global update events" on public.events;
create policy "Global update events" on public.events for update
  using (public.is_global_admin() or public.can_write_section('news_events'))
  with check (public.is_global_admin() or public.can_write_section('news_events'));
drop policy "Global delete events" on public.events;
create policy "Global delete events" on public.events for delete
  using (public.is_global_admin() or public.can_write_section('news_events'));

drop policy "Global insert posts" on public.posts;
create policy "Global insert posts" on public.posts for insert
  with check (public.is_global_admin() or public.can_write_section('news_events'));
drop policy "Global update posts" on public.posts;
create policy "Global update posts" on public.posts for update
  using (public.is_global_admin() or public.can_write_section('news_events'))
  with check (public.is_global_admin() or public.can_write_section('news_events'));
drop policy "Global delete posts" on public.posts;
create policy "Global delete posts" on public.posts for delete
  using (public.is_global_admin() or public.can_write_section('news_events'));

drop policy "Global write content_categories" on public.content_categories;
create policy "Global write content_categories" on public.content_categories for all
  using (public.is_global_admin() or public.can_write_section('news_events'))
  with check (public.is_global_admin() or public.can_write_section('news_events'));

-- admissions
drop policy "Global write inquiry_forms" on public.inquiry_forms;
create policy "Global write inquiry_forms" on public.inquiry_forms for all
  using (public.is_global_admin() or public.can_write_section('admissions'))
  with check (public.is_global_admin() or public.can_write_section('admissions'));

drop policy "Global read inquiry_submissions" on public.inquiry_submissions;
create policy "Global read inquiry_submissions" on public.inquiry_submissions for select
  using (public.is_global_admin() or public.can_write_section('admissions'));
drop policy "Global update inquiry_submissions" on public.inquiry_submissions;
create policy "Global update inquiry_submissions" on public.inquiry_submissions for update
  using (public.is_global_admin() or public.can_write_section('admissions'))
  with check (public.is_global_admin() or public.can_write_section('admissions'));
drop policy "Global delete inquiry_submissions" on public.inquiry_submissions;
create policy "Global delete inquiry_submissions" on public.inquiry_submissions for delete
  using (public.is_global_admin() or public.can_write_section('admissions'));

-- placement
drop policy "Global insert recruiters" on public.recruiters;
create policy "Global insert recruiters" on public.recruiters for insert
  with check (public.is_global_admin() or public.can_write_section('placement'));
drop policy "Global update recruiters" on public.recruiters;
create policy "Global update recruiters" on public.recruiters for update
  using (public.is_global_admin() or public.can_write_section('placement'))
  with check (public.is_global_admin() or public.can_write_section('placement'));
drop policy "Global delete recruiters" on public.recruiters;
create policy "Global delete recruiters" on public.recruiters for delete
  using (public.is_global_admin() or public.can_write_section('placement'));

drop policy "Global insert placed_students" on public.placed_students;
create policy "Global insert placed_students" on public.placed_students for insert
  with check (public.is_global_admin() or public.can_write_section('placement'));
drop policy "Global update placed_students" on public.placed_students;
create policy "Global update placed_students" on public.placed_students for update
  using (public.is_global_admin() or public.can_write_section('placement'))
  with check (public.is_global_admin() or public.can_write_section('placement'));
drop policy "Global delete placed_students" on public.placed_students;
create policy "Global delete placed_students" on public.placed_students for delete
  using (public.is_global_admin() or public.can_write_section('placement'));

drop policy "Global write placement_cells" on public.placement_cells;
create policy "Global write placement_cells" on public.placement_cells for all
  using (public.is_global_admin() or public.can_write_section('placement'))
  with check (public.is_global_admin() or public.can_write_section('placement'));

-- about_us
drop policy "Global write accreditations" on public.accreditations;
create policy "Global write accreditations" on public.accreditations for all
  using (public.is_global_admin() or public.can_write_section('about_us'))
  with check (public.is_global_admin() or public.can_write_section('about_us'));

drop policy "Global insert board_members" on public.board_members;
create policy "Global insert board_members" on public.board_members for insert
  with check (public.is_global_admin() or public.can_write_section('about_us'));
drop policy "Global update board_members" on public.board_members;
create policy "Global update board_members" on public.board_members for update
  using (public.is_global_admin() or public.can_write_section('about_us'))
  with check (public.is_global_admin() or public.can_write_section('about_us'));
drop policy "Global delete board_members" on public.board_members;
create policy "Global delete board_members" on public.board_members for delete
  using (public.is_global_admin() or public.can_write_section('about_us'));

drop policy "Scoped insert committees" on public.committees;
create policy "Scoped insert committees" on public.committees for insert
  with check (public.can_write_scoped_record(null, null, college_id, null) or public.can_write_section('about_us', null, college_id, null));
drop policy "Scoped update committees" on public.committees;
create policy "Scoped update committees" on public.committees for update
  using (public.can_write_scoped_record(null, null, college_id, null) or public.can_write_section('about_us', null, college_id, null))
  with check (public.can_write_scoped_record(null, null, college_id, null) or public.can_write_section('about_us', null, college_id, null));
drop policy "Scoped delete committees" on public.committees;
create policy "Scoped delete committees" on public.committees for delete
  using (public.can_write_scoped_record(null, null, college_id, null) or public.can_write_section('about_us', null, college_id, null));

-- campus_life
drop policy "Global insert student_clubs" on public.student_clubs;
create policy "Global insert student_clubs" on public.student_clubs for insert
  with check (public.is_global_admin() or public.can_write_section('campus_life'));
drop policy "Global update student_clubs" on public.student_clubs;
create policy "Global update student_clubs" on public.student_clubs for update
  using (public.is_global_admin() or public.can_write_section('campus_life'))
  with check (public.is_global_admin() or public.can_write_section('campus_life'));
drop policy "Global delete student_clubs" on public.student_clubs;
create policy "Global delete student_clubs" on public.student_clubs for delete
  using (public.is_global_admin() or public.can_write_section('campus_life'));

drop policy "Global write club_events" on public.club_events;
create policy "Global write club_events" on public.club_events for all
  using (public.is_global_admin() or public.can_write_section('campus_life'))
  with check (public.is_global_admin() or public.can_write_section('campus_life'));

drop policy "Scoped insert centers" on public.centers;
create policy "Scoped insert centers" on public.centers for insert
  with check (public.can_write_scoped_record(null, institute_id, college_id, null) or public.can_write_section('campus_life', institute_id, college_id, null));
drop policy "Scoped update centers" on public.centers;
create policy "Scoped update centers" on public.centers for update
  using (public.can_write_scoped_record(null, institute_id, college_id, null) or public.can_write_section('campus_life', institute_id, college_id, null))
  with check (public.can_write_scoped_record(null, institute_id, college_id, null) or public.can_write_section('campus_life', institute_id, college_id, null));
drop policy "Scoped delete centers" on public.centers;
create policy "Scoped delete centers" on public.centers for delete
  using (public.can_write_scoped_record(null, institute_id, college_id, null) or public.can_write_section('campus_life', institute_id, college_id, null));

drop policy "Scoped insert department_activities" on public.department_activities;
create policy "Scoped insert department_activities" on public.department_activities for insert
  with check (
    public.can_write_scoped_record(null, null, (select d.college_id from public.departments d where d.id = department_activities.department_id), department_id)
    or public.can_write_section('campus_life', null, (select d.college_id from public.departments d where d.id = department_activities.department_id), department_id)
  );
drop policy "Scoped update department_activities" on public.department_activities;
create policy "Scoped update department_activities" on public.department_activities for update
  using (
    public.can_write_scoped_record(null, null, (select d.college_id from public.departments d where d.id = department_activities.department_id), department_id)
    or public.can_write_section('campus_life', null, (select d.college_id from public.departments d where d.id = department_activities.department_id), department_id)
  )
  with check (
    public.can_write_scoped_record(null, null, (select d.college_id from public.departments d where d.id = department_activities.department_id), department_id)
    or public.can_write_section('campus_life', null, (select d.college_id from public.departments d where d.id = department_activities.department_id), department_id)
  );
drop policy "Scoped delete department_activities" on public.department_activities;
create policy "Scoped delete department_activities" on public.department_activities for delete
  using (
    public.can_write_scoped_record(null, null, (select d.college_id from public.departments d where d.id = department_activities.department_id), department_id)
    or public.can_write_section('campus_life', null, (select d.college_id from public.departments d where d.id = department_activities.department_id), department_id)
  );

drop policy "Global insert gallery_albums" on public.gallery_albums;
create policy "Global insert gallery_albums" on public.gallery_albums for insert
  with check (public.is_global_admin() or public.can_write_section('campus_life'));
drop policy "Global update gallery_albums" on public.gallery_albums;
create policy "Global update gallery_albums" on public.gallery_albums for update
  using (public.is_global_admin() or public.can_write_section('campus_life'))
  with check (public.is_global_admin() or public.can_write_section('campus_life'));
drop policy "Global delete gallery_albums" on public.gallery_albums;
create policy "Global delete gallery_albums" on public.gallery_albums for delete
  using (public.is_global_admin() or public.can_write_section('campus_life'));

drop policy "Global write gallery_media" on public.gallery_media;
create policy "Global write gallery_media" on public.gallery_media for all
  using (public.is_global_admin() or public.can_write_section('campus_life'))
  with check (public.is_global_admin() or public.can_write_section('campus_life'));

drop policy "Global admin write sports" on public.sports;
create policy "Global admin write sports" on public.sports for all
  using (public.is_global_admin() or public.can_write_section('campus_life'))
  with check (public.is_global_admin() or public.can_write_section('campus_life'));
