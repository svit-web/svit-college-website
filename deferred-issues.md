# Deferred Issues

Issues surfaced during a codebase exploration (2026-07-29) that need attention but aren't blocking current work.

## 1. Schema drift on `user_roles`

Two different migrations define conflicting shapes for `user_roles`:

- `supabase/migrations/20260722000000_auth_tables.sql` — role-FK + `scope_type` model (`role_id` referencing a `roles` table, `scope_type` enum trust/institute/college/department).
- `supabase/migrations/20260728120000_schema_restructure.sql` — a second, differently-shaped `user_roles` table using a `user_role_enum` (`super_admin`/`college_admin`/`dept_coordinator`) that references `auth.users` directly, instead of going through the `roles` table.

Need to determine which shape is actually live in the DB and reconcile the migration history so it isn't ambiguous. This affects `useAdminAuth.ts` and the scoping logic in `AdminCrudManager.tsx`, both of which assume a specific shape.

## 2. `placement_cells` table has no tracked `CREATE TABLE`

Only `ALTER TABLE` migrations reference `placement_cells`:
- `20260729131000_add_placed_students_to_placement_cells.sql`
- `20260729133600_add_default_student_placeholder_url_to_placement_cells.sql`

The table itself (columns: `college_code`, `officer_name/designation/email/phone/photo_url`, `about_text`, `metadata`, standard audit columns) was created directly against the live DB, not via a migration. `src/integrations/supabase/types.ts` reflects it, but migration history alone can't rebuild this table from scratch. Worth backfilling a proper `CREATE TABLE` migration (or documenting the manual origin) before the DB is ever rebuilt from migrations.

## 3. Server-side image compression toggle is non-functional (2026-07-30)

Added as part of the hybrid image-compression feature (`src/lib/image-compression.ts`, `@jsquash/*` WASM codecs, `app_settings.image_compression_mode`). Client-side compression works fully and is the default. The "server-side" mode (`uploadCompressedMedia` in `src/lib/media-upload.functions.ts`) is currently broken under this app's Cloudflare Workers build:

- `@jsquash/*` packages load their WASM binary via `new URL("*.wasm", import.meta.url)` + `fetch()`.
- Vite correctly rewrites this to a proper hashed asset URL for the **client** bundle (`.output/public/assets/*.wasm` — confirmed present after a build), but does **not** do the same for the **server**/Workers bundle — no `.wasm` files exist anywhere under `.output/server`, so the fetch has nothing to reach at runtime. Reproduced directly: calling `compressImage()` server-side throws `TypeError: fetch failed` / `Error: not implemented... yet...`.

The toggle UI (`/admin/settings`) is disabled with an explanatory note; `app_settings.image_compression_mode` stays seeded at `"client"`. To actually fix server-side compression: bypass each `@jsquash/*` package's default WASM loader and manually feed it a `WebAssembly.Module` through that package's `init()` — either via a static `.wasm` import Vite bundles correctly for the server target, or via Cloudflare's `ASSETS` binding (`wrangler.json` already has an `assets` binding configured). Needs verification via an actual `wrangler dev`/deployed run, not just a successful build (the build succeeds silently even though the runtime path is broken).

## Other stale-doc notes (lower priority)

- `implemented/status_summary.md` lists "Homepage Layout Builder" and "Inquiry Forms & Submissions Dashboard" as outstanding (Phase 4), but `implemented/5_homepage_inquiries.md` documents both as completed — `status_summary.md` is stale.
- `TESTING_REPORT.md` flagged an SSR hydration bug where clubs/centers index pages render 0 cards server-side; this was never explicitly marked fixed even though `SESSION_SUMMARY.md`/`MIGRATION_STATUS.md` call Phase 1 "100% complete."
- `SUPABASE_SCHEMA.md` is called out in `PHASE4_COMPLETE.md` as a stale one-time audit snapshot that undercounts real row counts — don't treat it as current.
