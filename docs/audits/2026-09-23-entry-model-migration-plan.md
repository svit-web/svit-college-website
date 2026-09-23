# Entry model migration: review notes (2026-09-23)

Draft files. Nothing has been applied. Apply in order:

1. `20260923140000_entry_card_photo_and_album.sql`: A–G, J
2. `20260923140100_entry_model_rls.sql`: events scoped policies and Entry-album RLS
3. `20260923140200_merge_sports_and_drop_legacy_tables.sql`: H, I, K, L

The files parse, but none has been run. Try them on a branch first.

## Judgment calls

- **`college_id` added to `posts`, `gallery_albums` and `achievements`.** It was missing, so `'college'` scope couldn't be expressed without it. FK `ON DELETE CASCADE`. The `global` branch now also requires `college_id IS NULL`.
- **events `check_content_scope` dropped** only after a DO block checks that `events_scope_consistency` still covers the global, college and department scopes.
- **Scoped events policies** use `can_write_scoped_record(null, null, college_id, department_id)`. A college admin can also write department events in their college. The unused live `can_write_event()` was ignored.
- **Entry album INSERT:** no Entry can point at an album that doesn't exist yet. So any admin (new `is_any_admin()`) can insert a hidden album (`owner_table` set, `show_in_public_gallery=false`). UPDATE and media writes require `can_write_entry_album()`. There is no album DELETE policy. **TODO:** add `owner_id` if orphan albums are unacceptable.
- `can_write_entry_album` also covers `posts` (`news_events`).
- **`has_detail_page` backfill** runs only when the column is added. It includes "Main Campus".
- **New sports are named after the sport**, not the venue. **Slug `pickle` → `pickleball`**, so the old URL may need a redirect. Venue name and highlights go into `metadata`.
- `sports_public_read` is recreated because the enum change breaks its text comparison. The sports audit FKs point to `user_profiles`. Verified: `user_profiles.id` is an FK to `auth.users`, and all audit values are NULL.
- **sports_achievements looks like seeded demo data** (one shared `created_at`). It stays published because it is live today. Please confirm it's real.

## Data used

**sports_achievements → achievements** (`sports`, global, published, no image):

| legacy id | title | date | slug |
|---|---|---|---|
| 480555d7… | GTU Inter-University Champions (kabaddi) | 2024-02-10 | sports-kabaddi-gtu-inter-university-champions-2024 |
| c38e1309… | State-Level Cricket Runner-up | 2023-11-20 | sports-cricket-state-level-cricket-runner-up-2023 |
| 4243f7ce… | AICTE Chess Championship – Bronze | 2024-01-15 | sports-chess-aicte-chess-championship-bronze-2024 |
| 95a06018… | GTU Football Zone Champions | 2023-09-05 | sports-football-gtu-football-zone-champions-2023 |
| d2077f84… | Volleyball State Runners-up | 2024-03-12 | sports-volleyball-volleyball-state-runners-up-2024 |

Sport, level and position are kept in `metadata`.

**facilities → sports:**

- New: carrom `ff797a6f` (indoor), pickle→pickleball `db3109fa` (outdoor), weightlifting `a490d63f` (indoor). Sort order 110–130.
- Already in sports: badminton `e794fe27`, basketball `606f0688`, chess `913cb497`, cricket `fabd1521`, football `aa808998`, table-tennis `d06fe16c`, volley `32c4dfea`.
- All 10 facility rows are soft-deleted.

**Dropped:** `club_events` (6 test rows), `department_activities` (3), `sports_achievements`, `testimonials`. No FK points into any of them.

## Not done

- Trash cascade from an Entry to its album needs per-table triggers.
- `sports` and `centers` are still missing from the Trash list.
- Entry album slugs must be globally unique. The app has to generate them.
- Regenerate `types.ts`. App code still uses the old column names.
