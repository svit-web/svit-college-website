# Entries share one Card photo column and link albums through gallery_albums

Every content table shown as a Card (events, posts, facilities, centers, sports, achievements, student_clubs) stores its single representative image in a column named `card_photo_url`. The old per-table names (`featured_image_url`, `cover_image_url`, `image_url`) were renamed in place, even though a rename is harder to undo than mapping names in code. Extra photos live in an optional Entry album: the Entry has `album_id → gallery_albums(id)`, and the photos are `gallery_media` rows. `has_detail_page` (default false) decides whether the Entry gets its own URL.

## Considered Options

- **Keep the old column names and map them in the data layer.** Rejected: the mismatch was the root of the "image exists but card doesn't show it" bugs found in the 2026-09-23 image audit.
- **Store extra photos as a jsonb array on each row** (how Library, NSS/NCC and labs used to do it). Rejected: each table ended up with its own shape and editor, and editing a lab silently dropped its images.
- **A polymorphic `entry_photos(entry_type, entry_id)` table.** Rejected: Postgres can't enforce a foreign key on it, and it would duplicate the existing gallery tables, their RLS and their admin screens.

## Consequences

- Logos (`logo_url`) and people's photos (`photo_url`) keep their own names, because they are different concepts from a Card photo.
- Entry albums are owned by one Entry (`gallery_albums.owner_table`) and are hidden from the public `/gallery`. Trashing, restoring or permanently deleting an Entry does the same to its album.
