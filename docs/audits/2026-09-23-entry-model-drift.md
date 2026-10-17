# Entry model — live schema drift check (2026-09-23)

Phase 0 of the Entry / Card photo / Entry album project (see `CONTEXT.md`). This is a read-only comparison of the live Supabase DB with `supabase/migrations/`, `supabase/seeds/` and `src/integrations/supabase/types.ts`. Backups are in `docs/backups/2026-09-23-entry-model/`.

## 1. Migration history

- **Tracked files don't match live versions.** Live has 76 migrations and there are 29 files. The live history uses different version numbers for many of the same changes (e.g. file `20260905120000_add_activity_type…` vs live `20260905090635`, file `20260921130000_add_staff_muster_number` vs live `20260921131841`). `20260812000000_phase0_baseline.sql` is the squashed baseline. Don't use `supabase db push` against live: it would try to re-run the mismatched files. Apply new migrations one at a time via MCP `apply_migration` and commit the same SQL as a file.
- **Live migrations with no file (after the baseline):**
  - `20260912093158_add_links_mega_menu_type`
  - `20260916*` / `20260917*`: faculty and diploma data fixes (11 migrations)
  - `20260921071821_admin_section_permissions`, `20260921071930_admin_section_row_tagging`, `20260921072035_fix_can_write_section_institute_match`, `20260921072107_admin_section_write_policies`. These came with commit `98139b6` (section-scoped editor permissions), which shipped without migration files.
  - `20260922150938_add_colleges_nav_label`
- **Recovered SQL** (from `supabase_migrations.schema_migrations.statements`) for the schema-affecting ones is in `docs/backups/2026-09-23-entry-model/recovered-live-migrations/`. `admin_section_write_policies` (13.6 KB) and the faculty data migrations can be pulled the same way (`select statements from supabase_migrations.schema_migrations where version = '…'`). Their resulting policies are recorded in section 3 below.
- **Generated types** (`src/integrations/supabase/types.ts`) match live: they include `admin_sections`, `user_section_grants`, `admin_section_id` and `colleges.nav_label`.

## 2. Tables — live vs files

Columns for all 20 tables match the baseline, with these exceptions:

| Object | Live | Files | Risk for planned migration |
|---|---|---|---|
| `facilities.admin_section_id`, `app_settings.admin_section_id` (FK → `admin_sections`) | present | missing | Must be kept when rewriting facilities RLS. The library row is tagged `library` and `hero_appearance` is tagged `home_page`. |
| `admin_sections`, `user_section_grants`, `can_write_section()` | present | missing | Every write policy below uses `can_write_section`, so new tables and policies must too. |
| `menu_items_menu_type_check` incl. `links_mega` | present | baseline lacks `links_mega` | none |
| `events.club_id` | absent (added then reverted 2026-07-29) | — | Must be re-added for club events. |

Constraints that matter for the planned changes:

- **`achievements`**:
  - `category CHECK IN ('student','faculty','college','department')`. Merging sports achievements needs `'sports'` added.
  - `check_content_scope` allows only global/department.
  - `slug` and `date` are NOT NULL, `sports_achievements.achievement_date` is nullable, but all 5 live rows have a date. Those rows have no slug, so one must be generated.
- **`posts`**: `check_content_scope` allows only global/department, so college-level News needs the check widened. `status` is `content_status` with default `'draft'`. There are 0 rows. `category_id` is an FK to `content_categories`.
- **`gallery_albums`**: `check_content_scope` allows only global/department. Entry albums for college, club or institute Entries need it widened, or should always be `global` with scope taken from the owning Entry. `gallery_media.album_id` is `ON DELETE CASCADE`, so a hard delete of an album removes its media.
- **`events`**:
  - `events_scope_consistency` covers global/trust/institute/college/department. `check_content_scope` (global/department only) also exists on events, so **a `college`-scoped event is currently impossible**: it fails `check_content_scope`. Live has 9 global and 1 department event, and no college ones. Drop or widen `check_content_scope` on events.
  - `status` is the `event_status` enum (`draft,published,cancelled,archived`), not `content_status`, with default `'draft'`.
  - `event_date_check start_date <= end_date`.
- **`sports`**: `status` is **text**, not an enum. `is_active` bool. `created_by`/`updated_by`/`deleted_by` are FKs to **`auth.users`**, not `user_profiles` like every other table. `slug` UNIQUE.
- **`facilities`**: `unique_facility_slug UNIQUE(slug)` is global across campus, building and lab rows. `check_facility_fields` requires a lab to have `department_id` and a campus row to have `institute_id` with no parent.
- **`mous`**: no `department_id` FK, only `department_name` text.
- **`student_clubs`**: `unique_club_slug`. `department_id` FK without ON DELETE.
- **Photos by facility type** (live rows): labs 105, of which 37 have `metadata.images[]` and 1 has `metadata.imageUrl`. Buildings 16 (the library has `metadata.gallery`). Campus 6.

### Triggers

| Table | Trigger | Note |
|---|---|---|
| events | `events_before_write` | fills `college_id` from the department and sets `featured_at`/`featured_by := auth.uid()` |
| events | **`events_enforce_featured_rules`** | Raises unless `auth.uid()` has a **global** `user_roles` row whenever `is_featured` *changes*. Also caps featured events at 8. A migration run via MCP/service role (`auth.uid()` NULL) that sets `is_featured = false` **will fail**. Soft-delete the `testing` event without touching `is_featured`: the cap already ignores deleted rows. |
| events, posts | `audit_events_trigger`, `audit_posts_trigger` | `process_audit_log()` writes `to_jsonb(row)` generically, with no column names. Rename-safe. |
| most | `update_*_modtime` / `update_sports_updated_at` | generic |

**No function or view references** `featured_image_url`, `cover_image_url`, `image_url`, `club_events`, `department_activities`, `sports_achievements` or `testimonials` (checked `pg_proc.prosrc` and `information_schema.views`; there are no public views). Renames and drops are safe at the DB-object level. Only app code, RLS and FKs reference them.

## 3. RLS (live)

Reads: nearly every table has `Anon SELECT … USING (true)`, so drafts and soft-deleted rows are readable by anon and the app filters them. The exceptions are `sports`/`sports_achievements` (`deleted_at IS NULL AND status='published' AND is_active`) and `placement_cells`. Writes:

| Table | Write policy (live) |
|---|---|
| events, posts | `is_global_admin() OR can_write_section('news_events')`. **Department and college admins can't write events** at all. |
| gallery_albums, gallery_media, student_clubs, club_events, sports | `is_global_admin() OR can_write_section('campus_life')`. **A department admin can't create a lab's album** under this. Entry albums need scope-aware policies derived from the owning Entry. |
| facilities | `can_write_scoped_record(null, institute_id, dept.college_id, department_id) OR (admin_section_id tag → can_write_section)` |
| centers | `can_write_scoped_record(null, institute_id, college_id, null) OR can_write_section('campus_life', …)` |
| department_activities | scoped by department (to be dropped) |
| achievements | global admin only (separate I/U/D policies) |
| mous, testimonials, menu_items | global admin only |
| accreditations | global OR `about_us` |
| homepage_items | global OR `home_page` |
| recruiters, placement_cells | global OR `placement` |
| app_settings | global OR section via `admin_section_id` |
| sports_achievements | **`auth.uid() IS NOT NULL` for ALL**: any logged-in user can write (being dropped anyway) |

Storage buckets: `media` (public; any authenticated user can insert; owner or global admin can update/delete), `gallery` (public, **0 files**, no write policies), `staff-photos` (public).

## 4. Trash mechanics

- Soft delete is done **client-side** by each admin screen: `AdminCrudManager.tsx:532-554` sets `deleted_at` and writes an audit row. Bespoke pages (Labs, Sports, Homepage, Menus, Media, Staff wizards, Inquiries) do it themselves.
- `/admin/trash` (`src/components/admin-next/pages/AdminTrashPage.tsx:9-43`) is a **hardcoded list** of 33 tables. Restore is a client `update({deleted_at:null, deleted_by:null})` on the selected table (`:104-110`). Purge (global admin only) is a client `delete().eq('id', …)` (`:149`). Both write a best-effort `audit_logs` row.
- **Not in the Trash list:** `centers`, `sports`, `mous`, `accreditations`, `club_events`, `department_activities`, `sports_achievements`, `admin_sections`, `user_section_grants`. Rows soft-deleted there can't be restored from the UI.
- There's no DB-level cascade. Because soft delete, restore and purge all happen client-side across many screens, "trashing an Entry trashes its album, restoring restores it, purging removes the album rows" is only reliable as **DB triggers** on each Entry table: on the `deleted_at` transition, and a hard delete removes the album, which cascades to media via the existing FK.

## 5. Seeds

`supabase/seeds/*.sql` and `run-seeds.mjs` have **no references** to `featured_image_url`, `cover_image_url`, `image_url`, `club_events`, `department_activities`, `sports_achievements`, `testimonials`, or inserts into events/facilities/sports/achievements/posts/student_clubs/centers/gallery tables. They seed trusts, colleges, departments, courses, committees, accreditations, placement statistics and faculty only. The renames and drops won't break the seeds.

Migration files referencing the tables to drop (history only; don't edit): `20260805051746_scope_aware_write_rls.sql:93-103`, `20260806060203_scope_aware_read_rls.sql:44-51` (department_activities), `20260806065601_global_only_write_rls.sql:186-213` (testimonials, club_events), and the baseline.

## 6. Everything that references the columns to rename and the tables to drop

**Columns to rename** (the Card photo column):
- `events.featured_image_url`
- `posts.featured_image_url`
- `achievements.featured_image_url`
- `sports.cover_image_url`

Also relevant: `gallery_albums.cover_image_url` (album cover, not an Entry), `homepage_items.image_url` (highlight cards, being removed), and `club_events.image_url` and `sports_achievements.image_url` (tables being dropped). At the DB level these columns are referenced by **no FK, RLS policy, view, function or trigger**. Only app code and generated types use them.

**Tables to drop:**

| Table | FKs out | FKs in | RLS | Triggers |
|---|---|---|---|---|
| `club_events` | `club_id → student_clubs`, `created_by`/`updated_by`/`deleted_by → user_profiles` | none | Anon SELECT, Authenticated read, Global write (campus_life) | none |
| `department_activities` | `department_id → departments`, audit → user_profiles | none | Anon read, Scoped read/insert/update/delete | none |
| `sports_achievements` | `sport_id → sports` (SET NULL), audit → `auth.users` | none | sports_ach_admin_all, sports_ach_public_read | `trg_sports_ach_updated_at` |
| `testimonials` | audit → user_profiles | none | Anon SELECT, Authenticated read, Global write | `update_testimonials_modtime` |

No table has an FK *into* any of these four, so `DROP TABLE` needs no CASCADE. Also drop `sports_achievements`' trigger function only if nothing else uses it: `update_sports_updated_at` is also used by `sports`, so **keep it**.

## 7. Backups written

`docs/backups/2026-09-23-entry-model/`:
- One JSON array per table, with all rows including soft-deleted: events 10, club_events 6, department_activities 3, mous 19, facilities 128, centers 9, sports 10, sports_achievements 5, achievements 155, posts 0, student_clubs 11, gallery_albums 2, gallery_media 233, testimonials 6, placement_cells 5, recruiters 288 (286 live, 18 with dead `/__l5e/` logos), accreditations 4, homepage_items 88, app_settings 15, menu_items 22. Counts were checked against `count(*)`.
- `hero_appearance.json`, `placement_cells_testimonials.json` (6 on `overview`), `testimonials-export.md` (all 12 quotes, readable).
- `recovered-live-migrations/*.sql`: SQL for the 6 schema migrations that exist live without files.
