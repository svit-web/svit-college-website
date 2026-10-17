-- Fix: deleting any Entry-type record with an album attached (events,
-- achievements, centers, facilities, posts, sports, student_clubs) failed
-- with "column status is of type content_status but expression is of type
-- text". Root cause: cascade_entry_soft_delete_to_album()'s CASE expression
-- has two untyped string literal branches ('published' / 'archived') with no
-- other type context, so Postgres resolves the whole CASE's type as `text`
-- — and a concretely `text`-typed value doesn't get the implicit coercion to
-- a custom enum that a bare literal does. Explicitly casting each branch to
-- content_status fixes it.
--
-- Not previously tracked in migration history — this function was applied
-- directly to the live DB (see docs/audits/deferred-issues.md's note on
-- live/migration drift). This migration brings it under tracked history.
--
-- Affects 7 tables via trg_cascade_soft_delete_to_album: achievements,
-- centers, events, facilities, posts, sports, student_clubs.

CREATE OR REPLACE FUNCTION public.cascade_entry_soft_delete_to_album()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.album_id is not null then
    update gallery_albums
    set deleted_at = new.deleted_at,
        deleted_by = new.deleted_by,
        status = case when new.deleted_at is null then 'published'::content_status else 'archived'::content_status end
    where id = new.album_id;
  end if;
  return new;
end;
$function$;
