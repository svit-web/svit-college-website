-- Entry cover photo moves from a separate card_photo_url column on each Entry
-- table into a tagged gallery_media row (is_cover), so an Entry's photos live
-- in one place instead of two. card_photo_url is left in place, unused, as a
-- rollback safety net — a later cleanup migration drops it once the admin UI
-- and every public reader have moved off it.
--
-- See docs/adr/0001-entry-card-photo-and-album.md (the decision this
-- supersedes) and the follow-up ADR this migration's PR adds.

ALTER TABLE public.gallery_media ADD COLUMN IF NOT EXISTS is_cover boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS gallery_media_one_cover_per_album
  ON public.gallery_media (album_id)
  WHERE is_cover AND deleted_at IS NULL;

-- Backfill: every Entry row with a card_photo_url gets exactly one is_cover
-- gallery_media row. Two cases per table:
--   A. album_id already set: tag the matching gallery_media row as cover (or
--      insert one if the cover photo was never added to the album).
--   B. album_id is null: synthesize an album first (same shape
--      EntryPhotosEditor.tsx creates for a real upload), link it, then insert
--      the cover gallery_media row.
DO $$
DECLARE
  tbl text;
  name_col text;
  r record;
  new_album_id uuid;
  existing_media_id uuid;
  min_sort integer;
  entry_title text;
  tbl_name_cols text[][] := ARRAY[
    ARRAY['events', 'title'],
    ARRAY['achievements', 'title'],
    ARRAY['facilities', 'name'],
    ARRAY['centers', 'name'],
    ARRAY['student_clubs', 'name'],
    ARRAY['sports', 'name']
  ];
  pair text[];
BEGIN
  FOREACH pair SLICE 1 IN ARRAY tbl_name_cols LOOP
    tbl := pair[1];
    name_col := pair[2];
    FOR r IN EXECUTE format(
      'SELECT id, album_id, card_photo_url, %I AS label FROM public.%I WHERE card_photo_url IS NOT NULL', name_col, tbl
    ) LOOP
      entry_title := coalesce(r.label, 'Untitled');

      IF r.album_id IS NOT NULL THEN
        SELECT id INTO existing_media_id FROM public.gallery_media
          WHERE album_id = r.album_id AND url = r.card_photo_url AND deleted_at IS NULL
          LIMIT 1;

        IF existing_media_id IS NOT NULL THEN
          UPDATE public.gallery_media SET is_cover = true WHERE id = existing_media_id;
        ELSE
          SELECT min(sort_order) INTO min_sort FROM public.gallery_media
            WHERE album_id = r.album_id AND deleted_at IS NULL;
          INSERT INTO public.gallery_media (album_id, media_type, url, sort_order, is_cover, status)
            VALUES (r.album_id, 'image', r.card_photo_url, coalesce(min_sort, 1) - 1, true, 'published');
        END IF;
      ELSE
        INSERT INTO public.gallery_albums (title, slug, owner_table, show_in_public_gallery, status)
          VALUES (
            entry_title,
            lower(regexp_replace(regexp_replace(entry_title, '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g'))
              || '-' || substr(md5(random()::text), 1, 6),
            tbl,
            false,
            'published'
          )
          RETURNING id INTO new_album_id;

        EXECUTE format('UPDATE public.%I SET album_id = $1 WHERE id = $2', tbl)
          USING new_album_id, r.id;

        INSERT INTO public.gallery_media (album_id, media_type, url, sort_order, is_cover, status)
          VALUES (new_album_id, 'image', r.card_photo_url, 1, true, 'published');
      END IF;
    END LOOP;
  END LOOP;
END $$;
