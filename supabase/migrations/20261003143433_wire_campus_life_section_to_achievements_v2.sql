-- achievements was omitted from 20260921072107_section_scoped_write_policies.sql
-- (every sibling campus_life table -- gallery_albums, gallery_media,
-- student_clubs, sports, club_events -- got an `or can_write_section(...)`
-- clause added to its write policies; achievements did not), so a
-- campus_life-granted, non-global admin cannot write it even though the
-- generic admin route is classified campus_life like its siblings.
drop policy "Global insert achievements" on public.achievements;
create policy "Global insert achievements" on public.achievements for insert
  with check (public.is_global_admin() or public.can_write_section('campus_life'));

drop policy "Global update achievements" on public.achievements;
create policy "Global update achievements" on public.achievements for update
  using (public.is_global_admin() or public.can_write_section('campus_life'))
  with check (public.is_global_admin() or public.can_write_section('campus_life'));

drop policy "Global delete achievements" on public.achievements;
create policy "Global delete achievements" on public.achievements for delete
  using (public.is_global_admin() or public.can_write_section('campus_life'));
