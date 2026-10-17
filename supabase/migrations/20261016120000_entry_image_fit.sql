-- Per-entry choice of how the Detail page shows its photos: 'fill' crops to the
-- stage (object-cover, the previous behaviour), 'fit' shows the whole photo
-- (object-contain). Cards and grids always fill. Existing rows default to 'fill'
-- so nothing changes until an editor flips it.
alter table public.student_clubs
  add column if not exists image_fit text not null default 'fill'
  check (image_fit in ('fill', 'fit'));

alter table public.posts
  add column if not exists image_fit text not null default 'fill'
  check (image_fit in ('fill', 'fit'));

alter table public.achievements
  add column if not exists image_fit text not null default 'fill'
  check (image_fit in ('fill', 'fit'));

notify pgrst, 'reload schema';
