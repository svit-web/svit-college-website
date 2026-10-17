-- Same bug, one level deeper in the same cascade chain as
-- 20261016161003_fix_cascade_soft_delete_status_cast.sql: deleting an Entry
-- (events/achievements/centers/facilities/posts/sports/student_clubs) with
-- an attached album cascades the soft-delete to that album
-- (cascade_entry_soft_delete_to_album, already fixed), which in turn
-- cascades to every photo in gallery_media via this function — which had
-- the identical untyped-CASE-defaults-to-text bug.
--
-- Not previously tracked in migration history (same live/migration drift as
-- the sibling fix).

CREATE OR REPLACE FUNCTION public.cascade_album_soft_delete_to_media()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  update gallery_media
  set deleted_at = new.deleted_at,
      deleted_by = new.deleted_by,
      status = case when new.deleted_at is null then 'published'::content_status else 'archived'::content_status end
  where album_id = new.id;
  return new;
end;
$function$;
