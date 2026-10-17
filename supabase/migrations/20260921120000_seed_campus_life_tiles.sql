-- Seeds the 11 "Life beyond the classroom" homepage tiles (item_type =
-- 'campus_life_tile'). Fixed set, editable text/link/image via the admin
-- panel — not add/delete.
insert into homepage_items
  (item_type, scope_type, title, eyebrow, link_href, sort_order, is_active, status)
values
  ('campus_life_tile', 'global', 'Central Library', 'Facilities', '/campus-life/facilities/academic/library', 10, true, 'published'),
  ('campus_life_tile', 'global', 'Engineering Labs', 'Facilities', '/campus-life/facilities/academic/labs', 20, true, 'published'),
  ('campus_life_tile', 'global', 'Cricket Ground', 'Sports & Athletics', '/campus-life/facilities/co-curriculum/cricket', 30, true, 'published'),
  ('campus_life_tile', 'global', 'Football Ground', 'Sports & Athletics', '/campus-life/facilities/co-curriculum/football', 40, true, 'published'),
  ('campus_life_tile', 'global', 'Health Centre', 'Facilities', '/campus-life/facilities/amenities/health-centre', 50, true, 'published'),
  ('campus_life_tile', 'global', 'Robotics Research Centre', 'Clubs', '/campus-life/clubs/robotics-research-centre', 60, true, 'published'),
  ('campus_life_tile', 'global', 'GDSC SVIT', 'Clubs', '/campus-life/clubs/gdsc-svit', 70, true, 'published'),
  ('campus_life_tile', 'global', 'Prakarsh — Techfest & Talkfest', 'Events', '/campus-life/events/prakarsh', 80, true, 'published'),
  ('campus_life_tile', 'global', 'Spandan', 'Events', '/campus-life/events/spark', 90, true, 'published'),
  ('campus_life_tile', 'global', 'ISTE Student Chapter', 'Societies', '/student-corner/iste-student', 100, true, 'published'),
  ('campus_life_tile', 'global', 'NSS / NCC', 'Societies', '/student-corner/nss-ncc', 110, true, 'published');
