-- Re-asserts the same two fixes from 20261016161003_fix_cascade_soft_delete_status_cast.sql
-- and 20261016161500_fix_cascade_album_soft_delete_status_cast.sql as a single script, to be
-- pasted into the self-hosted production instance's Studio SQL editor directly
-- (https://supabase.svit.qzz.io) — the `supabase-selfhosted` MCP server wasn't reachable in the
-- session that found this, so apply_migration couldn't be run against production there.
--
-- Both CREATE OR REPLACE FUNCTION statements are idempotent, so running this against a database
-- that already has the fix (e.g. the hosted "test-gpu" platform project, where these were
-- originally verified) is a safe no-op.
--
-- Symptom this fixes: deleting (single or bulk) any Entry-type record with an attached album
-- (events, achievements, centers, facilities, posts, sports, student_clubs) from /admin/events
-- (or any other admin CRUD page over those tables) fails with:
--   column "status" is of type content_status but expression is of type text
--
-- Root cause: both functions had a `CASE WHEN ... THEN 'published' ELSE 'archived' END`
-- expression with untyped string literal branches. Postgres resolves the whole CASE's type as
-- `text` in that shape, and a concretely text-typed value doesn't get the implicit coercion to a
-- custom enum that a bare literal would. Cast each branch to ::content_status explicitly.

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

-- PostgREST caches the schema; without this, the running API process may keep using the
-- pre-fix function definitions until it restarts on its own.
NOTIFY pgrst, 'reload schema';
