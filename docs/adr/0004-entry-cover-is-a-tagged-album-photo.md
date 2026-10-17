# An Entry's cover photo is a tagged album photo, not a separate column

ADR 0001 deliberately kept the Card photo (`card_photo_url`) separate from the Entry album: "reordering album photos never changes it." In practice this meant the admin Photos section was two different upload widgets glued together — a single-image `MediaUploader` for the cover, and a separate multi-file dropzone for the album — with two different write paths (a plain column update vs. an album/`gallery_media` insert). Admins found this confusing enough that at least one pasted a photo URL into an unrelated field, apparently looking for "the" photo field.

This migration adds `gallery_media.is_cover boolean`, backfills every existing `card_photo_url` into the matching album as the `is_cover` row (synthesizing an album for the 93 Entries that had a cover but no album), and rewrites `EntryPhotosEditor` to one drop zone and one grid: the first photo uploaded is tagged `is_cover`, and any other photo can be promoted via "Set cover". Every public reader (`src/lib/*.functions.ts`, the site-next components) now resolves the cover through the Entry album's `is_cover` photo instead of the column.

## Considered Options

- **Keep `card_photo_url`, sync it automatically on every promote.** Rejected: still two sources of truth for the same photo, just kept in sync by convention — the exact class of bug (`image exists but card doesn't show it`) ADR 0001 itself cites as the reason the old per-table columns were unified in the first place.
- **Replace `card_photo_url` with a view or generated column deriving it from `gallery_media`.** Rejected: Postgres can't express "the row where `is_cover = true`" as a generated column, and a view adds a second thing to keep in sync with RLS.
- **Drop `card_photo_url` entirely in this same migration.** Rejected for now: it's a larger, harder-to-reverse step than the admin UX fix actually needed, and the column is harmless left in place, unused. A later cleanup migration drops it once this has run in production for a while.

## Consequences

- One unique partial index (`gallery_media (album_id) WHERE is_cover AND deleted_at IS NULL`) is the only thing enforcing "at most one cover per album" — the admin UI's two-step promote (unset old cover, then set new) relies on that ordering to never violate it, since Supabase has no client-side transaction.
- An Entry with any photo always has an album now (previously an Entry could have just a Card photo and no album at all).
- `card_photo_url` stays on every Entry table, unused by the app, until a later cleanup migration drops it.
