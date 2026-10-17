-- gallery_media.media_type allowed 'video' but no admin UI path ever creates a
-- video row (EntryPhotosEditor and the public gallery only handle 'image'),
-- and the live table has zero rows of either type. Drop the dead value so the
-- constraint matches what the app actually supports.
alter table public.gallery_media drop constraint gallery_media_media_type_check;
alter table public.gallery_media add constraint gallery_media_media_type_check
  check (media_type = 'image'::text);
