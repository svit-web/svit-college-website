-- Cascade Trash-page soft delete/restore, and hard delete (purge), from an
-- Entry row to its linked gallery_albums row (and from there to gallery_media
-- via the existing ON DELETE CASCADE FK). See CONTEXT.md: Entry, Entry album.
--
--   soft delete (deleted_at set)   -> album (and its media) trashed too
--   restore (deleted_at cleared)   -> album (and its media) restored too
--   hard delete (purge from Trash) -> album + its media rows are deleted
--
-- Applies to every Entry table that can own an album (see the owner_table
-- check constraint on gallery_albums added in 20260923140000).

create or replace function cascade_entry_soft_delete_to_album()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.album_id is not null then
    update gallery_albums
    set deleted_at = new.deleted_at,
        deleted_by = new.deleted_by,
        status = case when new.deleted_at is null then 'published' else 'archived' end
    where id = new.album_id;
  end if;
  return new;
end;
$$;

create or replace function cascade_album_soft_delete_to_media()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update gallery_media
  set deleted_at = new.deleted_at,
      deleted_by = new.deleted_by,
      status = case when new.deleted_at is null then 'published' else 'archived' end
  where album_id = new.id;
  return new;
end;
$$;

create or replace function cascade_entry_hard_delete_to_album()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.album_id is not null then
    delete from gallery_albums where id = old.album_id;
  end if;
  return old;
end;
$$;

drop trigger if exists trg_cascade_album_soft_delete_to_media on gallery_albums;
create trigger trg_cascade_album_soft_delete_to_media
  after update of deleted_at on gallery_albums
  for each row
  when (old.deleted_at is distinct from new.deleted_at)
  execute function cascade_album_soft_delete_to_media();

do $$
declare
  tbl text;
begin
  foreach tbl in array array['events', 'facilities', 'centers', 'sports', 'achievements', 'student_clubs', 'posts']
  loop
    execute format('drop trigger if exists trg_cascade_soft_delete_to_album on %I', tbl);
    execute format(
      'create trigger trg_cascade_soft_delete_to_album
         after update of deleted_at on %I
         for each row
         when (old.deleted_at is distinct from new.deleted_at)
         execute function cascade_entry_soft_delete_to_album()',
      tbl
    );

    execute format('drop trigger if exists trg_cascade_hard_delete_to_album on %I', tbl);
    execute format(
      'create trigger trg_cascade_hard_delete_to_album
         before delete on %I
         for each row
         execute function cascade_entry_hard_delete_to_album()',
      tbl
    );
  end loop;
end $$;
