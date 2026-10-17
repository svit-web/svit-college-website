-- Campus life tiles (homepage_items.item_type = 'campus_life_tile') need to link
-- to a real Facility/Student Club/Event (resolved live by id, not a stored URL
-- snapshot — see docs/adr/0006) or to a fixed Campus Life section, in addition
-- to today's free-text link_href (custom URL) and no-link cases.
alter table public.homepage_items
  add column link_entity_type text,
  add column link_entity_id uuid;

alter table public.homepage_items
  add constraint homepage_items_link_entity_type_check
  check (link_entity_type is null or link_entity_type in ('facility', 'student_club', 'event', 'section', 'custom', 'none'));
