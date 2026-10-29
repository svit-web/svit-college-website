-- Lets admins keep a department (e.g. the Library Department, which exists
-- only to hold staff) out of the main menu's Colleges panel. Defaults to true
-- so every existing department stays listed until someone unticks it. The
-- department's own pages are unaffected.
alter table public.departments
  add column if not exists show_in_menu boolean not null default true;
