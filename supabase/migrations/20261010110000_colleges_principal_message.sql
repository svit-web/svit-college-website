-- Per-college principal message, so each college/institute under the group
-- can carry its own principal (distinct from the SVIT-wide "about" page's
-- singleton chairman/principal, which only covers the flagship college).
alter table public.colleges
  add column principal_name text,
  add column principal_title text,
  add column principal_message text,
  add column principal_photo_url text;
