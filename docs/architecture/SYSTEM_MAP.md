# System map: database ↔ admin panel ↔ website

Hand-written snapshot for the site's designers/maintainers, built 2026-10-03 on branch `nextjs-migration`. It traces every live Supabase table, every admin screen, and every public route into one picture, and lists every inconsistency found along the way. **Nothing here was fixed or changed** — this is a read-only audit. The live Supabase schema is treated as truth; places where it differs from the tracked migrations in `supabase/migrations/` are called out as drift.

Much of this codebase was vibe-coded across many sessions, so several "obvious" wirings turned out not to exist (e.g. SEO metadata that's never read, soft-delete columns that no query ever checks). Every claim below was independently re-checked by a second pass against the live code and live database before being included — see each section's "Verification corrections" block for anything the first pass got wrong.

## How a request flows

1. **Public pages** (`src/app/(site)/**`) are async Server Components. They call plain async functions in `src/lib/*.functions.ts` (misleadingly named — a TanStack-era convention, not Next.js server functions), which query Supabase through `publicSupabase()` — a cookie-less anonymous client relying on RLS `SELECT` policies. `layout.tsx` wraps each call in `.catch(() => fallback)` so a failing query degrades instead of 500ing.
2. **Admin pages** (`src/app/admin/(dashboard)/**`) call `getAdminUser()` in the dashboard layout, which redirects unauthenticated/unauthorized users to `/admin/login`. Server actions (`src/app/admin/actions.ts` and per-feature `actions.ts` files) re-check `requireAdmin()` themselves and only then dynamically import the service-role client.
3. **Authorization is enforced by Postgres RLS** (`is_global_admin()`, `can_write_scoped_record()`, `can_write_section()`), not by the UI. `src/lib/admin-sections.ts` (route/table scope lists) and `useUserScope`/`getScopeConstraints` (client-side convenience) are meant to mirror RLS but can drift from it — several such mismatches are documented below.
4. **middleware.ts** runs Supabase session refresh (`getClaims`) on every non-asset route.
5. **Soft deletes**: most tables carry `status` (draft/published/archived) and `deleted_at`/`deleted_by`. The admin Trash page restores from a hardcoded table allowlist — several tables with real `deleted_at` columns are missing from that allowlist, and (worse) several public read queries never filter `deleted_at` at all, so "deleting" a row doesn't actually hide it from the live site. See the Gaps list.

## Structure of this document

Nine domain sections, each written and then independently re-verified against the live DB and code:

1. Organisation & academics (trusts, institutes, colleges, departments, courses, facilities)
2. Staff & faculty
3. Events, news, gallery, achievements
4. Placement & recruiters
5. Homepage, settings, menus, media, site shell
6. About pages, campus life, admissions info
7. Inquiries, grievance & public forms
8. Auth, roles, RLS, audit, trash, admin shell, DB-wide objects (functions/triggers/enums/views/storage/advisors)
9. Everything else (coverage sweep — anything the other eight missed)

Each section documents, per table: every column (type, nullable, default, FK/check/enum, which admin field edits it, which website component renders it), RLS policies in plain English, triggers, and migration drift; then the admin screen(s), the data-layer functions, and the public routes/components that consume it; then a **Gaps** list for that domain.

After the nine sections: **reverse indexes** (table → section, route → section, admin screen → section) and a **master Gaps list** combining and de-duplicating all ~111 confirmed issues by severity.

---


## Organisation & academics

This section covers the hierarchy `trusts → institutes → colleges → departments → courses`, plus
`facilities` (campus/building/laboratory, including department labs) which hang off institutes/departments.
Live schema read 2026-10-03 via `mcp__supabase__execute_sql` against the project configured in `.mcp.json`.
Row counts, RLS, constraints and triggers below are live-DB truth, compared against
`supabase/migrations/*.sql`.

### Trust / Institute / College / Department / Course hierarchy

**Summary**: A single `trusts` row owns one `institutes` row, which owns the 6 `colleges` rows, each
with its own `departments`, each department owning 0+ `courses`. This is the "multi-college" backbone
CLAUDE.md calls core, but in practice only one trust and one institute have ever existed — and the admin
panel has **no screen to edit either of them**.

#### `trusts`

- Row count (live): **1**. Soft-delete: yes (`deleted_at`/`deleted_by`). Status column: yes
  (`content_status`: draft/published/archived). Audit columns: `created_at/by`, `updated_at/by`. RLS: **enabled**.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | never edited | internal join key |
| name | text | NO | — | — | **never edited** (no admin screen) | never shown directly (not rendered on site; site hardcodes the trust's name instead, see Gaps) |
| slug | text | NO | — | UNIQUE; CHECK `slug_format` (`^[a-z0-9]+(-[a-z0-9]+)*$`) | never edited | never shown |
| logo_url | text | YES | — | — | never edited | never shown |
| website_url | text | YES | — | — | never edited | never shown |
| sort_order | int | NO | 0 | — | never edited | never shown |
| created_at | timestamptz | NO | now() | — | — | — |
| updated_at | timestamptz | NO | now() | trigger `update_trusts_modtime` → `update_updated_at_column()` | — | — |
| created_by | uuid | YES | — | FK → `user_profiles(id)` ON DELETE SET NULL | — | — |
| updated_by | uuid | YES | — | FK → `user_profiles(id)` ON DELETE SET NULL | — | — |
| deleted_at | timestamptz | YES | — | — | drives Trash (in theory) | — |
| deleted_by | uuid | YES | — | FK → `user_profiles(id)` ON DELETE SET NULL | — | — |
| status | content_status | NO | 'published' | enum draft/published/archived | — | — |
| metadata | jsonb | NO | '{}' | — | — | — |

- Constraints: `trusts_pkey`, `trusts_slug_key` UNIQUE(slug), `slug_format` CHECK, 3 audit FKs to `user_profiles`.
- RLS policies:
  - `Public read trusts` — SELECT, role `public`, `USING (true)`: anyone (including anon) can read every trust row regardless of status/deleted_at (no status or deleted_at filter in the policy itself — callers are expected to filter, see Data layer below, but nothing stops an unfiltered client query from exposing a soft-deleted or draft trust).
  - `Auth CRUD` — ALL (SELECT/INSERT/UPDATE/DELETE), role `authenticated`, `USING (true)` / `WITH CHECK (true)`: **any logged-in Supabase user can insert/update/delete any trust row**, with no role check (`is_global_admin()`, `can_write_scoped_record`, etc. are not referenced at all). This is the only org/academics table whose write policy does not gate on admin role or scope.
- Triggers: `update_trusts_modtime` (BEFORE UPDATE) → `update_updated_at_column()`.
- Migration drift: table originates in the `phase0_baseline` migration dump; the permissive `Auth CRUD` policy is part of that baseline, not something later `scope_aware_*`/`global_only_write_*` migrations revisited — those migrations tightened `colleges`/`departments`/`courses`/`facilities`/`institutes` but never touched `trusts`. No drift from migrations (live matches), but see Gaps.

**Admin**: No `/admin/trusts` or `/admin/tables/trusts` route exists; nothing in `AdminSidebar.tsx` links to it, and it's absent from `GLOBAL_ONLY_TABLE_IDS`/`COLLEGE_OR_ABOVE_ROUTE_PREFIXES` in `src/lib/admin-sections.ts`. The only place `trust_id` appears in admin code is `src/app/admin/(dashboard)/user-management/actions.ts:92,106,267,302`, which only *assigns* a user's scope to an existing trust — it never creates/edits/deletes the trust row itself. `AdminCrudManager` could in principle serve `/admin/tables/trusts` (it's a generic table editor keyed by `tableId`), but no route wires it up.

**Data layer**: no `trusts.functions.ts` exists; nothing under `src/lib/*.functions.ts` queries `trusts` at all (confirmed by grep — zero website call sites).

**Website**: never rendered. The one trust row ("SVIT Vasad" trust, presumably) is pure dead data from the website's perspective; any trust name/tagline shown publicly is hardcoded in site copy, not pulled from this table.

**Storage/media**: `logo_url`/`website_url` columns exist but are unused in practice (no writer, no reader).

#### `institutes`

- Row count (live): **1**. Soft-delete: yes. Status: yes (content_status). Audit: yes. RLS: **enabled**.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | never edited | FK target for `colleges.institute_id`, `facilities.institute_id` |
| trust_id | uuid | NO | — | FK → `trusts(id)` ON DELETE CASCADE | never edited | — |
| name | text | NO | — | — | **never edited** | never shown |
| slug | text | NO | — | UNIQUE; CHECK `slug_format` | never edited | never shown |
| logo_url | text | YES | — | — | never edited | never shown |
| website_url | text | YES | — | — | never edited | never shown |
| sort_order | int | NO | 0 | — | never edited | never shown |
| created_at/updated_at | timestamptz | NO | now() | trigger `update_institutes_modtime` | — | — |
| created_by/updated_by/deleted_by | uuid | YES | — | FK → `user_profiles(id)` SET NULL | — | — |
| deleted_at | timestamptz | YES | — | — | — | — |
| status | content_status | NO | 'published' | enum | — | — |
| metadata | jsonb | NO | '{}' | — | — | — |

- RLS policies:
  - `Public read institutes` — SELECT, role `public`, `USING (true)` — same unfiltered-read shape as trusts.
  - `Scoped insert/update/delete institutes` — role `public`, gated by `can_write_scoped_record(trust_id, id, NULL, NULL)` — this one *is* scope-aware (trust-level admin only), unlike `trusts`' own policy.
- Triggers: `update_institutes_modtime`.
- Migration drift: none found; matches `phase0_baseline` + later scope-aware write migrations.

**Admin**: Same situation as `trusts` — no dedicated route, not in any sidebar group, only referenced for scope-assignment in `user-management/actions.ts:176` (`institute_id: institute.id` when creating an institute-scoped admin). No screen edits `name`/`logo_url`/`website_url`/`slug` for the one institute row.

**Data layer**: no `institutes.functions.ts`; zero website read call sites.

**Website**: never rendered.

#### `colleges`

- Row count (live): **6**. Soft-delete: yes. Status: yes. Audit: yes. RLS: **enabled**.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | — | join key |
| institute_id | uuid | NO | — | FK → `institutes(id)` ON DELETE CASCADE | not editable (hidden FK, see Admin) | — |
| name | text | NO | — | — | `AdminCrudManager` generic field, `/admin/colleges` | `src/lib/colleges.functions.ts` `getAllColleges/getCollegeBySlug`; rendered in `colleges/page.tsx`, `CollegeLandingPage.tsx`, mega panel |
| slug | text | NO | — | UNIQUE; CHECK `slug_format` | generic field | route param for `/colleges/[college]` |
| code | text | NO | — | UNIQUE; CHECK `code_format` (`^[A-Z0-9]+$`) | generic field | shown in some cards |
| logo_url | text | YES | — | — | generic field (text input, not the `MediaUploader`/`EntryPhotosEditor` flow other Entry tables get) | college logo in nav/landing |
| website_url | text | YES | — | — | generic field | external link if present |
| sort_order | int | NO | 0 | — | generic field | ordering on `/colleges` and mega panel |
| created_at/updated_at | timestamptz | NO | now() | trigger `update_colleges_modtime` | — | — |
| created_by/updated_by/deleted_by | uuid | YES | — | FK → `user_profiles` SET NULL | — | — |
| deleted_at | timestamptz | YES | — | — | restorable from `/admin/trash` | filtered out everywhere (`.is("deleted_at", null)`) |
| status | content_status | NO | 'published' | enum | status badge/toggle in `AdminCrudManager` | `.eq("status","published")` filter |
| metadata | jsonb | NO | '{}' | — | generic JSON field (no structured editor, unlike departments) | occasionally spread into `College` type but not consistently read |
| tagline | text | YES | — | — | generic field | `CollegeLandingPage` hero |
| hero_kicker | text | YES | — | — | generic field | hero kicker text |
| hero_subhead | text | YES | — | — | generic field | hero subhead |
| show_in_navigation | boolean | NO | true | — | generic field | gates mega-panel/nav listing (`menus.functions.ts` / Header) |
| nav_label | text | YES | — | — | generic field (added 20260922150938) | overrides `name` in nav if set |

- Constraints: PK, UNIQUE(code), UNIQUE(slug), `slug_format`, `code_format` CHECK, FK `institute_id→institutes` CASCADE, 3 audit FKs.
- RLS policies:
  - `Anon read colleges` — SELECT, `anon`, `USING (true)` — unfiltered, same pattern as trusts/institutes (no status/deleted_at filter in the policy; relies on callers).
  - `Scoped read colleges` — SELECT, `authenticated`, `can_write_scoped_record(NULL, institute_id, id, NULL)`.
  - `Scoped insert/update/delete colleges` — same function, `(institute_id, college_id=id)` scope — i.e. a college-scoped admin can write only their own row; an institute-scoped admin can write any college under their institute.
- Triggers: `update_colleges_modtime`.
- Migration drift: `nav_label` (20260922150938) and `show_in_navigation`/`hero_*`/`tagline` are all tracked in migrations; live matches.

**Admin**: `/admin/colleges` (`src/app/admin/(dashboard)/colleges/page.tsx:1-15`) → `AdminCrudManager` with `tableId="colleges"`. Guarded by `requireAdmin()` + `isRouteAllowedForUser('/admin/colleges', level, sections)`; `/admin/colleges` is listed in `COLLEGE_OR_ABOVE_ROUTE_PREFIXES` (`admin-sections.ts:59`) so department-scoped admins are redirected away. `TABLE_CONFIGS.colleges` (`AdminCrudManager.tsx:191-196`) sets `scope.selfScopeLevel: 'college'` and `writePermissions.resolve`: for a **global** admin the top-level short-circuit at `AdminCrudManager.tsx:628` (`if (userScope.level === 'global') return {insert:true,update:true,delete:true}`) applies first, so globals get full CRUD; for any other level the override `{insert:false, update: level==='college', delete:false}` applies — a college-scoped admin can edit their own row but never insert/delete a college (matches RLS, which also blocks insert/delete for a college-scoped admin via `can_write_scoped_record`). No import/CSV path. `institute_id` is not exposed as an editable field (it's filtered out by `AdminCrudManager`'s generic FK-dropdown machinery only if it recognizes the column type — code read shows no explicit hide, so it likely renders as a raw FK dropdown for global admins only, since new colleges can't be created under any non-global scope and only global admins can insert).

**Data layer**: `src/lib/colleges.functions.ts` — `getAllColleges()` (status=published, deleted_at IS NULL, order by sort_order), `getDepartmentsByCollegeSlug(slug)` (two round-trips: college id lookup then departments), `getCollegeBySlug(slug)` (status=published, deleted_at IS NULL). No caching/revalidation (`fetch` defaults for a Server Component database call via Supabase client — no `next: {revalidate}` tags seen), so content updates are live on next request, consistent with CLAUDE.md's "avoid stale caching" rule.

**Website**: `/colleges` (`src/app/(site)/colleges/page.tsx`) lists all colleges via `getAllColleges().catch(() => [])`. `/colleges/[college]` (`src/app/(site)/colleges/[college]/page.tsx:1-99`) loads college + its departments and renders `CollegeLandingPage` (`src/components/site-next/CollegeLandingPage.tsx`), which also renders `DeptBranchCard` per department and a `RecruitersMarquee`. Not-found handled by `colleges/[college]/not-found.tsx`. The Colleges mega panel (Header) consumes `show_in_navigation`/`nav_label`/`sort_order` via the nav data layer (`menus.functions.ts`, not re-read line-by-line here).

**Storage/media**: `logo_url` is a plain text URL column edited via raw text input in `AdminCrudManager`'s generic form, not through `MediaUploader`/client-side compression — any logo uploaded this way skips the `@jsquash/*` compression pipeline CLAUDE.md describes for other media.

#### `departments`

- Row count (live): **22**. Soft-delete: yes. Status: yes. Audit: yes. RLS: **enabled**.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | — | join key |
| college_id | uuid | NO | — | FK → `colleges(id)` ON DELETE CASCADE | hidden (self-scope) | groups departments per college |
| name | text | NO | — | — | generic field | everywhere (titles, cards, nav) |
| slug | text | NO | — | UNIQUE(college_id, slug) | generic field | `/departments/[dept]` route param |
| code | text | NO | — | UNIQUE(college_id, code) | generic field | `getDepartmentByCode`, `CODE_TO_STATIC_ID` map (dead, see Gaps) |
| created_at/updated_at | timestamptz | NO | now() | trigger `update_departments_modtime` | — | — |
| created_by/updated_by/deleted_by | uuid | YES | — | FK → `user_profiles` SET NULL | — | — |
| deleted_at | timestamptz | YES | — | — | Trash | filtered via `.eq('status','published')` only — **not** via `deleted_at IS NULL`, see Gaps |
| status | content_status | NO | 'published' | enum | status toggle | `.eq('status','published')` filter in every query |
| metadata | jsonb | NO | '{}' | — | **structured editor**: `DepartmentMetaEditor` (`AdminCrudManager.tsx:36-95`) edits `about`/`vision`/`mission`/`intake` sub-keys inside this one JSONB blob | `metadata.labs`, `metadata.careers` read by `programmes.functions.ts` `EngDeptRecord` |
| head_of_department_id | uuid | YES | — | FK → `staff_profiles(id)` SET NULL | not exposed in `DepartmentMetaEditor`; only generic FK dropdown if shown | HOD derivation on dept staff page relies on `staff_department_assignments`/`staff_posts`, not this column — see Gaps |
| logo_url | text | YES | — | — | generic field | department badges |
| about | text | YES | — | — | **generic top-level field editable directly AND duplicated inside `metadata.about` via `DepartmentMetaEditor`** | `Department.about` |
| vision | text | YES | — | — | same dual-path as `about` | `Department.vision` |
| mission | text | YES | — | — | same dual-path | `Department.mission` (typed `string \| string[] \| null` client-side — DB column is plain `text`, so array usage must come from JSON-encoded strings or is dead typing) |
| intake_ug | int | YES | — | — | generic field | `Department.intake_ug` |
| intake_pg | int | YES | — | — | generic field | `Department.intake_pg` |
| established_year | int | YES | — | — | generic field | — |
| level | text | YES | — | free text, not enum (values used: `'UG'` etc.) | generic field | `programmes.functions.ts getEngDepts()` filters `.eq('level','UG')` |
| degree_type | text | YES | — | free text (e.g. `'BE'`) | generic field | `getEngDepts()` filters `.eq('degree_type','BE')` |
| short_name | text | YES | — | — | generic field | `EngDeptRecord.short_name` |
| theme_color | text | YES | — | — | generic field | per-department accent color |
| overview | text | YES | — | — | generic field | `EngDeptRecord.overview` |

- Constraints: PK, FK `college_id→colleges` CASCADE, FK `head_of_department_id→staff_profiles` SET NULL, UNIQUE(college_id,code), UNIQUE(college_id,slug), `slug_format` CHECK, 3 audit FKs.
- RLS: `Anon read departments` (unfiltered `true`), `Scoped read/insert/update/delete departments` via `can_write_scoped_record(NULL, NULL, college_id, id)`.
- Triggers: `update_departments_modtime`.
- Migration drift: `about`/`vision`/`mission`/`overview`/`theme_color`/`short_name` as top-level columns coexist with the same concepts duplicated inside `metadata` jsonb (the admin's `DepartmentMetaEditor` writes `about`/`vision`/`mission`/`intake` into `metadata`, while the table also has first-class `about`/`vision`/`mission`/`intake_ug` columns edited by the generic form) — this is live behavior, not migration drift, but it's a real duplication (see Gaps).

**Admin**: `/admin/tables/departments` → generic `AdminCrudManager` (not a dedicated page component). `TABLE_CONFIGS.departments` (`AdminCrudManager.tsx:197-205`): `scope.selfScopeLevel:'department'`, write override gives department-scoped admins `update:true` but never `insert`/`delete`; `metadata` field is rendered via `DepartmentMetaEditor` instead of a raw JSON textarea. Route itself has no explicit entry in `GLOBAL_ONLY_ROUTE_PREFIXES`/`COLLEGE_OR_ABOVE_ROUTE_PREFIXES`, so `isRouteAllowedForScope` lets every scope level (including `department`) reach `/admin/tables/departments` — consistent with department admins needing to edit their own department.

**Data layer**: `src/lib/departments.functions.ts`. `getAllDepartments()`/`getDepartmentsByCollege()`/`getDepartmentBySlug()`/`getDepartmentByCode()` all filter `status='published'` but **none filter `deleted_at`** (confirmed by reading the file — no `.is('deleted_at', null)` anywhere in this module), unlike `colleges.functions.ts` which does filter it. `mapRow()` (`departments.functions.ts:60-68`) computes `static_id` from a 20-entry hardcoded `CODE_TO_STATIC_ID` map (`departments.functions.ts:36-58`) described in its own comment as mapping to "legacy static dept ID for content/staff/programs lookup" in files `departmentContent.ts`, `academics.ts`, `staff.ts` — **none of those three files exist in the repo** (confirmed via search), and `static_id` itself has zero other read sites in `src` (confirmed via grep). `getCoursesByDepartmentId`/`getCourseById`/`getCourseWithDept` also live in this module and query `courses`, filtering `status='published'` (courses has no `deleted_at` filter applied here either, though `courses` does have the column).

**Website**: `/departments/[dept]/layout.tsx` + `page.tsx` render `DepartmentLayout`/`DepartmentSections`; `/departments/[dept]/labs`, `/achievements`, `/activities`, `/staff` are sibling routes pulling from `department-content.functions.ts` (staff via `staff_department_assignments`, achievements via `achievements`, not `department_activities` — that table was dropped in `20260923140200_merge_sports_and_drop_legacy_tables.sql`, so `/departments/[dept]/activities` should be checked for whether it still queries a dropped table — see Gaps). `departments/not-found.tsx` exists at the group level.

**Storage/media**: `logo_url` plain text column, same caveat as colleges (no compression pipeline guarantee from the generic admin form).

#### `courses`

- Row count (live): **32**. Soft-delete: yes (column exists). Status: yes. Audit: columns exist but **no FK constraints** (see below). RLS: **enabled**.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | — | join key |
| department_id | uuid | YES | — | FK → `departments(id)` ON DELETE **SET NULL** | generic FK dropdown | groups courses per department; `is_programme=true` rows have `department_id IS NULL` by design (see below) |
| name | text | NO | — | — | generic field | course/programme name everywhere |
| code | text | NO | — | UNIQUE(code) | generic field | slug-like lookup key for programmes (`getProgrammeBySlug` matches on `code`, not a real slug column) |
| degree_level | degree_level enum | NO | — | enum: undergraduate/graduate/doctorate/certificate | generic field (enum picker) | `CourseWithCollegeInfo.degree_level`; note **`doctorate` exists in the live enum but is never referenced in any `src/lib` function or component** (grep found none) |
| created_at/updated_at | timestamptz | NO | now() | trigger `update_courses_modtime` | — | — |
| created_by | uuid | YES | — | **no FK constraint** (column present, unlike every sibling table) | — | — |
| updated_by | uuid | YES | — | **no FK constraint** | — | — |
| deleted_at | timestamptz | YES | — | — | not surfaced in Trash reliably since no query filters it (see Gaps) | **never filtered by any `src/lib` query** |
| deleted_by | uuid | YES | — | **no FK constraint** | — | — |
| status | content_status | NO | 'published' | enum | status toggle | `.eq('status','published')` everywhere |
| metadata | jsonb | NO | '{}' | — | generic JSON textarea | `CourseWithCollegeInfo.metadata`, `Programme.metadata.{outcomes,highlights}` |
| intake | int | YES | — | — | generic field | `intake-fees.functions.ts` |
| fees_per_semester | text | YES | — | — | generic field | `intake-fees.functions.ts` |
| description | text | YES | — | — | generic field | course detail page |
| duration | text | YES | — | — | generic field | intake-fees table, course detail |
| eligibility | text | YES | — | — | generic field | `Programme.eligibility` |
| short_name | text | YES | — | — | generic field | dept course list |
| year_started | int | YES | — | — | generic field | dept course list |
| duration_years | int | YES | — | — | generic field | dept course list |
| is_programme | boolean | YES | false | — | generic field | distinguishes "programme landing page" rows (`/programs/[program]`) from normal per-department courses |
| programme_slug | text | YES | — | **not actually used as a lookup key** — `getProgrammeBySlug()` matches on `code`, not `programme_slug` (see Gaps) | generic field | effectively dead on the read path |
| tagline | text | YES | — | — | generic field | `Programme.tagline` |
| full_name | text | YES | — | — | generic field | `Programme.full_name` |
| color / accent | text | YES | — | — | generic fields | `Programme.color/accent` |
| brochure_file_url | text | YES | — | — | generic field (plain URL, no uploader) | download links if rendered |

- Constraints: PK, UNIQUE(code), FK `department_id→departments` **ON DELETE SET NULL** (not CASCADE like most other FKs in this domain — deleting a department silently orphans its courses instead of removing them).
- RLS: `Anon read courses` (unfiltered), `Scoped read/insert/update/delete courses` via `can_write_scoped_record(NULL, NULL, (SELECT college_id FROM departments WHERE id=courses.department_id), department_id)` — for `is_programme=true` rows where `department_id IS NULL`, this subquery returns NULL college_id, meaning **only a global admin can ever write a programme-level course row** (a college/department admin's scope check can't match a NULL college_id/department_id), which matches the product intent (programmes are global pages) but isn't documented anywhere.
- Triggers: `update_courses_modtime`.
- Migration drift: **the missing `created_by`/`updated_by`/`deleted_by` FK constraints are drift relative to the pattern every sibling table (`trusts`, `institutes`, `colleges`, `departments`, `facilities`) follows** — those columns exist on `courses` (confirmed via `information_schema.columns`) but `pg_constraint` shows no matching foreign keys, so either a migration that should have added them was never written, or one was dropped without a trace in `supabase/migrations/*`.

**Admin**: `/admin/tables/courses` → generic `AdminCrudManager`, no `TABLE_CONFIGS` entry (falls through to the generic column-based scope rule at `AdminCrudManager.tsx:645-655`: a department-scoped admin gets full insert/update/delete because `department_id` is a column on the table — this is looser than RLS for programme rows, where RLS would reject the department admin's write anyway since `department_id IS NULL` on those rows doesn't match their own department; the UI would still show them as editable until the Supabase call fails).

**Data layer**: `src/lib/departments.functions.ts` (`getCoursesByDepartmentId`, `getCourseById`, `getCourseWithDept`), `src/lib/programmes.functions.ts` (`getAllProgrammes`, `getProgrammeBySlug`, `getEngDepts`, `getEngDeptBySlug` — the latter two query `departments`, not `courses`), `src/lib/intake-fees.functions.ts` (`getAllCoursesWithIntakeFees`, joins `departments!inner(colleges!inner(...))`, filters `status='published'`). None of these filter `deleted_at`.

**Website**: `/courses` (list), `/courses/[course]` (uses `getCourseWithDept`), `/courses/[course]/faculty`, `/courses/engineering/[dept]` + `/faculty` (uses `getEngDeptBySlug`/`getEngDepts`, i.e. a *departments* query despite living under `/courses/engineering/`), `/programs/[program]` (uses `getProgrammeBySlug`, matching route param against `courses.code`). `/admissions/intake-fees` renders `getAllCoursesWithIntakeFees()`. All have `not-found.tsx` siblings.

**Storage/media**: `brochure_file_url` is a plain URL column; no evidence of a dedicated brochure-upload admin flow — likely pasted after an out-of-band upload to Storage.

#### `facilities`

- Row count (live): **128** total, **118** with `deleted_at IS NULL`. Breakdown by `category` (live, non-deleted): `academic` 4, `amenities` 8, `sports` **0** (all 10 soft-deleted by migration `20260923140200`), `null` 103 (mostly department labs, which don't set `category`), `transport` **0** (no row currently has this category at all). Soft-delete: yes. Status: yes. Audit: yes. RLS: **enabled**.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | — | join key |
| facility_type | facility_type enum | NO | — | enum campus/building/laboratory; CHECK `check_facility_fields` ties the enum to required FKs (campus→institute_id set + parent_id null; building→parent_id set; laboratory→department_id set) | generic field | distinguishes labs (`facility_type='laboratory'`) from campus facilities |
| parent_id | uuid | YES | — | FK → `facilities(id)` ON DELETE CASCADE (self-referential, for building→campus) | not exposed clearly in generic form | building hierarchy, unused by the simple facilities-list page |
| institute_id | uuid | YES | — | FK → `institutes(id)` ON DELETE CASCADE | generic field | campus-level facilities |
| department_id | uuid | YES | — | FK → `departments(id)` ON DELETE CASCADE | generic field | labs: `getLabsByDepartmentId`/`getLabBySlug` |
| name | text | NO | — | — | generic field | card title |
| slug | text | YES | — | UNIQUE(slug) **global**, not per-department — a lab and a campus facility share one slug namespace | generic field | route segment; `getFacilityBySlug` explicitly excludes labs (`department_id IS NULL`) to avoid collision with `getLabBySlug`'s own namespace, per `facilities.functions.ts:73-78` comment citing `docs/audits/2026-09-23-entry-model-drift.md` |
| address | text | YES | — | — | generic field | rarely shown |
| code | text | YES | — | — | generic field | — |
| room_number | text | YES | — | — | generic field | lab detail |
| created_at/updated_at | timestamptz | NO | now() | trigger `update_facilities_modtime` | — | — |
| created_by/updated_by/deleted_by | uuid | YES | — | FK → `user_profiles` SET NULL | — | — |
| deleted_at | timestamptz | YES | — | — | Trash | filtered in most read functions |
| status | content_status | NO | 'published' | enum | status toggle | `.eq('status','published')` |
| metadata | jsonb | NO | '{}' | — | generic JSON textarea | `highlights[]`, `institute_libraries[]`, `gallery.images[]` |
| subtitle | text | YES | — | — | generic field (also skipped by Entry-photo field config where relevant) | card subtitle |
| description | text | YES | — | — | generic field | detail body |
| category | text | YES | — | free text, not enum (`academic`/`sports`/`transport`/`amenities` observed/expected) | generic field | drives the 4-way split on `/campus-life/facilities` |
| accent_color | text | YES | — | — | generic field | used as a "subtitle" value in `toCard()` (`facilities/page.tsx:27`) — **field is misnamed on the read side**, see Gaps |
| admin_section_id | uuid | YES | — | FK → `admin_sections(id)` | — | ties some facilities to section-grant-based write access (RLS `can_write_section`) |
| card_photo_url | text | YES | — | — | replaced by `EntryPhotosEditor` in admin (`ENTRY_PHOTO_FIELDS`) | card image |
| has_detail_page | boolean | NO | false | — | owned by `EntryPhotosEditor`, not the generic form | gates whether a card links to a detail route |
| album_id | uuid | YES | — | FK → `gallery_albums(id)` ON DELETE SET NULL | owned by `EntryPhotosEditor` | gallery album on detail page |

- Constraints: PK, UNIQUE(slug), `check_facility_fields` CHECK, FKs to `gallery_albums`/`departments`/`institutes`/`facilities`(self)/`admin_sections`, 3 audit FKs.
- RLS: `Anon SELECT` (`true`, unfiltered), `Scoped read facilities` via `can_write_scoped_record(NULL, institute_id, (SELECT college_id FROM departments WHERE id=department_id), department_id)`, `Scoped insert/update/delete facilities` — same function **OR** `(admin_section_id IS NOT NULL AND can_write_section(...))`, i.e. a user with only a section grant (no college/department scope) can still write facilities tagged to their section.
- Triggers: `update_facilities_modtime`; `trg_cascade_soft_delete_to_album` (AFTER UPDATE) and `trg_cascade_hard_delete_to_album` (BEFORE DELETE), both calling the Entry-model cascade functions that soft/hard-delete the linked `gallery_albums` row when a facility is trashed/purged.
- Migration drift: the `20260923*` Entry-model migrations moved all 10 `category='sports'` facilities to a separate `sports` table and soft-deleted the originals in `facilities`; `src/app/(site)/campus-life/facilities/page.tsx` was **not** updated to drop its now-permanently-empty "Sports Facilities" section (confirmed live: `sports` category has 0 non-deleted rows) — see Gaps.

**Admin**: `/admin/tables/facilities` → generic `AdminCrudManager`, `TABLE_CONFIGS.facilities = { fields: ENTRY_PHOTO_FIELDS }` (`AdminCrudManager.tsx:219`) swaps `card_photo_url` for the `EntryPhotosEditor` and hides `album_id`/`has_detail_page` from the generic form. `/admin/labs` (`src/app/admin/(dashboard)/labs/page.tsx`) is a **separate, dedicated** page (`AdminLabsPage`, 525 lines) rather than the generic table editor — presumably a friendlier department-scoped lab-creation flow (room number, department picker) layered over the same `facilities` table with `facility_type='laboratory'`. Neither `/admin/tables/facilities` nor `/admin/labs` is in `GLOBAL_ONLY_ROUTE_PREFIXES`, so every scope level can reach them (RLS does the real gating).

**Data layer**: `src/lib/facilities.functions.ts`: `getAllFacilities()` (status + `department_id IS NULL` + `deleted_at IS NULL`), `getFacilitiesByType(type)` — **filters `status` and `facility_type` only, not `deleted_at`**, and **has zero call sites anywhere in `src`** (dead function), `getFacilityBySlug(slug)` (status + `department_id IS NULL` + `deleted_at IS NULL`), `getLabsByDepartmentId`/`getLabBySlug` (status + `facility_type='laboratory'` + `deleted_at IS NULL`).

**Website**: `/campus-life/facilities` (`facilities/page.tsx`) splits `getAllFacilities()` into four `FacilitySection`s by `category` (`transport`/`academic`/`sports`/`amenities`); a section with 0 entries renders nothing (`entries.length===0 → return null`), so the "Transport" and "Sports" headings never currently appear even though the code paths exist. `/campus-life/facilities/[...slug]` resolves individual facility detail pages (academic/transport/amenities/co-curriculum prefixes from `pathFor()`). `/departments/[dept]/labs` and `/departments/[dept]/labs/[slug]` render department labs via `getLabsByDepartmentId`/`getLabBySlug`.

**Storage/media**: `card_photo_url`/gallery images go through the Entry-model `EntryPhotosEditor` + `gallery_albums`/`gallery_media`, which per CLAUDE.md uses client-side compression (`src/lib/image-compression.ts`).

### Related but out of this section's scope

- **`scholarships`** (0 live rows): lives under Admissions (`/admin/scholarships`, `/admissions/scholarships`), not Academics, despite being listed in the Academics sidebar group (`AdminSidebar.tsx:54`) — a placement inconsistency worth a designer's eye, but its data layer (`scholarships.functions.ts`, `scholarships-next.ts`) belongs to the admissions domain and wasn't audited column-by-column here.
- **`gallery_albums`**: only touched here via `facilities.album_id`/the Entry-model cascade triggers; full table audit belongs to the campus-life/gallery domain.
- **`staff_department_assignments`, `staff_posts`**: read by `department-content.functions.ts` for a department's Staff tab; full audit belongs to the Staff & Faculty domain.

#### Gaps (Organisation & academics)

- **broken** — `trusts` RLS policy `Auth CRUD` (`ALL`, role `authenticated`, `USING (true)` / `WITH CHECK (true)`) lets **any signed-in Supabase user**, regardless of admin role or scope, insert/update/delete the trust row directly via the Supabase client/REST API — no `is_global_admin()`/`can_write_scoped_record()` check at all, unlike every other table in this domain. Fix: replace with a scope-aware policy matching `institutes`' pattern (`can_write_scoped_record(trust_id, NULL, NULL, NULL)` or equivalent global-admin check).
- **broken** — `courses.created_by`/`updated_by`/`deleted_by` have no FK constraint to `user_profiles`, unlike `trusts`/`institutes`/`colleges`/`departments`/`facilities`, which all FK those columns. Any write sets them to arbitrary UUIDs with no referential guarantee, and audit-log tooling that joins on these columns will silently miss/mis-resolve course edits. Fix: add the missing FK constraints in a new migration (live drift, no tracked migration adds or removes them).
- **dead** — `departments.functions.ts`'s `CODE_TO_STATIC_ID` map (lines 36–58) and the `static_id` field it produces (line 65) are entirely unused: the three files its comment says it maps into (`departmentContent.ts`, `academics.ts`, `staff.ts`) do not exist anywhere in the repo, and `static_id` has no other read site. ~25 lines of dead mapping code plus a misleading comment pointing at nonexistent files.
- **misleading** — `departments` table duplicates `about`/`vision`/`mission`/`intake_ug` as first-class columns *and* inside `metadata.{about,vision,mission,intake}` jsonb. The admin's `DepartmentMetaEditor` (`AdminCrudManager.tsx:36-95`) writes into `metadata`, while the same table's generic field renderer also exposes the top-level `about`/`vision`/`mission`/`intake_ug` columns directly — an editor filling in one doesn't update the other, so which one the website actually reads (top-level columns, per `departments.functions.ts`'s `Department` interface) can silently diverge from what an admin thinks they changed via the structured editor.
- **misleading** — `facilities.accent_color` is read by `src/app/(site)/campus-life/facilities/page.tsx:27` as the card's `subtitle` (`subtitle: facility.accent_color`), not as a color value — the column name says one thing, the UI uses it for another. An admin editing "accent color" has no idea they're setting visible subtitle text.
- **misleading** — `courses.programme_slug` exists and is admin-editable but is never read on any lookup path: `programmes.functions.ts getProgrammeBySlug()` matches the `/programs/[program]` route param against `courses.code`, not `programme_slug`. An admin setting a custom programme slug has no effect.
- **dead** — `facilities.functions.ts`'s `getFacilitiesByType()` has zero call sites in the codebase, and unlike its siblings in the same file, it does not filter `deleted_at IS NULL` — if it's ever wired up, it will resurface soft-deleted facilities.
- **dead** — `/campus-life/facilities`'s "Sports Facilities" and "Transport Facilities" sections (`facilities/page.tsx`) are permanently empty in production: all 10 `category='sports'` facility rows were soft-deleted by migration `20260923140200_merge_sports_and_drop_legacy_tables.sql` in favor of the separate `sports` table, and no facility row has ever had `category='transport'`. The sections degrade gracefully (render nothing) rather than erroring, but the code implies features that don't exist.
- **broken/misleading** — `trusts` and `institutes` have full CRUD RLS policies and (for institutes) a scope-aware write policy, implying they're meant to be admin-editable records, but **no admin route exists for either table** — not in `AdminSidebar.tsx`, not in `admin-sections.ts`'s route lists. The only UI touching `trust_id`/`institute_id` is `user-management/actions.ts`, which assigns a *user's* scope to an existing trust/institute row, never edits the row's own `name`/`logo_url`/`website_url`/`slug`. If the trust or institute's name/branding ever needs to change, it requires a raw SQL update — contradicts CLAUDE.md's "content lives in Supabase, edited via admin" expectation, and is a live risk given CLAUDE.md's binding-branding rule.
- **misleading** — public read RLS on `trusts`, `institutes`, and `colleges` (`Public/Anon read ... USING (true)`) has no `status`/`deleted_at` filter at the database level; every caller is trusted to add `.eq('status','published').is('deleted_at', null)` itself. `colleges.functions.ts` does this consistently, but `departments.functions.ts` never filters `deleted_at` for departments or courses (see next item) — the safety net is "every data-layer function remembered to filter," not RLS, which is fragile.
- **broken (potential data leak)** — none of `getAllDepartments`, `getDepartmentsByCollege`, `getDepartmentBySlug`, `getDepartmentByCode`, `getCoursesByDepartmentId`, `getCourseById`, or `getCourseWithDept` in `departments.functions.ts` filter `deleted_at IS NULL`, even though both `departments` and `courses` have the column and RLS doesn't filter it either. A soft-deleted (trashed) department or course remains publicly visible on the website until it is hard-deleted, defeating the purpose of Trash/soft-delete for this content type.
- **cosmetic** — `departments.mission` is typed client-side as `string | string[] | null` (`departments.functions.ts:17`) but the live column is plain `text`; the array branch of that union type has no corresponding DB representation and is presumably dead typing from an earlier data shape.
- **cosmetic** — `courses.degree_level`'s live enum includes `doctorate`, but no `src/lib` function, admin option-label config, or page component references it — it's either aspirational (no doctorate programs yet) or a forgotten enum value; harmless but worth confirming with product owner before relying on it.
- **cosmetic** — the Academics sidebar group (`AdminSidebar.tsx:44-56`) lists "Scholarships" even though that table/feature belongs to Admissions in the URL structure (`/admin/scholarships`, `/admissions/scholarships`) and data layer — a grouping inconsistency for the person organizing the sidebar, not a functional bug.


#### Verification corrections

A second, independent pass re-checked this section against the live code and database. Corrections:

- Line ~178/277: the section claims courses.degree_level's 'doctorate' value is 'never referenced in any src/lib function or component (grep found none)'. This is wrong — src/app/(site)/admissions/intake-fees/page.tsx:21 defines a DEGREE_LABEL map with `doctorate: "Doctorate"`, a page component explicitly referencing the enum value as a display label. The underlying point still holds in practice (a live query confirms 0 courses have degree_level='doctorate'; counts are certificate=7, graduate=7, undergraduate=18), so the label never actually renders, but the specific claim of zero references anywhere is factually incorrect. Correction: 'referenced only in an unused DEGREE_LABEL mapping in intake-fees/page.tsx; no live course currently has this degree_level so the label never renders.'


---

## Staff & faculty

### Staff & faculty
**Summary**: One `staff_profiles` row per employee, assigned to one or more departments via
`staff_department_assignments` (which carries the `designations` title and any `staff_posts` such as
HOD/Dean), plus a flat achievements log in `staff_achievements`. Admin is a single wizard
(`/admin/staff-wizards`); the public site renders a profile page per employee code and per-department
rosters. Everything is written directly from the browser against Supabase (no server actions) — RLS is
the only real gate.

### Tables

#### `staff_profiles`
- Row count (live): **541**. Soft-delete: yes (`deleted_at`/`deleted_by`). Status column: yes
  (`status` content_status, default `published`). Audit columns: `created_at/by`, `updated_at/by`. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` | PK | implicit | implicit (profile key, URL via `employee_code` not `id`) |
| `user_id` | uuid | YES | — | FK → `user_profiles(id)` ON DELETE SET NULL | never edited | never shown |
| `title` | text | YES | — | — | `AdminStaffWizardsPage.tsx:728` (New) / `:617` (Create) select Dr./Prof./Mr./Ms./Mrs. | prefixed to name, `staff.functions.ts:97`, `:167`; `staff/[staff]/page.tsx` via `profile.name` |
| `first_name` | text | NO | — | — | `AdminStaffWizardsPage.tsx:747` | `staff.functions.ts:98` name build |
| `last_name` | text | NO | — | — | `AdminStaffWizardsPage.tsx:751` | same |
| `email` | text | YES | — | UNIQUE (`staff_profiles_email_key`) | `AdminStaffWizardsPage.tsx:774`; required in New-staff form (`:668`) though DB allows null (see migration `20260916095022_allow_null_staff_email.sql`) | mailto link on `staff/[staff]/page.tsx:186`; matching key for `faculty-import.ts` and `achievements-import.ts` |
| `phone` | text | YES | — | — | `AdminStaffWizardsPage.tsx:779` | **never shown** on any public page |
| `bio` | text | YES | — | — | `AdminStaffWizardsPage.tsx:816` | `staff/[staff]/page.tsx:66` "Profile" accordion |
| `office_hours` | jsonb | NO | `{}` | — | **never edited** (no UI field anywhere) | `staff/[staff]/page.tsx:233-246` renders `{day,time}[]` if present |
| `social_links` | jsonb | NO | `{}` | — | **never edited** (no UI field anywhere) | `staff/[staff]/page.tsx:195-231` renders linkedin/googleScholar/orcid if present |
| `created_at` | timestamptz | NO | `timezone('utc', now())` | — | n/a | n/a |
| `updated_at` | timestamptz | NO | `timezone('utc', now())` | — | trigger-maintained | n/a |
| `created_by` | uuid | YES | — | FK → `user_profiles(id)` SET NULL | set on create (`AdminStaffWizardsPage.tsx:196`) | used by RLS (`created_by = auth.uid()`) |
| `updated_by` | uuid | YES | — | FK → `user_profiles(id)` SET NULL | set on save (`:258`) | never shown |
| `deleted_at` | timestamptz | YES | — | — | `handleSoftDelete` (`:274`) | **should** gate visibility — see Gaps |
| `deleted_by` | uuid | YES | — | FK → `user_profiles(id)` SET NULL | set with `deleted_at` | never shown |
| `status` | content_status enum (`draft`/`published`/`archived`) | NO | `'published'` | — | `AdminStaffWizardsPage.tsx:736` select | `staff.functions.ts` filters `.eq('status','published')`; `department-content.functions.ts:46` filters client-side |
| `metadata` | jsonb | NO | `{}` | — | round-tripped unchanged by `handleSaveGeneral` (`:217,256`) — **no field-level UI** | passed through in queries, never read on site |
| `expertise` | text[] | NO | `{}` | — | Expertise tab, `AdminStaffWizardsPage.tsx:369-398` | `staff/[staff]/page.tsx:251-256` "Areas of Expertise" |
| `joining_year` | int4 | YES | — | — | `AdminStaffWizardsPage.tsx:790` | fetched (`staff.functions.ts:125`) but **not rendered** on `staff/[staff]/page.tsx`; used in `department-content.functions.ts` type but `DeptStaffMember.joiningYear` is also **not rendered** by `StaffCard` (`DepartmentSections.tsx`) |
| `past_experience_years` | int4 | YES | — | — | `AdminStaffWizardsPage.tsx:802` | fetched, same as above — **not rendered anywhere** |
| `employee_code` | text | YES | — | UNIQUE partial (`idx_staff_employee_code` WHERE NOT NULL); admin-enforced regex `^\d{3}-[A-Za-z]{2,6}$`, **no DB check constraint** | `AdminStaffWizardsPage.tsx:649/757` (regex-validated in JS only) | route param for `/staff/[staff]` (`getStaffByEmployeeCode`); CSV import (`faculty-import.ts`) writes it **without** the regex check — can insert a code the public route can still reach, but that breaks the "3-digit+hyphen+initials" convention documented in the UI |
| `photo_url` | text | YES | — | — | `MediaUploader` (`AdminStaffWizardsPage.tsx:784`), bucket `media` | avatar on both staff pages |
| `rank_group` | text | YES | — | free text, not an enum (values seen in code: "HOD"/"Faculty"/"Support") | CSV import only (`faculty-import.ts:186/203`); **no wizard UI field** | fallback rank when the per-department assignment has no `rank_group` (`staff.functions.ts:117/174`) |
| `designation` | text | YES | — | free text | CSV import never sets it; **no wizard UI field** — legacy/manually-seeded only | fallback designation text (`staff.functions.ts:112/173`) when no `designation_id` resolves |
| `qualification` | text | YES | — | free text | CSV import only (`faculty-import.ts:185/202`); no wizard UI field | fetched by `getStaffByEmployeeCode` (`staff.functions.ts:47`) but **dropped** — not in the `StaffMember` interface, never rendered (the page's "Qualifications" section instead reads `staff_achievements` type=`qualification`) |
| `gender` | text | YES | — | free text, no enum | CSV import only (`faculty-import.ts:187/204`); no wizard UI field | **never read or shown anywhere** on the site |
| `muster_number` | int4 | YES | — | CHECK `>= 0 OR NULL` (`staff_profiles_muster_number_nonneg`); uniqueness **per college** enforced only in app code (`muster-check.ts`), not in the DB | `AdminStaffWizardsPage.tsx:820-831`; explicit note "Not shown publicly" | sort key only (`staff-order.ts: compareByMuster`), confirmed never rendered as text |

- Indexes: `staff_profiles_pkey`, `staff_profiles_email_key` (unique), `idx_staff_employee_code` (unique, partial on NOT NULL).
- RLS policies:
  - `Anon read staff_profiles` (SELECT, `anon`): `USING true` — **no `deleted_at`/`status` filter**, so an anonymous client can read every column of every staff row, including soft-deleted and draft ones, straight from PostgREST.
  - `Scoped insert staff_profiles` (INSERT, `authenticated`): `WITH CHECK true` — **any authenticated user can insert a staff profile**, unlike every other write policy on this table/domain which calls `can_write_scoped_record(...)`. A department-scoped editor could create a profile for any department (they just couldn't attach it without a scoped department assignment, since `staff_department_assignments` INSERT *is* scope-checked).
  - `Scoped read staff_profiles` (SELECT, `authenticated`): row owner (`created_by = auth.uid()`) OR a global-scope role OR a role whose department scope matches one of the staff member's live assignments.
  - `Scoped update staff_profiles` (UPDATE, public role): same three-way OR as the scoped read, applied to both `USING` and `WITH CHECK`.
  - `Scoped delete staff_profiles` (DELETE, public role): same three-way OR. (The UI never issues a real DELETE here — it only ever sets `deleted_at` — so this policy is effectively unused in practice, which is fine, but it does mean a hard delete is technically possible for anyone matching the OR.)
- Triggers: `update_staff_profiles_modtime` (BEFORE UPDATE) → `update_updated_at_column()` (sets `updated_at`).
- Migration drift: none found structurally; `employee_code`, `muster_number`, `gender`, `rank_group`, `designation`, `qualification` were added across several later migrations (`20260805…`, `20260917…`, `20260921000000_add_staff_muster_number.sql`) — all tracked.

#### `staff_department_assignments`
- Row count (live): **457**. Soft-delete: yes. Status column: yes (`published` default). Audit columns: yes. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` | PK | implicit | — |
| `staff_id` | uuid | NO | — | FK → `staff_profiles(id)` CASCADE; UNIQUE with `department_id` (`unique_faculty_dept` — one assignment per staff/department pair) | set on create (`AdminStaffWizardsPage.tsx:296-304`) | join key everywhere |
| `department_id` | uuid | NO | — | FK → `departments(id)` CASCADE | department select (`:852-864`) | join key; department roster page |
| `designation_id` | uuid | NO | — | FK → `designations(id)` SET NULL | designation select (`:867-885`) | resolves display title (`staff.functions.ts:88-95`, `department-content.functions.ts:32`) |
| `is_primary` | bool | NO | `false` | — | checkbox (`:890-899`) | picks the "primary" department shown on `/staff/[staff]` (`staff.functions.ts:63`); `getPrimary()` in admin list falls back to `assignments[0]` if none flagged primary |
| `created_at` | timestamptz | NO | `timezone('utc', now())` | — | n/a | n/a |
| `updated_at` | timestamptz | NO | `timezone('utc', now())` | — | trigger | n/a |
| `created_by` | uuid | YES | — | FK → `user_profiles(id)` SET NULL | set on insert | — |
| `updated_by` | uuid | YES | — | FK → `user_profiles(id)` SET NULL | set on posts update (`:318`) | — |
| `deleted_at` | timestamptz | YES | — | — | **never set** — `handleDeleteAssignment` (`:329-337`) issues a real `.delete()`, not a soft delete | — |
| `deleted_by` | uuid | YES | — | FK → `user_profiles(id)` SET NULL | **never set** (see above) | — |
| `status` | content_status enum | NO | `'published'` | — | always `'published'` on insert; never changed by UI | filtered `.eq('status','published')` everywhere it's read |
| `metadata` | jsonb | NO | `{}` | — | never edited | never read |
| `rank_group` | text | YES | — | free text | **no UI**; only ever set by legacy seed migrations | overrides `staff_profiles.rank_group` when present (`staff.functions.ts:117/174`) |
| `designation_override` | text | YES | — | free text | **no UI** | overrides the resolved designation title when `designation_id` has no match (`staff.functions.ts:112/173`) |
| `post_ids` | uuid[] | NO | `{}` | elements expected to be `staff_posts.id`; **no FK/array-element constraint**, so stale/garbage ids are silently dropped by `postsForIds()` (`staff-posts.ts:27-31`) rather than surfaced as an error | `PostPicker` chips (`:1098-1121`), also set via `post` column in faculty CSV import | formats "Associate Professor · HOD, Dean (R&D)" (`staff-posts.ts:41-45`); `holdsDepartmentHeadPost()` decides HOD badge |

- Indexes: `staff_department_assignments_pkey`, `unique_faculty_dept` (unique on `staff_id, department_id`).
- RLS: `Anon SELECT` (anon, `true` — no deleted_at/status filter, same pattern as above); `Scoped insert/update/delete` (public role) all call `can_write_scoped_record(NULL,NULL, departments.college_id, department_id)`; `Scoped read` (authenticated) same check. These *are* properly scope-checked (unlike the `staff_profiles` insert policy).
- Triggers:
  - `update_faculty_dept_assignments_modtime` (BEFORE UPDATE) → `update_updated_at_column()`.
  - `enforce_single_department_head` (BEFORE INSERT/UPDATE) → raises `unique_violation` if the new row's `post_ids` overlaps a `staff_posts.is_department_head=true` post and another live assignment in the same department already holds a head post. This is the only DB-level guarantee of "one HOD per department"; it does **not** consider `is_primary`/`rank_group='HOD'`, only `post_ids`, so the legacy `rank_group`-based "HOD" marking used in `staff.functions.ts:179` (`a.rank_group === 'HOD'`) is not protected by this trigger at all.
- Migration drift: none found; `post_ids`/`designation_override`/`rank_group` additions are tracked in `20260924062926_designation_categories_and_staff_posts.sql` and earlier scope migrations.

#### `staff_achievements`
- Row count (live): **4,039**. Soft-delete: yes. Status column: yes, but **unused** (see below). Audit: only `deleted_at/by`, no `created_by/updated_by`. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` | PK | implicit | — |
| `staff_id` | uuid | NO | — | FK → `staff_profiles(id)` CASCADE | set on insert (`AdminStaffWizardsPage.tsx:343-349`) | join key |
| `type` | text | NO | — | CHECK ∈ `{award, patent, publication, research, qualification, experience, activity}` (migration `20260905120000_add_activity_type_to_staff_achievements.sql`) | `ACHIEVEMENT_TYPES` dropdown (`AdminStaffWizardsPage.tsx:20-27`) — **omits `activity`**, so that type can't be created/edited in the wizard | `ACHIEVEMENT_LABELS`/`ACHIEVEMENT_ORDER` (`staff/[staff]/page.tsx:15-32`) also **omit `activity`** — see Gaps, this hides 1,426 live rows |
| `title` | text | NO | — | — | `:971` | list item text |
| `year` | int4 | YES | — | — | `:982` | sort key (`order('year', desc)`), shown in parens |
| `description` | text | YES | — | — | `:992` | shown after em-dash |
| `extra` | jsonb | YES | — | — | **never edited, never read** anywhere in `src/` | dead column |
| `status` | text | NO | `'published'` | plain `text`, **not** the `content_status` enum used by every other table in this domain | never set/shown by the wizard (insert omits it, defaults to `'published'`) | **never filtered on** by any query (`staff.functions.ts:70`, `department wizard loads`, `achievements-import.ts` dup-check) — effectively decorative |
| `created_at` | timestamptz | NO | `now()` | — | n/a | — |
| `updated_at` | timestamptz | NO | `now()` | — | **no trigger keeps this current** (no `update_*_modtime` trigger registered for this table) | — |
| `deleted_at` | timestamptz | YES | — | — | **never set** — `handleDeleteAchievement` (`:359-367`) does a real `.delete()` | — |
| `deleted_by` | uuid | YES | — | FK → `auth.users(id)` (inconsistent with every other `deleted_by` FK in this domain, which point to `user_profiles(id)`) | never set | — |

- Indexes: `staff_achievements_pkey`, `idx_staff_achievements_staff_id`, `idx_staff_achievements_type`.
- RLS: `Anon SELECT` / `Authenticated users can read` (both `deleted_at IS NULL` only — no `status` check, consistent with `status` being vestigial); `Scoped write staff_achievements` (ALL, authenticated) requires `is_global_admin()` OR a live, non-deleted `staff_department_assignments` row linking the achievement's staff to a department the caller can write — correctly scoped.
- Triggers: **none** (no `updated_at` trigger, unlike every sibling table).
- Migration drift: table creation isn't among the staff migrations grepped above by name pattern alone but the `type` CHECK constraint is tracked (`20260905120000_add_activity_type_to_staff_achievements.sql`); the base table predates the grepped list (not inspected further since out of scope — flagged below as worth confirming against `docs/audits/deferred-issues.md`, which already documents at least one untracked table in the neighborhood).

#### `staff_posts`
- Row count (live): **6**. Soft-delete: yes. Status column: yes. Audit: full. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` | PK | implicit | — |
| `title` | text | NO | — | UNIQUE on `lower(title)` where live (`staff_posts_title_live_key`) | `/admin/tables/staff_posts` generic CRUD (`AdminCrudManager.tsx:236`, field label `title`) | chip label (`PostPicker`), appended to designation string (`staff-posts.ts:41-45`) |
| `is_department_head` | bool | NO | `false` | — | generic CRUD field | gates `holdsDepartmentHeadPost()` → HOD badge + the `enforce_single_department_head` trigger |
| `sort_order` | int4 | NO | `0` | — | generic CRUD field | ordering in `postsForIds()` and the admin picker list |
| `status` | content_status enum | NO | `'published'` | — | generic CRUD | all reads filter `.eq('status','published')` |
| `metadata` | jsonb | NO | `{}` | — | generic CRUD (raw JSON, if exposed) | unused |
| `created_at/by`, `updated_at/by`, `deleted_at/by` | — | — | — | standard audit/soft-delete | generic CRUD / Trash (`staff_posts` is in `SOFT_DELETE_TABLES`) | — |

- Indexes: `staff_posts_pkey`, `staff_posts_title_live_key` (unique, partial on `deleted_at IS NULL`).
- RLS: `Global write staff_posts` (ALL, authenticated) requires `is_global_admin()`; `Public read staff_posts` (SELECT, public) `true` — no deleted_at filter at the RLS layer (code-side queries do add `.is('deleted_at', null)` consistently here, unlike `staff_profiles`).
- Triggers: `update_staff_posts_modtime` (BEFORE UPDATE) → `update_updated_at_column()`.
- Table is global-only in the admin: listed in both `GLOBAL_ONLY_ROUTE_PREFIXES` and `GLOBAL_ONLY_TABLE_IDS` in `src/lib/admin-sections.ts:41,101` — a college/department admin cannot reach `/admin/tables/staff_posts` to define new posts, even though they can freely attach existing posts to their own staff via the wizard's `PostPicker`.
- Migration drift: none; created in `20260924062926_designation_categories_and_staff_posts.sql`.

#### `designations`
- Row count (live): **71**. Soft-delete: yes. Status column: yes. Audit: full. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` | PK | implicit | — |
| `title` | text | NO | — | UNIQUE (`designations_title_key`, table-wide — **not partial on `deleted_at`**, so a soft-deleted designation's title can never be reused for a new one) | generic CRUD (`AdminCrudManager.tsx:228`, field `title`) | resolved designation text (`staff.functions.ts:94`, `department-content.functions.ts:32`) |
| `created_at` | timestamptz | NO | `timezone('utc', now())` | — | n/a | — |
| `updated_at` | timestamptz | NO | `timezone('utc', now())` | — | trigger | — |
| `created_by` | uuid | YES | — | FK → `user_profiles(id)` SET NULL | generic CRUD | — |
| `updated_by` | uuid | YES | — | FK → `user_profiles(id)` SET NULL | generic CRUD | — |
| `deleted_at` | timestamptz | YES | — | — | Trash (`designations` in `SOFT_DELETE_TABLES`) | **not filtered** by `staff.functions.ts:89-94` or `department-content.functions.ts:32`, which look up/join a designation by id with no `deleted_at`/`status` check — a soft-deleted designation's title keeps showing on live staff records that still reference it |
| `deleted_by` | uuid | YES | — | FK → `user_profiles(id)` SET NULL | Trash | — |
| `status` | content_status enum | NO | `'published'` | — | generic CRUD | **never filtered on** by either read path above (both select by `id` only) |
| `metadata` | jsonb | NO | `{}` | — | generic CRUD | unused |
| `category` | designation_category enum (`teaching`/`technical`/`administrative`/`support`) | YES | — | enum | generic CRUD; also drives `PICKER_DESIGNATION_CATEGORIES` grouping (`staff-posts.ts:11-15`) in the wizard's designation `<select>` | `rankGroup` classification in `department-content.functions.ts:55` (`category === 'teaching'` → "Faculty") |
| `is_selectable` | bool | NO | `true` | — | generic CRUD | wizard filters `designations.filter(d => d.is_selectable && …)` (`AdminStaffWizardsPage.tsx:446`) so legacy/"support" titles stay assignable via CSV/DB but disappear from the picker — intentional per the comment in `staff-posts.ts:9-10` |

- Indexes: `designations_pkey`, `designations_title_key` (unique, full-table).
- RLS: `Global write designations` (ALL, authenticated) requires `is_global_admin()`; `Anon SELECT` and `Public read designations` are two separate, functionally identical `true` SELECT policies (one for `anon`, one for `public` — redundant, cosmetic).
- Triggers: `update_designations_modtime` (BEFORE UPDATE) → `update_updated_at_column()`.
- Global-only in the admin UI (`admin-sections.ts:40,100`), same as `staff_posts`.
- Migration drift: `category`/`is_selectable` tracked in `20260917070805_add_support_staff_designations.sql` / `20260924062926_…`.

### Admin
- **Route**: `/admin/staff-wizards` (`src/app/admin/(dashboard)/staff-wizards/page.tsx:1-15`) — `requireAdmin()` then `isRouteAllowedForUser(..., level, sections)`; not global-only, so `college`/`department`-scoped admins reach it with a filtered view (`scopedDepartmentIds`/`visibleStaffList`, `AdminStaffWizardsPage.tsx:400-418`).
- **Component**: `AdminStaffWizardsPage.tsx` — single client component, all reads/writes go straight through the browser Supabase client (`createClient()`), relying entirely on the RLS policies above (no server action, no extra `requireAdmin()` per mutation — consistent with the rest of this component's style but worth noting since `CLAUDE.md` flags server actions as the place role checks happen; here there is no server action at all).
- **Tabs**: General (profile fields), Department (assignments + posts), Achievements, Expertise. New-profile flow only collects title/first/last/employee_code/email/phone (`:1148-1238` modal-free, inline form `:611-696`); everything else is edited after creation.
- **CSV imports**:
  - Faculty: `src/lib/faculty-import.ts` — matches existing staff by `email`; upserts `staff_profiles` + one `staff_department_assignments` row per department column; validates department/designation/post names against the already-loaded masters, muster-number conflicts via `findMusterConflict`; does **not** enforce the employee-code regex the wizard UI enforces.
  - Achievements: `src/lib/achievements-import.ts` — matches by `email`, requires the staff member to already have a department assignment the importing admin can write to, de-dupes on `(staff_id, type, title, year)`; its `VALID_ACHIEVEMENT_TYPES` list (6 entries) also omits `activity`, so legacy "activity" rows can never be bulk-imported this way either.
  - `muster-check.ts` consumers: `AdminStaffWizardsPage.tsx` (general-tab save, new-assignment add) and `faculty-import.ts` (per-row). Its own doc comment notes the per-college uniqueness it checks is **"not enforced in the DB"** — only the `>= 0` CHECK exists at the DB level, so any direct DB write (e.g. a future migration or a different client) can silently create a muster-number collision.
- **Designations / Staff posts**: managed as plain rows via the generic `AdminCrudManager` at `/admin/tables/designations` and `/admin/tables/staff_posts` (`AdminCrudManager.tsx:131-132,228,236`), both locked to global admins only (`admin-sections.ts:40-41,100-101`).
- **Trash**: `AdminTrashPage.tsx` lists `staff_profiles`, `designations`, `staff_posts`, `staff_department_assignments` among its `SOFT_DELETE_TABLES` (lines ~14, 26-28) — **but not `staff_achievements`**, even though that table has `deleted_at`/`deleted_by` columns and RLS policies written against `deleted_at`. Combined with the wizard hard-deleting achievements and assignments directly (see table notes), achievements/assignments never actually reach a soft-deleted state in practice, so the Trash page's listing of `staff_department_assignments` as a recoverable table is largely theoretical. The same `SOFT_DELETE_TABLES` list also carries `qualifications`, `experiences`, `awards`, `publications`, `research_projects`, `patents` — none of these tables exist in the live database; they're dead entries left over from before those concepts were unified into `staff_achievements`.
- **Roles/scope reaching it**: `admin`, `editor`, `department_admin`, `college_admin` per `CLAUDE.md`; scope filtering narrows the visible staff list and department picker but, per the `staff_profiles` INSERT policy noted above, does not actually stop a department-scoped user's browser from inserting an unscoped `staff_profiles` row directly.

### Data layer
- `src/lib/staff.functions.ts`:
  - `getStaffByEmployeeCode(code)` — single profile + primary assignment + achievements + all posts; filters `.eq('status','published')` on `staff_profiles` only (no `deleted_at` filter — see Gaps).
  - `getStaffByDepartmentId(departmentId)` — **dead code**, not imported anywhere; the page that needs this (`/departments/[dept]/staff`) uses the differently-shaped function of the same name in `department-content.functions.ts` instead. The two implementations disagree on HOD detection (this one uses `rank_group === 'HOD'` only, ignoring `staff_posts`/`post_ids` entirely) and on which columns they return.
- `src/lib/department-content.functions.ts: getStaffByDepartmentId` — the one actually used; joins `staff_department_assignments → designations, staff_profiles`, loads `staff_posts` separately, computes `rankGroup` from posts + a regex fallback on the designation title. Filters assignment `.eq('status','published')` and client-side `staff_profiles?.status === 'published'`; **does not filter `deleted_at`** on either table.
- `src/lib/stats.functions.ts: getLiveStats` — faculty count via `staff_profiles` `.eq('status','published').is('deleted_at', null)` (this one *does* filter deleted_at — inconsistent with the two functions above).
- `src/lib/staff-posts.ts` — shared helpers (`postsForIds`, `holdsDepartmentHeadPost`, `formatDesignationWithPosts`), designation-category picker list.
- `src/lib/staff-order.ts` — `compareByMuster`, used by both admin list sort and public rosters.
- `src/lib/muster-check.ts` — `findMusterConflict`, `parseMusterNumber`.
- No caching/revalidation beyond Next's default per-request fetch for Server Components; no `revalidatePath`/`revalidateTag` calls found in this domain, and the admin wizard mutates via the browser client directly (no server action to trigger revalidation anyway) — a published profile edit is picked up on the next full request since these are dynamic Server Components, not statically cached.

### Website
- `/staff/[staff]` (`src/app/(site)/staff/[staff]/page.tsx`) — looks up by `employee_code`; 404s via `not-found.tsx` if `getStaffByEmployeeCode` throws or returns null. Renders photo/initials, HOD badge, name, designation+posts, department, top qualification achievement, email, social links, office hours, expertise, and an achievements accordion grouped by `ACHIEVEMENT_ORDER` (`qualification, research, publication, patent, award, experience` — **`activity` missing**, see Gaps).
- `/departments/[dept]/staff` (`src/app/(site)/departments/[dept]/staff/page.tsx`) → `DeptStaffView` in `src/components/site-next/DepartmentSections.tsx` — splits staff into HOD / Faculty / Support by `rankGroup`, renders `StaffCard` for HOD/faculty and a flat support-staff list; empty state "Staff information will be published soon." when the department has none.
- `CommitteeMembers.tsx` (`src/components/site-next/CommitteeMembers.tsx`) is **unrelated** to this domain — it renders plain `{name, role, designation, email, phone}` objects passed in from the `committees` table's own JSON, not from `staff_profiles`. No join exists between committees and staff records.
- No sitewide "faculty directory" page was found beyond the per-department roster; a search for other faculty listing components turned up none.
- Hardcoded content: none found — all staff content is Supabase-sourced. The achievement-type label map (`ACHIEVEMENT_LABELS`) and ordering (`ACHIEVEMENT_ORDER`) are hardcoded in the page component, which is fine for UI copy but is the direct cause of the `activity` type being invisible (it's a code list, not DB-driven).

### Storage/media
- Staff photos go through `MediaUploader` (`bucketName` defaults to `'media'`) with client-side compression per `src/lib/image-compression.ts` (project-wide pattern); stored URL lands in `staff_profiles.photo_url`. No dedicated staff-photos bucket; no server-side compression (consistent with the project-wide note that server-side compression is non-functional).

### Related non-DB files noted while tracing this domain
- `scripts/generate_faculty_seeds.py`, `scripts/audit_faculty_data.py`, `scripts/apply_faculty_migration.sh` — one-off Python/shell generators used to produce the faculty seed migrations (e.g. `20260917071214_seed_support_and_admin_staff.sql`); not wired into `npm run` scripts, pure one-time tooling.
- `supabase/seeds/` has no staff-specific seed file; all faculty seed data lives in timestamped migrations instead.

#### Gaps (Staff & faculty)

- **[broken] Soft-deleting a staff member doesn't remove them from the public site.** `handleSoftDelete` (`src/components/admin-next/pages/AdminStaffWizardsPage.tsx:271-281`) only sets `deleted_at`/`deleted_by`; `status` stays `'published'`. `getStaffByEmployeeCode` (`src/lib/staff.functions.ts:49`) and `getStaffByDepartmentId` (`src/lib/department-content.functions.ts:36,46`) filter only on `status`, never on `deleted_at`. Combined with the `Anon read staff_profiles` RLS policy (`USING true`, no `deleted_at` check), a "trashed" staff profile keeps rendering at `/staff/[code]` and on its department roster until `status` is also changed by hand. Fix: add `.is('deleted_at', null)` to both query paths (and ideally tighten the RLS `USING` clause too).
- **[broken] 1,426 live `staff_achievements` rows of type `activity` are invisible on the public site and unmanageable in the admin wizard.** The DB `CHECK` constraint allows `activity` (migration `20260905120000_add_activity_type_to_staff_achievements.sql`), but `ACHIEVEMENT_TYPES` in `AdminStaffWizardsPage.tsx:20-27`, `ACHIEVEMENT_LABELS`/`ACHIEVEMENT_ORDER` in `src/app/(site)/staff/[staff]/page.tsx:15-32`, and `VALID_ACHIEVEMENT_TYPES` in `src/lib/achievements-import.ts:12` all omit it — roughly a third of all achievement rows in the database can be neither edited through the UI nor seen by a visitor, and re-importing the same CSV would reject them as invalid.
- **[broken] `staff_profiles` INSERT RLS policy is unscoped.** `Scoped insert staff_profiles` has `WITH CHECK true` for any `authenticated` role, unlike every sibling insert policy in this domain (`staff_department_assignments`, `staff_achievements`) which call `can_write_scoped_record(...)`. A department- or college-scoped admin's browser session can insert a `staff_profiles` row outside their scope (they just can't attach a scoped department assignment to it).
- **[broken] `staff_department_assignments` and `staff_achievements` are hard-deleted from the admin UI**, not soft-deleted, despite both tables having `deleted_at`/`deleted_by` and RLS policies that reference them (`handleDeleteAssignment` at `AdminStaffWizardsPage.tsx:329-337`, `handleDeleteAchievement` at `:359-367`, both call `.delete()`). This bypasses the Trash/recovery flow `CLAUDE.md` requires ("Use soft delete, not hard delete") and means the audit trail/recovery for these two tables doesn't actually work from the only UI that writes them.
- **[dead] `AdminTrashPage.tsx`'s `SOFT_DELETE_TABLES` lists `staff_achievements`... actually it does *not* list it at all** — `staff_achievements` is missing from the Trash table list even though it's soft-deletable in principle, while the list does include six tables (`qualifications`, `experiences`, `awards`, `publications`, `research_projects`, `patents`) that **do not exist** in the live database at all (confirmed via `information_schema.tables`) — pure dead entries, presumably pre-dating the `staff_achievements` consolidation.
- **[dead] `getStaffByDepartmentId` in `src/lib/staff.functions.ts:135-188` is unused** — no importer anywhere in `src/`. The function that's actually wired up lives in `src/lib/department-content.functions.ts` under the same name and has different (and more correct) HOD logic. Keeping both invites a future regression if someone edits the wrong one.
- **[misleading] `staff_profiles.qualification` and `.gender` are collected by CSV import but never shown or edited anywhere else.** `qualification` is even fetched by `getStaffByEmployeeCode` (`staff.functions.ts:47`) and then silently dropped (not in the `StaffMember` return type) — the "Qualifications" section on the public profile actually comes from `staff_achievements` rows instead, not this column, which is confusing for anyone reading the CSV template (`faculty-import.ts:44-64`) expecting it to show up.
- **[misleading] `office_hours` and `social_links` are rendered on the public profile but have no admin UI to set them.** The only way to populate these jsonb columns today is a direct DB write — not via `/admin/staff-wizards`, which has no fields for either.
- **[misleading] Designation titles can go stale.** Both `staff.functions.ts:89-94` and `department-content.functions.ts:32` resolve/join a `designations` row by id without filtering `deleted_at`/`status`, so soft-deleting (or draft-ing) a designation in `/admin/tables/designations` leaves its title still showing against every staff member who references it.
- **[misleading] Employee-code format is enforced in the UI only.** The wizard's regex (`^\d{3}-[A-Za-z]{2,6}$`) is JS-side validation; there's no DB `CHECK` constraint, and `faculty-import.ts` writes whatever string is in the CSV's `employee_code` column without checking the pattern — a CSV import can silently create a code that doesn't match the documented convention.
- **[misleading] Muster-number uniqueness-per-college is "not enforced in the DB"** (the comment in `muster-check.ts:4-8` says so itself) — only app-level checks in the wizard and the CSV importer prevent a collision; a migration or any other write path could create one.
- **[cosmetic] `staff_achievements.status` is a plain `text` column (not the `content_status` enum used everywhere else in this domain) and is never read by any query** — it's set by DB default to `'published'` and never changes; effectively vestigial.
- **[cosmetic] `staff_achievements.extra` (jsonb) is never read or written** anywhere in `src/`.
- **[cosmetic] `staff_achievements.deleted_by` FK points to `auth.users(id)`**, while every other `deleted_by`/`created_by`/`updated_by` column in this domain (and the rest of the schema) points to `user_profiles(id)` — a one-off inconsistency.
- **[cosmetic] `staff_achievements` has no `updated_at` trigger**, unlike `staff_profiles`, `staff_department_assignments`, `staff_posts`, and `designations`, all of which have an `update_*_modtime` BEFORE UPDATE trigger.
- **[cosmetic] `designations` has two functionally identical SELECT RLS policies** (`Anon SELECT` and `Public read designations`, both `USING true`) — redundant, not a reason for a `category`/`anon` split that doesn't actually exist.
- **[cosmetic] `designations_title_key` is a full-table UNIQUE constraint, not partial on `deleted_at IS NULL`** (unlike `staff_posts_title_live_key`, which correctly is) — a soft-deleted designation's title can never be reused for a replacement.
- **[cosmetic] `joining_year` and `past_experience_years` are collected in the admin wizard and fetched by `getStaffByEmployeeCode`, but `/staff/[staff]/page.tsx` never renders them**, and `DeptStaffMember` carries the same two fields through `department-content.functions.ts` without `StaffCard` ever displaying them either.
- **Scope note**: `staff_profiles.phone` is also collected (admin + CSV) but never shown publicly — likely intentional (contact is via email only) but worth confirming with the content owner since the field exists and is editable.


#### Verification corrections

A second, independent pass re-checked this section against the live code and database. Corrections:

- No factual errors found in the section on spot-check. All re-verified claims (RLS policy text/roles/qual for staff_profiles and staff_achievements, the staff_achievements column list and type CHECK constraint, the live row count of type='activity' achievements, the non-existence of the six dead SOFT_DELETE_TABLES entries, the staff_achievements.deleted_by FK target, the exact line numbers for handleSoftDelete/handleDeleteAssignment/handleDeleteAchievement, the ACHIEVEMENT_TYPES/ACHIEVEMENT_LABELS/ACHIEVEMENT_ORDER/VALID_ACHIEVEMENT_TYPES lists, and the missing deleted_at filters in staff.functions.ts and department-content.functions.ts) matched the section file exactly.


---

## Events, news, gallery, achievements

### Events
**Summary**: `events` is a multi-scope "Entry" (CONTEXT.md) covering institute/trust/college/department/club happenings — TEDx-style flagship events, department activities (expert sessions, workshops, FDPs…), and club events. One table backs `/campus-life/events` (browse + filter), `/campus-life/events/[slug]` (Detail page), the homepage "Latest from campus" slider/section, and a department's "Activities" tab (a filtered view by `event_type`).

**Tables**:

#### `events`
- Row count (live): **13**. Soft-delete: yes (`deleted_at`/`deleted_by`). Status column: yes (`status` enum `event_status`, default `'draft'`). Audit columns: `created_at/by`, `updated_at/by`. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field (path:line) | Website use (path:line) |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | hidden (PK), `AdminCrudManager.tsx:943` | `events.functions.ts:40` select |
| scope_type | scope_level enum | NO | 'global' | `events_scope_consistency` check | `TABLE_CONFIGS.events.fields.scope_type` locked for non-global, defaults to admin's scope — `AdminCrudManager.tsx:210` | `events.functions.ts:24`, drives `EventsBrowser` category chips (`EventsBrowser.tsx:10-26`) |
| department_id | uuid | YES | null | FK `departments(id)` ON DELETE CASCADE | generic FK select, `AdminCrudManager.tsx` FK dropdown | filter in `getDepartmentActivities` (`department-content.functions.ts:193`) |
| title | text | NO | null | — | generic text input | `EntryCard`, `EventsNewsSlider.tsx:39`, `events.functions.ts` |
| slug | text | NO | null | unique per dept / unique global (partial indexes) | generic text input (not auto-generated — admin must type it) | route param `campus-life/events/[slug]` |
| description | text | YES | null | — | textarea (hidden from grid) | Detail page body, `EntryCard` description |
| tag | text | YES | null | — | generic text input | **Deprecated** — comment in `events.functions.ts:9` says superseded by `event_type`, "still read by /news" but `/news` reads `posts`, not `events`; actually read as a fallback subtitle in `EventsIndex`/`[slug]` (`campus-life/events/page.tsx:39`, `[slug]/page.tsx:59`) |
| start_date | timestamptz | NO | null | `event_date_check` (start ≤ end) | date input | sorting/display everywhere |
| end_date | timestamptz | YES | null | see above | date input | `formatEventDates` |
| location | text | YES | null | — | generic text input | Detail page "Location" |
| map_url | text | YES | null | — | generic text input | Detail page location link |
| registration_link | text | YES | null | — | generic text input | Detail page "Register now", homepage card |
| card_photo_url | text | YES | null | — | **EntryPhotosEditor** "Card photo" (`EntryPhotosEditor.tsx:256-259`), not a plain field | `EntryCard`, sliders, Detail page |
| sort_order | integer | NO | 0 | — | generic number input | default ordering on `/admin/tables/*`-style grids only; public queries order by `start_date`/`featured_at`, not `sort_order` |
| seo_id | uuid | YES | null | FK `seo_metadata(id)` ON DELETE SET NULL | **SeoEditor** popover (`AdminCrudManager.tsx:979-980`) | **never read** — not even selected by `events.functions.ts` (see Gaps) |
| created_at/updated_at | timestamptz | NO | now() | — | hidden | `events.functions.ts` select, unused on site |
| created_by/updated_by | uuid | YES | null | FK `user_profiles(id)` | auto-set by `AdminCrudManager.tsx:531-541` | not shown publicly |
| deleted_at/deleted_by | timestamptz/uuid | YES | null | — | soft-delete + Trash page | filtered via `.is('deleted_at', null)` everywhere |
| status | event_status enum | NO | 'draft' | — | status badge + bulk publish/draft | `.eq('status','published')` filter |
| metadata | jsonb | NO | '{}' | — | raw JSON textarea (generic) | `highlights` sub-shape typed in `CampusEvent.metadata` (`events.functions.ts:31-34`) but **no UI renders `highlights`** anywhere found on the Detail page — dead shape |
| college_id | uuid | YES | null | FK `colleges(id)` | FK dropdown, scoped default | `TABLE_CONFIGS.events.scope.collegeScopeExtra` |
| is_featured | boolean | NO | false | — | checkbox, locked to global admin, labeled "max 8 at once" (`AdminCrudManager.tsx:212-216`) | `getLatestEvents()` `.eq('is_featured', true).limit(8)` (`homepage.functions.ts:85-99`) — label is accurate |
| featured_at | timestamptz | YES | null | — | hidden from form entirely | `getLatestEvents` orders by it; set by `events_enforce_featured_rules_trigger` |
| featured_by | uuid | YES | null | FK `user_profiles(id)` | hidden | audit only |
| subtitle | text | YES | null | — | generic text input | `EventsBrowser`/Detail page subtitle |
| accent_color | text | YES | null | — | generic text input (no color picker) | fallback accent label on Detail page/card |
| has_detail_page | boolean | NO | false | — | EntryPhotosEditor "Give this its own page" | gates `/campus-life/events/[slug]` (404 if false) |
| album_id | uuid | YES | null | FK `gallery_albums(id)` ON DELETE SET NULL | owned by EntryPhotosEditor, not a plain field | `getEntryAlbum(event.album_id)` for Detail page / Entry viewer |
| event_type | event type enum (USER-DEFINED) | YES | null | — | select with `EVENT_TYPE_LABELS` | `eventTypeLabel()`, filters `getDepartmentActivities` to `ACTIVITY_EVENT_TYPES` |
| club_id | uuid | YES | null | FK `student_clubs(id)` ON DELETE SET NULL | FK dropdown | `EventsBrowser` "club" chip, Detail page "Organised by" |

- Constraints: `event_date_check`, `events_scope_consistency`, 7 FKs (album, club, college, created_by, department, featured_by, updated_by, seo). Indexes: `idx_event_slug`, `idx_events_active` (partial on `deleted_at IS NULL`), `idx_events_album_id`, `idx_events_club_id`, `idx_events_scope`, plus two **partial unique** slug indexes (`unique_event_slug_global` when `department_id IS NULL`, `unique_event_slug_dept` scoped per department) — so the same slug can exist once globally and once per department, by design.
- RLS policies: `Public read events` (SELECT, `true` — public can read drafts and soft-deleted rows too, see Gaps); `Global insert/update/delete events` (`is_global_admin() OR can_write_section('news_events')`); `Scoped insert/update/delete events` for `authenticated` via `can_write_scoped_record(...college_id, department_id)`.
- Triggers: `audit_events_trigger` (INSERT/UPDATE/DELETE → `process_audit_log()`), `events_before_write_trigger` (BEFORE UPDATE/INSERT → `events_before_write()`), `events_enforce_featured_rules_trigger` (BEFORE INSERT/UPDATE → `events_enforce_featured_rules()`, presumably stamps `featured_at`/`featured_by` and may cap the featured count), `trg_cascade_hard_delete_to_album` / `trg_cascade_soft_delete_to_album` (keep the linked Entry album in sync), `update_events_modtime` (`updated_at` stamp).
- Migration drift: not fully diffed against `supabase/migrations/*.sql` line-by-line in this pass (read-only time budget); the live RLS/trigger/constraint set above is what to diff against migration files named `*entry_model_rls*`, `*events*`, `*scope_aware*`. Flag for a follow-up: confirm `events_enforce_featured_rules()` body matches its migration (not inspected here — function source wasn't pulled).

**Admin**: `/admin/events` (`src/app/admin/(dashboard)/events/page.tsx:1-15`) is a thin wrapper — `requireAdmin()` + `isRouteAllowedForUser('/admin/events', ...)` (route is in `GLOBAL_ONLY_ROUTE_PREFIXES`, unlockable via the `news_events` section grant) — rendering the generic `AdminCrudManager tableId="events"` (`src/components/admin-next/AdminCrudManager.tsx`). All CRUD, schema introspection (`get_table_schema_info` RPC), FK dropdowns, soft-delete-to-Trash, bulk publish/draft/delete, and audit logging (client-side `audit_logs` insert, best-effort) are generic, table-driven — there is **no events-specific admin page/component** beyond the `TABLE_CONFIGS.events` entry (lines 206-218) that: renders Card photo + Entry album via `EntryPhotosEditor`, labels `event_type` via `EVENT_TYPE_LABELS`, locks `scope_type`/`is_featured` for non-global admins. Role/scope reach: global admins full access; college/department-scoped admins reach `/admin/events` only via a `news_events` section grant (`ROUTE_SECTION_MAP`) since the route itself is global-only; write permission inside the table is then re-derived generically (`writePermissions` in `AdminCrudManager.tsx:627-658`) from `college_id`/`department_id` columns, which is a second, independent scoping path from the route guard — the two are not provably kept in sync anywhere in code (comment at `admin-sections.ts` header acknowledges this is a manual-sync risk).

**Data layer**: `src/lib/events.functions.ts` — `getAllEvents()` (all published, undeleted, newest-`start_date`-first, joins college/department/club names), `getEventBySlug()` (same + `.maybeSingle()`). `src/lib/homepage.functions.ts:getLatestEvents()` — featured-only, capped at 8, ordered by `featured_at`. `src/lib/department-content.functions.ts:getDepartmentActivities()` — department-scoped, filtered to activity `event_type`s. All use `publicSupabase()` (anon, cookie-less) and rely on RLS; no caching/revalidation directives (`fetch` cache tags, `revalidatePath`) found in these modules — Next's default per-request fetch on a Server Component with no explicit `cache`/`revalidate` export means these are effectively dynamic (re-fetched per request) rather than ISR; confirm against `export const revalidate` in the route files (none seen in the ones read).

**Website**: `/campus-life/events` (`src/app/(site)/campus-life/events/page.tsx`) → `EventsBrowser` (chips: institute/college/department/club, client-side filter) → `EntryCard` + `EntryViewer` for Cards without a Detail page. `/campus-life/events/[slug]` (`.../[slug]/page.tsx`) → `DetailPageLayout`, 404s if `has_detail_page` is false (`loadEvent` returns null) — note this means a published event can still 404 its own slug URL, which is correct-by-design but worth the designers knowing. Homepage: `NewsEventsSection` (`NewsEventsSection.tsx`) and/or `EventsNewsSlider` (`EventsNewsSlider.tsx`) render `getLatestEvents()` output — both components exist; confirm with design which one is actually mounted on `/` (the homepage file `src/app/(site)/page.tsx` imports `getLatestEvents` — grep shows only `NewsEventsSection`/`EventsNewsSlider` as standalone files, not cross-checked here which one `page.tsx` actually renders — **note for follow-up**, not confirmed). Empty state: "No events yet — check back soon." (`EventsBrowser.tsx:78`) / "No events or news published yet." (`EventsNewsSlider.tsx:76-80`). Departments: `getDepartmentActivities()` feeds the "Activities" tab on `/departments/[dept]/activities`.

**Storage/media**: Card photo via `MediaUploader` (client-compressed, `@jsquash/*`) direct to `card_photo_url`. "More photos" go through `EntryPhotosEditor` → Supabase Storage bucket `media`, path prefix `images/` (`EntryPhotosEditor.tsx:179`), creating/linking a `gallery_albums` row with `owner_table='events'`.

---

### News (posts)
**Summary**: `posts` is announcements/news — explicitly *not* Events (see code comment in `posts.functions.ts:1-4`: "something that happened... not itself something to attend"). Every post always has a Detail page (no `has_detail_page` toggle). Backs `/news`, `/news/[slug]`, and the homepage News column.

**Tables**:

#### `posts`
- Row count (live): **3**. Soft-delete: yes. Status: yes (`content_status` enum, default `'draft'`). Audit columns: yes. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | hidden | — |
| scope_type | scope_level | NO | 'global' | `check_content_scope` | generic (not specially configured in `TABLE_CONFIGS.posts`, unlike events — no lock/default-to-scope-level behavior) | `Post.scope_type` typed but not rendered anywhere found |
| department_id | uuid | YES | null | FK `departments` CASCADE | FK dropdown | not read in `posts.functions.ts` select list (joined as `department:departments(name,slug)`) |
| title | text | NO | null | — | text input | everywhere |
| slug | text | NO | null | partial-unique (global/dept) | text input | `/news/[slug]` route |
| summary | text | YES | null | — | textarea (hidden from grid) | card description, meta description fallback |
| content | text | YES | null | — | textarea (hidden from grid) | Detail page body (`DetailPageLayout` `description: post.content ?? post.summary`) — **plain text/no rich-text editor in admin**, so any HTML pasted in is not sanitized/rendered as HTML either (treated as `PlainText`, confirm against `PlainText.tsx`) |
| card_photo_url | text | YES | null | EntryPhotosEditor "Card photo" | `EntryCard`, Detail page |
| category_id | uuid | YES | null | FK `content_categories(id)` SET NULL | FK dropdown (table is empty, see Gaps) | `category:content_categories(name,slug)` join — eyebrow/subtitle on cards |
| is_featured | boolean | NO | false | — | plain checkbox, generic label "Toggle Active State" (not customized like events') | `getFeaturedPosts()` homepage query |
| published_at | timestamptz | YES | null | — | date input | sort key, displayed date |
| expires_at | timestamptz | YES | null | — | date input | `getAllPosts`/`getFeaturedPosts` filter out expired posts (`.or('expires_at.is.null,expires_at.gt.<now>')`) |
| seo_id | uuid | YES | null | FK `seo_metadata` | SeoEditor popover | **never read publicly** (same gap as events) |
| created_at/updated_at | timestamptz | NO | now() | — | hidden | unused publicly |
| created_by/updated_by | uuid | YES | null | FK `user_profiles` | auto-set | — |
| deleted_at/deleted_by | timestamptz/uuid | YES | null | — | soft-delete/Trash | `.is('deleted_at', null)` filters |
| status | content_status | NO | 'draft' | — | status badge/bulk actions | `.eq('status','published')` |
| metadata | jsonb | NO | '{}' | — | raw JSON textarea | `Post.metadata` typed but unused in any component read |
| album_id | uuid | YES | null | FK `gallery_albums` SET NULL | EntryPhotosEditor-owned | `getEntryAlbum(post.album_id)` on `/news/[slug]` |
| college_id | uuid | YES | null | FK `colleges` CASCADE | FK dropdown | not selected in `POST_SELECT` even though `college:colleges(name,slug)` is joined — fine, it is selected via the relationship, just the raw FK column itself isn't separately exposed |

- Constraints: `check_content_scope`, FKs to `gallery_albums`, `content_categories`, `colleges`, `departments`, `seo_metadata`, `user_profiles` ×3. Indexes: `idx_post_slug`, `idx_posts_active` (partial), `idx_posts_album_id` (partial), `idx_posts_scope`, two partial-unique slug indexes.
- RLS: `Public read posts`-equivalent is actually named `Anon SELECT` + `Authenticated read posts` (both `true`, same caveat as events — drafts are publicly selectable at the RLS layer; only app-level `.eq('status','published')` hides them, see Gaps). Write: `Global insert/update/delete posts` (`is_global_admin() OR can_write_section('news_events')`) — **no scoped (college/department) write policy exists for `posts`**, unlike `events`. So even though `/admin/posts` is reachable by a `news_events`-section-granted admin, a plain college/department-scoped admin without that section grant has zero RLS path to write posts, even for their own college/department — this is consistent with posts being in `GLOBAL_ONLY_ROUTE_PREFIXES`/`GLOBAL_ONLY_TABLE_IDS`, just noting the asymmetry with `events`.
- Triggers: `audit_posts_trigger`, `trg_cascade_hard_delete_to_album`, `trg_cascade_soft_delete_to_album`, `update_posts_modtime`. No `posts_before_write`/featured-rules trigger equivalent to events (no `featured_at` column either, so "Featured" has no visible audit trail of when/who featured a post, unlike events which has `featured_at`/`featured_by`).

**Admin**: `/admin/posts` (`src/app/admin/(dashboard)/posts/page.tsx`) — identical thin-wrapper pattern to events, `AdminCrudManager tableId="posts"`. `TABLE_CONFIGS.posts = { fields: ENTRY_PHOTO_FIELDS }` only — no featured/scope customization, so `is_featured` shows the generic "Toggle Active State" label (misleading — doesn't say what featuring does or that it feeds the homepage) and `scope_type` is an unlocked, ungoverned enum dropdown for any admin who reaches the table (contrast with events' locked `scope_type`).

**Data layer**: `src/lib/posts.functions.ts` — `getAllPosts()`, `getPostBySlug()`, `getFeaturedPosts(limit=6)`. All `publicSupabase()`, no caching directives found.

**Website**: `/news` (`src/app/(site)/news/page.tsx`) — grid of `EntryCard`s, all always `hasDetailPage: true` (posts have no toggle). `/news/[slug]` (`src/app/(site)/news/[slug]/page.tsx`) — `DetailPageLayout`, `generateMetadata` builds its own title/description from `post.title`/`post.summary` (does **not** read `seo_metadata` despite `seo_id` existing — see Gaps). Homepage News column via `NewsEventsSection` consumes `getFeaturedPosts()`-shaped rows (typed `PostRow` in `homepage.ts`/`homepage.functions.ts`). Empty state: "No news posted yet — check back soon." (`NewsEventsSection.tsx:71-74`), "No news published yet." (`news/page.tsx:39`).

**Storage/media**: same `MediaUploader`/`EntryPhotosEditor` → `media` bucket, `images/` prefix pattern as events.

---

### Gallery
**Summary**: Two tables — `gallery_albums` (an album, either a standalone public gallery entry or an "Entry album" auto-created by another table's Photos editor) and `gallery_media` (photos/videos inside an album). Powers the standalone `/gallery` + `/gallery/[albumId]` pages **and** the "More photos" lightbox for every Entry type (events, facilities, centers, sports, achievements, student_clubs, posts).

**Tables**:

#### `gallery_albums`
- Row count (live): **5** (2 soft-deleted/archived standalone albums, 3 live Entry-owned albums). Soft-delete: yes. Status: yes (`content_status`, default `'published'` — **not** `'draft'**, see Gaps). Audit columns: yes. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | hidden | route param `/gallery/[albumId]` |
| scope_type | scope_level | NO | 'global' | `check_content_scope` | generic (`/admin/tables/gallery_albums`) | unused in `gallery.functions.ts` selects |
| department_id | uuid | YES | null | FK `departments` CASCADE | FK dropdown | unused publicly |
| title | text | NO | null | — | text input; auto-generated as `"<Entry title>-<random6>"` slug when created via `EntryPhotosEditor` (`EntryPhotosEditor.tsx:128-130`) | album card title, Detail/lightbox header, `FK_LABEL_COLUMNS` label column for FK pickers |
| slug | text | NO | null | partial-unique | text input / auto-slug | **not used as the route param** — `/gallery/[albumId]` uses the album's `id`, not `slug` (see `gallery/page.tsx:40`: `href={/gallery/${album.id}}`) — the `slug` column exists and is enforced unique but is otherwise decorative on this table (see Gaps) |
| description | text | YES | null | — | textarea | album page subtitle |
| cover_image_url | text | YES | null | — | generic `MediaUploader` (URL/image heuristic) | `/gallery` listing cover image |
| created_at/updated_at | timestamptz | NO | now() | — | hidden | unused |
| created_by/updated_by | uuid | YES | null | FK `user_profiles` | auto-set | — |
| deleted_at/deleted_by | timestamptz/uuid | YES | null | — | soft-delete/Trash; `trg_cascade_album_soft_delete_to_media` cascades the soft-delete to child media | `getAllGalleryAlbums`/`getGalleryAlbumWithMedia` do **not** filter `deleted_at` (only `status`) — relies on delete always also setting `status='archived'`, which is true for the generic delete path but not guaranteed for every writer (see Gaps) |
| status | content_status | NO | 'published' | — | status badge/bulk | `.eq('status','published')` gate |
| metadata | jsonb | NO | '{}' | — | raw JSON | `GalleryAlbum.metadata.accent` typed but not read by any component found |
| owner_table | text | YES | null | `gallery_albums_owner_table_check` ∈ {events, facilities, centers, sports, achievements, student_clubs, posts} | set only by `EntryPhotosEditor`'s `createAndLinkAlbum` (`EntryPhotosEditor.tsx:134`), never user-editable | **never read** by any public query (confirmed: only 2 files reference it — `types.ts`, `EntryPhotosEditor.tsx`) — purely an RLS/bookkeeping marker, not a display filter |
| show_in_public_gallery | boolean | NO | true | — | checkbox "Also show in Gallery", unchecked by default **inside EntryPhotosEditor only** (`showInGallery` state init `useState(false)`, `EntryPhotosEditor.tsx:80`) — the column's own DB default is `true` | **never read by `getAllGalleryAlbums()`/`getGalleryAlbumWithMedia()`** — see Gaps (CONFIRMED BROKEN, verified live) |
| college_id | uuid | YES | null | FK `colleges` CASCADE | FK dropdown | unused publicly |

#### `gallery_media`
- Row count (live): **241**. Soft-delete: yes. Status: yes. Audit columns: yes. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | hidden | lightbox key |
| album_id | uuid | NO | null | FK `gallery_albums` **CASCADE** (hard-deletes media when album is hard-deleted) | set by `EntryPhotosEditor`/generic form | filter key in every gallery query |
| media_type | text | NO | null | check ∈ {image, video} | hardcoded `'image'` on upload (`EntryPhotosEditor.tsx:182`) — **video is a supported value with no admin UI to set it** (see Gaps) | `getEntryAlbums()` explicitly filters `m.media_type !== 'image'` → skips videos entirely even if some exist via direct DB/generic-table insert |
| url | text | NO | null | — | `MediaUploader`/drag-drop upload | `<Image>` src everywhere |
| caption | text | YES | null | — | not exposed in `EntryPhotosEditor` (no caption field in that UI); editable only via `/admin/tables/gallery_media` generic grid | alt text (`PhotoLightbox`/`GalleryAlbumView` alt fallback to album title) |
| sort_order | integer | NO | 0 | — | drag-to-reorder UI in `EntryPhotosEditor` (persists via `persistOrder`) | ordering in album view / Entry viewer |
| created_at/updated_at | timestamptz | NO | now() | — | hidden | — |
| created_by/updated_by | uuid | YES | null | FK `user_profiles` | auto-set | — |
| deleted_at/deleted_by | timestamptz/uuid | YES | null | — | soft-delete | `.is('deleted_at', null)` filters in `gallery.functions.ts` |
| status | content_status | NO | 'published' | — | — | `.eq('status','published')` filter |
| metadata | jsonb | NO | '{}' | — | — | `GalleryMedia.metadata.alt` typed but not read anywhere found |

- Constraints/indexes: `gallery_albums_owner_table_check`, `check_content_scope`, partial-unique slugs; `gallery_media_media_type_check`; both tables PK + `idx_gallery_albums_scope`.
- RLS policies — `gallery_albums`: `Anon SELECT`/`Authenticated read` (`true`, public can read everything incl. drafts/unpublished at the DB layer); `Entry album insert` (`owner_table IS NOT NULL AND show_in_public_gallery=false AND is_any_admin()` — **any admin role**, not scope-checked, can create an Entry album for *any* `owner_table`, though `can_write_entry_album` then gates the subsequent UPDATE/media writes); `Entry album update` (`owner_table IS NOT NULL AND can_write_entry_album(id)`); `Global insert/update/delete` (`is_global_admin() OR can_write_section('campus_life')`) — standalone (non-Entry) albums are therefore campus_life-section-gated, consistent with the sidebar.
- RLS — `gallery_media`: `Anon/Authenticated SELECT` (`true`); `Entry album insert/update/delete` (album must have `owner_table IS NOT NULL` + `can_write_entry_album(album_id)`); `Global write` (ALL, `is_global_admin() OR can_write_section('campus_life')`) — note this `ALL` policy has no separate SELECT carve-out, consistent with the blanket anon/auth SELECT above.
- Triggers: `trg_cascade_album_soft_delete_to_media` (album soft-delete → cascades to its media), `update_gallery_albums_modtime`/`update_gallery_media_modtime`. `gallery_media_album_id_fkey` is `ON DELETE CASCADE` (hard delete of an album hard-deletes its media rows, bypassing soft-delete/Trash entirely) whereas `gallery_albums` has no `ON DELETE` cascade *from* events/achievements/posts (those FKs are `SET NULL`), so hard-deleting an Entry row only orphans its `album_id` reference, it doesn't delete the album (consistent with `cascade_entry_hard_delete_to_album()` trigger existing specifically to handle that case on the Entry tables).

**Admin**: No dedicated gallery admin page — `/admin/tables/gallery_albums` and `/admin/tables/gallery_media` (generic `AdminCrudManager`, both in `GLOBAL_ONLY_TABLE_IDS`/`GLOBAL_ONLY_ROUTE_PREFIXES`, unlockable via `campus_life` section grant). The real authoring surface for *most* albums is indirect: `EntryPhotosEditor` embedded inside every Entry table's edit form (events, facilities, centers, sports, achievements, student_clubs, posts).

**Data layer**: `src/lib/gallery.functions.ts` — `getAllGalleryAlbums()` (standalone `/gallery` listing, **missing `show_in_public_gallery` and `deleted_at` filters**, see Gaps), `getGalleryAlbumWithMedia(albumId)` (album detail, same missing filters), `getEntryAlbum(albumId)`/`getEntryAlbums(ids)` (batched, used by every Entry Detail/Card page, correctly filters `status='published'` + `deleted_at IS NULL` on both album and media, and silently excludes non-image media).

**Website**: `/gallery` (`src/app/(site)/gallery/page.tsx`) — grid of all `getAllGalleryAlbums()` results, routes to `/gallery/[id]`. `/gallery/[albumId]` → `GalleryAlbumView` → `PhotoLightbox`. Every Entry Detail/Card page (`EntryCard`/`EntryViewer`/`DetailPageLayout`) reuses the same `PhotoLightbox` for "more photos" via `getEntryAlbum(s)`. Empty states: "No albums available yet." (`gallery/page.tsx:32`).

**Storage/media**: bucket `media`, `images/` prefix, client-compressed via `src/lib/image-compression.ts`/`@jsquash/*` before upload (per `uploadMediaFile`/`MediaUploader`).

---

### Achievements
**Summary**: `achievements` is an Entry type for student/faculty/college/department/sports accolades — distinct from the unrelated `staff_achievements` table (faculty CV line items, 4,039 rows, no soft-delete/status columns relevant to this domain scan — out of scope, but see Gaps for a naming collision in `achievements-import.ts`). Backs `/achievements/[slug]` and a department's "Achievements" tab.

**Tables**:

#### `achievements`
- Row count (live): **160**. Soft-delete: yes. Status: yes (default `'published'`). Audit columns: yes. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | hidden | — |
| scope_type | scope_level | NO | 'global' | `check_content_scope` | generic | unused in `achievements.functions.ts` select |
| department_id | uuid | YES | null | FK `departments` CASCADE | FK dropdown | `getAchievementsByDepartmentId()` filter |
| title | text | NO | null | — | text input | card/Detail title |
| slug | text | NO | null | partial-unique | text input | `/achievements/[slug]` route |
| description | text | YES | null | — | textarea | Detail page body |
| date | date | NO | null | — | date input | sort key, formatted date display |
| category | text | NO | null | check ∈ {student, faculty, college, department, sports} | plain text input in the generic form (**not a `<select>`** — `category` is a `text` column, not an enum, so `AdminCrudManager` renders it as a free-text field with no dropdown/validation client-side; only the DB check constraint catches a typo, after a failed save) | `achievementCategoryLabel()` maps the 5 known values to display labels, falls back to capitalized raw text for anything else |
| card_photo_url | text | YES | null | EntryPhotosEditor | `EntryCard`, Detail page |
| created_at/updated_at | timestamptz | NO | now() | — | hidden | unused |
| created_by/updated_by | uuid | YES | null | FK `user_profiles` | auto-set | — |
| deleted_at/deleted_by | timestamptz/uuid | YES | null | — | soft-delete/Trash | `.is('deleted_at', null)` filters |
| status | content_status | NO | 'published' | — | status badge/bulk | `.eq('status','published')` |
| metadata | jsonb | NO | '{}' | — | raw JSON | unused in typed `AchievementDetail`/`DeptAchievement` |
| has_detail_page | boolean | NO | false | — | EntryPhotosEditor "Give this its own page" | gates `/achievements/[slug]` 404 |
| album_id | uuid | YES | null | FK `gallery_albums` SET NULL | EntryPhotosEditor-owned | `getEntryAlbum`/`getEntryAlbums` |
| college_id | uuid | YES | null | FK `colleges` CASCADE | FK dropdown | unused in current selects |

- Constraints: `achievements_category_check`, `check_content_scope`, FKs (album, college, department, created_by, updated_by). Indexes: `idx_achievements_album_id`, `idx_achievements_scope`, two partial-unique slug indexes.
- RLS: `Anon SELECT`/`Authenticated read achievements` (`true`); `Global insert/update/delete achievements` (`is_global_admin()` **only** — no `can_write_section` carve-out here unlike events/posts/gallery, and **no scoped college/department write policy** either). This means a college- or department-scoped admin has **no RLS path to write achievements at all**, even though `achievements` participates in the same department-scoped read helper (`getAchievementsByDepartmentId`) as if it were department-manageable content — the write side is strictly global-admin-only (or via a `campus_life`/other section grant at the UI layer, but there is no `achievements` entry in `ROUTE_SECTION_MAP`, so **no section grant can unlock it either** — it is the single most locked-down table in this domain; confirm with the team whether department admins are expected to add their own achievements, because today they structurally cannot).
- Triggers: `trg_cascade_hard_delete_to_album`, `trg_cascade_soft_delete_to_album`, `update_achievements_modtime`. **No audit trigger** (`audit_*_trigger`) on `achievements`, unlike `events`/`posts` — achievement inserts/updates/deletes are only logged via the client-side best-effort `audit_logs` insert in `AdminCrudManager.handleSave`/`handleDelete`, not server-enforced — if that client call fails or is bypassed (e.g. direct API/SQL), there is no audit record at all.

**Admin**: `/admin/tables/achievements` only (no dedicated `/admin/achievements` route — unlike events/posts). `TABLE_CONFIGS.achievements = { fields: ENTRY_PHOTO_FIELDS }`, same generic pattern. CSV import: `src/lib/achievements-import.ts` exists but — **important scope note** — it imports into `staff_achievements` (faculty CV award/patent/publication rows keyed by staff email), a completely different table from the `achievements` Entry table documented above. The filename strongly implies it populates this domain's `achievements` table; it does not. This should be renamed or the relationship documented (see Gaps).

**Data layer**: `src/lib/achievements.functions.ts` — category label helpers + `getAchievementDetailBySlug()` (joins `departments(name, code)`, loads entry album). `src/lib/department-content.functions.ts:getAchievementsByDepartmentId()` — department-scoped list, batches entry albums only for cards without a Detail page.

**Website**: `/achievements/[slug]` (`src/app/(site)/achievements/[slug]/page.tsx`) — `generateMetadata` builds its own title/description (does not use `seo_metadata`). `/departments/[dept]/achievements` consumes `getAchievementsByDepartmentId()`. There is **no standalone `/achievements` listing page** in the scanned route tree (only the `[slug]` detail route) — achievements are only discoverable via a department's Achievements tab or a direct link; a plain `/achievements` index was in scope to check and was not found, which may be intentional (confirm with design) or a missing listing page.

**Storage/media**: same `media` bucket / `EntryPhotosEditor` pattern.

---

### Content categories (`content_categories`)
**Summary**: A simple taxonomy table for `posts.category_id` (news categories). **Currently empty (0 rows)** in the live DB, so every post today has `category_id = null` and `EntryCard`/`NewsEventsSection` never render a category eyebrow derived from it.

#### `content_categories`
- Row count: **0**. Soft-delete: yes. Status: yes. Audit columns: yes. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | hidden | `posts.category_id` FK target |
| name | text | NO | null | — | generic text input | `category:content_categories(name, slug)` join label |
| slug | text | NO | null | `unique_category_slug` UNIQUE(slug, module_type) | generic text input | not used as a route today |
| module_type | text | NO | null | part of composite unique constraint, no CHECK restricting its values | generic text input (free text — admin must know to type e.g. `"news"`; nothing in the UI documents valid values or filters posts' FK dropdown by it) | **not filtered by `module_type` anywhere** — `posts.functions.ts`'s `category:content_categories(name, slug)` join doesn't scope by module_type, so if other module types are ever added to this table, a post could show an unrelated category with no guard |
| created_at/updated_at/created_by/updated_by/deleted_at/deleted_by | — | — | — | — | hidden/auto | — |
| status | content_status | NO | 'published' | — | status badge | not filtered by any post query (categories aren't checked for `status='published'` before being joined/displayed) |
| metadata | jsonb | NO | '{}' | — | raw JSON | unused |

- RLS: `Anon/Authenticated SELECT` (`true`); `Global write content_categories` (ALL, `is_global_admin() OR can_write_section('news_events')`).
- Triggers: `update_content_categories_modtime` only — no audit trigger, no cascade triggers (table has no children that need them).
- Admin: `/admin/tables/content_categories`, generic, global-only route (`ROUTE_SECTION_MAP` maps it to `news_events`).

---

### SEO metadata (`seo_metadata`)
**Summary**: A generic SEO/OpenGraph fields table, linkable from `events.seo_id` and `posts.seo_id` via the `SeoEditor` admin component. **Currently empty (0 rows) and, more importantly, never read by any public route's `generateMetadata`** — see Gaps, this is the headline finding for this domain.

#### `seo_metadata`
- Row count: **0**. Soft-delete: yes. Status: yes. Audit columns: yes. RLS: enabled.

| Column | Type | Null | Default | FK/check | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | hidden | FK target from `events.seo_id`/`posts.seo_id` |
| meta_title | text | YES | null | — | `SeoEditor.tsx:149-157` | **never read** |
| meta_description | text | YES | null | — | `SeoEditor.tsx:173-182` | **never read** |
| meta_keywords | text[] | NO | '{}' | — | comma-separated input, parsed to array | **never read** |
| canonical_url | text | YES | null | — | `SeoEditor.tsx:198-206` | **never read** |
| og_title | text | YES | null | — | `SeoEditor.tsx:216-224` | **never read** |
| og_description | text | YES | null | — | `SeoEditor.tsx:240-248` | **never read** |
| og_image_url | text | YES | null | — | `MediaUploader` | **never read** |
| twitter_card | text | YES | null | — | select (summary / summary_large_image) | **never read** |
| structured_data | jsonb | NO | '{}' | — | **no UI field for this at all** — the column exists but `SeoEditor`'s `formValues` shape never touches `structured_data`, so it's always written as `{}` | **never read** — JSON-LD is never emitted anywhere in the scanned routes |
| robots_directives | text | YES | null | — | select (index,follow / noindex,nofollow / noindex,follow) | **never read** — Next's `generateMetadata` `robots: {index:false}` in `news/[slug]`, `achievements/[slug]`, `campus-life/events/[slug]` is **hardcoded in code** for the not-found case only, not driven by this column |
| created_at/updated_at/created_by/updated_by/deleted_at/deleted_by | — | — | — | — | hidden/auto | — |
| status | content_status | NO | 'published' | — | hardcoded `'published'` on save | — |
| metadata | jsonb | NO | '{}' | — | — | unused |

- RLS: `Anon/Authenticated SELECT` (`true`); `Global write seo_metadata` (ALL, `is_global_admin()` only — no section-grant carve-out).
- Admin: no dedicated route; only reachable as an embedded popover inside the events/posts edit forms (`col.name === 'seo_id'` branch, `AdminCrudManager.tsx:979-980`) and the generic `/admin/tables/seo_metadata` grid (not in `GLOBAL_ONLY_TABLE_IDS`, so oddly a scoped admin with a `college_id`/`department_id` column match could theoretically reach it via the generic fallback rule in `writePermissions` — but `seo_metadata` has neither column, so the generic rule falls through to `none`; effectively global-admin-only in practice too).

**Gap confirmation**: searched every file under `src/app` and `src/lib` for `seo_metadata`/`seo_id` — the only hits are the admin component itself (`SeoEditor.tsx`, `AdminCrudManager.tsx`) and the generated types file. No `generateMetadata` function in any route reads it.

---

#### Gaps (Events, news, gallery, achievements)

1. **[broken] Gallery visibility checkbox does nothing — Entry albums leak into the public /gallery listing regardless of the "Also show in Gallery" toggle.**
   `getAllGalleryAlbums()` (`src/lib/gallery.functions.ts:29-39`) only filters `status = 'published'`; it never checks `show_in_public_gallery`. Every Entry album created via `EntryPhotosEditor` is inserted with `status: 'published'` (`EntryPhotosEditor.tsx:134`) regardless of the checkbox state — only `show_in_public_gallery` itself reflects the admin's choice. Live data confirms this is not theoretical: 3 of the 5 live `gallery_albums` rows today are Entry-owned (`owner_table='facilities'`) with `show_in_public_gallery=false`, `status='published'` — these currently appear on the public `/gallery` page and at `/gallery/[albumId]` even though the admin explicitly left the box unchecked. Fix: add `.eq('show_in_public_gallery', true)` (and arguably `.is('owner_table', null)`, since an Entry album is never meant to double as a standalone listing entry) to both `getAllGalleryAlbums()` and `getGalleryAlbumWithMedia()`.

2. **[broken] `seo_metadata` / `seo_id` is entirely write-only — nothing on the public site ever reads it.**
   `events.seo_id` and `posts.seo_id` route into a full `SeoEditor` UI (meta title/description/keywords, canonical URL, OpenGraph fields, Twitter card, robots directives) that admins can fill in and save, but every `generateMetadata()` found (`news/[slug]`, `achievements/[slug]`, `campus-life/events/[slug]`) builds its own `<title>`/description from the row's own `title`/`summary`/`description` fields and never queries `seo_metadata`. The table has 0 rows today, meaning no admin has even discovered this works — but if they do, the time spent is wasted with no visible effect, and `robots_directives` (e.g. "hide this page from Google") silently does not work at all.

3. **[misleading] `achievements-import.ts` does not import into the `achievements` table.**
   The file is named and organized as the achievements CSV importer, but it writes to `staff_achievements` (a faculty-CV table, 4,039 live rows, keyed by staff email, with its own `type` enum of award/patent/publication/research/qualification/experience) — a different table from the public Achievements Entry (`achievements`, 160 rows, `category` ∈ student/faculty/college/department/sports) documented in this section. A reader going by the filename alone (as this audit's scope list did) would reasonably expect it to populate `achievements`; it populates faculty CVs instead. Recommend renaming to `staff-achievements-import.ts` or similar, and clarifying in `CONTEXT.md`/`docs/README.md` that these are two unrelated "achievements" concepts.

4. **[misleading] `achievements` write RLS has no scoped or section-grant path — department/college admins structurally cannot write achievements despite department-scoped read support.**
   `achievements`'s only write policies are `Global insert/update/delete achievements` gated on `is_global_admin()` alone (no `can_write_section(...)` OR-clause like events/posts/gallery/content_categories have, and no `Scoped insert/update/delete` policy like events has). `achievements` also has no entry in `ROUTE_SECTION_MAP`, so no admin section grant can unlock `/admin/tables/achievements` either. Yet `getAchievementsByDepartmentId()` exists specifically to show a department's achievements on its own page, implying achievements are meant to be department content. If a department admin is expected to add their own achievements, today they cannot — only a global admin can, for every department.

5. **[dead] `gallery_albums.owner_table` and `gallery_media.caption`/`metadata.alt` are write-only or unused.**
   `owner_table` is set once at album creation and never read by any public query (it exists purely for the RLS `can_write_entry_album()`/insert-policy check). `gallery_media.caption` has no field in `EntryPhotosEditor` (only reachable via the generic `/admin/tables/gallery_media` grid) even though `PhotoLightbox`/`GalleryAlbumView` use it for alt text — so photos uploaded through the normal Entry flow (the vast majority) never get a caption/alt text unless an admin separately visits the raw table editor. `GalleryMedia.metadata.alt` and `GalleryAlbum.metadata.accent` are typed in TypeScript but no component reads either.

6. **[dead] `content_categories` is empty and its `module_type` column is unvalidated free text with no admin guidance.**
   0 rows live; every post today has no category. `module_type` has no CHECK constraint and no UI hint about valid values (it's presumably meant to be `"news"` to scope posts' categories, modeled for future reuse by other content types, but nothing enforces or documents that), and `posts.functions.ts`'s join doesn't filter by `module_type` or `status`, so once rows do exist, an unpublished or wrong-module-type category could still surface on a post card.

7. **[dead] `events.metadata.highlights` and `posts.metadata`/`achievements.metadata` JSON shapes are typed but never rendered.**
   `CampusEvent.metadata.highlights` (`events.functions.ts:31-34`) documents a `{title, description}[]` shape with no corresponding UI in `EntryPhotosEditor`/`TABLE_CONFIGS.events` to populate it (only the raw JSON textarea) and no component found that reads `event.metadata.highlights` to render it on the Detail page.

8. **[misleading] `gallery_albums.slug` is enforced unique but never used as a route/lookup key.**
   `/gallery/[albumId]` and every `href` building it use the album's `id`, not its `slug` (`gallery/page.tsx:40`). The slug column, its two partial-unique indexes, and the admin's "Required" slug field are effectively decorative for this table — unlike `events`/`posts`/`achievements` where slug is the actual route key.

9. **[cosmetic] `events.tag` is documented as deprecated but is still the subtitle fallback on both the browse and detail pages.**
   The field comment in `events.functions.ts:9` calls it deprecated/superseded by `event_type`, but `campus-life/events/page.tsx:39` and `[slug]/page.tsx:59` both still fall back to `event.tag` in their subtitle chain (`subtitle ?? accent_color ?? tag`). Not broken, but the "deprecated" label and continued live use should be reconciled — either finish the migration off `tag` or update the comment.

10. **[broken-adjacent / verify] Public `SELECT` RLS on `events`/`posts`/`gallery_albums`/`gallery_media`/`achievements`/`content_categories`/`seo_metadata` is unconditionally `true` for `anon`/`authenticated`, with no `status`/`deleted_at` filter at the RLS layer.**
    Every read-side protection (draft hiding, soft-delete hiding) is enforced only in application code (`.eq('status','published')`, `.is('deleted_at', null)`) inside `src/lib/*.functions.ts`. Any direct REST/PostgREST call with the anon key that skips those filters (or a future function that forgets them, like `getAllGalleryAlbums()` forgetting `deleted_at` today — see gap 1's sibling issue) will expose drafts and soft-deleted rows. This matches the project-wide pattern noted in `CLAUDE.md` ("filter status = 'published' and deleted_at IS NULL" is a convention, not an RLS guarantee) — flagging it here because this domain's `getAllGalleryAlbums`/`getGalleryAlbumWithMedia` already miss the `deleted_at` half of that convention.

11. **[cosmetic] `achievements.category` is a free-text column with a DB CHECK constraint but no `<select>` in the generic admin form**, because `AdminCrudManager` only renders enum dropdowns for `USER-DEFINED` (Postgres enum) column types, and `category` is plain `text`. An admin typing a value outside {student, faculty, college, department, sports} only finds out at save time via a raw Postgres constraint-violation error message, not a friendly client-side validation message.

12. **[dead] `gallery_media.media_type = 'video'` has no admin path to set it.**
    The CHECK constraint allows `'video'`, and `getEntryAlbums()` explicitly filters `media_type !== 'image'` (meaning videos are silently excluded from every Entry's "more photos" lightbox even if one existed), but `EntryPhotosEditor`'s upload hardcodes `media_type: 'image'` and its file input only accepts `image/*`. Confirm whether video support is intentionally unfinished or should be removed from the constraint/types to stop implying it's supported.


#### Verification corrections

A second, independent pass re-checked this section against the live code and database. Corrections:

- achievements RLS/ROUTE_SECTION_MAP claim in gap 4 (section lines 191, 267-268) is correct and additionally independently confirmed: ROUTE_SECTION_MAP (src/lib/admin-sections.ts:111-127) lists exactly 10 routes (home_page, news_events x3, admissions, placement x3, about_us x3, campus_life x4) and genuinely has no achievements entry — this is not a stale/inferred claim, it was directly verified against the current file.
- No factual errors found in the spot-checked claims (file paths, line numbers for tag/highlights/slug/caption/media_type, and RLS policy shapes for achievements/events/posts/gallery_albums/gallery_media/content_categories/seo_metadata) — all matched live code and live DB exactly. The 'achievements has no ROUTE_SECTION_MAP entry' and 'no Scoped policy' claims, in particular, are fully correct, not overstated.


---

## Placement & recruiters

**Scope note**: The brief lists `placement_cells`, `placed_students`, `recruiters`, `cells` (dead?).
All four exist live. `cells` turned out to be unrelated to placement (see its own subsection) and is
fully dead. No other placement-adjacent table surfaced (`stats.functions.ts` only reads `recruiters`/
`placed_students` counts, nothing new).

### Training & Placement Cell (unified page)

**Summary**: One public page (`/placement`) built from a single `placement_cells` row
(`college_code = 'overview'`), a flat list of `placed_students` cards, and a flat list of `recruiters`
logos. Per-college placement data (`placement_cells` rows for `svica`, `svion`, `svit-coa`,
`svit-degree`, plus `/placement/[college]` and per-student/recruiter college scoping) was built into the
schema but the current UI never surfaces it — see Gaps.

#### `placement_cells`

- Row count (live): **5** (`overview`, `svica`, `svion`, `svit-coa`, `svit-degree`).
- Soft-delete: yes (`deleted_at`/`deleted_by`). Status column: yes (`status` enum `content_status`,
  default `published`). Audit columns: yes (`created_at/by`, `updated_at/by`). RLS enabled: yes.
- **No tracked `CREATE TABLE` migration originally** — `supabase/migrations/20260729130000_backfill_create_placement_cells.sql:15-35`
  now documents the live shape retroactively (`IF NOT EXISTS`, timestamped before the first `ALTER TABLE`
  that touches it) per `docs/audits/deferred-issues.md`. Later columns were added by real `ALTER TABLE`
  migrations: `default_student_placeholder_url` (`20260729133600_...sql`), `hero_title`/`hero_subtitle`
  (`20260729131000_add_placed_students_to_placement_cells.sql` — name is misleading, it actually adds the
  hero columns, not placed-students; see Gaps).

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` | PK | never edited | never shown |
| `college_code` | text | NO | — | UNIQUE (`placement_cells_college_code_key`) | hardcoded to `'overview'` on save, `src/lib/placement.functions.ts:16,273` | used only as the lookup key, `src/lib/placement.functions.ts:168` |
| `about_text` | text | NO | `''` | — | AdminTnpHubPage "About" tab → `savePlacementContent`, `src/lib/placement.functions.ts:276` | `PlacementPage` about section, `src/components/site-next/PlacementPage.tsx` (via `data.aboutText`) |
| `officer_name` | text | NO | `''` | — | AdminTnpHubPage "Officer" tab, `placement.functions.ts:277` | officer card, `PlacementPage.tsx` (`data.officer.name`) |
| `officer_designation` | text | NO | `'Training & Placement Officer'` | — | AdminTnpHubPage, `placement.functions.ts:278` | officer card |
| `officer_phone` | text | NO | `''` | — | AdminTnpHubPage, `placement.functions.ts:279` | officer card (tel link) |
| `officer_email` | text | NO | `''` | — | AdminTnpHubPage, `placement.functions.ts:280` | officer card (mailto link) |
| `officer_photo_url` | text | YES | null | — | AdminTnpHubPage via `MediaUploader`, `placement.functions.ts:281` | officer card avatar |
| `status` | content_status enum | NO | `'published'` | enum `content_status` (draft/published/archived) | hardcoded `'published'` on every save, `placement.functions.ts:282` — **never set to draft/archived from the UI** | gates public SELECT RLS |
| `created_at` | timestamptz | NO | `timezone('utc', now())` | — | never edited | never shown |
| `updated_at` | timestamptz | NO | `timezone('utc', now())` | — | never edited (no trigger either — see Gaps) | never shown |
| `created_by` | uuid | YES | null | no FK on live DB (cf. `recruiters.created_by` which does have one) | never set by app code | never shown |
| `updated_by` | uuid | YES | null | no FK | never set | never shown |
| `deleted_at` | timestamptz | YES | null | — | never set (no trash UI for this table) | gates public SELECT RLS |
| `deleted_by` | uuid | YES | null | — | never set | never shown |
| `metadata` | jsonb | NO | `'{}'` | — | AdminTnpHubPage packs `highestPackage`, `averagePackage`, `sectionConfig`, `graphicalData` into it, `placement.functions.ts:283-288` | read back via `readMeta()`, `placement.functions.ts:147-150,189` |
| `default_student_placeholder_url` | text | YES | null | — | **no admin field writes this column at all** (`savePlacementContent` never includes it) | **no website code reads it** — fully dead column |
| `hero_title` | text | YES | null | — | AdminTnpHubPage "Hero" tab, `placement.functions.ts:274` | `PlacementPage` hero `<PageHero title=...>` |
| `hero_subtitle` | text | YES | null | — | AdminTnpHubPage "Hero" tab, `placement.functions.ts:275` | `PlacementPage` hero subtitle |

Constraints/indexes (live): PK on `id`; UNIQUE on `college_code`. No index on `status`/`deleted_at` (fine
at 5 rows).

RLS policies (live, `pg_policies`):
- `Public read placement_cells` — SELECT, roles `{anon, authenticated}` — USING `status = 'published' AND deleted_at IS NULL`.
- `Global write placement_cells` — ALL, roles `{public}` (i.e. evaluated for every role, scoped by the expression) — USING/WITH CHECK `is_global_admin() OR can_write_section('placement')`.

**Drift**: the backfill migration (`20260729130000_...sql:45-50`) only ever created a `USING (is_global_admin())`
write policy restricted `TO authenticated`; the live policy is broader — `TO public`, `is_global_admin() OR
can_write_section('placement')` — which matches the later `20260921072107_section_scoped_write_policies.sql`
migration, so the *current* tracked history is consistent with live, but the backfill file itself is now
stale/misleading if read in isolation (it documents a policy that was since superseded).

Triggers: **none**. There is no `update_placement_cells_modtime`-style trigger, unlike `recruiters`/`cells`
(`update_recruiters_modtime`, `update_cells_modtime` both call `update_updated_at_column()`). `updated_at`
on `placement_cells` is only as fresh as whatever the admin app's upsert payload happens to set (it doesn't
set it — Postgres column default only fires on insert), so **`updated_at` goes stale after every update**.

#### `placed_students`

- Row count (live): **1058**.
- Soft-delete: **no** `deleted_at` column — deletion is hard (`DELETE` from `placed_students`,
  `src/lib/placement.functions.ts:345`). Status column: yes (`status` text, check-constrained to
  draft/published/archived). Audit columns: only `created_at`/`updated_at`, no `created_by`/`updated_by`.
  RLS enabled: yes.
- Created by `supabase/migrations/20260729142000_create_placed_students_table.sql` then reshaped by
  `20260729150000_placement_full_setup.sql` (adds/confirms shape), `20260729190000_add_department_to_placed_students.sql`
  (adds `department_id`), `20260730110000_placed_students_proper_fk.sql` (tightens the `college_id` FK).

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` | PK | never edited | never shown |
| `college_id` | uuid | NO | — | FK → `colleges(id)` ON DELETE CASCADE | AdminTnpHubPage "Students" tab, as a college picker resolved from `colleges.slug`, `placement.functions.ts:295-328` | **never rendered** — resolved back to `colleges.slug` for the edit form only, never shown on `/placement` (`PlacementPage.tsx` renders only name/company/batch), `src/components/site-next/PlacementPage.tsx:319-338` |
| `department_id` | uuid | YES | null | FK → `departments(id)` ON DELETE SET NULL | **no admin UI sets this** — `savePlacementContent` comment explicitly says "package_lpa / department_id set elsewhere", but nothing in the codebase ever writes it except the reachable-only-by-direct-URL `/admin/tables/placed_students` generic editor | never read by any query (`placement.functions.ts` never selects it) |
| `student_name` | text | NO | `'Student'` | — | AdminTnpHubPage "Students" tab | student card name |
| `company_name` | text | NO | — | — | AdminTnpHubPage | student card company |
| `photo_url` | text | YES | null | — | AdminTnpHubPage via `MediaUploader` | student card avatar (falls back to initials, `PlacementPage.tsx:49-53,327`) |
| `batch_year` | text | YES | `'2024'` | — | AdminTnpHubPage | student card "Batch {year}"; also the default sort key (`placement.functions.ts:174`) |
| `package_lpa` | numeric | YES | null | — | **no admin UI writes this** (same "elsewhere" comment as `department_id`); only reachable via `/admin/tables/placed_students`. Only **6 of 1058** rows have a value | never read by any query — the "Highest/Average Package" stat tiles on `/placement` come from free-text `metadata.highestPackage`/`averagePackage` on `placement_cells`, not computed from `package_lpa` |
| `status` | text | NO | `'published'` | CHECK `status IN ('draft','published','archived')` | hardcoded `'published'` on every write, `placement.functions.ts:332` | gates public SELECT RLS and the read query's `.eq("status","published")` filter |
| `created_at` | timestamptz | NO | `now()` | — | never edited | never shown |
| `updated_at` | timestamptz | NO | `now()` | — | never edited; **no update trigger exists** on this table either, so it goes stale the same way `placement_cells.updated_at` does | never shown |

Constraints/indexes (live): PK on `id`; CHECK on `status`; FK `college_id`→colleges (CASCADE), FK
`department_id`→departments (SET NULL); btree indexes on `(college_id, status)`, `department_id`,
`batch_year DESC`.

RLS policies (live):
- `Public read placed_students` — SELECT, `{public}` — USING `status = 'published'`. **No `deleted_at`
  check** (there is no such column, so this is correct, but it means archived rows are hard to recover —
  there's no trash either).
- `Global insert/update/delete placed_students` — `{public}` — USING/WITH CHECK `is_global_admin() OR
  can_write_section('placement')`.

Triggers: none.

Migration drift: none found beyond the `updated_at`/trigger gap noted above (that's a design gap, not
drift from migrations — no migration ever claimed a trigger existed).

#### `recruiters`

- Row count (live): **288**. Soft-delete: yes (`deleted_at`/`deleted_by`). Status column: yes (`status`
  enum `content_status`). Audit columns: yes (`created_at/by`, `updated_at/by`). RLS enabled: yes.
- Created by `supabase/migrations/20260718080249_4a64dcdf-....sql:56` (original shape), then
  `department_id` and `college_codes` were added later (both present in `20260812000000_phase0_baseline.sql:1426`
  as a consolidated dump — the incremental `ALTER TABLE` that added them individually was not separately
  located in migration history, i.e. possible drift: the baseline dump is the only record of these two
  columns' origin).

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` | PK | never edited | never shown |
| `company_name` | text | NO | — | UNIQUE-ish via `recruiters_unique_live_company_name` (functional unique index on trimmed/lowercased name, `WHERE deleted_at IS NULL`) | AdminTnpHubPage "Recruiters" tab (`placement.functions.ts:365`) **and** `/admin/recruiters` generic CRUD editor (`src/app/admin/(dashboard)/recruiters/page.tsx:14`) — two separate admin UIs write the same column | logo wall name/alt text everywhere recruiters render |
| `logo_url` | text | YES | null | — | both admin UIs (`MediaUploader` in AdminTnpHubPage; generic file field in `/admin/recruiters`) | logo image, falls back to company name text (`RecruitersMarquee.tsx:14-26`) |
| `website_url` | text | YES | null | — | **only** editable via `/admin/recruiters` (AdminTnpHubPage's `savePlacementContent` never touches it, `placement.functions.ts:363-370`) | **never read** by any query (`placement.functions.ts`, `homepage.functions.ts` both select only `id, company_name, logo_url, sort_order`) — dead on the public side despite being editable |
| `sort_order` | integer | NO | `0` | — | AdminTnpHubPage re-numbers all rows by array index on every save (`placement.functions.ts:367`) — **this silently stomps any ordering set via `/admin/recruiters`'s own sort_order field** the next time someone saves the T&P hub | ordering for marquee/logo wall everywhere |
| `created_at` / `updated_at` | timestamptz | NO | `timezone('utc', now())` | — | n/a | n/a |
| `created_by` / `updated_by` / `deleted_by` | uuid | YES | null | FK → `user_profiles(id)` ON DELETE SET NULL (all three) | set implicitly by Supabase triggers/RLS context where applicable; AdminCrudManager's generic editor doesn't appear to populate these on write | never shown |
| `status` | content_status enum | NO | `'published'` | enum | AdminTnpHubPage hardcodes `'published'` on every row (`placement.functions.ts:368`); `/admin/recruiters` can set any status since it's a generic enum field | **not filtered** by `getRecruiterLogos()` (homepage, college pages) — see Gaps |
| `metadata` | jsonb | NO | `'{}'` | — | generic JSON field via `/admin/recruiters` only | never read |
| `department_id` | uuid | YES | null | FK → `departments(id)` ON DELETE SET NULL | editable only via `/admin/recruiters` generic CRUD | **never read by any query** — 0 of 288 rows have a value; fully dead in practice |
| `college_codes` | text[] | YES | null | — | editable only via `/admin/recruiters` generic CRUD | **never read by any query** — 0 of 288 rows have a value; fully dead |

Constraints/indexes (live): PK on `id`; FKs as above; btree index on `department_id`; unique functional
index on normalized `company_name` where not deleted.

RLS policies (live):
- `Public read recruiters` — SELECT, `{public}` — USING `true`. **No `status`/`deleted_at` filter at all**
  — this is the most permissive read policy of the four tables in this domain and matches the original
  2026-07-18 migration verbatim (`CREATE POLICY "Public read recruiters" ... USING (true)`), so this is
  not drift, it's an original design choice that the data layer never compensated for on two of its three
  read paths (see Gaps).
- `Global insert/update/delete recruiters` — `{public}` — USING/WITH CHECK `is_global_admin() OR
  can_write_section('placement')`.

Triggers: `update_recruiters_modtime` (BEFORE UPDATE) → `update_updated_at_column()` — this one *does*
auto-refresh `updated_at`, unlike `placement_cells`/`placed_students`.

Migration drift: `department_id`/`college_codes` columns exist live with no traceable incremental
migration (only visible in the `20260812000000_phase0_baseline.sql` full-schema dump) — flag for
investigation; not necessarily wrong, but the origin isn't in tracked history the way the other
`ALTER TABLE`s for this domain are.

#### `cells` (checked — unrelated to placement, fully dead)

- Row count (live): **0**. RLS enabled: yes, with full read/scoped-write policies defined
  (`Anon SELECT`, `Authenticated read cells`, `Scoped insert/update/delete cells` using
  `can_write_scoped_record`), but nothing ever calls `.from("cells")` anywhere in `src/` or `scripts/`
  (confirmed by repo-wide grep). No admin route, no sidebar entry, no data-layer function.
- Created by `supabase/migrations/20260812000000_phase0_baseline.sql:611` as a generic `college_id` +
  `name`/`slug` + standard audit/status/metadata table — shape suggests a generic "campus cell" directory
  (e.g. anti-ragging cell, grievance cell, women's cell) that was scaffolded but never wired to any UI.
  Despite the name, it has nothing to do with `placement_cells` (confusingly similar name, unrelated
  table, unrelated migration lineage).
- Trigger: `update_cells_modtime` (BEFORE UPDATE) → `update_updated_at_column()` — maintained even though
  the table is unused.
- Verdict: **dead table**. Not in scope for the placement domain beyond confirming it's not secretly
  backing anything placement-related.

### Admin

- **`/admin/tnp-hub`** (`src/app/admin/(dashboard)/tnp-hub/page.tsx`) — gated by `requireAdmin()` +
  `isRouteAllowedForUser('/admin/tnp-hub', ...)`; classified **global-only** in
  `src/lib/admin-sections.ts:18` (`GLOBAL_ONLY_ROUTE_PREFIXES`), section code `placement`
  (`admin-sections.ts:118`-ish mapping). Renders `AdminTnpHubPage`
  (`src/components/admin-next/pages/AdminTnpHubPage.tsx`, 723 lines), a tabbed single-page editor:
  Toggles / Hero / About / Trend / Students / Recruiters / Officer. It loads via
  `getPlacementContent()` + `getPlacementColleges()` and saves the *entire* hub in one call to
  `savePlacementContent()` (`placement.functions.ts:267-387`) — update/insert/delete across
  `placement_cells`, `placed_students`, and `recruiters` in one client-side pass (not a DB transaction;
  partial failure mid-loop leaves inconsistent state, e.g. some students saved, a later one throwing and
  aborting the recruiters pass).
- **`/admin/recruiters`** (`src/app/admin/(dashboard)/recruiters/page.tsx`) — also global-only
  (`admin-sections.ts:19` prefix), section `placement`. Renders the **generic** `AdminCrudManager`
  with `tableId="recruiters"` and no custom `TABLE_CONFIGS` entry
  (`src/components/admin-next/AdminCrudManager.tsx` — grep confirms no `recruiters:` key in the
  `TABLE_CONFIGS` map that starts at line 190), so it introspects all 15 columns directly, including
  `website_url`, `department_id`, `college_codes`, `metadata`, `status`, `deleted_at` as raw fields. This
  is a **second, independent editor for the same table** AdminTnpHubPage edits — see Gaps for the
  conflicts this creates.
- **`/admin/tables/placed_students`** (`src/app/admin/(dashboard)/tables/[tableId]/page.tsx`, generic
  dynamic route) is classified global-only in `admin-sections.ts:39/98/119` but has **no sidebar entry**
  (`AdminSidebar.tsx` only links `/admin/tnp-hub` and `/admin/recruiters` for placement,
  `src/components/admin-next/AdminSidebar.tsx:76-77`). It is the only place `department_id` and
  `package_lpa` on `placed_students` can be set, and it's unreachable without typing the URL directly.
- **Redirect stubs**: `/admin/placement-cells`, `/admin/placement-stats`, `/admin/placements` are all
  one-line `redirect('/admin/tnp-hub')` pages (`src/app/admin/(dashboard)/placement-cells/page.tsx`,
  `placement-stats/page.tsx`, `placements/page.tsx`) — legacy URLs kept alive, consistent with the
  single-hub consolidation. No gap here; working as intended.
- **Roles/scopes**: `GLOBAL_ONLY_ROUTE_PREFIXES` means only `scope_type = 'global'` users can see or use
  any of the three real admin UIs (`tnp-hub`, `recruiters`, `tables/placed_students`) — a
  `college_admin`/`department_admin` cannot manage placement content for their own college even though
  the RLS write policies (`is_global_admin() OR can_write_section('placement')`) would technically permit
  a scoped admin with a `placement` write grant to write via direct API calls; the admin UI route guard
  is stricter than the DB policy for this domain.
- **Imports**: no CSV import exists for `placed_students` or `recruiters` (unlike staff/achievements) —
  all 1058 students and 288 recruiters were presumably seeded directly via SQL/migration or one-off
  script, not through the app.
- **Soft delete / trash / audit**: `recruiters` and `placement_cells` support `deleted_at` but **neither
  appears on the Trash page's managed list** — check `src/components/admin-next/pages/AdminTrashPage.tsx`
  references `placed_students`/`recruiters` only as table-id strings used for the generic trash restore
  flow (grep hit), not confirmed wired end-to-end here; `placed_students` has no `deleted_at` at all so
  cannot be trashed — AdminTnpHubPage's student removal path does a **hard DELETE**
  (`placement.functions.ts:345`), which is a direct violation of the repo's "soft delete, not hard
  delete" rule in `CLAUDE.md`.

### Data layer

- `src/lib/placement.functions.ts` — the canonical module for this domain. `getPlacementContent()`
  (reads, `publicSupabase()`), `getAllRecruiters()` (reads, filtered), `getPlacementColleges()` (reads),
  `savePlacementContent()` (writes, browser client so RLS sees `authenticated`). Uses `any`-typed client
  (`serverClient(): any`, line 21) because `src/integrations/supabase/types.ts` is stale and missing
  `placed_students` entirely plus `placement_cells.hero_title`/`hero_subtitle` (comment at
  `placement.functions.ts:18-20` — self-documented drift between generated types and live schema).
- `src/lib/homepage.functions.ts:32-40` — `getRecruiterLogos()`, used by the homepage and college landing
  pages. **Does not filter `status`/`deleted_at`** (contrast with `getAllRecruiters()` in
  `placement.functions.ts:229-245`, which does). Two functions, same table, inconsistent filtering.
- `src/lib/stats.functions.ts:16-49` — `getLiveStats()` computes `recruitersCount` (distinct
  `company_name` among `status='published' AND deleted_at IS NULL` rows) and `placedStudentsCount`
  (count where `status='published'`), shared by the homepage stats strip and nav. This one filters
  correctly, unlike `getRecruiterLogos`.
- Caching/revalidation: none of these call `revalidatePath`/`revalidateTag` or set `fetch` cache options
  — they're plain async Supabase calls inside Server Components, so freshness depends entirely on
  Next.js's default per-request fetch behavior for Server Components (no explicit `cache: 'no-store'`
  either, so default caching rules apply — worth a build-time check if stale content is ever reported).

### Website

- **`/placement`** (`src/app/(site)/placement/page.tsx`) → `getPlacementContent()` → `PlacementPage`
  (`src/components/site-next/PlacementPage.tsx`). Renders: hero (title/subtitle), a 4-tile stat strip
  (students placed count, highest/average package as free text, recruiter count), About, a year-over-year
  trend chart from `metadata.graphicalData`, paginated placed-student cards (10 at a time, "Show more"),
  paginated recruiter logos (12 at a time), and the officer card. Section visibility and highlight icons
  are all admin-configurable via `sectionConfig` in `metadata`.
- **`/placement/[college]`** (`src/app/(site)/placement/[college]/page.tsx`) — a **redirect-only stub**
  to `/placement` (comment: "Placements are presented as a single unified page... kept so existing links
  and search results don't 404"). The per-college `placement_cells` rows (`svica`, `svion`, `svit-coa`,
  `svit-degree`) and the `placed_students.college_id` tagging are therefore **data with no page that ever
  renders them per-college** — see Gaps.
- **`/careers`** (`src/app/(site)/careers/page.tsx`) — despite the brief's hint, this page has **nothing
  to do with placement/recruiters**. It lists staff job openings from `homepage_items` where
  `item_type='job'` (`getJobListings()`, `homepage.functions.ts:42-53`) — a faculty-recruitment page, not
  a student-placement/recruiter page. No gap, just a naming-adjacent dead end for anyone expecting
  recruiter content here.
- **Homepage** (`src/app/(site)/page.tsx:63,420`) — `RecruitersMarquee` (GSAP auto-scrolling logo strip,
  `src/components/site-next/RecruitersMarquee.tsx`) fed by unfiltered `getRecruiterLogos()`.
- **`/colleges/[college]`** (`src/app/(site)/colleges/[college]/page.tsx:8,27`) — same unfiltered
  `getRecruiterLogos()`, and critically **the same global recruiter list regardless of which college**
  — `recruiters.department_id`/`college_codes` exist precisely to scope this and are never used, so every
  college landing page shows identical recruiter logos.
- **`/courses/[course]`** (`src/app/(site)/courses/[course]/page.tsx:7,15-16,109-113`) — uses
  `getAllRecruiters()` (the filtered one) but renders the **same flat list of all 288 recruiters on every
  course page**, under the heading "Where our graduates go" — again, no per-course/per-department
  filtering despite the schema having a `department_id` column built for exactly this.
- **Empty/fallback behavior**: `layout.tsx`-style `.catch(() => [])` is applied at each call site
  (`page.tsx:61-69`, `careers/page.tsx:17-18`, college page does **not** `.catch()` its own
  `getRecruiterLogos()` call at `colleges/[college]/page.tsx:27` — an unhandled Supabase error there would
  propagate past the `Promise.all` and 500 the whole college landing page, unlike the homepage's
  equivalent call which is individually wrapped).
- **Hardcoded content**: none found — all copy in this domain is Supabase-driven (hero text, about text,
  highlights, officer details, stat labels are static JSX but the values are dynamic).

### Storage/media

- Recruiter logos and student photos and officer photos all go through `MediaUploader`
  (`src/components/admin-next/MediaUploader.tsx`) with client-side compression
  (`src/lib/image-compression.ts`), consistent with the rest of the site. No placement-specific storage
  bucket or path convention was found beyond the shared media upload flow — not independently audited
  further here since it's shared infrastructure, not domain-specific.

#### Gaps (Placement & recruiters)

1. **[broken]** `getRecruiterLogos()` (`src/lib/homepage.functions.ts:32-40`), used by the homepage and
   every college landing page, selects from `recruiters` with no `status`/`deleted_at` filter, and the
   table's own RLS SELECT policy (`Public read recruiters ... USING (true)`) also has no such filter.
   Archiving or trashing a recruiter in `/admin/recruiters` does **not** remove its logo from the homepage
   marquee or any `/colleges/[college]` page — only `/placement` and `/courses/[course]` (which use the
   properly-filtered `getAllRecruiters()`) respect the recruiter's status. Fix: add
   `.eq("status","published").is("deleted_at", null)` to `getRecruiterLogos()`, and consider tightening
   the RLS policy to match.
2. **[broken]** `AdminTnpHubPage`'s student-removal path does a hard `DELETE FROM placed_students`
   (`src/lib/placement.functions.ts:345`), and `placed_students` has no `deleted_at` column at all — this
   violates the repo's documented "soft delete, not hard delete" rule (`CLAUDE.md`) and means a removed
   placed-student record is unrecoverable and won't show up in Trash.
3. **[broken]** `savePlacementContent()` (`src/lib/placement.functions.ts:267-387`) performs ~10+
   sequential Supabase calls (upsert cell, read colleges, read existing students, N updates/inserts,
   1 bulk delete, read existing recruiters, N updates/inserts, 1 bulk soft-delete) with no transaction.
   A failure partway through (e.g. one student row fails validation) leaves the cell/earlier
   students/recruiters already committed while later ones are not — admins get a toast error but the data
   is already partially mutated, with no rollback and no indication of which parts succeeded.
4. **[misleading]** `20260729131000_add_placed_students_to_placement_cells.sql` is misleadingly named —
   it adds `hero_title`/`hero_subtitle` columns to `placement_cells`, not anything related to
   `placed_students`. Anyone searching migration history by filename for where the placed-students
   relationship was added will be misdirected.
5. **[misleading]** Two independent admin screens write the same `recruiters` row set:
   `/admin/tnp-hub` (Recruiters tab, via `savePlacementContent`) always re-numbers every row's
   `sort_order` by its position in the submitted array and forces `status='published'`, while
   `/admin/recruiters` (generic `AdminCrudManager`) lets an admin set `sort_order`, `status`,
   `website_url`, `department_id`, `college_codes`, and `metadata` directly. The next T&P Hub save
   silently overwrites `sort_order`/`status` for every recruiter row, discarding whatever was set via the
   other screen, with no warning to the admin in either UI that the two surfaces collide.
6. **[dead]** `recruiters.department_id` and `recruiters.college_codes` columns exist, are editable only
   through `/admin/recruiters`'s generic field editor, and are **0/288 populated** and **never read by any
   query** in the codebase. They look like the intended mechanism for scoping recruiter logos per
   college/department (which would fix gap #7 below) but were never wired up.
7. **[misleading]** Recruiter logos are identical on every `/colleges/[college]` page and every
   `/courses/[course]` page — there is no per-college or per-department filtering despite the schema
   having exactly the columns (`department_id`, `college_codes`) that would support it. A visitor on the
   nursing college page or the architecture course page sees the same 288-recruiter list as everyone
   else.
8. **[dead]** `placed_students.department_id` (932/1058 rows populated — likely set by a one-off
   script/import, not any admin UI) and `placed_students.package_lpa` (6/1058 populated) are only
   editable via `/admin/tables/placed_students`, a generic CRUD route that exists in code
   (`src/app/admin/(dashboard)/tables/[tableId]/page.tsx`) but has **no sidebar link anywhere**
   (`src/components/admin-next/AdminSidebar.tsx:76-77` only links `tnp-hub` and `recruiters`) — a
   non-technical admin (per project memory, admins are non-technical) has no discoverable way to reach it.
   `package_lpa` is also never read by any query, so even if populated it would do nothing — the
   "Highest/Average Package" stats on `/placement` are separate free-text fields in
   `placement_cells.metadata`.
9. **[dead]** `placement_cells` rows for `svica`, `svion`, `svit-coa`, `svit-degree` (4 of the 5 live
   rows) hold real-looking about-text copy but are **never read by any page** — `getPlacementContent()`
   hardcodes `.eq("college_code", OVERVIEW_CODE)` (`placement.functions.ts:168`), and
   `/placement/[college]` is a pure redirect to `/placement`. There is also no admin UI that edits these
   four rows (AdminTnpHubPage only ever upserts the `overview` row). This looks like a half-finished
   per-college placement pages feature that was abandoned in favor of the unified page, leaving stale
   content stranded in the DB.
10. **[dead]** `placement_cells.default_student_placeholder_url` column exists (added by
    `20260729133600_add_default_student_placeholder_url_to_placement_cells.sql`) but no admin field
    writes it and no website code reads it. Fully dead end-to-end.
11. **[dead]** `recruiters.website_url` is editable via `/admin/recruiters` but never read by any public
    page — the recruiter logo wall/marquee never links out to the recruiter's site.
12. **[dead]** `placed_students.college_id` is collected in the admin UI (as a college picker, resolved
    from `colleges.slug`) purely to satisfy the NOT NULL FK, but the public `/placement` page never
    displays which college a placed student belongs to (`PlacementPage.tsx` renders only name, company,
    batch, photo). The field exists only to make the write succeed, not to inform the visitor.
13. **[dead]** `cells` table (`supabase/migrations/20260812000000_phase0_baseline.sql:611-624`) — 0 rows,
    no admin route, no data-layer function, no code reference anywhere in `src/`. Fully-featured RLS
    (anon read, scoped write) and an `updated_at` trigger were built for a table nothing uses. Despite
    the similar name, it is unrelated to `placement_cells` (looks like a scaffolded-but-unused generic
    "campus cell" directory — grievance/women's/anti-ragging cell type content).
14. **[cosmetic]** `placement_cells` and `placed_students` have no `BEFORE UPDATE` trigger to refresh
    `updated_at` (unlike `recruiters`/`cells`, which both have `update_*_modtime` triggers calling
    `update_updated_at_column()`), and the app code never sets `updated_at` manually either — so
    `updated_at` on these two tables is frozen at row-creation time forever, which would mislead anyone
    using it to gauge content freshness (e.g. for a "last updated" audit).
15. **[cosmetic]** `recruiters.created_by`/`updated_by`/`deleted_by` have FKs to `user_profiles`, but
    neither admin UI (`AdminTnpHubPage`'s `savePlacementContent`, nor the generic `/admin/recruiters`
    editor) appears to populate them on write, so they're likely always null in practice despite being
    modeled as audit columns — not independently verified against a live write in this review, flagged
    for confirmation.
16. **[cosmetic]** `recruiters.department_id`/`college_codes` columns' origin isn't traceable to a
    specific incremental migration — they only appear in the full-schema `20260812000000_phase0_baseline.sql`
    dump, unlike every other column change in this domain which has its own dated `ALTER TABLE` file.
    Minor history gap, same class of issue as the already-documented `placement_cells` backfill.
17. **[misleading]** `GLOBAL_ONLY_ROUTE_PREFIXES` locks all three real placement admin screens to
    `scope_type = 'global'` users only, but the RLS write policies on `placement_cells`/`placed_students`/
    `recruiters` all read `is_global_admin() OR can_write_section('placement')` — i.e. the database would
    permit a scoped admin with a granted `placement` section to write directly via the Supabase client,
    but the admin UI's route guard never lets such a user reach a page to do so. The UI is stricter than
    the DB; if `can_write_section('placement')` is ever granted to a non-global role, there is currently
    no UI path for them to use it for this domain.


#### Verification corrections

A second, independent pass re-checked this section against the live code and database. Corrections:

- Lines 24-26 and gap #4 (lines 300-303): factually wrong. 20260729131000_add_placed_students_to_placement_cells.sql does NOT add hero_title/hero_subtitle — reading the file shows it adds a transitional `placed_students jsonb` column to placement_cells (matching its filename), which was later abandoned with no tracked DROP COLUMN migration (confirmed absent from live schema). hero_title/hero_subtitle were actually added by a different migration, 20260729150000_placement_full_setup.sql (STEP 0C). The real documentable issue is an orphaned jsonb column with no removal migration, not a misleading filename.
- Gap #16/line ~148-151, ~360-363: recruiters.college_codes origin IS traceable — 20260729150000_placement_full_setup.sql STEP 0F adds it via an explicit ALTER TABLE (`ADD COLUMN IF NOT EXISTS college_codes text[] DEFAULT ARRAY['overview']`). Only department_id's incremental migration remains unlocated in this pass; the claim that both columns are untraceable to incremental migrations is only half correct.
- Lines 208-214 ('Soft delete / trash / audit' section): the claim that recruiters/placed_students appearing in AdminTrashPage was only a 'grep hit... not confirmed wired end-to-end' understates what's actually there — both ARE in the SOFT_DELETE_TABLES array and the generic query at line 77 IS wired to run against them. For placed_students specifically this is wired but broken (no deleted_at column to query), which is a stronger, confirmed gap, not an open question — see the new gap filed above.
- Row counts (recruiters=288, placed_students=1058, placement_cells=5) and the recruiters.department_id/college_codes=0/288, placed_students.department_id=932/1058, package_lpa=6/1058 population figures were all re-verified live and are accurate as stated in the section.


---

## Homepage, settings, menus, media, site shell

Live Supabase project inspected directly via SQL (`information_schema`, `pg_policies`, `pg_constraint`, `pg_indexes`, `pg_tables`, `information_schema.triggers`) on 2026-10-03. Row counts and all column/constraint/policy/trigger data below are live, not read from migration files. Migration history was listed (`mcp__supabase__list_migrations`, 90 migrations) and diffed against the live shape; drift notes are called out per table.

---

### Homepage content items

**Summary**: `homepage_items` is a single flexible table holding every homepage content block (hero copy, carousel slides, stats, "why choose us" cards, campus-life tiles, trust badges, CTA promo cards, job listings) discriminated by `item_type`, with optional per-college/per-department scoping. The admin "Homepage Items" tab (`src/components/admin-next/pages/AdminHomepagePage.tsx:107-519`) does raw CRUD against this one table; the public homepage (`src/app/(site)/page.tsx`) fetches the global slice once and slices it client-side by `item_type`/`metadata.slot` via `byType`/`promoBySlot` (`src/lib/homepage.ts:15-27`).

#### `homepage_items`
- Row count (live): **88**. Soft-delete: yes (`deleted_at`/`deleted_by`). Status column: yes (`content_status` enum, default `published`). Audit columns: `created_at/by`, `updated_at/by`. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| `id` | uuid | no | `gen_random_uuid()` | PK | never edited | key only |
| `scope_type` | enum `scope_level` | no | `'global'` | `check_content_scope` (global⇒no dept/college id; department⇒dept id; college⇒college id) | implicit via "Scope" tab buttons, `AdminHomepagePage.tsx:244-260` | `homepage.functions.ts:10,74` filters (`getGlobalHomepageItems`, `getCollegeHomepageItems`) |
| `department_id` | uuid | yes | — | FK → `departments(id)` ON DELETE CASCADE | not exposed in the admin form (form only offers Global/College) | never read on site (no department-scoped homepage reader exists) |
| `item_type` | text | no | — | free text, admin restricts to a fixed list client-side only (`ITEM_TYPES`, `AdminHomepagePage.tsx:84`) — DB has no check constraint | `AdminHomepagePage.tsx` select, `item_type` field | `byType()` filter, `src/lib/homepage.ts:15` |
| `eyebrow` | text | yes | — | — | `AdminHomepagePage.tsx:355` (hero/carousel/promo/hero_slide/campus_life_tile) | `HeroNew.tsx:30`, carousel/campus-life rendering |
| `title` | text | no | — | — | `AdminHomepagePage.tsx:367` | `HeroNew.tsx:32`, stats value, why_choose title, trust badge label |
| `title_accent` | text | yes | — | — | hero only, `AdminHomepagePage.tsx:377` | `HeroNew.tsx:33` (italic accent word) |
| `subtitle` | text | yes | — | — | stat/why_choose/carousel/hero/promo, `AdminHomepagePage.tsx:389` | `HeroNew.tsx:34`, stats label (`StatsStrip`, `page.tsx:90`) |
| `body` | text | yes | — | — | why_choose/job/hero_slide/hero/promo/carousel, `AdminHomepagePage.tsx:401` | `WhySection` desc (`page.tsx:331`), `CTABannerSection` fallback subtitle |
| `image_url` | text | yes | — | — | `MediaUploader` on hero/carousel/promo/hero_slide/campus_life_tile, `AdminHomepagePage.tsx:423` | `HeroNew.tsx:42` fallback photo, carousel slide image |
| `icon_name` | text | yes | — | free-text Lucide name, no validation | why_choose/trust_badge/quick_link, `AdminHomepagePage.tsx:412` | `iconMap` lookup in `page.tsx:46-56`; unknown name silently falls back to `BadgeCheck` |
| `link_href` | text | yes | — | — | `AdminHomepagePage.tsx:432` | `HeroNew.tsx:37`, carousel CTA, campus-life tile link |
| `link_label` | text | yes | — | — | `AdminHomepagePage.tsx:446` (hidden for the CTA-banner promo item, see below) | `HeroNew.tsx:36`, carousel CTA label |
| `secondary_link_href` | text | yes | — | — | promo_card only, `AdminHomepagePage.tsx:461` | `CTABannerSection` secondary link (`page.tsx:397`) |
| `secondary_link_label` | text | yes | — | — | promo_card only, `AdminHomepagePage.tsx:470` | `CTABannerSection` secondary label |
| `sort_order` | integer | no | `0` | — | `AdminHomepagePage.tsx:483` | ordering in `getGlobalHomepageItems` query |
| `is_active` | boolean | no | `true` | — | checkbox, `AdminHomepagePage.tsx:499` | filtered `eq('is_active', true)` in `homepage.functions.ts:11` |
| `created_at`/`updated_at` | timestamptz | no | `timezone('utc', now())` | — | never edited | never shown |
| `created_by`/`updated_by` | uuid | yes | — | FK → `user_profiles(id)` ON DELETE SET NULL | set on insert (`AdminHomepagePage.tsx:207`) | never shown |
| `deleted_at`/`deleted_by` | timestamptz/uuid | yes | — | — | soft-delete on "Delete" (`AdminHomepagePage.tsx:220`) — **goes straight to `is('deleted_at', null)` filtering, no restore UI on this page** (Trash page handles restore generically) | filtered out everywhere (`is('deleted_at', null)`) |
| `status` | enum `content_status` | no | `'published'` | — | dropdown published/draft, `AdminHomepagePage.tsx:491` | `eq('status', 'published')` filter in all public readers |
| `metadata` | jsonb | no | `'{}'` | — | not directly editable — one card (the `home_cta_banner` promo) is matched by `metadata.slot`, set only via direct DB seed, not the admin form | `promoBySlot()` keys off `metadata.slot === 'home_cta_banner'` (`homepage.ts:19-27`); also `metadata.image_alt` read by `HeroNew.tsx:41` |
| `college_id` | uuid | yes | — | FK → `colleges(id)` ON DELETE CASCADE | College scope buttons, `AdminHomepagePage.tsx:252-260` | `getCollegeHomepageItems()` (`homepage.functions.ts:60-83`) — used by college landing pages |
| `pretitle` | text | yes | — | — | hero only, `AdminHomepagePage.tsx:339` | not read by `HeroNew.tsx` at all — **dead column on the homepage hero** (added in migration `20260808055934_add_pretitle_to_homepage_items`) |

- Indexes: `idx_homepage_items_scope (scope_type, department_id)`, `homepage_items_college_id_idx (college_id)`, PK on `id`.
- Constraints: `check_content_scope`, FKs as above. No unique constraint on `(item_type, scope_type, college_id, metadata->>slot)`, so nothing stops an admin creating two "hero" items for the same scope — the public reader just takes `items.find(... === "hero")`, i.e. the first by `sort_order, id`.
- Trigger: `update_homepage_items_modtime` (BEFORE UPDATE → `update_updated_at_column()`). **No audit-log trigger** on this table, unlike `homepage_sections`/`homepage_widgets` below — admin edits to homepage content are not recorded in `audit_logs`.
- RLS policies:
  - `Public read homepage_items` (SELECT, public, `true`) — world-readable regardless of status/scope; public-facing filtering is entirely client-side (`.eq('status','published')` etc. in the data layer), not enforced by RLS.
  - `Global insert/update/delete homepage_items` (public role, `is_global_admin() OR can_write_section('home_page')`) — so a user with only a `home_page` section grant (not a global/college/department scope role) can also write every row, including other colleges' scoped items; the UI's scope buttons are the only thing narrowing what they see, not RLS.
- Migration drift: none found — `20260728053331_placement_college_id_and_homepage_seed`, `20260728181533_fix_homepage_items_scope_constraint`, `20260728181610_seed_per_college_homepage_items`, `20260808055934_add_pretitle_to_homepage_items` together account for the live shape.

#### `homepage_sections` / `homepage_widgets` — dead tables
- Row counts (live): `homepage_sections` **1**, `homepage_widgets` **0**.
- Both have full soft-delete/status/audit columns, RLS enabled, a `check_content_scope` constraint (sections only), `update_*_modtime` triggers, **and** `audit_*_trigger` triggers wired to `process_audit_log()` (insert/update/delete) — unlike `homepage_items`, which has no audit trigger. So the schema clearly intends these two to be the "real" CMS layer (a page made of ordered sections, each with typed widgets) with `homepage_items` perhaps meant as the older/simpler model.
- **No application code reads or writes either table.** The only references in `src/` are generated types (`src/integrations/supabase/types.ts:1766,1852`) and two admin-infra lists that treat them generically: `AdminCrudManager.tsx:134` (a label map entry, `homepage_sections: 'title'`) and `AdminTrashPage.tsx:23-24` (lists them as trash-restorable table ids). There is no `/admin/tables/homepage_sections` route wired up via the sidebar/`admin-sections.ts`, and no public reader. The one live `homepage_sections` row is an orphan from the `20260728173739_schema_restructure` migration era.
- Treat as **dead**: a fully RLS'd, audited, indexed table pair with zero live usage.

---

### Site-wide settings (`app_settings`)

**Summary**: a single key→jsonb table used as a generic settings store. 16 keys live. Reads are public and used throughout the public site and admin; writes are gated by RLS per-row via `admin_section_id` (NULL ⇒ global-admin-only; set ⇒ also writable by a user with a matching section grant).

#### `app_settings`
- Row count (live): **16**. No soft-delete, no `status` column (every key is implicitly "live" the moment it's upserted). Audit columns: `updated_at`, `updated_by` only (no `created_at`/`created_by` — a key's first insert and every later edit look identical). RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| `key` | text | no | — | PK | fixed per form (`MISC_KEYS`, `HOME_POPUP_KEY`, `'contact_info'`, `'cta_button_label'`, `'hero_appearance'`) | lookup key in every reader |
| `value` | jsonb | no | — | — | per-key shape, see table below | per-key, see table below |
| `updated_at` | timestamptz | no | `now()` | — | set by every writer | never shown |
| `updated_by` | uuid | yes | — | FK → `user_profiles(id)` | set only by `home-popup-next.ts:34` — `site-settings-next.ts` and `theme-next.ts` writers **never set `updated_by`**, so "who last touched contact info / hero appearance / CTA label" is unrecoverable from this column even though the schema supports it | never shown |
| `admin_section_id` | uuid | yes | — | FK → `admin_sections(id)` | not settable from any UI — only `hero_appearance`'s row carries one (`home_page`, seeded by a migration); every other key's upsert omits the column so it stays NULL forever | drives RLS write-gating only |

Per-key inventory (live `key: value` shape, who edits, who reads):

| Key | Shape | `admin_section_id` | Writer (RLS gate) | Reader(s) |
|---|---|---|---|---|
| `hero_appearance` | `HeroAppearance` (opacity/blur/overlay numbers, `homepagePhotos: string[]`, `heroSliderEnabled`) | set → `home_page` | `theme-next.ts:9-33` (global admin or `home_page` section grant) | `theme.functions.ts:33-48`, used by `src/app/(site)/layout.tsx:12,32` (sets `--hero-text` globally) and homepage `HeroNew.tsx` |
| `home_popup` | `HomePopup` (admissions banner copy/links/image/date window) | NULL | `home-popup-next.ts:7-41` (**global-admin only** — section grant does *not* unlock this key despite living under the same "Homepage" admin page) | `home-popup.functions.ts:26-34`; rendered by `HomePopup.tsx` on the homepage only |
| `contact_info` | phone/email/address/office_hours/social_links/map iframe/etc. | NULL | `site-settings-next.ts:7-16` (global-admin only) | `site-settings.functions.ts:37-51`; `Header`, `Footer`, `DesktopUtilityBar`, contact/about pages |
| `admission_year`, `year_established`, `antiragging_email`, `it_support_email`, `ugc_helpline`, `og_description`, `og_image_url`, `meta_description`, `placement_percentage`, `recruiter_count`, `campus_size_acres`, `colleges_label`, `cta_button_label` (the `MISC_KEYS` set, `site-settings-types.ts:32-46`) | scalar (string/number) | NULL | `site-settings-next.ts:18-28` (`saveMiscSettings`, batch upsert) and `saveCtaButtonLabel` (`site-settings-next.ts:33-44`, separate so it doesn't clobber unsaved General Settings edits) — all global-admin only | `site-settings.functions.ts:53-82` (`getMiscSettings`); `admission_year`/`recruiter_count` feed `HeroNew`, `CTABanner`, `HomePopup` defaults; `colleges_label` feeds the homepage "Our {label}" heading (`page.tsx:163,180`); `placement_percentage`/`campus_size_acres` are stored but **only `meta_description` embeds them as text** — there's no live binding of `placement_percentage`/`campus_size_acres` into any rendered stat (the real homepage stats strip uses `getLiveStats()`, computed from content tables, not these settings) |
| `image_compression_mode` | `"client"` | NULL | no writer in `src/` at all | `CLAUDE.md`/code comments confirm server-side compression is non-functional; this setting is **read by nothing** — `upload-media-next.ts:59-72` always compresses client-side unconditionally, never consulting this key. Fully dead setting. |

- Constraints: PK `key`, FK `admin_section_id → admin_sections(id)`, FK `updated_by → user_profiles(id)`.
- Index: PK only (`app_settings_pkey`).
- Trigger: none (no `updated_at` trigger — every writer sets `updated_at` manually in its upsert payload; consistent, but means a direct SQL edit wouldn't bump it).
- RLS: `Public read app_settings` (SELECT, public, `true`); `Global admins can write app_settings` (ALL, `is_global_admin() OR (admin_section_id IS NOT NULL AND can_write_section(...))`) — correctly blocks writes to NULL-section keys (`home_popup`, `contact_info`, all `MISC_KEYS`) from anyone but a global admin, matching the client code comments that say as much.
- Migration drift: none — `20260730044306_app_settings`, `20260803074338_app_settings_global_admin_write_policy`, `20260730070141_drop_broad_app_settings_write_policy` account for the live RLS.

---

### Menus (`menus`, `menu_items`)

**Summary**: CMS-driven header/utility navigation. Two menus live (`main_navigation`, `top_navigation`), 22 items total. The admin editor (`AdminMenusPage.tsx`) does raw CRUD; the public reader (`menus.functions.ts`) returns a two-level tree (top items + children) per menu code.

#### `menus`
- Row count (live): **2**. Soft-delete/status/audit: yes/yes/yes. RLS: enabled.

| Column | Type | Null | Default | FK/check | Admin field | Website use |
|---|---|---|---|---|---|---|
| `id` | uuid | no | `gen_random_uuid()` | PK | — | join key |
| `name` | text | no | — | — | "New Menu" modal name field, `AdminMenusPage.tsx` (new-menu form, `newMenuValues.name`) | not shown (only `code` is queried by `menus.functions.ts:36`) |
| `code` | text | no | — | UNIQUE `unique_menu_code` | set at creation, free text defaulting to `'main'` (`newMenuValues: { code: 'main' }`) — **nothing stops creating a menu with a code other than `main_navigation`/`top_navigation`**, which would simply never render anywhere since `getMenuByCode` only looks up those two hardcoded codes (`menus.functions.ts:79-85`) | lookup key, `menus.functions.ts:37` |
| `created_at`/`updated_at` | timestamptz | no | `timezone('utc', now())` | — | n/a | never shown |
| `created_by`/`updated_by`/`deleted_at`/`deleted_by` | uuid/timestamptz | yes | — | FK → `user_profiles` | n/a | never shown |
| `status` | enum | no | `'published'` | — | not exposed in `AdminMenusPage` UI at all (new rows default `published`; nothing lets an admin set a menu to draft) | `getMenuByCode` filters `eq('status','published')` — consistent |
| `metadata` | jsonb | no | `'{}'` | — | not used | not used |

#### `menu_items`
- Row count (live): **22**. Soft-delete/status/audit: yes/yes/yes. RLS: enabled.

| Column | Type | Null | Default | FK/check | Admin field | Website use |
|---|---|---|---|---|---|---|
| `id` | uuid | no | `gen_random_uuid()` | PK | — | tree key |
| `menu_id` | uuid | no | — | FK → `menus(id)` ON DELETE CASCADE | selected menu tab | `menus.functions.ts:47` |
| `parent_id` | uuid | yes | — | FK → `menu_items(id)` ON DELETE SET NULL | parent picker in item form | groups top-level vs. child items (`menus.functions.ts:54-60`) |
| `title` | text | no | — | — | item form | `MenuTopItem.title`/`MenuLink.title`, rendered in `DesktopNavItem`, mega panels, `MobileNavPanel` |
| `link_type` | enum `link_type` | no | — | `menu_item_url_check`: `internal` ⇒ `page_id` required, `external` ⇒ `url` required | `itemFormValues.link_type` (admin default `'custom'` — **not a valid enum value**; see Gaps) | not read by the public query at all (`menus.functions.ts:46` selects `url` but not `link_type`) |
| `url` | text | yes | — | see above | item form "URL" field | `MenuLink.url`, used directly as the `<Link href>` target |
| `page_id` | uuid | yes | — | FK → `pages(id)` ON DELETE SET NULL | not exposed in `AdminMenusPage` form (only `url`) — so `link_type='internal'` can never actually be created from this UI even though the DB models it | never read by the public query |
| `icon` | text | yes | — | — | `itemFormValues.icon` free-text field in the admin item modal | **never selected or rendered anywhere on the public site** — `menus.functions.ts:46` doesn't fetch it, and no nav component reads an `icon` field off a menu item (`CampusMegaPanel.tsx:134`'s `c.icon` is a *different*, hardcoded category icon, not this column) |
| `sort_order` | integer | no | `0` | — | up/down arrows in admin list | `.order('sort_order')` |
| `permissions_required` | text[] | no | `'{}'` | — | not exposed in any admin UI | not read anywhere in `src/` |
| `visibility_rules` | jsonb | no | `'{}'` | — | not exposed in any admin UI | not read anywhere in `src/` |
| `created_at`/`updated_at`/`created_by`/`updated_by`/`deleted_at`/`deleted_by` | — | — | — | FK → `user_profiles` | standard | never shown |
| `status` | enum | no | `'published'` | — | not exposed (defaults published) | `menus.functions.ts:48` filters on it |
| `metadata` | jsonb | no | `'{}'` | — | not exposed in `AdminMenusPage`, but **is** the mechanism by which `getGlobalHomepageItems`'s cousin, `groupMenuChildren()` (`menus.functions.ts:88-102`), buckets `LinksMegaPanel` children by `metadata.group`, and how `HeroNew`/items read `metadata.image_alt`/`metadata.slot` elsewhere — for menu items specifically, `metadata.group` is seeded directly in migrations/seed SQL, not editable from `AdminMenusPage`'s form | `LinksMegaPanel` column grouping |
| `menu_type` | text | yes | `'simple'` | `menu_items_menu_type_check`: `simple|colleges_mega|campus_mega|placement_mega|links_mega` | not exposed in `AdminMenusPage`'s item form at all — only settable by direct SQL/migration | `Header.tsx:98-114` `megaFor()` switches on it; `placement_mega` is a **legal DB value with no case in `megaFor`** (falls to `default: null`, i.e. a top-level item typed `placement_mega` would render with no dropdown) and no live item currently uses it |

- Constraints/indexes: `unique_menu_code`, `menu_item_url_check`, `menu_items_menu_type_check`, FKs as above; `idx_menu_items_menu_id`.
- Triggers: `update_menus_modtime`, `update_menu_items_modtime` only — **no audit-log trigger** on either table (menu changes aren't recorded in `audit_logs`, unlike the dead `homepage_sections`/`homepage_widgets`).
- RLS: `menus`/`menu_items` both have "Public read" (SELECT, public, `true`) plus "Global write" (ALL, `authenticated`, `is_global_admin()`) — **no section-grant escape hatch** here (unlike `homepage_items`/`app_settings`'s `home_page` section), and no route-section mapping for `/admin/menus` either (`admin-sections.ts` lists it only under `GLOBAL_ONLY_ROUTE_PREFIXES`, absent from `ROUTE_SECTION_MAP`) — consistent end-to-end.
- Migration drift: `20260803081442_add_menu_type_to_menu_items`, `20260912093158_add_links_mega_menu_type` account for `menu_type`; live data matches.
- Current data (`main_navigation`): About SVIT / Admissions / Campus Life are `links_mega`/`campus_mega` parents; Colleges is `colleges_mega`; Placement is a plain `simple` top-level link (no mega panel, despite `placement_mega` existing in the schema). `top_navigation`: Parents, Alumni, Careers (flat, no children) — rendered by `DesktopUtilityBar`.

---

### Media (`media_files`, `media_folders`, storage)

**Summary**: `media_files`/`media_folders` model a folder-tree media library with a full admin UI (`AdminMediaPage.tsx`), but **every other upload path in the admin panel (hero photos, popup images, homepage item images, logos, staff photos, etc.) uploads straight to Supabase Storage via `uploadMediaFile()`/`MediaUploader` and never inserts a row into `media_files`.** The two systems are disconnected.

#### `media_files`
- Row count (live): **0**. Soft-delete/status/audit: yes/yes/yes. RLS: enabled.

| Column | Type | Null | Default | FK/check | Admin field | Website use |
|---|---|---|---|---|---|---|
| `id` | uuid | no | `gen_random_uuid()` | PK | — | — |
| `scope_type` | enum | no | `'global'` | `check_content_scope` | folder/file scope at upload time, `AdminMediaPage.tsx` (`payload.scope_type`) | not read on the public site (table has no public reader at all) |
| `department_id` | uuid | yes | — | FK → `departments(id)` CASCADE | scoped upload | — |
| `folder_id` | uuid | yes | — | FK → `media_folders(id)` ON DELETE SET NULL | current folder | — |
| `filename` | text | no | — | — | set from the uploaded file's name | — |
| `file_path` | text | no | — | UNIQUE | storage object path | — |
| `mime_type` | text | no | — | — | from file | — |
| `file_size` | integer | no | — | — | from file | — |
| `alt_text` | text | yes | — | — | editable in file-detail modal (`altText` state) | — |
| `caption` | text | yes | — | — | editable in file-detail modal (`caption` state) | — |
| `tags` | text[] | no | `'{}'` | — | not exposed in UI | — |
| `created_at`/`updated_at`/`created_by`/`updated_by`/`deleted_at`/`deleted_by` | — | — | — | FK → `user_profiles` | standard | — |
| `status` | enum | no | `'published'` | — | not exposed | — |
| `metadata` | jsonb | no | `'{}'` | — | not exposed | — |

Because this table is always empty, **every column above is currently inert in production** — the Admin → Media Library page always renders "no files" at the root, even though the `media` storage bucket almost certainly holds real uploaded images (hero photos, popup posters, homepage item images — all go through `MediaUploader`/`uploadMediaFile`, `upload-media-next.ts:26-73`, which talks to `supabase.storage.from('media').upload(...)` directly and **never calls `.from('media_files').insert(...)`**).

#### `media_folders`
- Row count (live): **0**. Same soft-delete/status/audit shape as `media_files`. Unique indexes `unique_folder_parent_global` / `unique_folder_parent_dept` prevent duplicate sibling names. Same disconnect: the folder-create UI (`handleSaveFolder`, `AdminMediaPage.tsx`) works and would insert correctly, but nothing has ever used it in production (0 rows).

#### Storage (`media` bucket)
- Bucket `media`: public, no file-size limit, no MIME allowlist set at the bucket level (size/type checks, where they exist, are client-side only — `MediaUploader.tsx` rejects HEIC and shows "up to 10MB" as a label with no enforced limit; `uploadMediaFile` doesn't check size at all).
- `storage.objects` policies (bucket-scoped to `media`): public SELECT (world-readable); INSERT allowed to **any authenticated Supabase user** (`auth.role() = 'authenticated'`, not `is_global_admin()` or any admin check) — since only admin-panel accounts exist as authenticated users today this isn't exploitable by the public, but it means any authenticated role (any admin, any scope) can upload to the shared `media` bucket root; UPDATE/DELETE restricted to the object's `owner` or a global admin.
- Other buckets seen live: `gallery`, `staff-photos` (both public) — out of this domain's scope but noted since they're siblings of `media`.
- `uploadMediaFile()` (`upload-media-next.ts:59-73`): routes through `@jsquash/*` client-side compression (`compressImageFile`), falling back to the raw file on any compression error; non-image files upload raw. Filenames are `${folderPrefix}${Date.now()}-${random6}.ext`. No thumbnailing, no `media_files` row, no folder association — uploads are simply flat objects under e.g. `images/`, `logos/` prefixes inside the `media` bucket.

---

### Redirects (`redirects`) — dead table, shadowed by `next.config.ts`

#### `redirects`
- Row count (live): **0**. Soft-delete/status/audit: yes/yes/yes. RLS enabled: `Authenticated read redirects` (SELECT, authenticated — **not public**) + `Global write redirects` (ALL, `is_global_admin()`).
- Columns: `id` (PK), `source_path`/`target_path` (text, not null), `status_code` (int, default 301, `CHECK IN (301,302,307,308)`), `UNIQUE(source_path)`, standard audit/soft-delete/status/metadata columns, trigger `update_redirects_modtime`.
- **No code in `src/` references this table at all** (no admin UI route, no public reader, not even in generic `AdminCrudManager`/`AdminTrashPage` lists). All real redirects are hardcoded in `next.config.ts:59-72` (`/campus-life/clubs`, `/student-corner`, `/student-corner/coe`, `/about/facilities`, `/campus`, `/alumni` → external alumni portal). The table is pure dead schema: even if an admin could reach it, nothing would ever read a row from it to actually redirect a request.

---

### Site shell: layout, header, footer, hero system

**Summary**: `src/app/(site)/layout.tsx` is the single fan-out point loading nav, contact/misc settings, hero appearance, and several content lists (departments/facilities/clubs/events/sports/centers) for `Header`/`Footer`/mega panels on every public page. The homepage (`src/app/(site)/page.tsx`) separately loads homepage items, colleges, recruiters, latest events, posts, live stats and the popup.

**Website — layout.tsx** (`src/app/(site)/layout.tsx:20-46`): runs 12 queries in parallel, each wrapped in `.catch(() => fallback)` per the project's documented degrade-not-500 pattern. Notably it does **not** load `getGlobalHomepageItems`/hero items — only the homepage route itself (`page.tsx`) does, so the hero's own per-item fields (`pretitle`, `eyebrow`, etc.) are only available on `/`.

- **Header** (`Header.tsx`): fixed/floating navbar; desktop renders `DesktopUtilityBar` (top_navigation + contact), the main nav with `megaFor()` dispatch, and `SiteSearch`; mobile renders `MobileUtilityBar` + `MobileNavPanel`. `displayColleges` filters out colleges with `show_in_navigation === false` and maps `nav_label ?? code` for the short badge (`Header.tsx:69-80`).
- **Footer** (`Footer.tsx`): **"Quick Links" and "Important" link lists are hardcoded arrays** (`Footer.tsx:43-55`: About Us, Admissions, Campus Life, Placement, News & Events / Anti-Ragging, Grievance Redressal, Downloads, Careers), not sourced from the `menus` table at all, despite `menus`/`menu_items` existing specifically to drive site navigation. An admin cannot edit the footer's link list from anywhere in the admin panel. `socialIconMap` (`Footer.tsx:19-25`) only maps `Facebook`, `Instagram`, `LinkedIn`, `Youtube` — the live `contact_info.social_links` includes a `"Twitter"` entry (seen in the live `app_settings` row), which has no matching icon key and is silently dropped from the footer, even though the admin Settings page presumably lets an admin add arbitrary platform keys to `social_links`.
- **HeroNew / HeroPhotoLayer** (`HeroNew.tsx`, `HeroPhotoLayer.tsx`): homepage-only full-bleed photo hero. Falls back to a single hardcoded Supabase Storage URL (`DEFAULT_IMAGE_URL`, `HeroNew.tsx:12-13`) if both `hero_appearance.homepagePhotos` and the `hero` item's `image_url` are empty — a hardcoded fallback image baked into source, acceptable as a last-resort default but worth flagging as non-CMS content. `HeroPhotoLayer` supports "marquee" (homepage) and "fade" (college/other pages) transitions, retries a failed `<Image>` load up to 3 times (cold CDN cache workaround), and the "Homepage Blur"/"Homepage Gradient Opacity" controls (`heroFadeStyles`, `theme.ts:71-94`) are **separate settings from "Background Blur"/"Overlay Intensity"** (`heroOverlayStyles`, `theme.ts:43-62`) that only apply to college-page heroes (`overlayBlur={false}` is passed explicitly for the homepage, `HeroNew.tsx:57`) — two blur systems live in one `HeroAppearance` object, easy for an admin to confuse via the single "Hero Appearance" panel.
- **HomePopup** (`HomePopup.tsx`): client-side gate on `isHomePopupLive()` (date window) since the homepage itself isn't guaranteed to be freshly rendered; `sessionStorage`/`localStorage` keys gate "seen" and "pill pulse" state. GA4 `track()` calls `window.gtag` directly (optional chaining — no-ops if GA4 isn't configured).
- **MobileUtilityBar**: logo + search + hamburger only; no utility-nav links shown on mobile here (they live inside `MobileNavPanel` instead).
- **CTABanner**: generic component; on the homepage it's fed by the one `promo_card` item tagged `metadata.slot === 'home_cta_banner'` — if that item is ever deleted, `CTABanner` silently falls back to its hardcoded default copy ("Ready to Shape Your Engineering & Architectural Career?", `CTABanner.tsx:22`), which an admin would have no way to know is not CMS content once the promo card disappears.
- **SiteSearch**: client-only, loads `public/search-index.json` lazily on first open (`SiteSearch.tsx:44-54`), fuzzy-matches via Fuse.js. Cmd/Ctrl+K opens it globally.

---

### Site-wide plumbing

- **`middleware.ts`**: runs on every non-asset route (matcher excludes `_next/static`, `_next/image`, `favicon.ico`, and common image extensions), refreshes the Supabase session via `getClaims()`. No homepage/menu/settings-specific logic here.
- **`next.config.ts`**: `output: "standalone"` (skipped on Vercel), `images.remotePatterns` locked to `*.supabase.co` with `dangerouslyAllowLocalIP: true` (documented DNS64 workaround), `typedRoutes: false` (documented as temporary during the route port), `redirects()` hardcodes the 6 legacy-URL redirects described above (the live, actually-used redirect source — not the dead `redirects` table).
- **Caching/revalidation**: grepped for `revalidate`, `unstable_cache`, `revalidatePath`/`revalidateTag` and `dynamic =` across `src/app/(site)` and the homepage/menu/settings data-layer files — **none found**. Every public page in this domain is a plain `async` Server Component doing a fresh Supabase read per request (no ISR, no explicit `force-dynamic`/`force-static`, no tag-based invalidation). This matches CLAUDE.md's "avoid caching that produces stale content" instruction by simply not caching at all here, but it also means there is no cache-invalidation story to audit — correctness depends entirely on Supabase round-trip latency per request.
- **`scripts/build-search-index.ts`**: contradicts the project's own `CLAUDE.md`, which describes it as something that "crawls a *running* server". The script's own header comment (`scripts/build-search-index.ts:3-9`) explicitly says the opposite: it builds entries **directly from Supabase** (colleges, departments, programmes, gallery albums, clubs, events, centers, facilities) plus a hardcoded `STATIC_ENTRIES` array for pages with no DB-backed content, specifically *because* a live-server crawl can't run inside Vercel's build sandbox. This is a real doc/code drift worth fixing in `CLAUDE.md`, not a code bug. Output: `public/search-index.json`, read lazily by `SiteSearch.tsx`.
- **GA4**: `NEXT_PUBLIC_GA4_ID` env var, loaded in `src/app/layout.tsx:9,37-49` only if set (conditional `<Script>` tags for `gtag.js` + inline init). `HomePopup.tsx:42-45` fires custom `gtag` events for popup opens/clicks, no-op if GA4 was never initialized. No other GA4 usage found in this domain.

---

### Hardcoded content inventory (this domain)

| Location | What's hardcoded | Why it matters |
|---|---|---|
| `Footer.tsx:43-55` | "Quick Links" / "Important" link lists | Can't be edited from the admin panel despite a CMS `menus` table existing for exactly this purpose |
| `Footer.tsx:19-25` | `socialIconMap` (4 platforms) | Drops any `social_links` entry (e.g. `Twitter`, seen live) whose key isn't in this fixed map |
| `HeroNew.tsx:12-13` | `DEFAULT_IMAGE_URL` fallback photo | Last-resort only, but it's a real production image baked into source, not configurable |
| `CTABanner.tsx:22-27` | Default title/subtitle/button copy | Silent fallback if the `home_cta_banner` promo item is ever deleted |
| `menus.functions.ts:79-85` | Menu codes `main_navigation`/`top_navigation` | Any menu created with a different `code` in the admin UI is unreachable from the public site |
| `next.config.ts:59-72` | 6 legacy-URL redirects | Lives in code, not the (dead) `redirects` table — fine as an architecture choice, but means "redirects" in the admin sense don't exist at all |

---

#### Gaps (Homepage, settings, menus, media, site shell)

1. **[broken] Media Library is completely disconnected from real uploads.** `media_files`/`media_folders` have 0 live rows and a full admin CRUD UI (`AdminMediaPage.tsx`), but every actual upload path in the admin panel (`MediaUploader.tsx` → `upload-media-next.ts:uploadMediaFile`) writes straight to the `media` storage bucket and never inserts a `media_files` row. The Media Library page will always show "no files" no matter how many images admins upload elsewhere, making it actively misleading about what media exists.
   - *Fix*: either have `uploadMediaFile()` also insert a `media_files` row (file_path/filename/mime/size/folder), or remove/relabel the Media Library page so it isn't presented as a working asset catalog.

2. **[dead] `homepage_sections` + `homepage_widgets` are fully-built, RLS'd, audit-triggered tables with zero code paths reading or writing them.** Only generic admin-infra lists (`AdminCrudManager.tsx:134`, `AdminTrashPage.tsx:23-24`) and generated types reference them. 1 orphan row exists in `homepage_sections` from a past migration.
   - *Fix*: drop the tables (with a migration) or wire up the intended section/widget page builder; right now they're silent dead weight that could confuse anyone reading the schema into thinking the homepage is section/widget-driven.

3. **[dead] `redirects` table has no reader or admin UI anywhere in `src/`.** All real redirects are hardcoded in `next.config.ts:59-72`. The table (with RLS, status_code check, unique source path) is pure unused schema.
   - *Fix*: drop it, or build the admin UI + a `redirects()` reader that merges DB rows into `next.config.ts`'s static list (requires a build-time or edge read since Next's `redirects()` can't hit Supabase per-request without middleware).

4. **[misleading] `scripts/build-search-index.ts` contradicts CLAUDE.md.** CLAUDE.md describes it as crawling "a *running* server"; the script itself says explicitly it builds directly from Supabase + a hardcoded static-page list because a live crawl can't run in Vercel's build sandbox.
   - *Fix*: update CLAUDE.md's one-line description.

5. **[misleading] Footer's nav links are hardcoded, not CMS-driven**, despite `menus`/`menu_items` existing and being the stated mechanism for site navigation (CONTEXT.md glossary references "menus"). An admin changing the header's "About"/"Admissions" labels via `/admin/menus` has no way to also change the Footer's matching hardcoded list — the two can silently drift apart (e.g. Footer still says "News & Events" if the menu item is ever renamed).
   - *Fix*: either drive Footer from a `menus` row (e.g. a `footer_navigation` menu code) or document explicitly that Footer is intentionally static.

6. **[misleading] `contact_info.social_links` silently drops unknown platforms.** The live data has a `"Twitter"` entry; `Footer.tsx`'s `socialIconMap` only has `Facebook`/`Instagram`/`LinkedIn`/`Youtube`, so the Twitter icon/link never renders even though an admin set it in Settings and presumably believes it's live.
   - *Fix*: add a generic fallback icon for unmapped platforms, or restrict the Settings form to only the platforms Footer actually supports.

7. **[misleading] `homepage_items.pretitle` is editable in the admin "Hero" form (`AdminHomepagePage.tsx:339-347`) but never read by `HeroNew.tsx`** — an admin can type a pretitle, save it successfully, and it will never appear anywhere on the live hero.
   - *Fix*: either render `pretitle` in `HeroNew.tsx` (it was clearly added for this, see migration `20260808055934_add_pretitle_to_homepage_items`) or remove the field from the admin form.

8. **[misleading] `menu_items.icon` is a real, editable admin field (`itemFormValues.icon` in `AdminMenusPage.tsx`) that is never selected or rendered by the public menu reader** (`menus.functions.ts:46` omits `icon` from its `select()`, and no nav component reads it). An admin setting an icon on a nav item sees no effect.
   - *Fix*: either select+render `icon` in `DesktopNavItem`/mega panels, or remove the field from the admin form.

9. **[dead] `menu_items.permissions_required` and `visibility_rules` columns exist with defaults/RLS but are never read or written anywhere in `src/`.** No admin UI exposes them either.
   - *Fix*: drop the columns, or implement role-based nav-item visibility if that was the original intent.

10. **[dead] `menu_items.menu_type = 'placement_mega'` is a legal DB value with no corresponding case in `Header.tsx`'s `megaFor()` switch** (`Header.tsx:98-113` only handles `links_mega`/`colleges_mega`/`campus_mega`; `placement_mega` falls to `default: null`). No live item currently uses it, but nothing stops an admin from setting it (if the DB constraint were the only form of validation — in practice the admin form doesn't even expose `menu_type` for editing, see #11).
    - *Fix*: either add a Placement mega-panel case or drop the enum value until one exists.

11. **[misleading] `menus`/`menu_items`' most structurally important fields — `menu_type`, `page_id`/`link_type` (internal links), `status` — are not exposed in `AdminMenusPage`'s item form at all.** The form only edits `title`, `url`, `icon` (dead, see #8), `sort_order`, `parent_id`. `menu_type` (which selects the mega-panel), `link_type`/`page_id` (internal-link targeting), and per-item `status` can only be set by direct SQL/migration, meaning the admin UI cannot actually create a new mega-panel item or an internal (page-linked) item — the two most powerful features of the schema are admin-inaccessible.
    - *Fix*: extend `AdminMenusPage`'s form to cover `menu_type`, `link_type`+`page_id`, and `status`.

12. **[dead] `app_settings.image_compression_mode` key has no writer in the codebase and is never read** — `upload-media-next.ts` always compresses client-side regardless of this setting's value (CLAUDE.md itself notes server-side compression is "non-functional," but the stale setting key still exists live and could mislead someone into thinking it's a working toggle).
    - *Fix*: delete the row, or remove any remaining UI that implies it's configurable (none currently found, but worth a grep before closing this out).

13. **[cosmetic] `app_settings.updated_by` is only ever set by the `home_popup` writer** (`home-popup-next.ts:34`); `theme-next.ts`, `site-settings-next.ts` never populate it, so "who last changed the hero appearance / contact info / misc settings" can't be audited from this column even though the schema supports it.
    - *Fix*: have all `app_settings` writers set `updated_by` consistently.

14. **[cosmetic] `AdminMenusPage`'s new-item default `link_type: 'custom'`** (seen in its initial `itemFormValues`) **is not a valid `link_type` enum value** (the DB check only allows `internal`/`external`) — since the form never actually submits `link_type` in its save payload (it's not wired to an input), this has had no live effect so far, but it's a latent trap if the field is ever wired up without noticing the mismatch.
    - *Fix*: align the default with the enum (`'external'`, matching what the form's `url` field actually produces).

15. **[cosmetic] Two independently-tunable "blur" concepts share the `HeroAppearance` type and one admin panel** (`heroBlurPx`/`heroOverlayOpacity` for college-page heroes vs. `homepageBlurPx`/`homepageGradientOpacity` for the homepage specifically, `theme.ts:43-94`), both edited from the same "Hero Appearance" tab (`HeroAppearancePanel.tsx`). Easy for a non-technical admin to adjust the wrong slider and see no effect on the page they're trying to change.
    - *Fix*: label the two groups more clearly as "Homepage hero" vs. "Other page heroes" in the panel (may already be partially done — worth a UI pass, not a data-layer fix).


#### Verification corrections

A second, independent pass re-checked this section against the live code and database. Corrections:

- Gap #11 overstates the admin form's gaps: it claims 'menu_type, page_id/link_type (internal links), status are not exposed in AdminMenusPage's item form at all' and 'The form only edits title, url, icon (dead), sort_order, parent_id.' This is wrong for link_type specifically — AdminMenusPage.tsx has a bound 'Link Type' <select> (lines 461-472) and includes `link_type: itemFormValues.link_type` in the save payload (line 150). Only menu_type, page_id, and status are truly absent from the form.
- Gap #14 mischaracterizes the link_type default as a harmless latent trap, stating 'the form never actually submits link_type in its save payload (it's not wired to an input), this has had no live effect so far.' This is factually wrong and understates severity: link_type IS wired to a select input and IS submitted on every insert/update (AdminMenusPage.tsx:150). Because the select's only options are 'custom'/'page' — neither a valid value of the live Postgres enum `link_type` (confirmed via `enum_range(NULL::link_type)` = {internal,external}) — every attempt to create a new menu item via this form fails with a database enum-type error. This should be reclassified from [cosmetic] to [broken] and merged with a new gap describing the create-item failure.
- The section's row counts for media_files (0), media_folders (0), homepage_sections (1), homepage_widgets (0), redirects (0), app_settings (16), menu_items (22), menus (2), and homepage_items (88) were all independently re-queried and match exactly — no correction needed there.


---

## About pages, campus life, admissions info

This domain is the least "table per feature" part of the schema: most of the free-text About
content (chairman/principal messages, mission/vision, history, accreditation prose, facilities
blurbs) lives as one giant JSON blob in a single `pages` row, while the more list-like entities
(board members, committees, accreditations, MOUs, downloads, centers, clubs, sports, scholarships)
each get their own small table. All ten tables are edited through the **same generic admin screen**
(`AdminCrudManager`, driving `/admin/tables/[tableId]`) except Sports and Scholarships, which have
purpose-built pages. Several tables skip the soft-delete contract entirely even though they have the
columns for it, and one (`scholarships`) skips it at the schema level too — see Gaps.

### Pages (CMS JSON blob)

**Summary**: `pages` is a generic CMS table (title/slug/content/parent/SEO), but in practice only 2
rows exist and both are consumed as typed JSON documents, not as "content" (the `content` text column
is unused/null on both). The `about` row's `metadata` column holds the entire About section's copy —
hero, history, mission, leadership quotes, accreditation prose, facilities blurbs, media/contact info —
as one nested object (`AboutPageData`, `src/lib/pages.functions.ts:4-58`). The `alumni` row exists but
nothing on the live site reads it.

#### `pages`
- Row count (live): 2. Soft-delete: yes (`deleted_at`/`deleted_by` present, but unused — see Gaps).
  Status: `content_status` enum (`draft`/`published`/`archived`), default `draft`. Audit columns:
  `created_by`/`updated_by`/`deleted_by` (FK `user_profiles`) plus an `audit_pages_trigger` AFTER
  INSERT/UPDATE/DELETE trigger calling `process_audit_log()` — this is the only table in this domain
  with a real audit-log trigger. RLS enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | generic grid, read-only | — |
| title | text | NO | — | — | AdminCrudManager text field | page `<title>`/heading — not actually rendered for `about`/`alumni` (consumers only read `metadata`) |
| slug | text | NO | — | UNIQUE `unique_page_slug`; CHECK `slug_format` (`^[a-z0-9]+(-[a-z0-9]+)*$`) | text field | lookup key: `getAboutPage()` filters `slug = 'about'` (`src/lib/pages.functions.ts:68`) |
| content | text | YES | — | — | textarea | never read by any component in this domain (0/2 rows populated) — dead column for these rows |
| parent_id | uuid | YES | — | FK `pages.id` (self), ON DELETE SET NULL | FK dropdown | never used (both rows are top-level) |
| is_homepage | boolean | NO | false | — | checkbox | never used by this domain (homepage is driven by `homepage_sections`/`homepage_items`, not `pages`) |
| seo_id | uuid | YES | — | FK `seo_metadata.id`, ON DELETE SET NULL | FK dropdown | `seo_metadata` has 0 rows — field is always empty, never affects `<head>` |
| created_at / updated_at | timestamptz | NO | now() | — | read-only | — |
| created_by / updated_by / deleted_by | uuid | YES | — | FK `user_profiles.id`, SET NULL | read-only | audit trail only |
| deleted_at | timestamptz | YES | — | — | set via Trash page | **not checked** by `getAboutPage()` — see Gaps |
| status | content_status enum | NO | 'draft' | enum | dropdown | `getAboutPage()` requires `status = 'published'` |
| metadata | jsonb | NO | '{}' | — | **raw JSON textarea** (`AdminCrudManager.tsx:1060-1062`) | entire `AboutPageData` tree — see below |
| page_type | text | YES | — | — | text field | not read by any consumer found (free-form label: `'about'`, `'alumni'`) |
| schema_version | integer | YES | 1 | — | number field | not read by any consumer found |

- Constraints: `pages_pkey`, `unique_page_slug` (UNIQUE slug), `slug_format` CHECK, 4 FKs to
  `user_profiles`/`pages`/`seo_metadata` (all `ON DELETE SET NULL`).
- RLS policies: `Anon SELECT` (anon, `true`), `Authenticated read pages` (authenticated, `true`),
  `Global write pages` (ALL, authenticated, `is_global_admin()`). No scope-aware write policy — only
  global admins can ever write to `pages`, which matches `GLOBAL_ONLY_ROUTE_PREFIXES` including
  `/admin/tables/pages` (`src/lib/admin-sections.ts:9`).
- Triggers: `update_pages_modtime` (BEFORE UPDATE, sets `updated_at`), `audit_pages_trigger`
  (AFTER INSERT/UPDATE/DELETE, writes to `audit_logs`).
- Migration drift: not checked line-by-line against `supabase/migrations/*.sql` (time-boxed); the
  `audit_logs` write path and `content_status` enum are present and consistent with the documented
  pattern in `CLAUDE.md`.

**`AboutPageData` shape** (`src/lib/pages.functions.ts:4-58`), all nested under `pages.metadata` for
the single `slug = 'about'` row: `hero` (accent/title/introText/portraitUrl), `quickFacts[]`,
`coreValues[]`, `history` (introText, `milestones[]`, closingText), `vision.visionText`,
`mission.missionPoints[]`, `leadership` (intro, `chairman` quote/name/title/strategicPlanText/
corePrinciples, `principal` quote/name/title/bodyText, `boardOfManagement[]` — **unused**, see Gaps),
`accreditation` (recognitions[], nbaText, nirfText, aicteText, academicRegulationsText,
regulationPoints[], mandatoryDisclosureText, codeOfConductPoints[], relatedDocuments[]), `facilities`
(intro, library, scholarships[] — **unused, duplicate of the real `scholarships` table**, sports,
nssNcc[], hostelsTransport, itMedical[]), `media` (intro, publications[], socialMedia[]), `contact`.

**Admin**: Route `/admin/tables/pages`, global-only (`isGlobalOnlyRoute`). Rendered by the generic
`AdminCrudManager` (`src/components/admin-next/AdminCrudManager.tsx`) via the `get_table_schema_info`
Postgres RPC — there is no purpose-built "edit the About page" form. To change the Chairman's Message,
mission points, or accreditation prose, an admin opens the `pages` row with slug `about` and edits the
entire `AboutPageData` tree by hand inside one `<textarea>` of raw JSON
(`AdminCrudManager.tsx:1060-1062`, `JSON.stringify(formValues.metadata, null, 2)`), then pastes it
back. No field-level validation, no sub-editor for the ~15 nested sections. Only `is_global_admin()`
can write (RLS). No import, no CSV path for this table.

**Data layer**: `src/lib/pages.functions.ts` — one function, `getAboutPage()`, used directly by 7
route files. No caching/revalidation beyond Next's default fetch behavior; `layout.tsx`/page files
wrap it in `.catch(() => null)`.

**Website**: `getAboutPage()` is called independently (not shared/memoized) by: `about/layout.tsx`,
`about/accreditation/page.tsx`, `about/principal-message/page.tsx`, `about/history-vision-mission/page.tsx`,
`about/chairman-message/page.tsx`, `about/board-of-management/page.tsx`, `about/media/page.tsx` — 7
separate Supabase round-trips per full crawl of `/about/*` instead of one shared fetch (minor
inefficiency, not a correctness bug since Next dedupes identical `fetch` calls only, and this uses the
Supabase client, not `fetch`, so there is no dedup). `alumni` row: no route consumes it — dead.

**Storage/media**: `hero.portraitUrl` and other image URLs inside `metadata` are plain Supabase Storage
URLs typed by hand into the JSON textarea — they do not go through the client-side compression pipeline
(`src/lib/image-compression.ts`) that other admin upload fields use, since there is no dedicated upload
control for this JSON blob.

### Board of Management

**Summary**: Trustees shown on `/about/board-of-management`. Simple list table, generic CRUD admin.

#### `board_members`
- Row count (live): 17. Soft-delete: yes (`deleted_at`/`deleted_by`), but **not enforced on read** —
  see Gaps. Status: `content_status` enum, default `published`. Audit columns: `created_by`/`updated_by`.
  RLS enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | — | React key |
| college_id | uuid | NO | — | FK `colleges.id` | FK dropdown | not used by `getAllBoardMembers()` (no college filter — trustees are shown group-wide) |
| name | text | NO | — | — | text field | member name + initials fallback avatar |
| designation | text | NO | — | — | text field | member role label |
| photo_url | text | YES | — | — | image upload (generic) | avatar, falls back to initials circle if null |
| sort_order | integer | NO | 0 | — | number field | `ORDER BY sort_order ASC` |
| status | content_status enum | NO | 'published' | enum | dropdown | must be `published` to show |
| metadata | jsonb | NO | '{}' | — | JSON textarea | never read on the site |
| created_at / updated_at | timestamptz | NO | now() | — | read-only | — |
| created_by / updated_by | uuid | YES | — | FK `user_profiles.id` | read-only | audit only |
| deleted_at / deleted_by | timestamptz/uuid | YES | — | FK `user_profiles.id` | set by Trash | **not filtered** by the public query |

- Constraints: PK, 3 FKs to `colleges`/`user_profiles` (no `ON DELETE` cascade behavior specified on
  `college_id`, i.e. default `NO ACTION` — deleting a college would be blocked while trustees reference it).
- RLS: `Anon SELECT`/`Authenticated read board_members` (`true`), `Global insert/update/delete
  board_members` (`is_global_admin() OR can_write_section('about_us')`).
- Triggers: none captured in this query beyond the shared `update_*_modtime` pattern — note:
  **no `update_board_members_modtime` trigger was found**, unlike every sibling table in this domain
  (accreditations, centers, committees, downloads, mous, student_clubs all have one). `updated_at` on
  `board_members` is therefore never bumped by the database on UPDATE; only app code setting it
  explicitly would change it.

**Admin**: `/admin/tables/board_members`, global-only route, generic `AdminCrudManager` grid (no
`TABLE_CONFIGS` override — plain field list). Writable only by `is_global_admin()` or a user with the
`about_us` section grant.

**Data layer**: `src/lib/board-members.functions.ts` — `getAllBoardMembers()` only, filters
`status = 'published'`, no `deleted_at` check.

**Website**: `/about/board-of-management/page.tsx` renders photo-or-initials cards; also reads
`getAboutPage().leadership.intro` for the intro paragraph (mixing the `pages` JSON blob with the real
table on one page). `boardOfManagement[]` inside `AboutPageData.leadership` is a second, unused copy
of this same data (dead JSON field — nothing reads `c.leadership.boardOfManagement`).

### Committees

**Summary**: Governance committees (Women Development Cell, Grievance Redressal, IQAC, etc.) on
`/about/committees`. Essentially all content lives in `metadata`, not typed columns.

#### `committees`
- Row count: 5. Soft-delete: yes, not enforced on read. Status: `content_status`, default `published`.
  RLS enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | — | key |
| college_id | uuid | NO | — | FK `colleges.id` | FK dropdown | `getCommitteesByCollege()` exists but `/about/committees` calls `getAllCommittees()` (no college filter) — multi-college scoping is defined but unused by the only page that renders this table |
| name | text | NO | — | — | text field | heading |
| slug | text | NO | — | — | text field | `getCommitteeBySlug()` exists but **no route calls it** — dead function/no detail pages |
| created_at / updated_at | timestamptz | NO | now() | — | read-only | — |
| created_by / updated_by | uuid | YES | — | FK `user_profiles.id` | read-only | — |
| deleted_at / deleted_by | timestamptz/uuid | YES | — | FK `user_profiles.id` | Trash | not filtered on read |
| status | content_status enum | NO | 'published' | enum | dropdown | gate |
| metadata | jsonb | NO | '{}' | — | JSON textarea | `description`, `vision`, `mission`, `keyActivities[]`, `members[]` (name/role/designation/email/phone) all read from here by `CommitteeMembers` component |

- Constraints: PK, FK `college_id → colleges`. No slug UNIQUE constraint (unlike `student_clubs`/`pages`
  which do have one) — two committees could share a slug and `getCommitteeBySlug` (if ever called)
  would hit `.single()` and throw on a duplicate.
- RLS: `Anon SELECT`/`Authenticated read committees` (`true`); `Scoped insert/update/delete committees`
  (`can_write_scoped_record(college_id) OR can_write_section('about_us', college_id)`) — this is the one
  table here with a genuinely scope-aware write policy (a college-scoped admin can manage their own
  college's committees), unlike board_members/accreditations/mous/downloads/student_clubs which are
  global-admin-only for writes.
- Triggers: `update_committees_modtime` (BEFORE UPDATE).

**Admin**: `/admin/tables/committees` is in `GLOBAL_ONLY_ROUTE_PREFIXES`
(`src/lib/admin-sections.ts:27`) **even though** the live RLS write policy is scope-aware, not
global-only — see Gaps (route gate is stricter than the database actually allows, so a
college-scoped admin who could legally write to their own committees via direct RPC/SQL is blocked
from ever seeing the UI for it).

**Data layer**: `src/lib/committees.functions.ts` — `getCommitteesByCollege(collegeId)` (unused by any
route found), `getAllCommittees()` (used), `getCommitteeBySlug(slug)` (unused — dead).

**Website**: `/about/committees/page.tsx` renders name + `metadata.description/vision/mission/
keyActivities/members` via `CommitteeMembers`. No empty-state UI if `committees` is empty (renders an
empty `<div className="mt-10 space-y-6">`).

### Accreditations & MOUs

**Summary**: Accreditation bodies (NBA/NAAC/AICTE-style records) and industry MOUs, both rendered on
one page, `/about/accreditation`, alongside hardcoded regulation/compliance text from the `pages` blob.

#### `accreditations`
- Row count: 4. Soft-delete: yes, not enforced on read. Status: `content_status`, default `published`.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | — | key |
| organization | text | NO | — | — | text field | fallback label `${organization} (${value})`; also used for `.order()` and `getAccreditationByOrg` lookup |
| value | text | NO | — | — | text field | right-aligned badge (e.g. "A+", "Tier I") |
| received_year | integer | NO | — | — | number field | **never rendered** on `/about/accreditation` |
| expiry_date | date | YES | — | — | date field | **never rendered** |
| created_at / updated_at | timestamptz | NO | now() | — | read-only | — |
| created_by / updated_by | uuid | YES | — | FK `user_profiles.id` | read-only | — |
| deleted_at / deleted_by | timestamptz/uuid | YES | — | FK `user_profiles.id` | Trash | not filtered on read |
| status | content_status enum | NO | 'published' | enum | dropdown | gate |
| metadata | jsonb | NO | '{}' | — | JSON textarea | not read by the page (page reads top-level columns only) |
| accreditation_body | text | YES | — | — | text field | preferred label over `organization` when present |
| description | text | YES | — | — | textarea | shown for first 3 rows that have one |
| document_url | text | YES | — | — | text/upload field | **never rendered** — no link-out to the certificate even though the column exists |

- RLS: `Anon SELECT`/`Authenticated read accreditations` (`true`); `Global write accreditations`
  (`is_global_admin() OR can_write_section('about_us')`).
- Triggers: `update_accreditations_modtime`.

#### `mous`
- Row count: 19. Soft-delete columns exist (`deleted_at`/`deleted_by`) but **not enforced on read**.
  Status: `status` is declared as plain `text` in the TypeScript interface (`src/lib/mous.functions.ts:9`)
  while the DB column is actually the `content_status` enum (default `'published'`) — a typing mismatch,
  not a DB issue.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | — | key |
| partner_organization | text | NO | — | — | text field | table cell |
| logo_url | text | YES | — | — | upload field | **never rendered** (table is text-only, no logo column shown) |
| purpose | text | YES | — | — | textarea | table cell (hidden below `sm`) |
| signed_date | date | NO | — | — | date field | table cell + `.order('signed_date', desc)` |
| expiry_date | date | YES | — | — | date field | **never rendered** |
| created_at / updated_at | timestamptz | NO | now() | — | read-only | — |
| created_by / updated_by | uuid | YES | — | FK `user_profiles.id` | read-only | — |
| deleted_at / deleted_by | timestamptz/uuid | YES | — | FK `user_profiles.id` | Trash | not filtered on read |
| status | content_status enum | NO | 'published' | enum | dropdown | gate |
| metadata | jsonb | NO | '{}' | — | JSON textarea | unused |
| department_name | text | YES | — | — | text field | table cell (hidden below `md`), falls back to "—" |
| location | text | YES | — | — | text field | **never rendered** |
| activities | text[] | YES | — | — | — (generic grid has no array-field editor; likely falls through to a plain text input, see Gaps) | **never rendered** |

- RLS: `Anon SELECT`/`Authenticated read mous` (`true`); `Global write mous` (`is_global_admin()`) —
  no scope-aware option (`can_write_section`) unlike `accreditations`/`board_members`.
- Triggers: `update_mous_modtime`.

**Admin**: `/admin/tables/accreditations` and `/admin/tables/mous`, both global-only routes, both
plain `AdminCrudManager` grids with no `TABLE_CONFIGS` entry (so `activities text[]` on `mous` has no
custom array editor — the generic form almost certainly renders it as a single text input that will
mis-serialize a Postgres array on save; not exercised in this audit, flagged as a risk).

**Data layer**: `src/lib/accreditations.functions.ts` (`getAllAccreditations`, `getAccreditationByOrg`
— the latter unused by any route found), `src/lib/mous.functions.ts` (`getAllMOUs` only).

**Website**: both rendered together on `/about/accreditation/page.tsx`. Significant hardcoded content
on this same page: "Academic Regulations (GTU)" and "Mandatory Disclosure & Code of Conduct" headings
are literal JSX strings (`accreditation/page.tsx:72-73, 88-89`), with only the body text coming from
`pages.metadata.accreditation.*` — if GTU regulations change to a different affiliating body, the
heading itself needs a code change, not an admin edit.

### Downloads

**Summary**: Flat document library (forms, circulars, syllabus) on `/downloads`.

#### `downloads`
- Row count: 8. Soft-delete: yes, and **correctly enforced on read** (the one table in this group that
  does). Status: `content_status`, default `published`.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | — | key |
| title | text | NO | — | — | text field | link label |
| file_url | text | NO | — | — | upload/text field | `href` |
| file_type | text | YES | — | — | text field | selected in query but **never rendered** (no file-type icon/badge on the page despite the `FileText` icon import suggesting one was intended) |
| file_size | integer | YES | — | — | number field | selected in query but not even fetched by `getAllDownloads` (query only selects `id, title, file_url, file_type, category, metadata`) — dead column for the site |
| category | text | NO | — | CHECK: `circular`/`notice`/`syllabus`/`form`/`other` | dropdown | `.order('category')` — but the page never groups or labels by category, just flattens into one list; the whole category taxonomy is invisible to visitors |
| publish_date | date | NO | CURRENT_DATE | — | date field | not selected/used by `getAllDownloads` at all |
| created_at / updated_at | timestamptz | NO | now() | — | read-only | — |
| created_by / updated_by / deleted_by | uuid | YES | — | FK `user_profiles.id` | read-only | — |
| deleted_at | timestamptz | YES | — | — | Trash | **filtered** (`is('deleted_at', null)`) |
| status | content_status enum | NO | 'published' | enum | dropdown | gate |
| metadata | jsonb | NO | '{}' | — | JSON textarea | selected but never destructured/rendered |

- RLS: `Anon SELECT`/`Authenticated read downloads` (`true`); `Global write downloads`
  (`is_global_admin()`).
- Triggers: `update_downloads_modtime`.

**Admin**: `/admin/tables/downloads`, global-only, plain `AdminCrudManager` grid.

**Data layer**: `src/lib/downloads.functions.ts` — one function, `getAllDownloads()`.

**Website**: `/downloads/page.tsx` — flat list, title + download icon only; `category` is fetched and
sorted by but never shown as a label/filter in the UI, so the admin-chosen taxonomy is invisible to
visitors (misleading: looks structured in the DB/admin, reads as one undifferentiated list on site).

### Centers (COE, NSS/NCC, generic "Student Groups" entries)

**Summary**: `centers` is a flexible, multi-purpose table used for three different site surfaces: the
dedicated Centre of Excellence page (`/coe`), the dedicated NSS/NCC page (`/campus-life/nss-ncc`), and
a generic "Student Groups" grid (`/campus-life/student-groups`, `/campus-life`, nav mega panel,
`/student-corner/[slug]`) for every other center. The split is done purely in application code by slug,
not by a `type`/`category` column.

#### `centers`
- Row count: 9. Soft-delete: yes, and **correctly enforced on read**. Status: `content_status`,
  default `published`.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | — | key |
| college_id | uuid | YES | — | FK `colleges.id`, ON DELETE CASCADE; CHECK `center_parent_check`: college_id OR institute_id required | FK dropdown | scoping only, not rendered |
| institute_id | uuid | YES | — | FK `institutes.id`, ON DELETE CASCADE | FK dropdown | scoping only |
| name | text | NO | — | — | text field | heading |
| slug | text | NO | — | no UNIQUE constraint found (unlike `student_clubs`/`sports`) | text field | routing key for `/coe`, `/campus-life/nss-ncc`, `/student-corner/[slug]`; hardcoded slug set `{"coe","nss-ncc"}` (`src/lib/centers.functions.ts:51`) decides which centers get their own top-level page vs. the generic grid |
| created_at / updated_at | timestamptz | NO | now() | — | read-only | — |
| created_by / updated_by / deleted_by | uuid | YES | — | FK `user_profiles.id` | read-only | — |
| deleted_at | timestamptz | YES | — | — | Trash | **filtered** |
| status | content_status enum | NO | 'published' | enum | dropdown | gate |
| metadata | jsonb | NO | '{}' | — | JSON textarea | `highlights[]`, `gallery.images[]` (with focal points) |
| subtitle | text | YES | — | — | text field | tagline |
| description | text | YES | — | — | textarea | body copy |
| accent_color | text | YES | — | — | text/color field | styling |
| card_photo_url | text | YES | — | — | entry-photos widget (`TABLE_CONFIGS.centers` uses `ENTRY_PHOTO_FIELDS`, `AdminCrudManager.tsx:220`) | card image |
| has_detail_page | boolean | NO | false | — | checkbox, owned by the Photos widget | gates whether `/student-corner/[slug]` renders a full detail layout vs. a card-only stub |
| album_id | uuid | YES | — | FK `gallery_albums.id`, ON DELETE SET NULL | owned by Photos widget | links to a gallery album for extra photos |

- No `slug` UNIQUE constraint — two centers could collide on slug, and `getCenterBySlug` uses
  `.maybeSingle()`, which throws a PostgREST error (not a graceful null) if more than one row matches.
- RLS: `Scoped insert/update/delete centers` (`can_write_scoped_record(institute_id, college_id) OR
  can_write_section('campus_life', institute_id, college_id)`); `Scoped read centers`
  (authenticated, same scope check — meaning a scoped admin's *read* in the admin grid is also
  filtered, unlike every other table in this domain where authenticated read is `true`); `Anon SELECT`
  (`true`) for the public site.
- Triggers: `update_centers_modtime`; `trg_cascade_hard_delete_to_album` (BEFORE DELETE) and
  `trg_cascade_soft_delete_to_album` (AFTER UPDATE) — deleting/soft-deleting a center cascades to its
  linked `gallery_albums` row.

**Admin**: `/admin/tables/centers`, a `COLLEGE_OR_ABOVE_ROUTE_PREFIXES` route (college-scoped admins
can reach it; department-scoped cannot). Generic `AdminCrudManager` with the Entry-model photo widget.

**Data layer**: `src/lib/centers.functions.ts` — `getAllCenters()`, `getVisibleCenters()` (excludes
`coe`/`nss-ncc` by a hardcoded slug `Set`), `getCenterBySlug(slug)`.

**Website**: `/coe/page.tsx` and `/campus-life/nss-ncc/page.tsx` both call `getCenterBySlug('coe' |
'nss-ncc')` directly — if that row is ever deleted or its slug changed in the admin, those two
top-level nav pages silently 404/empty with no admin-visible warning that the slug is load-bearing.
`/student-corner/[slug]/page.tsx` and `/campus-life/student-groups/page.tsx` use `getVisibleCenters()`
for the generic grid. `CampusMegaPanel`/`Header.tsx` also pull centers for the nav mega panel.

### Student Clubs

**Summary**: Clubs/societies, each with an optional department link and optional detail page with its
own events feed (events table, `club_id` FK — "one events table" per `docs/adr/0002-one-events-table.md`).

#### `student_clubs`
- Row count: 11. Soft-delete columns exist but **not enforced on read** — see Gaps. Status:
  `content_status`, default `published`.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | — | key |
| name | text | NO | — | — | text field | heading |
| slug | text | NO | — | UNIQUE `unique_club_slug` | text field | routing (`/campus-life/clubs/[slug]`) |
| description | text | YES | — | — | textarea | body copy on detail page |
| logo_url | text | YES | — | — | upload field | **never rendered** (only `card_photo_url` is used on cards/detail) |
| coordinator_id | uuid | YES | — | FK `staff_profiles.id`, ON DELETE SET NULL | FK dropdown | staff coordinator link — not confirmed rendered (not read in the grep sample; likely shown on the club detail page) |
| student_coordinator_name | text | YES | — | — | text field | plain-text student lead name |
| created_at / updated_at | timestamptz | NO | now() | — | read-only | — |
| created_by / updated_by / deleted_by | uuid | YES | — | FK `user_profiles.id` | read-only | — |
| deleted_at | timestamptz | YES | — | — | Trash | **not filtered** by `getAllStudentClubs`/`getFeaturedStudentClubs`/`getStudentClubBySlug` |
| status | content_status enum | NO | 'published' | enum | dropdown | gate (only filter applied) |
| metadata | jsonb | NO | '{}' | — | JSON textarea | `highlights[]` |
| featured | boolean | YES | false | — | checkbox | `getFeaturedStudentClubs()` — used for nav/home, but not confirmed consumed anywhere in this grep pass beyond the function existing |
| department_id | uuid | YES | — | FK `departments.id` (no ON DELETE action — blocks department deletion) | FK dropdown | joined as `departments(name)` → `departmentName`, shown as a sub-label on cards |
| subtitle | text | YES | — | — | text field | tagline |
| accent_color | text | YES | — | — | text/color field | **misused** on `/campus-life/student-groups`: `{c.accent_color || "Club"}` is rendered as the visible eyebrow label text (`student-groups/page.tsx`), not as a color — so a club with `accent_color = "#1e3a8a"` would literally print "#1e3a8a" as its category label instead of "Club" |
| card_photo_url | text | YES | — | — | entry-photos widget | club card image |
| has_detail_page | boolean | NO | false | — | owned by Photos widget | gates `/campus-life/clubs/[slug]` full page vs. stub |
| album_id | uuid | YES | — | FK `gallery_albums.id`, SET NULL | owned by Photos widget | gallery link |

- RLS: `Anon SELECT`/`Authenticated read student_clubs` (`true`); `Global insert/update/delete
  student_clubs` (`is_global_admin() OR can_write_section('campus_life')`).
- Triggers: `update_student_clubs_modtime`; `trg_cascade_hard_delete_to_album` /
  `trg_cascade_soft_delete_to_album` (same album-cascade pattern as `centers`/`sports`).

**Admin**: `/admin/tables/student_clubs`, global-only route, `AdminCrudManager` with
`ENTRY_PHOTO_FIELDS`.

**Data layer**: `src/lib/clubs.functions.ts` — `getAllStudentClubs`, `getFeaturedStudentClubs`,
`getStudentClubBySlug` (all join `departments(name)`, none filter `deleted_at`), plus
`getClubEvents`/`getAllClubEvents` against the shared `events` table filtered by `club_id` (these two
correctly filter `deleted_at IS NULL`).

**Website**: `/campus-life/clubs/[slug]/*` (layout, detail page, events sub-page), `/campus-life/
student-groups`, `/campus-life/page.tsx`, `/departments/[dept]/achievements`, nav
(`Header.tsx`/`CampusMegaPanel.tsx`).

### Sports

**Summary**: Sports disciplines with their own admin page (not generic CRUD) and the most complete
RLS/soft-delete wiring in this domain.

#### `sports`
- Row count: 13. Soft-delete: yes, **correctly enforced in both RLS and the app query** (the only
  table here where the public-read RLS policy itself encodes `deleted_at IS NULL AND status =
  'published' AND is_active = true`, not just app-level filtering). Status: `content_status`, default
  `published`.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | — | key |
| name | text | NO | — | — | text field | heading |
| slug | text | NO | — | UNIQUE `sports_slug_key` | text field | detail routing |
| category | text | NO | 'outdoor' | app-level union `outdoor/indoor/aquatic/combat` (no DB CHECK constraint enforcing it) | dropdown | category grouping/filter in `SportsSection` |
| description | text | YES | — | — | textarea | body copy |
| card_photo_url | text | YES | — | — | entry-photos widget | card image |
| is_active | boolean | NO | true | — | checkbox | public-read gate (also baked into RLS) |
| sort_order | integer | NO | 10 | — | number field | ordering |
| status | content_status enum | NO | 'published' | enum | dropdown | gate |
| metadata | jsonb | NO | '{}' | — | JSON textarea | `venue_name`, `subtitle`, `highlights[]` — merged in from the old `facilities` table per entry-model migration |
| created_at / updated_at | timestamptz | NO | now() | — | read-only | — |
| created_by / updated_by / deleted_by | uuid | YES | — | FK `user_profiles.id` | read-only | — |
| deleted_at | timestamptz | YES | — | — | Trash | **filtered**, incl. in RLS |
| players_count | integer | YES | — | — | number field | shown as a stat on `SportsSection`/detail (not independently verified line-by-line, out of grep budget) |
| coach_name | text | YES | — | — | text field | coach info |
| coach_image_url | text | YES | — | — | upload field | coach photo |
| achievements_count | integer | YES | — | — | number field | **stale/dead by design**: the code comment in `sports.functions.ts:39-40` says sports achievements now live in the `achievements` table (category `'sports'`) — this column is a leftover counter that nothing recomputes |
| has_detail_page | boolean | NO | false | — | Photos widget | gates detail page |
| album_id | uuid | YES | — | FK `gallery_albums.id`, SET NULL | Photos widget | gallery |

- RLS: `sports_public_read` (public, `deleted_at IS NULL AND status='published' AND is_active=true`);
  `Global admin write sports` (`is_global_admin() OR can_write_section('campus_life')`).
- Triggers: `update_sports_updated_at` via `trg_sports_updated_at`(a differently-named trigger function,
  `update_sports_updated_at()`, vs. the shared `update_updated_at_column()` every other table uses —
  functionally equivalent but inconsistent naming, worth consolidating); album cascade triggers as above.

**Admin**: `/admin/sports`, global-only route, **purpose-built** `AdminSportsPage` component
(`src/components/admin-next/pages/AdminSportsPage.tsx`, 327 lines) — not the generic CRUD grid.

**Data layer**: `src/lib/sports.functions.ts` — `getSports()` only (selects an explicit column list,
filters status/is_active/deleted_at correctly).

**Website**: `/campus-life/sports-and-athletics/page.tsx` → `SportsSection` (embedded variant);
`Header.tsx`/`CampusMegaPanel.tsx` for nav. Entry albums (`getEntryAlbum`) loaded per sport with its
own `album_id`, failures swallowed with `.catch(() => null)` (graceful degrade, per the `layout.tsx`
pattern described in `CLAUDE.md`).

### Scholarships

**Summary**: The one table in this domain that does **not** follow the shared content model at all —
different enum handling, no soft delete, a narrower RLS write policy, and (currently) zero live rows,
so the public `/admissions/scholarships` page is always in its empty state in production today.

#### `scholarships`
- Row count (live): **0**. Soft-delete: **no** — no `deleted_at`/`deleted_by` columns exist at all.
  Status: plain `text` column (not the `content_status` enum used everywhere else), default
  `'published'::text` — a string that happens to collide with the enum's value but is not type-checked
  against it. No audit-log trigger. RLS enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | — | key |
| name | text | NO | — | — | text field | card title |
| type | text | NO | 'merit' | app-level union `merit/need/govt/sports/other` (no DB CHECK) | dropdown (`AdminScholarshipsPage`) | drives icon/color/grouping on `/admissions/scholarships` |
| description | text | YES | — | — | textarea | card body |
| eligibility | text | YES | — | — | textarea | "Eligibility" box |
| amount | text | YES | — | — | text field | badge |
| provider | text | YES | — | — | text field | sub-label under name |
| status | **text** (not enum) | NO | 'published'::text | — | dropdown, presumably `published`/`draft` by convention only | public query filters `.eq('status','published')` |
| sort_order | integer | YES | 0 | — | number field | ordering |
| created_at / updated_at | timestamptz | YES | now() | — | read-only | — |
| created_by / updated_by | uuid | YES | — | FK **`auth.users(id)`**, not `user_profiles.id` like every other table in this domain | read-only | inconsistent FK target — see Gaps |

- Constraints: PK, 2 FKs to `auth.users` (not `user_profiles`).
- RLS policies: `Scholarships are publicly readable` (public, `status = 'published'`); `Admins can
  manage scholarships` (ALL, `EXISTS (... JOIN roles ON role_id WHERE user_id = auth.uid() AND
  r.code = 'admin')`) — this checks the **literal role code `'admin'`**, not the `is_global_admin()`
  helper function every other table uses and not `can_write_section()`. Per `CLAUDE.md`, authorized
  admin role codes are `admin`, `editor`, `department_admin`, `college_admin` — an `editor` (a
  global-scope role distinct from `admin`) who can write every other global table in this domain would
  be **denied** by RLS on `scholarships` specifically. Not verified end-to-end against `is_global_admin()`'s
  actual definition in this pass, but the SQL text is unambiguous: it hardcodes `r.code = 'admin'`.
- Triggers: `scholarships_updated_at` calling a **dedicated** `set_scholarships_updated_at()` function
  (not the shared `update_updated_at_column()`), consistent with this table being a separate, later
  addition that didn't reuse the shared helpers.
- Migration drift: this table's shape (text status, no soft delete, `auth.users` FK) looks like it was
  added independently of the entry-model migrations that standardized `content_status`/`deleted_at`
  across the rest of the schema — flagged for comparison against `supabase/migrations/*.sql` (not
  individually confirmed which migration file created it in this pass).

**Admin**: `/admin/scholarships`, global-only route, **purpose-built** `AdminScholarshipsPage`
(`src/components/admin-next/pages/AdminScholarshipsPage.tsx`, 240 lines) using
`src/lib/scholarships-next.ts` (`upsertScholarship`, `deleteScholarship`) for writes — a genuinely
separate module from the read-only `src/lib/scholarships.functions.ts`, per that file's own header
comment. `deleteScholarship()` is a **hard delete** (`supabase.from('scholarships').delete()...`,
`scholarships-next.ts:25-28`) — the only hard-delete write path found in this domain; there is no Trash
recovery for a deleted scholarship, contradicting `CLAUDE.md`'s "soft delete, not hard delete" rule.

**Data layer**: `src/lib/scholarships.functions.ts` (`getAllScholarships` — published only, used by the
public page; `getAllScholarshipsAdmin` — all rows, used by the admin list) and
`src/lib/scholarships-next.ts` (admin writes).

**Website**: `/admissions/scholarships/page.tsx` groups by `type` into `merit/govt/need/sports/other`
sections; with 0 live rows it always renders the "Scholarship information will be published soon"
empty state. The `pages.metadata.facilities.scholarships[]` field (under the About page's JSON blob)
is a second, separate, unused scholarships list that was apparently the pre-migration source of this
content and was never ported into the real `scholarships` table.

**Storage/media**: none (no image fields on this table).

### Other routes in scope, and what's hardcoded

- `/about` landing page, `/about/history-vision-mission`, `/about/principal-message`,
  `/about/chairman-message`, `/about/media`: all read only from `pages.metadata` (the `AboutPageData`
  blob) — no dedicated table, no admin form, just the raw JSON textarea described above.
- `AboutNav` (`src/app/(site)/about/AboutNav.tsx`) and the campus-life equivalent: driven by
  `menus.functions.ts` (`MenuLink[]` passed in as props), i.e. genuinely Supabase-driven navigation,
  not hardcoded — consistent with `CLAUDE.md`'s "Nav is Supabase-driven" note.
- `/anti-ragging`: **mostly hardcoded**. The policy bullet list ("24×7 anti-ragging monitoring…",
  "Every student signs an undertaking…", penalty text) is literal JSX in
  `src/app/(site)/anti-ragging/page.tsx:30-35`. Only the helpline phone/email come from
  `getMiscSettings()` (`src/lib/site-settings.functions.ts`), with hardcoded fallbacks baked in even
  when that call fails.
- `/parents`: **fully hardcoded** feature cards (`feats` array literal in `page.tsx:15-20`); only the
  placement-percentage sentence pulls from `getMiscSettings()`.
- `/grievance`: fully hardcoded copy (steps list, intro); the only dynamic piece is the
  `GrievanceForm` component, which presumably writes to `inquiry_submissions`/`inquiry_forms` (not
  audited in this pass — out of this domain's table list).
- `/alumni`: **no route exists** in `src/app/(site)` despite a `pages` row with `slug = 'alumni'` and
  `page_type = 'alumni'` sitting in the live DB — either a page that was planned and never built, or
  one that was removed from the app but left behind in the database (dead data either way).
- `/admissions`, `/admissions/intake-fees`, `/admissions/inquiry`: not read in this pass (out of the
  explicit table scope — they likely belong to a separate inquiry/forms section of the system map).

#### Gaps (About pages, campus life, admissions info)

- **Soft-deleted rows stay live on the public site for 5 of 10 tables (broken).** `board_members`,
  `committees`, `accreditations`, `mous`, and `student_clubs` all have `deleted_at`/`deleted_by`
  columns and are listed in the admin Trash page, but their public-read functions
  (`getAllBoardMembers`, `getAllCommittees`/`getCommitteesByCollege`, `getAllAccreditations`,
  `getAllMOUs`, `getAllStudentClubs`/`getFeaturedStudentClubs`/`getStudentClubBySlug`) only filter
  `status = 'published'` and never check `deleted_at IS NULL`. RLS doesn't filter it either (their
  `Anon SELECT` policies are all `qual: true`). Trash → Restore moves `deleted_at` to `null` and back
  with no visible effect, because the record was never actually hidden. Contrast with `downloads`,
  `centers`, and `sports`, which all correctly filter `deleted_at`.
  — Fix: add `.is('deleted_at', null)` to each of the 7 affected query functions listed above
  (`src/lib/board-members.functions.ts`, `committees.functions.ts`, `accreditations.functions.ts`,
  `mous.functions.ts`, `clubs.functions.ts`).

- **`scholarships` has no soft-delete at all, and its only delete path is a hard delete (broken,
  contradicts `CLAUDE.md`).** The table has no `deleted_at`/`deleted_by` columns, isn't wired into the
  Trash page, and `deleteScholarship()` in `src/lib/scholarships-next.ts:25-28` runs
  `.delete().eq('id', id)` directly — an admin who deletes a scholarship by mistake has no recovery
  path, unlike every other content type in the admin panel.
  — Fix: add `deleted_at`/`deleted_by`/`status` (enum) columns via migration, switch
  `deleteScholarship` to a soft-delete update, and add `scholarships` to the Trash page's table list
  (`src/components/admin-next/pages/AdminTrashPage.tsx:40` area).

- **Scholarships RLS write policy checks the literal role code `admin`, not `is_global_admin()`
  (broken / likely-security-relevant inconsistency).** Every other table in this domain authorizes
  writes via `is_global_admin()` and/or `can_write_section(...)`. `scholarships`'s "Admins can manage
  scholarships" policy instead does `EXISTS (... r.code = 'admin')`. If an `editor`-role user (a
  distinct, global-scope role per `CLAUDE.md`'s authorized role list) is expected to manage
  scholarships like they can every other global table, RLS silently denies them — the admin UI would
  need to be checked for whether it even offers `/admin/scholarships` to editors, and if it does, their
  save/delete calls will fail.
  — Fix: confirm the intended role set for Scholarships, then align the RLS policy (ideally
  `is_global_admin()` for consistency) via a migration.

- **The entire About page content model is a hand-edited JSON blob with no admin form (misleading for
  non-technical admins).** `pages.metadata` on the single `slug='about'` row holds ~15 nested sections
  (hero, history, mission, vision, chairman/principal messages, accreditation prose, facilities text,
  media/contact info — `AboutPageData`, `src/lib/pages.functions.ts:4-58`), and the only way to edit any
  of it is a raw `<textarea>` of `JSON.stringify(metadata, null, 2)` inside the generic
  `AdminCrudManager` (`src/components/admin-next/AdminCrudManager.tsx:1060-1062`). A typo or a missing
  comma silently breaks every About subpage that reads that field (no schema validation on save).
  — Fix: either build dedicated forms per About subsection, or at minimum validate the JSON shape
  against `AboutPageData` on save and show field-level errors.

- **`/alumni` has a published `pages` row with no corresponding route (dead).** `page_type = 'alumni'`,
  `status = 'published'`, but no `src/app/(site)/alumni` directory exists — content that looks live in
  the admin (and in the database) but is unreachable on the public site.
  — Fix: either build the `/alumni` route or delete/archive the orphaned row.

- **`student_clubs.accent_color` is rendered as a text label instead of a color (misleading/cosmetic
  bug).** `src/app/(site)/campus-life/student-groups/page.tsx`: `{c.accent_color || "Club"}` prints
  the raw `accent_color` value (presumably a hex code or Tailwind token) as the visible eyebrow text
  above each club name, falling back to the literal word "Club" only when the column is null. Any club
  with `accent_color` set would show a color code as its label instead of a category/type.
  — Fix: either use `accent_color` for actual styling (e.g. a background/border color) and show a real
  category field as the label, or remove the column from this spot if it was copy-pasted from a
  different Entry-model component.

- **`/admissions/scholarships` is currently always empty in production (broken end-to-end, not a code
  bug).** The `scholarships` table has 0 live rows. The full feature (schema, RLS, admin page, public
  page, empty-state copy) is built and wired correctly end-to-end, but nothing has ever been published
  through it — likely because content was never migrated out of the old
  `pages.metadata.facilities.scholarships[]` blob (see below) into the real table.
  — Fix: migrate the existing scholarship entries out of `pages.metadata.facilities.scholarships` into
  the `scholarships` table via the admin UI or a one-off script, then remove the stale JSON copy.

- **Duplicate, drifted copies of the same content inside `pages.metadata` (dead/misleading).**
  `AboutPageData.leadership.boardOfManagement[]` duplicates the real `board_members` table (nothing
  reads the JSON copy — `/about/board-of-management` only reads `getAllBoardMembers()`).
  `AboutPageData.facilities.scholarships[]` duplicates the real `scholarships` table and is the likely
  source of the "0 live rows" gap above. Both JSON copies are stale, unreachable from any UI, and will
  silently diverge further from the real tables over time.
  — Fix: delete both arrays from the `about` row's `metadata` once confirmed unused, to stop admins
  from mistakenly editing them and expecting a site change.

- **Several selected/stored columns are never rendered anywhere on the public site (dead, low
  severity).** `accreditations.received_year`, `accreditations.expiry_date`,
  `accreditations.document_url` (no link-out to the actual certificate file despite the column
  existing); `mous.logo_url`, `mous.expiry_date`, `mous.location`, `mous.activities` (text[]);
  `downloads.file_type`, `downloads.file_size`, `downloads.publish_date` (not even selected by the
  query); `sports.achievements_count` (superseded by the `achievements` table per the code's own
  comment); `student_clubs.logo_url`. Each is a field an admin can fill in via the generic CRUD form
  that has zero visible effect on the site — misleading for content editors who reasonably expect a
  filled-in field to show up somewhere.
  — Fix: either render these fields (several are clearly intended — e.g. a download's file type icon,
  an accreditation's certificate link) or remove them from the admin forms so editors aren't filling in
  content that goes nowhere.

- **`mous.activities` is a Postgres `text[]` with no custom array-field editor (likely broken, not
  exercised in this audit).** The generic `AdminCrudManager` has no entry in `TABLE_CONFIGS` for `mous`,
  and no array-type handling was found in the component beyond the `metadata`/jsonb special case — an
  array column will most likely render as a single text input and mis-save.
  — Fix: verify by hand in the admin UI; add an array-field renderer to `AdminCrudManager` or a
  `TABLE_CONFIGS.mous` entry if confirmed broken.

- **`/admin/tables/committees` is gated global-only even though its RLS write policy is scope-aware
  (misleading / unnecessarily restrictive).** `committees`'s RLS allows a college-scoped admin to write
  their own college's committees (`can_write_scoped_record`/`can_write_section('about_us', college_id)`),
  but `GLOBAL_ONLY_ROUTE_PREFIXES` in `src/lib/admin-sections.ts:27` blocks every non-global admin from
  ever reaching `/admin/tables/committees`, so that RLS capability is unreachable through the UI.
  — Fix: move `committees` out of `GLOBAL_ONLY_ROUTE_PREFIXES` (and `GLOBAL_ONLY_TABLE_IDS`) if
  college-scoped committee management is actually wanted, or leave it and treat the scope-aware RLS as
  dead code if it isn't.

- **`board_members` has no `updated_at`-bumping trigger (cosmetic drift).** Every sibling table in this
  domain has an `update_<table>_modtime` BEFORE UPDATE trigger; `board_members` does not, so its
  `updated_at` column is only as accurate as whatever the client happens to set on each write (the
  generic `AdminCrudManager` may or may not set it — not individually confirmed).
  — Fix: add the standard `update_updated_at_column()` trigger via migration for consistency.

- **`centers.slug` has no UNIQUE constraint, unlike `student_clubs`/`sports`/`pages` (potential broken
  state).** Two centers sharing a slug would make `getCenterBySlug()`'s `.maybeSingle()` throw instead
  of resolving one record, taking down `/coe`, `/campus-life/nss-ncc`, or any `/student-corner/[slug]`
  page whose slug collided.
  — Fix: add a UNIQUE constraint on `centers.slug` via migration.

- **`pages.seo_id` points at an empty table (dead).** `seo_metadata` has 0 rows live, so the field is
  always null in practice and has no effect on `<head>` tags for either `pages` row.

- **Hardcoded static content on several "policy" pages contradicts the "content lives in Supabase"
  rule, though these aren't in an admin table today (misleading for anyone expecting them to be
  editable without a deploy).** `/anti-ragging`'s policy bullets, `/parents`'s four feature cards, and
  `/grievance`'s "what happens next" steps are all literal JSX. This may be an intentional scope
  decision (these read as fairly static, compliance-style boilerplate) rather than an oversight, but it
  means a content change here always requires a code change and deploy, unlike everything else in this
  domain.


#### Verification corrections

A second, independent pass re-checked this section against the live code and database. Corrections:

- Soft-delete read bug (section lines 526-537 and per-table gap notes for board_members/committees/accreditations/mous): the section repeatedly states these 4 tables (board_members, committees, accreditations, mous) 'are listed in the admin Trash page' alongside student_clubs. This is factually wrong - reading src/components/admin-next/pages/AdminTrashPage.tsx's SOFT_DELETE_TABLES array directly shows only 'student_clubs' from this domain; board_members, committees, accreditations and mous are absent entirely. They can still be soft-deleted via AdminCrudManager's own generic delete button (sets deleted_at directly, AdminCrudManager.tsx:564-589) and disappear from the admin grid (which filters deleted_at IS NULL on its own list query, line 386-387), but there is no Trash-page restore path for them - a stronger problem than the section describes (not just 'restore has no visible site effect' but 'these 4 tables cannot be restored through the Trash UI at all').
- The section flags student_clubs.accent_color as misrendered as a text label on /campus-life/student-groups but misses that the identical bug exists for centers.accent_color on the same page (line 69: {c.accent_color || "Centre"}); the centers table's own row in this section lists accent_color's 'Website use' as simply 'styling' with no caveat, which is incomplete given this code.
- sports.achievements_count's 'Admin field' column says 'number field' implying it is editable in the admin; AdminSportsPage.tsx's field list, select query and form state do not include achievements_count anywhere, so the column is not actually editable through any admin UI (no generic /admin/tables/sports fallback exists either). The section should say this column has no admin exposure at all, not merely no public rendering.
- Minor: the committees subsection calls it 'the one table here with a genuinely scope-aware write policy' in contrast to board_members/accreditations/mous/downloads/student_clubs - true for that named comparison set, but centers (covered elsewhere in the same section) also has scope-aware write policies (confirmed live: 'Scoped insert/update/delete centers'), so the phrasing is misleading if read across the whole section rather than just the explicitly named comparison set.


---

## Inquiries, grievance & public forms

### Public forms & submissions

**Summary**: A single generic "form submission" system backs the site's public forms. Public pages
insert into `inquiry_submissions` (anon INSERT, no auth) tagged with a `form_id` that points at a row
in `inquiry_forms` (a form's name/fields/recipient list), looked up client-side by a `metadata.slug`
convention. The admin "Inquiries" page lets a global admin browse/export submissions and edit form
definitions. Three forms are wired to a UI that actually submits (Admission Inquiry, Grievance, and a
third DB-only "Contact" form with no page); two more forms visible on the site (Quick Enquiry on college
pages, Student Login) are pure front-end stubs that never touch Supabase at all.

### Tables

#### `inquiry_forms`

- Row count (live): **3** (`Admission Inquiry` / slug `admission-inquiry`, `Grievance` / slug
  `grievance`, `Contact Form` / slug `contact` — the last has no corresponding page/component anywhere
  in `src`, i.e. it is orphaned DB config with no caller).
- Soft-delete: yes (`deleted_at`/`deleted_by`). Status column: yes (`status`, `content_status` enum,
  default `published`). Audit columns: `created_at/by`, `updated_at/by`. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` | PK | hidden (used as `form_id` in submissions) | used internally only |
| `form_name` | text | NO | — | UNIQUE (`unique_form_name`) | `src/components/admin-next/pages/AdminInquiriesPage.tsx:409-417` "Form Template Name" input | never shown (slug, not name, is matched by the site) |
| `fields_config` | jsonb | NO | `'[]'` | none (free-form JSON, no schema/validation) | `AdminInquiriesPage.tsx:431-441` raw JSON textarea | **never read by any public page** — see Gaps |
| `recipient_emails` | text[] | NO | `'{}'` | none | `AdminInquiriesPage.tsx:421-428` comma-separated input | **never read/used anywhere** — no email-sending code exists in the repo (no notification mechanism at all) |
| `created_at` | timestamptz | NO | `timezone('utc', now())` | — | never edited | never shown |
| `updated_at` | timestamptz | NO | `timezone('utc', now())` | trigger-maintained (`update_inquiry_forms_modtime` → `update_updated_at_column()`) | never edited | never shown |
| `created_by` | uuid | YES | — | FK → `user_profiles(id)` ON DELETE SET NULL | never set by `AdminInquiriesPage` inserts (no `created_by` in `handleSaveForm` payload, `src/components/admin-next/pages/AdminInquiriesPage.tsx:105-110`) | never shown |
| `updated_by` | uuid | YES | — | FK → `user_profiles(id)` ON DELETE SET NULL | never set on update either (same payload) | never shown |
| `deleted_at` | timestamptz | YES | — | — | set by `handleDeleteForm` (`AdminInquiriesPage.tsx:140-156`, soft delete) | filters site reads (`src/lib/submissions-next.ts:21`) |
| `deleted_by` | uuid | YES | — | FK → `user_profiles(id)` ON DELETE SET NULL | set to `admin.id` on delete (`AdminInquiriesPage.tsx:147`) | never shown |
| `status` | content_status enum (draft/published/archived) | NO | `'published'` | enum `content_status` | always forced to `'published'` on save (`AdminInquiriesPage.tsx:109`) — admin UI never offers draft/archived, so a form can't be unpublished short of soft-deleting it | gates public SELECT (`status='published'`) |
| `metadata` | jsonb | NO | `'{}'` | none | **never editable in the admin UI** — the `slug` that the public site depends on to find the right form (`src/lib/submissions-next.ts:26`) has no admin field to set/see it | read by `submitForm()` to match `formSlug` |

Constraints & indexes (live): PK `inquiry_forms_pkey(id)`; UNIQUE `unique_form_name(form_name)`; FKs
`created_by/updated_by/deleted_by → user_profiles(id)` (ON DELETE SET NULL).

RLS policies (live):
- `Public read inquiry_forms` — SELECT, roles `anon, authenticated` — USING: row is visible if
  `status = 'published' AND deleted_at IS NULL`. Correct for public consumption.
- `Global write inquiry_forms` — ALL, role `public` (i.e. PostgREST default, effectively any logged-in
  role reaching it) — USING/WITH CHECK: `is_global_admin() OR can_write_section('admissions')`. So a
  scoped admin with write access to the "admissions" section can also edit `inquiry_forms`/write submissions,
  even though `src/lib/admin-sections.ts:31` lists `/admin/inquiries` as **global-only** in the UI (`GLOBAL_ONLY_ROUTE_PREFIXES`). The UI hides the page from scoped admins, but RLS would let a
  college/department admin with `can_write_section('admissions')` reach the same tables directly via the
  Supabase client. Not necessarily a bug (RLS is correctly permissive-by-design per CLAUDE.md), but the
  UI's "global-only" framing is stricter than what RLS actually allows.

Triggers: `update_inquiry_forms_modtime` (BEFORE UPDATE) → `update_updated_at_column()`, standard
`updated_at = now()` bump.

Migration drift: table, trigger, and FK definitions match `supabase/migrations/20260812000000_phase0_baseline.sql:1092-1111`. The live RLS policies differ from the ones baselined at
`supabase/migrations/20260812000000_phase0_baseline.sql:5425-5428` (baseline: `Global write` used
`is_global_admin()` only) — that's explained by the later
`supabase/migrations/20260921072107_section_scoped_write_policies.sql`, which adds the
`can_write_section('admissions')` OR-clause; this is **tracked, not drift**.

#### `inquiry_submissions`

- Row count (live): **5**. Soft-delete: yes (`deleted_at`/`deleted_by`). Status column: yes (`status`,
  `submission_status` enum: `unread`/`read`/`replied`, default `unread`). Audit columns: `created_at/by`,
  `updated_at/by`. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` | PK | row key for delete button (`AdminInquiriesPage.tsx:355`) | never shown |
| `form_id` | uuid | NO | — | FK → `inquiry_forms(id)` ON DELETE CASCADE | selected via the "Active Template" dropdown that filters the inbox (`AdminInquiriesPage.tsx:280-291`) | set by `submitForm()` from the resolved form id (`src/lib/submissions-next.ts:43`) |
| `submitted_data` | jsonb | NO | — | none — no schema validation against `fields_config` | rendered as dynamic columns, keys unioned across all rows (`AdminInquiriesPage.tsx:176-184`, `:348-352`) and exported to CSV (`:186-212`) | written verbatim from each form's `FormData` (`GrievanceForm.tsx:20-27`, `InquiryForm.tsx:30-40`) |
| `status` | submission_status enum | NO | `'unread'` | enum | **never read or written anywhere in the admin UI** — `AdminInquiriesPage` selects `*` but has no column/filter/action for unread/read/replied; every submission sits at `unread` forever | n/a |
| `notes` | text | YES | — | none | displayed read-only ("Staff Notes" column, `AdminInquiriesPage.tsx:353`) but **there is no UI to add/edit a note** — the column exists, is rendered, but has no input anywhere in the file | n/a |
| `created_at` | timestamptz | NO | `timezone('utc', now())` | — | shown as "Date Info" (`AdminInquiriesPage.tsx:342-347`), sort key (`loadSubmissions`, `:80`) | never shown on site |
| `updated_at` | timestamptz | NO | `timezone('utc', now())` | trigger (`update_inquiry_submissions_modtime`) | never edited | never shown |
| `created_by` | uuid | YES | — | FK → `user_profiles(id)` ON DELETE SET NULL | always null (public inserts are unauthenticated) | n/a |
| `updated_by` | uuid | YES | — | FK → `user_profiles(id)` ON DELETE SET NULL | never set | n/a |
| `deleted_at` | timestamptz | YES | — | — | set by `handleDeleteSubmission` (soft delete, `AdminInquiriesPage.tsx:163-166`) | filters admin's own read (`:80`) |
| `deleted_by` | uuid | YES | — | FK → `user_profiles(id)` ON DELETE SET NULL | set to `admin.id` (`:165`) | n/a |
| `metadata` | jsonb | NO | `'{}'` | none | never surfaced | never written by `submitForm()` — always `{}` |

Constraints & indexes (live): PK `inquiry_submissions_pkey(id)`; FK `form_id → inquiry_forms(id) ON
DELETE CASCADE` (deleting a form template hard-deletes its submissions at the DB level — this
contradicts the admin's own confirm dialog, see Gaps); FKs `created_by/updated_by/deleted_by →
user_profiles(id)`.

RLS policies (live):
- `Public insert inquiry_submissions` — INSERT, role `public` — WITH CHECK: `true`. **Unrestricted
  anonymous insert**: no CAPTCHA, no rate limit, no shape/field validation against the target form's
  `fields_config`, no email-format check, nothing. Anyone can POST arbitrary JSON (any size, any keys) as
  `submitted_data` tied to any existing `form_id`, as many times as they like.
- `Global read inquiry_submissions` — SELECT, role `authenticated` — USING:
  `is_global_admin() OR can_write_section('admissions')`.
- `Global update inquiry_submissions` — UPDATE — same predicate, both sides.
- `Global delete inquiry_submissions` — DELETE — same predicate.

Triggers: `update_inquiry_submissions_modtime` (BEFORE UPDATE) → `update_updated_at_column()`.

Migration drift: table/FK/trigger shape matches baseline
(`supabase/migrations/20260812000000_phase0_baseline.sql:1112-1131, 3845-3849`). RLS predicates for
read/update/delete differ from the baseline's `is_global_admin()`-only versions; again accounted for by
`20260921072107_section_scoped_write_policies.sql` — tracked, not drift. No migration anywhere defines a
rate limit, CAPTCHA, or submission size cap for the public INSERT policy.

### Admin

- **Route**: `/admin/inquiries` → `src/app/admin/(dashboard)/inquiries/page.tsx` (thin wrapper) renders
  `src/components/admin-next/pages/AdminInquiriesPage.tsx`. Classified **global-only** in
  `src/lib/admin-sections.ts:31` and `:116` (`"/admin/inquiries": "admissions"` section mapping), so it's
  hidden from the sidebar and route-guarded for anything but `scope_type === 'global'` admins — tighter
  than the RLS, which (per `can_write_section('admissions')`) would also let a scoped admin through if
  they ever hit the Supabase client directly.
- **Component**: single client component, two tabs — "Submissions Inbox" and "Configure Template Fields".
  No server actions are used; all reads/writes go straight through the browser Supabase client
  (`createClient()` from `@/app/lib/supabase/client`, `AdminInquiriesPage.tsx:4,26`), relying entirely on
  RLS for authorization (no `requireAdmin()` call in this file — correct per the architecture since RLS
  is the enforcement layer, but there is also no server action here at all, unlike most other admin CRUD
  which routes through `src/app/admin/actions.ts`).
- **Forms tab**: lets an admin create/edit/soft-delete `inquiry_forms` rows: name, recipient emails
  (comma list), and a raw JSON textarea for `fields_config` (`AdminInquiriesPage.tsx:91-128, 402-454`).
  There is no field to set `metadata.slug`, which is the only thing that actually connects a form row to
  a public page (see Gaps) — so a non-technical admin creating a new form from this UI could never wire
  it to an actual site form.
- **Submissions tab**: dropdown to pick a form template, free-text search across `submitted_data` values
  and `notes` (client-side filter, `:214-226`), a CSV export (`handleExportCSV`, `:186-212`, columns =
  union of all `submitted_data` keys across loaded rows, client-generated, not server-side), and a
  per-row soft-delete. No bulk actions, no status change (unread/read/replied unused), no notes editor,
  no reply/email action.
- **Imports**: none — this domain has no CSV import (unlike faculty/achievements).
- **Trash**: `src/components/admin-next/pages/AdminTrashPage.tsx` includes `inquiry_forms` and
  `inquiry_submissions` in its managed-tables list (lines 43-44) — soft-deleted rows from either table
  are restorable from `/admin/trash`, consistent with the soft-delete pattern.
- **Audit log**: no explicit audit-log writes from this page (relies on whatever global DB-level audit
  trigger infrastructure exists elsewhere in the schema, not inspected further here as it's out of this
  domain's scope — note for the audit-log section owner).
- **Roles/scopes**: effectively `admin`/global editor roles only, per `GLOBAL_ONLY_ROUTE_PREFIXES`.

### Data layer

- `src/lib/submissions-next.ts` — the only data-layer module for this domain. Client-only (`'use client'`,
  line 6) wrapper around the browser Supabase client.
  - `getFormId(slug)` (`:12-32`): fetches **all** published, non-deleted `inquiry_forms` rows
    (`select('id, metadata')`, no `.eq` on slug — the slug match happens client-side via `.find()` on
    `metadata.slug`, `:25-27`) and caches the resolved id in a module-level `Map` (`formIdCache`, `:10`) —
    this cache is per browser tab/session (module scope), not persisted, so it's rebuilt on reload; fine
    for its purpose but means every first submit on a page load re-fetches all forms.
  - `submitForm(formSlug, submittedData)` (`:34-46`): resolves the form id, then
    `insert({ form_id, submitted_data })` into `inquiry_submissions`. No client-side validation of
    `submittedData` shape against the form's `fields_config` (fields_config is never even fetched here).
  - No caching/revalidation concerns beyond the in-memory id cache (this module never reads published
    content for rendering, only writes).
  - Note: the file's own header comment (`:1-5`) documents that this exists specifically to avoid a
    Vite-only Supabase client that reads non-public `SUPABASE_URL` — i.e. a deliberate Next.js-migration
    fix, not dead code.
- There is no `src/lib/*.functions.ts` module for inquiries (no `inquiries.functions.ts`) — unlike every
  other public-data domain in this codebase, this one has no server-side read path at all; the public
  site only ever **writes** to this domain, never reads it back.

### Website

- **`/admissions/inquiry`** (`src/app/(site)/admissions/inquiry/page.tsx`) — Server Component, fetches
  programmes/contact/misc settings, renders `InquiryForm`
  (`src/components/site-next/InquiryForm.tsx`). Fields: first/last name, email, mobile, city, state,
  programme (populated from live `getAllProgrammes()`), a **year `<select>` with a single hardcoded
  option** bound to `admissionYear` (`InquiryForm.tsx:93-97` — `<option value={yr}>{yr}</option>`, no
  other years selectable, so the field is cosmetic/decorative only), message, and a required consent
  checkbox. Submits via `submitForm("admission-inquiry", …)`. Success state is a static "Thank you"
  panel (no reference number, unlike Grievance). Error handling: toast only, via `sonner`.
- **`/grievance`** (`src/app/(site)/grievance/page.tsx`) — renders `GrievanceForm`
  (`src/components/site-next/GrievanceForm.tsx`). Fields: name, enrollment/employee no., email, category
  (select: Academic/Hostel/Administrative/Other), description. Generates a client-side reference number
  (`"GRV-" + Date.now().toString(36).toUpperCase()`, `GrievanceForm.tsx:19`) **before** confirming the
  insert succeeded — it's computed and would be shown even if, hypothetically, the UI didn't gate on
  `sent` (it does gate correctly here, so not currently misleading, but the ref number is never persisted
  as a real column — it only lives inside `submitted_data.reference_number`, so an admin can only find a
  specific grievance by searching submissions for that opaque string; there's no indexed/queryable
  reference field). The page's static copy promises "The committee reviews within 48 hours" and
  "resolution... within 5 working days" and "Escalation is available" (`grievance/page.tsx:19-23`) — none
  of this is backed by any workflow: there is no committee review queue, no SLA timer, no escalation
  mechanism, no notification to anyone that a grievance was filed (see Gaps: notification).
- **Quick Enquiry** (`src/components/site-next/EnquiryForm.tsx`), rendered nowhere — grepping the whole
  `src/` tree finds zero importers of `EnquiryForm` outside its own file. It is dead code: a fully built
  form (name/email/mobile/programme select) whose `onSubmit` only calls `e.preventDefault()`,
  `setSent(true)`, and a toast (`EnquiryForm.tsx:16-22`) — it never calls `submitForm` or touches Supabase
  at all, and isn't mounted on any page today. If it is ever wired up without fixing this, it would
  silently discard every enquiry while telling the visitor "Thank you! We'll respond within 24 hours."
- **`/student-login`** (`src/app/(site)/student-login/page.tsx`) — renders `StudentLoginForm`
  (`src/components/site-next/StudentLoginForm.tsx`). The only live data it fetches is
  `it_support_email` from misc settings for the help-contact mailto link. The login form itself
  (`StudentLoginForm.tsx:15-19`) has no `name`/`id` attributes on its inputs, no real auth call — on
  submit it only does `e.preventDefault()` and `toast.info("Portal integration coming soon.")`. No
  Supabase Auth, no student-portal backend exists anywhere in this repo. This is an intentional stub (the
  toast says so) rather than a silently-broken feature, but the page's hero copy ("Log in to access
  marks, attendance, fees and notices") oversells a feature that doesn't exist at all.
- **Orphaned "Contact Form" row**: `inquiry_forms` has a published row with `metadata.slug = "contact"`
  and its own recipient list, but there is no `/contact` route, no `ContactForm` component, and no other
  caller anywhere in `src` that submits to slug `contact`. It's DB-only config with no front end.
- **Empty/fallback behaviour**: all three live forms (`InquiryForm`, `GrievanceForm`) wrap their submit in
  try/catch and show a `sonner` toast on failure (`"Something went wrong. Please try again."` or the
  thrown message) — no error boundary, no retry, no persistence of the user's input on failure (the form
  isn't disabled-and-preserved; a failed submit just re-enables the button with the same field values
  still in the uncontrolled `FormData`-backed inputs, so nothing is actually lost, but there's no explicit
  "we saved your draft" affordance either).
- **Hardcoded content that should arguably come from Supabase**: the Grievance "What happens next"
  steps and SLA language (`grievance/page.tsx:19-23`), the Admission Inquiry "Why Apply" bullet list
  (`InquiryForm.tsx:119-124`, partly data-driven via `placementPct` but "AICTE approved" / "Scholarships
  available" / "Modern hostels" are static strings), and the Student Login hero subtitle are all
  hardcoded JSX, consistent with how most marketing copy works elsewhere in this codebase (CLAUDE.md
  flags admin-edited content specifically; this copy isn't admin-edited content, it's page chrome, so
  it's a minor/cosmetic note rather than a rule violation).

### Storage/media

- None. No file upload field exists on any of these forms, and no storage bucket is referenced anywhere
  in this domain.

#### Gaps (Inquiries, grievance & public forms)

1. **[broken] No admin UI to set `inquiry_forms.metadata.slug`.** The public site's `submitForm()`
   (`src/lib/submissions-next.ts:26`) is the only thing that matches a submission to a form, and it
   matches purely on `metadata.slug`. The admin "New Inquiry Form" / "Edit Form" modal
   (`AdminInquiriesPage.tsx:402-454`) has no field for `metadata` at all — a non-technical admin cannot
   create a new working form, or see/understand why an existing one works, from the admin panel. They
   would have to hand-edit the JSONB in the database directly.
   - Fix: add a `metadata.slug` field to the form editor (ideally auto-derived from `form_name`, shown
     read-only with a copy button once set, since changing it after a page ships would silently break
     that page's submissions).

2. **[dead] `fields_config` and `recipient_emails` are stored but never consumed.** No code anywhere
   reads `fields_config` to render a form dynamically (every public form's fields are hardcoded JSX, not
   generated from this JSON), and no code anywhere reads `recipient_emails` to send a notification. There
   is no email/notification system in this codebase at all (no edge function, no `nodemailer`/`resend`/
   SMTP code, confirmed by repo-wide search).
   - Fix: either wire `recipient_emails` to a real notification path (e.g. a Supabase Edge Function
     triggered on insert) or remove the field and the "Recipient Email Addresses" input so the admin
     panel stops implying that submitting a form notifies anyone — currently a grievance or admission
     inquiry can sit unseen indefinitely unless an admin manually opens `/admin/inquiries`.

3. **[misleading] Grievance page promises a review/escalation workflow that doesn't exist.**
   `src/app/(site)/grievance/page.tsx:19-23` states the committee reviews within 48 hours, resolves
   within 5 working days, and that escalation is available. The actual system: an anonymous insert into
   `inquiry_submissions` with `status` defaulting to `unread`, a status value that the admin UI never
   reads or changes (see #4), and no escalation, SLA tracking, or outbound communication of any kind.
   - Fix: either build the minimal workflow (status transitions + a visible SLA clock in admin) or soften
     the page copy to match reality.

4. **[dead] `inquiry_submissions.status` (unread/read/replied) and `.notes` are unused by the admin UI.**
   `AdminInquiriesPage.tsx` selects `*` (so it fetches both columns) but renders `notes` read-only with no
   input to set it (`:353`, "(No notes added)" is the only state it can ever show) and never displays or
   changes `status` anywhere. Every submission is permanently `unread` from the admin's point of view, so
   there's no way to track which inquiries have been handled.
   - Fix: add a status toggle/badge and a notes textarea with a save action to the submissions table.

5. **[broken/misleading] `ON DELETE CASCADE` on `inquiry_submissions.form_id` contradicts the admin's own
   confirmation message.** `handleDeleteForm` (`AdminInquiriesPage.tsx:140-141`) tells the admin
   "Submissions will remain archived" before soft-deleting a form template. But the live FK
   (`inquiry_submissions_form_id_fkey ... ON DELETE CASCADE`) only matters for a hard delete of the form
   row, which this soft-delete flow never performs — so today the claim happens to be true in practice
   (the form row is merely flagged `deleted_at`, not removed), but the schema has no actual protection if
   anyone (e.g. a future hard-delete/cleanup job, or a manual SQL delete) removes a form row: every one of
   its submissions would be silently destroyed with no warning, despite the UI's explicit promise that
   submissions are archived.
   - Fix: change the FK to `ON DELETE SET NULL` (or `RESTRICT`) so a hard delete can never silently wipe
     submission history, or explicitly document that "archived" only applies to soft-delete.

6. **[broken] Anonymous INSERT into `inquiry_submissions` has zero validation or abuse protection.** RLS
   policy `Public insert inquiry_submissions` is `WITH CHECK (true)` — any unauthenticated caller can
   insert arbitrary-shaped, arbitrary-size JSON under any existing `form_id`, with no CAPTCHA, honeypot,
   rate limit, or field-shape check against `fields_config`. This is a spam/abuse surface (and a
   self-inflicted PII bucket: anyone can insert attacker-chosen "PII" into this table too).
   - Fix: add a honeypot field + simple rate limiting (e.g. via a Postgres function checking inserts per
     IP/time in a trigger, or an edge function in front of the insert), and/or a CAPTCHA on the forms.

7. **[dead] `EnquiryForm` component is never rendered anywhere.** `src/components/site-next/EnquiryForm.tsx`
   has zero importers outside its own file. It also never calls `submitForm` — its submit handler is pure
   UI theater (`setSent(true)` + toast, `EnquiryForm.tsx:16-22`). If someone wires it into
   `CollegeLandingPage` (the department-contact pattern it was clearly built for — it takes
   `shortCode`/`departments` props matching that page) without also fixing the submit handler, visitors on
   college pages would see "Thank you! We'll respond within 24 hours" for enquiries that were never saved
   anywhere.
   - Fix: either remove the component, or finish it (wire to `submitForm`, pick/register a form slug for
     it, e.g. `department-enquiry`) before it's mounted on a page.

8. **[misleading] Student Login page oversells a non-existent portal.** `StudentLoginForm.tsx` has no
   `name` attributes on its inputs and performs no authentication — the only behavior is a
   "Portal integration coming soon" toast. The page's own subtitle
   ("Log in to access marks, attendance, fees and notices") describes features that don't exist in this
   codebase at all (no student-facing marks/attendance/fees module). Low severity since the toast is
   honest, but the hero copy isn't.
   - Fix: soften the hero subtitle to something like "Student portal access" until the backend exists, or
     link out to whatever third-party ERP actually hosts this functionality (if one exists — not found in
     this repo).

9. **[dead] Orphaned `inquiry_forms` row for `slug: "contact"` ("Contact Form").** No `/contact` route or
   `ContactForm` component exists anywhere in `src/app` or `src/components`; this form row and its
   `recipient_emails` are unreachable from the live site.
   - Fix: either build the contact page that was evidently planned, or soft-delete the row so the admin
     "Forms" tab doesn't list a template nothing points to.

10. **[cosmetic] Admin-only global-vs-scoped mismatch.** `src/lib/admin-sections.ts` hides
    `/admin/inquiries` from every non-global admin (`GLOBAL_ONLY_ROUTE_PREFIXES`), but the live RLS
    (`is_global_admin() OR can_write_section('admissions')`) would also allow a scoped "admissions"-write
    admin to read/write these tables if they reached Supabase directly (e.g. via browser devtools against
    the same anon/auth session). Not exploitable beyond what their role already grants elsewhere, but the
    UI's framing as strictly global-only is narrower than the actual authorization boundary — worth
    reconciling so the two stay documented as intentionally equivalent or are tightened to match.

11. **[cosmetic] `InquiryForm`'s "Year" field is a fixed single-option select.** `InquiryForm.tsx:93-97`
    renders `<select><option value={yr}>{yr}</option></select>` with no other choices — functionally a
    read-only label styled as a dropdown. Minor UX inconsistency, not a data problem.


#### Verification corrections

A second, independent pass re-checked this section against the live code and database. Corrections:

- No material factual errors found in the section — spot-checked column types, FK delete behavior, live RLS policy predicates, row counts (3 inquiry_forms, 5 inquiry_submissions), file paths, and cited line numbers (AdminInquiriesPage.tsx handleDeleteForm/handleDeleteSubmission/handleSaveForm, admin-sections.ts:31,116, submissions-next.ts, grievance/page.tsx, StudentLoginForm.tsx, EnquiryForm.tsx, InquiryForm.tsx) all match the live code and database exactly as described.
- Minor nit only: the cited admin form-editor modal line range (402-454) is approximately but not exactly aligned with the actual JSX in the file (the <form onSubmit={handleSaveForm}> tag itself starts at line 407); this is a negligible line-drift, not a factual error about content or behavior.


---

## Auth, roles, RLS, audit, trash, admin shell, DB-wide objects

Everything here was checked against the **live** Supabase project (SELECT-only; `mcp__supabase__list_migrations`
shows 84 tracked migrations, newest `20260924062926`) and cross-referenced with `supabase/migrations/*.sql` and
the app code on `nextjs-migration`. Live row counts as of 2026-10-03.

### Role / scope model

**Summary**: Access control is two orthogonal systems layered on one `user_profiles` row per `auth.users` row:
(1) a scope tree (`user_roles`: role × {global, trust, institute, college, department}) that most RLS policies
and the admin UI treat as "how wide can this person write", and (2) a parallel, mostly-dead "section grant"
system (`user_section_grants` + `admin_sections`) meant to unlock specific CMS sections (Home Page, News, Placement…)
for someone who isn't global and doesn't fit the scope tree. A third system — `roles`/`permissions`/`role_permissions`
— exists in the schema but is never consulted by any RLS policy or app code; only `roles.code` (a free-standing
string compared with `IN ('admin','editor',...)`) is actually used for authorization.

#### `user_profiles`
- Row count: 32. Soft-delete: yes (`deleted_at`/`deleted_by`). Status column: yes (`content_status` enum,
  default `published`). Audit columns: `created_at/by`, `updated_at/by`. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | — | PK; FK → `auth.users(id)` ON DELETE CASCADE | never edited directly (set at account creation) | never shown |
| first_name | text | YES | — | — | User Management "Edit profile" dialog — `src/app/admin/(dashboard)/user-management/actions.ts:329` (`updatePortalUserProfile`); also prefilled at account creation, `actions.ts:247` | never shown (admin-only identity) |
| last_name | text | YES | — | — | same as above | never shown |
| avatar_url | text | YES | — | — | never edited (no UI field sets it after creation; only `handle_new_user()` seeds it from OAuth metadata) | AdminSidebar user chip initial only (`src/components/admin-next/AdminSidebar.tsx:199`), not from this column — see Gaps |
| bio | text | YES | — | — | never edited | never shown |
| created_at | timestamptz | NO | `timezone('utc', now())` | — | never edited | never shown |
| updated_at | timestamptz | NO | `timezone('utc', now())` | — | trigger-maintained (`update_profiles_modtime`) | never shown |
| created_by | uuid | YES | — | FK → `user_profiles(id)` ON DELETE SET NULL | never edited | never shown |
| updated_by | uuid | YES | — | FK → `user_profiles(id)` ON DELETE SET NULL | set by `updatePortalUserProfile` | never shown |
| deleted_at | timestamptz | YES | — | — | **no UI sets or clears this** (see Gaps — not in Trash table list) | never shown |
| deleted_by | uuid | YES | — | FK → `user_profiles(id)` ON DELETE SET NULL | same | never shown |
| status | content_status enum | NO | `'published'` | enum: draft/published/archived | never edited | never shown |
| metadata | jsonb | NO | `'{}'` | — | never edited | never shown |

- Constraints: PK `(id)`; `user_profiles_id_fkey` → `auth.users(id)` CASCADE.
- Indexes: PK only (no index on `deleted_at`, `status`, or name columns — fine at 32 rows).
- RLS policies:
  - `Read own or global profile` (SELECT, authenticated): `id = auth.uid() OR is_global_admin()` — a signed-in user reads their own profile; a global admin reads all.
  - `Update own or global profile` (UPDATE): same condition on USING and WITH CHECK.
  - `Global insert profiles` (INSERT): WITH CHECK `is_global_admin()`. (In practice `handle_new_user()` is SECURITY DEFINER and bypasses this anyway — see below.)
  - `Global delete profiles` (DELETE): USING `is_global_admin()`.
- Triggers: `on_user_profile_created` AFTER INSERT → `handle_first_user_role()` (bootstraps the very first signup as a global `admin`, see below); `update_profiles_modtime` BEFORE UPDATE → `update_updated_at_column()`.
- Migration drift: none found — matches `normalize_phase2_staff_pages` / `rbac_rls_user_roles` lineage.

#### `user_roles`
- Row count: 37. Soft-delete: yes. Status: yes. Audit columns: yes. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` | PK | never edited | never shown |
| user_id | uuid | NO | — | FK → `user_profiles(id)` CASCADE | User Management "Assign role" — `user-management/actions.ts:263,298` (`createPortalUser`, `assignPortalUserRole`) | never shown |
| role_id | uuid | NO | — | FK → `roles(id)` CASCADE | same (role picker, `AdminUserManagementPage`) | never shown |
| scope_type | scope_level enum | NO | — | enum global/trust/institute/college/department; `scope_fkey_check` CHECK ties it to exactly one of the 4 id columns (or none for global) | scope picker in the same forms | never shown |
| trust_id | uuid | YES | — | FK → `trusts(id)` CASCADE | scope picker (trust option exists in schema but `createPortalUser`'s UI scope dropdown offers global/college/department — see Gaps re: trust/institute) | never shown |
| institute_id | uuid | YES | — | FK → `institutes(id)` CASCADE | **no UI ever sets this on `user_roles`** — institute-scoped `user_roles` rows exist in the DB (8 of them) but nothing in `user-management/actions.ts` can create a new one (its scope dropdown only emits global/trust/college/department — see Gaps) | never shown |
| college_id | uuid | YES | — | FK → `colleges(id)` CASCADE | scope picker | never shown |
| department_id | uuid | YES | — | FK → `departments(id)` CASCADE | scope picker | never shown |
| created_at/updated_at | timestamptz | NO | utc now() | — | trigger-maintained | never shown |
| created_by/updated_by | uuid | YES | — | FK → `user_profiles(id)` SET NULL | set on insert | never shown |
| deleted_at/deleted_by | timestamptz/uuid | YES | — | — | set by `removePortalUserRole` (`user-management/actions.ts:313`, soft-delete) | never shown |
| status | content_status enum | NO | `'published'` | — | implicitly `published` on insert, `archived` on remove | never shown |
| metadata | jsonb | NO | `'{}'` | — | never edited | never shown |

- Constraints: PK; `unique_user_role_scope` UNIQUE on the full (user, role, scope, trust/institute/college/department) tuple; `scope_fkey_check` CHECK (quoted above is correct — enforces exactly-one-scope-id-set-per-scope_type, **but note it has no branch requiring `trust_id`/etc. for `scope_type='institute'`... it does**: institute branch requires `institute_id IS NOT NULL`). All 4 scope FKs CASCADE delete, so deleting a college/department/trust/institute silently deletes any admin's role grant at that scope (no warning anywhere in the admin UI).
- Indexes: PK, `unique_user_role_scope`, plus **duplicate** `idx_user_roles_user_id` and `user_roles_user_id_idx` (identical, flagged by the Postgres advisor — drop one), `user_roles_college_id_idx`, `user_roles_department_id_idx`. No index on `role_id`, `trust_id`, or `institute_id` despite FKs on all three (advisor: `unindexed_foreign_keys`).
- RLS policies:
  - `user_roles_select` (SELECT): `user_id = auth.uid() OR is_global_admin()` — a user can see their own role rows; only a global admin sees everyone's.
  - `user_roles_insert` (INSERT): WITH CHECK `is_global_admin()`.
  - `user_roles_update` (UPDATE): USING/WITH CHECK `is_global_admin()`.
  - `user_roles_delete` (DELETE): USING `is_global_admin()`.
  - Advisor flags `user_roles_select` for re-evaluating `auth.uid()`/`is_global_admin()` per row instead of `(select auth.uid())` — perf-only, not a correctness bug at 37 rows.
- Triggers: `update_user_roles_modtime` BEFORE UPDATE.
- Migration drift: none.

#### `user_section_grants`
- Row count: 8. Soft-delete: yes. Status: yes. Audit columns: yes. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` | PK | never edited | never shown |
| user_id | uuid | NO | — | FK → `user_profiles(id)` CASCADE | User Management "Grant section" — `user-management/actions.ts:159` (`assignPortalUserSection`) | never shown |
| section_id | uuid | NO | — | FK → `admin_sections(id)` (no ON DELETE clause → defaults to NO ACTION, meaning deleting an `admin_sections` row that still has grants would error, not cascade) | section picker (list from `listSectionOptions`) | never shown |
| scope_type | scope_level enum | NO | `'institute'` | same CHECK pattern as `user_roles` (`section_scope_fkey_check`) | **hardcoded** — see Gaps: `assignPortalUserSection` always writes `scope_type: 'institute'` and the first non-deleted row from `institutes`, regardless of which college/department the admin actually wants to scope the grant to | never shown |
| institute_id | uuid | YES | — | FK → `institutes(id)` CASCADE | set to "whichever institute happens to be first" (see above) | never shown |
| college_id / department_id | uuid | YES | — | FK → `colleges`/`departments` CASCADE | **never set** — the UI has no path to create a college- or department-scoped section grant even though the schema and `can_write_section()` both support it | never shown |
| created_at/updated_at | timestamptz | NO | utc now() | — | trigger-maintained | never shown |
| created_by/updated_by | uuid | YES | — | FK → `user_profiles(id)` SET NULL | set on insert | never shown |
| deleted_at/deleted_by | timestamptz/uuid | YES | — | — | set by `removePortalUserSection` (soft-delete) | never shown |
| status | content_status enum | NO | `'published'` | — | — | never shown |
| metadata | jsonb | NO | `'{}'` | — | never edited | never shown |

- Constraints: PK; `unique_user_section_scope` UNIQUE; `section_scope_fkey_check`; `user_section_grants_section_id_fkey`.
- Indexes: PK, unique index, partial index `user_section_grants_user_id_idx ... WHERE deleted_at IS NULL`. `section_id` FK has no covering index (advisor).
- RLS: `Authenticated read user_section_grants` (SELECT, qual `true`) — **any signed-in user, including one with zero admin roles, can read every row of this table** (every user_id ↔ section ↔ scope mapping in the system) via the PostgREST API; `Global admin write user_section_grants` (ALL) gated on `is_global_admin()`.
- Triggers: `update_user_section_grants_modtime`.
- Migration drift: table and its RLS come from `admin_section_permissions`/`admin_section_row_tagging`/`admin_section_write_policies` (2026-09-21); matches live shape.

#### `roles`
- Row count: 2 (`admin` = "Administrator", `editor` = "Editor"). Soft-delete: yes (column exists, never used — 0 archived rows). Status: yes. Audit: yes. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` | PK | never edited | never shown |
| name | text | NO | — | UNIQUE | editable only via the generic `/admin/tables/roles` CRUD page (not linked from the sidebar — see Gaps) | shown as role label throughout User Management |
| code | text | NO | — | UNIQUE; compared literally against `'admin'/'editor'/'department_admin'/'college_admin'` in `src/app/lib/auth/admin.ts:31` | same | drives `AUTHORIZED_ROLE_CODES` gate — **but only 2 of the 4 hardcoded codes exist as rows** (see Gaps) |
| created_at/updated_at | timestamptz | NO | utc now() | — | trigger-maintained | — |
| created_by/updated_by | uuid | YES | — | FK → `user_profiles(id)` SET NULL | — | — |
| deleted_at/deleted_by | timestamptz/uuid | YES | — | — | reachable via generic CRUD soft-delete, but **not listed in `AdminTrashPage`'s `SOFT_DELETE_TABLES`**, so a soft-deleted role can never be restored or even viewed through the Trash UI | — |
| status | content_status enum | NO | `'published'` | — | — | — |
| metadata | jsonb | NO | `'{}'` | — | — | — |

- Constraints/indexes: PK, `roles_name_key`, `roles_code_key` (all 3 unindexed-FK advisor hits are the `created_by/updated_by/deleted_by` self-FKs).
- RLS: `roles_select` (SELECT, qual `true` — any authenticated user, admin or not, can read the full roles table); `roles_write` (ALL) gated `is_global_admin()`.
- Triggers: `update_roles_modtime`.
- Migration drift: **confirms `docs/audits/deferred-issues.md`** — `20260728120000_schema_restructure.sql` creates a *different*, inert `user_role_enum` (`super_admin`/`college_admin`/`dept_coordinator`) and an inert `user_roles` shape; the live, actually-used `roles`/`user_roles` tables come from the later `rbac_rls_user_roles` (20260728180812) migration. The `user_role_enum` type still exists live with 3 labels and is never referenced by any table column, policy, or app code — pure dead weight.

#### `permissions` / `role_permissions` — **dead tables**
- Row counts: `permissions` = 0, `role_permissions` = 0.
- Both have full `content_status`/soft-delete/audit column sets and RLS (`Authenticated read ...` qual `true`; `Global write ...` gated `is_global_admin()`), and both appear in the generated TS types (`src/integrations/supabase/types.ts:3168` etc.), but **no app code anywhere reads or writes either table** (`grep -rn "role_permissions\|from('permissions')"` across `src/` returns only the generated types file) and no RLS policy, trigger, or function on any other table consults them. `is_global_admin()`/`is_any_admin()`/`can_write_section()` all key off `roles.code` and `user_section_grants` directly, never off a permission. This is the finer-grained permission system CLAUDE.md flags as dead in `docs/audits/deferred-issues.md`, confirmed empty and unreferenced on the live DB.
- No sidebar entry, no route reference in `admin-sections.ts`'s `GLOBAL_ONLY_TABLE_IDS`, reachable only by typing `/admin/tables/permissions` or `/admin/tables/role_permissions` directly.

#### `admin_sections`
- Row count: 7 (`home_page`, `news_events`, `placement`, `about_us`, `campus_life`, `admissions`, `library`). Soft-delete: yes. Status: yes. Audit: yes. RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` | PK | never edited | never shown |
| code | text | NO | — | UNIQUE; the literal strings matched in `src/lib/admin-sections.ts`'s `ROUTE_SECTION_MAP` (e.g. `'home_page'`, `'news_events'`, `'placement'`, `'about_us'`, `'campus_life'`, `'admissions'`) — **`'library'` has a row but no entry in `ROUTE_SECTION_MAP`, so a user granted the Library section can never actually unlock any route with it** (see Gaps) | drives which `/admin/tables/*` or top-level route a scoped editor can reach |
| name | text | NO | — | shown in the section picker, `user-management/actions.ts:140` | — |
| created_at/updated_at | timestamptz | NO | utc now() | — | trigger-maintained | — |
| created_by/updated_by | uuid | YES | — | FK → `user_profiles(id)` SET NULL | — | — |
| deleted_at/deleted_by | timestamptz/uuid | YES | — | — | `listSectionOptions` filters `deleted_at IS NULL`, but there is **no UI to create/soft-delete an `admin_sections` row** — the 7 rows are migration-seeded and the table is otherwise read-only from the app's perspective (editable only via `/admin/tables/admin_sections`, unlinked from the sidebar) | — |
| status | content_status enum | NO | `'published'` | — | — | — |
| metadata | jsonb | NO | `'{}'` | — | — | — |

- RLS: `Authenticated read admin_sections` (SELECT, qual `true`); `Global admin write admin_sections` (ALL, `is_global_admin()`).
- Triggers: none listed beyond standard `updated_at`? (not in trigger dump — `admin_sections` has no `update_*_modtime` trigger, so `updated_at` never auto-updates on UPDATE — minor drift from every other table in this domain, which all have one.)
- Migration drift: created in `admin_section_permissions`/`admin_section_row_tagging` (2026-09-21); matches live.

#### `audit_logs`
- Row count: 271. Soft-delete: **no** `deleted_at` column (correct — an audit trail shouldn't be deletable in the normal sense). Status column: none. Audit columns: only `created_at` (no `updated_at`/`created_by`/`updated_by`, which is appropriate for an append-only log). RLS: enabled.

| Column | Type | Null | Default | FK / check / enum | Admin field | Website use |
|---|---|---|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` | PK | — | never shown |
| user_id | uuid | YES | — | FK → `user_profiles(id)` SET NULL | set automatically (DB trigger or client-side `logAuditAction`) | Dashboard "Recent Activity" feed joins `user:user_id(first_name,last_name)` — `src/app/admin/(dashboard)/page.tsx:171` |
| action | text | NO | — | free text `'INSERT'/'UPDATE'/'DELETE'` (also `'password_reset_requested'`-style ad hoc strings from `AdminCrudManager`) | — | Dashboard feed badge |
| table_name | text | NO | — | free text — no FK/enum, so a typo'd `tableId` from `AdminCrudManager` silently pollutes the log with a bogus table name | — | Dashboard feed, Trash purge/restore trail |
| record_id | uuid | NO | — | no FK (the referenced row may itself be in any table, or already hard-deleted) | — | — |
| old_values / new_values | jsonb | YES | — | — | — | — |
| client_ip / user_agent | text | YES | — | populated only by the DB-trigger path (`process_audit_log()` reads `request.headers`); the client-side `logAuditAction` path in `AdminCrudManager`/`AdminTrashPage` **never sets these**, so most of the 271 rows likely have them null | — | — |
| created_at | timestamptz | NO | utc now() | — | — | — |

- Constraints: PK; `audit_logs_user_id_fkey` SET NULL (unindexed FK per advisor).
- RLS: `Global read audit_logs` (SELECT, `is_global_admin()`); `Authenticated insert own audit_logs` (INSERT, WITH CHECK `user_id = auth.uid()` — lets any signed-in user insert a row claiming to be about any `table_name`/`record_id`, not just tables they can actually write, since there's no cross-check against `can_write_scoped_record`); `Global update/delete audit_logs` gated `is_global_admin()`.
- **Two independent write paths, not one**: a Postgres trigger (`process_audit_log()`, SECURITY DEFINER) fires on `events`, `homepage_sections`, `homepage_widgets`, `pages`, `posts` only; every other audited table (`colleges`, `departments`, `courses`, `facilities`, `committees`, `board_members`, `student_clubs`, `centers`, `menu_items`, `branches`, `department_activities`, `club_events`, …) is logged **only** because `AdminCrudManager.logAuditAction()` (client-side, best-effort, wrapped in try/catch that just `console.error`s on failure) or `AdminTrashPage`'s restore/purge handlers happen to call `audit_logs.insert()` after the fact. Live data confirms this split (see Gaps — `audit_rls_initplan`/row counts by table). Any write path that bypasses `AdminCrudManager` (staff wizards, bulk CSV import, a future server action, a direct SQL migration) leaves **no audit trail at all** for those tables, while silently producing one for the 5 trigger-covered tables. The "audit log" the admin UI presents as one subsystem is really two, with very different reliability guarantees.
- Migration drift: none found for the table itself.

### DB-wide objects (whole `public` schema)

#### Enums
| Enum | Values | Notes |
|---|---|---|
| `content_status` | draft, published, archived | universal status column |
| `scope_level` | global, trust, institute, college, department | drives `user_roles`/`user_section_grants` |
| `degree_level`, `designation_category`, `event_status`, `event_type_enum`, `facility_type`, `link_type`, `staff_type`, `submission_status` | — | domain enums, out of this section's scope |
| `user_role_enum` | super_admin, college_admin, dept_coordinator | **dead** — leftover from the superseded `20260728120000_schema_restructure.sql` RBAC design; no column, policy, or app code references it. |

#### Views
None in `public` schema (`information_schema.views` returns empty) — there is no reporting/aggregation view backing the dashboard; all dashboard counts are raw per-table `count: 'exact', head: true` queries (`src/app/admin/(dashboard)/page.tsx:141-151`), run in parallel on every dashboard load with no caching.

#### Functions in `public` (purpose, SECURITY mode, search_path)
| Function | Security | search_path set? | Purpose |
|---|---|---|---|
| `is_global_admin()` | DEFINER | yes (`''`) | `EXISTS` check: caller has a `user_roles` row with `scope_type='global'`, `status='published'`, not deleted. Core of almost every write policy in the DB. |
| `is_any_admin()` | DEFINER | yes | Caller has any `user_roles` row with `role.code IN ('admin','editor','department_admin','college_admin')`. Used by exactly one policy (`gallery_albums` entry-album insert). |
| `can_write_scoped_record(trust, institute, college, department)` | DEFINER | yes | Generic "does caller's scope match one of these ids (or are they global)" check, used across many content tables' write policies. |
| `can_write_section(code, institute, college, department)` | DEFINER | yes | Same idea but keyed on a `user_section_grants` row instead of `user_roles`. |
| `can_write_event(scope_type, college_id, department_id)` | DEFINER | yes | Narrower variant for `events` only. |
| `can_write_entry_album(album_id)` | DEFINER | yes | Resolves an album back to whichever `facilities`/`centers`/`events`/`posts` row owns it and re-checks scope/section write access on that owner — supports the shared gallery-album "entry model". |
| `current_user_is_dept_admin_for(dept_id)` | DEFINER | `'public'` (mutable) | Checks `role.code = 'department_admin'` at a given department. **Dead**: defined in the baseline migration, referenced by no live RLS policy and no app code. |
| `handle_new_user()` | DEFINER | **not set** (flagged by advisor) | AFTER INSERT trigger on `auth.users` (`on_auth_user_created`) — inserts the matching `user_profiles` row from `raw_user_meta_data`. Runs for every signup, including Google OAuth self-signups from the admin login page (see Gaps). |
| `handle_first_user_role()` | DEFINER | **not set** | AFTER INSERT trigger on `user_profiles` (`on_user_profile_created`) — if `user_roles` is completely empty, inserts a `global` `admin` role for the new user. One-time bootstrap; harmless now that 37 rows exist, but it means the *very first* person who ever signs in (including via Google) silently becomes global admin — fine for initial setup, dangerous if the table were ever fully emptied (e.g. by a careless `/admin/trash` purge cascade — see Gaps). |
| `process_audit_log()` | DEFINER | **not set** | Generic row-level audit trigger, see `audit_logs` above. |
| `update_updated_at_column()`, `update_sports_updated_at()`, `set_scholarships_updated_at()` | INVOKER (the two sport/scholarship variants) / INVOKER | n/a | Trivial `updated_at = now()` triggers; three near-duplicate implementations of the same thing — `scholarships` and `sports` each reinvent their own copy instead of using the shared `update_updated_at_column()` every other table uses (cosmetic). |
| `events_before_write()`, `events_enforce_featured_rules()`, `enforce_single_department_head()`, `cascade_entry_hard_delete_to_album()`, `cascade_entry_soft_delete_to_album()`, `cascade_album_soft_delete_to_media()` | DEFINER | yes | Domain-specific triggers outside this section's table scope, noted for completeness. |
| `get_table_schema_info(table_name)` | DEFINER | **not set** | Introspection RPC the generic `/admin/tables/[tableId]` page (`AdminCrudManager.tsx:288`) calls to build its form/grid from `information_schema` + enum labels at runtime. **Callable by `anon`** (flagged by the security advisor) — lets an unauthenticated caller enumerate every public-schema table's full column list, types, nullability, defaults, and FK targets via `/rest/v1/rpc/get_table_schema_info`, which is schema reconnaissance information disclosure (low severity — it's not row data — but unnecessary exposure; should be `SECURITY INVOKER` or revoked from `anon`). |

Every `SECURITY DEFINER` function in `public` is also advisor-flagged as executable by `anon` and `authenticated` by default (17 functions) — this is Supabase's default grant behavior (`EXECUTE` on `PUBLIC` for every new function) rather than an explicit choice in any migration; none of the migrations ever `REVOKE EXECUTE ... FROM anon`. For the `is_*`/`can_write_*` boolean checks this is harmless (they key off `auth.uid()`, which is null for `anon` and makes them return false), but `get_table_schema_info` leaking schema metadata and `handle_new_user`/`handle_first_user_role`/`process_audit_log`/the cascade functions being directly RPC-callable (as opposed to only trigger-invoked) is unnecessary attack surface.

#### RLS summary matrix (this domain's tables)
| Table | anon SELECT | authenticated SELECT | authenticated write |
|---|---|---|---|
| `user_profiles` | no | own row, or all rows if global admin | own row (update only), or all if global admin; insert/delete global-admin-only |
| `user_roles` | no | own rows, or all if global admin | global-admin-only (insert/update/delete) |
| `user_section_grants` | no | **all rows, any authenticated user** | global-admin-only |
| `roles` | no | **all rows, any authenticated user** | global-admin-only |
| `permissions` | no | **all rows, any authenticated user** (table is empty, so moot) | global-admin-only |
| `role_permissions` | no | **all rows, any authenticated user** (table is empty, so moot) | global-admin-only |
| `admin_sections` | no | **all rows, any authenticated user** | global-admin-only |
| `audit_logs` | no | global-admin-only | insert-only, self-attributed (`user_id = auth.uid()`), no check that the caller could actually write the referenced table/record |

#### Storage
- Buckets: `media` (public, no size/MIME limit), `gallery` (public, no limit), `staff-photos` (public, no limit). None of the three set `file_size_limit` or `allowed_mime_types`, so the bucket itself enforces no caps — any size/type restriction happens only in client-side compression code (`src/lib/image-compression.ts`), which a direct API call bypasses entirely.
- `storage.objects` policies exist only for the `media` bucket: public SELECT; authenticated INSERT (any authenticated role, no scope/section check — any signed-in portal user, even one with zero `user_roles`/`user_section_grants`, can upload to `media`); owner-or-global-admin UPDATE/DELETE.
- **`gallery` and `staff-photos` buckets have zero RLS policies on `storage.objects` scoped to them** — with `public: true` and no object-level policy, Supabase's default is to deny all `anon`/`authenticated` writes (no policy = no access) but still serve public reads via the bucket's public-read setting, so uploads to these two buckets must be happening exclusively through the service-role client in server actions (not checked in this pass — flagged for the Media/staff-wizard section to confirm) rather than any RLS-gated client path.
- Auth config: not independently inspectable via SQL in this pass (no `auth.config` table exposed to SQL); the Google OAuth provider is wired in `src/app/admin/login/actions.ts:43` and `supabase/auth/callback/route.ts` — whether self-service Google sign-up is restricted to a domain or invite-only is an **auth-dashboard setting, not visible in the schema**, and could not be confirmed read-only from SQL. The `auth_leaked_password_protection` advisor confirms HaveIBeenPwned checking is currently **disabled** project-wide.

### Admin shell

- **Layout** (`src/app/admin/(dashboard)/layout.tsx`): calls `getAdminUser()`; redirects to `/admin/login` if null (i.e., authenticated but no `user_roles` row with an authorized `code`). Computes `scopeLevel` via `getScopeLevel()` and passes `admin` + `scopeLevel` into `<AdminShell>`.
- **`getAdminUser()`** (`src/app/lib/auth/admin.ts:37`): one query each to `user_profiles`, `user_roles` (joined to `roles`), `user_section_grants` (joined to `admin_sections`), filtered to `status='published'` (but **not** `deleted_at IS NULL` on the `user_roles`/`user_section_grants` queries themselves — relies entirely on RLS, not an explicit filter, to exclude soft-deleted rows; since the SELECT policies don't check `deleted_at` either (`user_roles_select` only checks `user_id`/`is_global_admin`), **a soft-deleted role or section grant (`deleted_at` set, `status` flipped to `archived`) is correctly excluded only because the app always filters `.eq('status', 'published')` in the query — if that filter were ever dropped, a "removed" role would silently come back**). Authorization is an allowlist of 4 role codes (`admin`, `editor`, `department_admin`, `college_admin`) — but live `roles` only has 2 rows (`admin`, `editor`); `department_admin`/`college_admin` are referenced throughout the code (`current_user_is_dept_admin_for`, `scopeLabel` in `AdminSidebar`, dashboard `SCOPE_LABEL`) as if they're assignable roles, but **no `roles` row with those codes exists**, so a department- or college-scoped `user_roles` row must actually carry `role_id → 'editor'` (scope comes from `scope_type`/`*_id` columns, not from the role code) — the UI's scope labels ("College Admin", "Department Admin") describe the *scope*, not a distinct *role*, which is easy to misread as "there are 4 role tiers" when there are really 2 role codes × 5 scope levels.
- **Route guard** (`src/lib/admin-sections.ts`): single source of truth shared by the server route guards (`(dashboard)/.../page.tsx` files call `isRouteAllowedForUser`) and `AdminSidebar` (link visibility) — `GLOBAL_ONLY_ROUTE_PREFIXES` (29 routes), `COLLEGE_OR_ABOVE_ROUTE_PREFIXES` (2 routes), and `ROUTE_SECTION_MAP` (12 routes → 7 section codes, though only 6 of the 7 `admin_sections` codes are mapped — `library` is orphaned, see Gaps). **`roles`, `permissions`, `role_permissions`, `admin_sections`, `user_section_grants`, `trusts`, `institutes` are absent from both `GLOBAL_ONLY_ROUTE_PREFIXES` and `GLOBAL_ONLY_TABLE_IDS`** — a college- or department-scoped admin who guesses/bookmarks `/admin/tables/roles` (etc.) is **not redirected away** by the route guard (`isRouteAllowedForScope` falls through to `return true` for any route not explicitly listed); RLS still blocks their writes (`roles_write`/etc. require `is_global_admin()`), but they can freely **read** these tables and see a fully-rendered Add/Edit UI that will fail only when submitted — a misleading UX gap, not a data breach (the underlying RLS read policies already allow it for any authenticated user anyway, per the matrix above).
- **`AdminSidebar`** (`src/components/admin-next/AdminSidebar.tsx`): hardcoded `NAV_GROUPS` (no DB-driven admin menu — unlike the public site's `menus` table, the admin nav itself is static code). Filters each group's items through `isRouteAllowedForUser`. **No sidebar entry exists for `/admin/tables/roles`, `/admin/tables/permissions`, `/admin/tables/role_permissions`, or `/admin/tables/admin_sections`** at all — these 4 tables are reachable only by typing the URL; there's no way to discover them by clicking through the UI, even as a global admin (dead/undiscoverable UI despite being wired up and functional).
- **Dashboard** (`src/app/admin/(dashboard)/page.tsx`): per-table `count: 'exact', head: true}` queries for 10 metrics, run unconditionally for every admin regardless of scope (RLS narrows the counts for scoped admins automatically) — 10 parallel round-trips on every dashboard load, no caching/memoization. "Recent Activity" (`audit_logs`, last 8 rows) is fetched **only when `level === 'global'`** — a correct optimization given `audit_logs`'s global-admin-only read policy, but it means scope-limited admins (college/department) never see any activity feed at all, even for their own writes, which could read as "nothing I do is logged" even though scoped writes to the 5 trigger-covered tables are in fact logged.
- **Login** (`src/app/admin/login/page.tsx` + `login/actions.ts`): email/password via `signInWithPassword`, Google OAuth via `signInWithOAuth({provider:'google'})` → `/admin/auth/callback` → `exchangeCodeForSession` → redirect to `/admin`. **Login makes no role check** — any successful Supabase Auth sign-in (password or Google) lands on `/admin`, and it's the `(dashboard)/layout.tsx` guard, not the login flow, that then checks `getAdminUser()` and bounces unauthorized users back to `/admin/login`. Practical effect: **a brand-new Google account with zero admin history can complete OAuth sign-in** (creating `auth.users` + `user_profiles` rows via `handle_new_user()`) and only then gets redirected away — meaning every Google sign-up, successful or not, leaves a permanent `user_profiles` row with no corresponding role, and (per the RLS matrix above) that now-authenticated-but-unauthorized session can still read `roles`, `admin_sections`, `user_section_grants`, `permissions`, `role_permissions` directly against the Supabase REST API before ever touching a Next.js page.
- **`/admin/auth/callback`**: on OAuth code-exchange failure, redirects to `/admin/login?error=oauth` — no server-side logging of the failure.
- **`sendPasswordResetForUser`** (`src/app/admin/actions.ts:34`) and the whole `user-management/actions.ts` module: every exported action starts with `requireAdmin()`/`assertGlobalAdmin()` and only then dynamically imports `@/integrations/supabase/client.server` (the real service-role client) — correctly matches the CLAUDE.md pattern ("service-role client imported dynamically and only after that check").
- **`revalidatePublicSite`** (`src/app/admin/actions.ts:17`): no-ops for non-admins, but note it checks `getAdminUser()` (any of the 4 authorized role codes), not `isAdmin()` — so an `editor`/`college_admin`/`department_admin` triggering any write anywhere can force a full-site `revalidatePath('/', 'layout')`, which is intentional (any admin write should bust the public cache) and not a gap.

### Trash (`/admin/trash`, `AdminTrashPage`)

- Hardcoded `SOFT_DELETE_TABLES` array of 35 table names (content/academic/CMS tables). **None of this domain's soft-deletable tables are in it**: `user_profiles`, `user_roles`, `user_section_grants`, `roles`, `permissions`, `role_permissions`, `admin_sections` all have `deleted_at`/`deleted_by` columns and are soft-deleted by their own actions (`removePortalUserRole`, `removePortalUserSection`) or by the generic CRUD manager's delete button, but **none can be restored or even viewed as "in the bin" through `/admin/trash`** — the only way back is the generic `/admin/tables/[tableId]` page, which (per `AdminCrudManager.tsx:386-387`) always queries `.is('deleted_at', null)` and has **no toggle to view soft-deleted rows**, so a soft-deleted role/section-grant/user-profile is **invisible everywhere in the admin UI** once removed — functionally a silent, un-reversible-from-the-UI delete despite using the soft-delete columns (the row still exists and could be restored via direct SQL, but there is no admin-facing path).
- Restore (`handleRestore`) and permanent purge (`handlePurgeConfirm`, global-admin-gated in the UI via `isAdmin` — note this is a **client-side-only** gate; the actual protection is the `Global delete ...` RLS policies on each real table, which this generic trash page relies on implicitly since it just calls `.delete()` through the plain browser client) both write a best-effort row to `audit_logs` afterward, same pattern as `AdminCrudManager`.
- The "Restore" button is shown unconditionally to every admin regardless of scope — a department-scoped admin viewing `colleges`' trash bin (a table outside their scope) would see restore succeed or fail based purely on RLS, with no scope-aware filtering of which rows even appear in the dropdown-selected table's trash view (RLS on content tables generally does filter by scope for SELECT per `scope_aware_read_rls`, out of this section's remit to verify per-table).

### Migration drift (whole project)

- `list_migrations` reports 84 applied migrations, newest `20260924062926_designation_categories_and_staff_posts`; this matches the newest file under `supabase/migrations/`.
- No live object was found with zero corresponding migration, and no migration file's objects were found missing live, for this domain's tables — the schema has been fully consolidated through the `normalize_phase1-4_*` and `20260812000000_phase0_baseline` migrations.
- Confirmed drift (already called out above, matches `docs/audits/deferred-issues.md`): `20260728120000_schema_restructure.sql` defines a dead `user_role_enum` + an inert, superseded `user_roles` shape that was never the live one; the live RBAC shape comes from `20260728180812_rbac_rls_user_roles.sql` onward. The dead enum is still present live.
- `placement_cells` (flagged in `docs/audits/deferred-issues.md` as having no tracked `CREATE TABLE` migration) is outside this domain's table list — not re-verified here; flag for whoever owns the Placement section.

### Postgres advisor findings (security + performance), filtered to relevance here

- **WARN — Leaked password protection disabled** (project-wide auth setting): HaveIBeenPwned checking is off; nothing stops a user (self-service Google sign-up or an admin-created password account) from using a known-compromised password.
- **WARN — 7 functions with mutable `search_path`**: `update_updated_at_column`, `handle_new_user`, `process_audit_log`, `handle_first_user_role`, `get_table_schema_info`, `update_sports_updated_at`, `set_scholarships_updated_at` don't pin `search_path`, which is a standard Postgres SECURITY DEFINER hardening gap (a malicious `search_path` set on the calling session could in theory redirect an unqualified object reference inside the function — low practical risk here since none of these functions build/execute dynamic SQL, but it's the kind of thing Supabase's linter calls out for a reason).
- **WARN — 17 SECURITY DEFINER functions executable by `anon` and `authenticated`**: see function table above; worst offender is `get_table_schema_info` (schema reconnaissance via public RPC).
- **WARN — `auth_rls_initplan` (8 hits)**, one of which is `user_roles_select`: performance-only, re-evaluates `auth.uid()`/`is_global_admin()` per row instead of once per query.
- **WARN — `duplicate_index`**: `user_roles` has two identical indexes (`idx_user_roles_user_id`, `user_roles_user_id_idx`) — drop one.
- **WARN — `multiple_permissive_policies`**: `admin_sections`, `permissions`, `role_permissions`, `roles`, `user_section_grants` each have two permissive SELECT policies for `authenticated` (an explicit "read" policy plus the "write" `ALL` policy, which Postgres also evaluates for SELECT) — functionally harmless (both would allow the read) but means Postgres evaluates both on every query; the "write" policies could be scoped to `INSERT/UPDATE/DELETE` instead of `ALL` to avoid the overlap.
- **INFO — `unindexed_foreign_keys` (count relevant to this domain: 15)**: `audit_logs.user_id`, `permissions.{created_by,deleted_by,updated_by}`, `role_permissions.permission_id`, `roles.{created_by,deleted_by,updated_by}`, `user_roles.{created_by,deleted_by,institute_id,role_id,trust_id,updated_by}`, `user_section_grants.section_id` — all fine at current row counts, worth indexing before these tables grow.
- **INFO — `unused_index`**: `user_roles_college_id_idx` has never been used by the query planner (live traffic doesn't yet filter `user_roles` by `college_id` directly).

---

#### Gaps (Auth, roles, RLS, audit, trash, admin shell, DB-wide objects)

1. **[broken] No restore path for soft-deleted RBAC rows.** `user_profiles`, `user_roles`, `user_section_grants`, `roles`, `permissions`, `role_permissions`, `admin_sections` all carry `deleted_at`/`deleted_by` and are soft-deleted by `removePortalUserRole`/`removePortalUserSection`/the generic CRUD delete button, but none appear in `AdminTrashPage`'s `SOFT_DELETE_TABLES` list (`src/components/admin-next/pages/AdminTrashPage.tsx:9-45`), and the generic `/admin/tables/[tableId]` view always filters `.is('deleted_at', null)` with no toggle to see deleted rows. Removing a role or section grant is effectively permanent from the UI's point of view even though the data model supports undoing it. *Fix: add these tables to `SOFT_DELETE_TABLES`, or give `AdminCrudManager` a "show deleted" toggle.*

2. **[broken] `assignPortalUserSection` hardcodes scope to the first institute row.** `src/app/admin/(dashboard)/user-management/actions.ts:159-183` always inserts `scope_type: 'institute'` and `institute_id` = whatever `institutes` row sorts first (`.limit(1)`), ignoring any college/department the admin might actually intend, even though `user_section_grants` has `college_id`/`department_id` columns and `can_write_section()` supports college/department-scoped grants. Every section grant created through the UI today is institute-wide regardless of intent. *Fix: let the UI pick a scope level and target id, matching the `user_roles` assignment flow.*

3. **[broken/misleading] `admin_sections.code = 'library'` is orphaned.** The table has a `library` row (`Library` section) but `src/lib/admin-sections.ts`'s `ROUTE_SECTION_MAP` never maps any route to `'library'`. A user granted the Library section via User Management gets a grant that unlocks nothing — `getRouteSection()` never returns `'library'`, so `isRouteAllowedForUser` never matches it. *Fix: either add the missing route mapping or stop offering `library` as a grantable section.*

4. **[broken] Google OAuth login has no admin allowlist or domain restriction visible in the app.** `src/app/admin/login/actions.ts:43` (`loginWithGoogle`) and `src/app/admin/auth/callback/route.ts` let any successful Google OAuth sign-in create an `auth.users` + `user_profiles` row (via `handle_new_user()`); only the downstream `(dashboard)/layout.tsx` guard then checks for an authorized role and bounces non-admins back to `/admin/login`. Whether Google sign-up is actually open to the public or restricted at the Supabase Auth / Google OAuth app level could not be verified via SQL in this read-only pass — flagged for the project owner to confirm in the Supabase Auth dashboard, since the in-repo code provides no restriction of its own.

5. **[broken] `user_section_grants`, `roles`, `permissions`, `role_permissions`, `admin_sections` are fully readable by any authenticated user, not just admins.** All five have an `Authenticated read ...` RLS policy with `qual: true`. Combined with gap 4, a Google sign-up with zero admin role can query the Supabase REST API directly (bypassing the Next.js admin UI entirely) and read the full role/section/permission configuration of the site, including which `user_id`s hold which section grants. Low-sensitivity data (no PII beyond UUIDs), but broader than intended — CLAUDE.md's "Authorization is enforced by RLS" assumption is weaker here than for the scoped content tables. *Fix: scope these SELECT policies to `is_global_admin()` or drop them to match the write policies, unless broad read really is intended (e.g. for the role-name dropdown — which could instead go through a server action).*

6. **[broken] `get_table_schema_info` RPC is callable by `anon`.** It's `SECURITY DEFINER` with no `search_path` pinned and no `REVOKE EXECUTE FROM anon`, so an unauthenticated caller can hit `/rest/v1/rpc/get_table_schema_info` for any table name and get back its full column/type/nullability/FK map — schema reconnaissance with no login required. *Fix: `REVOKE EXECUTE ... FROM anon` or switch to `SECURITY INVOKER` and let RLS on the underlying tables do the real gating.*

7. **[misleading] Route guard and sidebar treat 4 role codes as live, but only 2 exist.** `AUTHORIZED_ROLE_CODES` in `src/app/lib/auth/admin.ts:31` lists `admin`, `editor`, `department_admin`, `college_admin`; the live `roles` table has only `admin` and `editor`. The "College Admin"/"Department Admin" labels shown in `AdminSidebar`/dashboard are derived from `scope_type`, not from a `role.code` of the same name — a scoped admin's actual `role_id` points to `editor`. This isn't broken (the scope-derived label is accurate), but it reads as "there are 4 distinct roles" when there are really 2 role codes crossed with 5 scope levels, and the dead code path for a `department_admin`/`college_admin` *role row* (as opposed to scope) would silently do nothing if anyone ever tried to create one via `/admin/tables/roles`.

8. **[misleading] `roles`, `permissions`, `role_permissions`, `admin_sections`, `user_section_grants` have no sidebar entry and aren't in `GLOBAL_ONLY_ROUTE_PREFIXES`/`GLOBAL_ONLY_TABLE_IDS`.** A global admin can't discover these 5 tables by clicking anything in the admin shell (only by guessing the `/admin/tables/<name>` URL), and a non-global admin who does guess the URL isn't redirected away by the route guard (reads succeed per gap 5; writes fail only at RLS submit-time with a raw Postgres error surfaced to the form). *Fix: either add sidebar links (if these are meant to be admin-manageable) or add them to `GLOBAL_ONLY_ROUTE_PREFIXES`/`GLOBAL_ONLY_TABLE_IDS` (if they're meant to be invisible/global-only).*

9. **[dead] `permissions` and `role_permissions` tables are completely unused.** 0 rows in both; no app code reads or writes either table; no RLS policy or function on any other table consults them. This is the fine-grained permission layer `docs/audits/deferred-issues.md` already flags as dead — confirmed empty and unreferenced on the live DB, not just undocumented.

10. **[dead] `user_role_enum` type (`super_admin`/`college_admin`/`dept_coordinator`) is live but unused.** Created by the superseded `20260728120000_schema_restructure.sql` RBAC design; no column, policy, function, or app code references it today. *Fix: drop it in a future migration once confirmed nothing depends on it.*

11. **[dead] `current_user_is_dept_admin_for()` function is unused.** Defined in the baseline migration; not referenced by any live RLS policy (checked against every policy on every table in `public`) or any app code.

12. **[dead] Duplicate index on `user_roles`.** `idx_user_roles_user_id` and `user_roles_user_id_idx` are identical (same column, same table) — one should be dropped.

13. **[cosmetic] `AdminCrudManager`'s `supabaseAdmin` is not an admin client.** `src/components/admin-next/AdminCrudManager.tsx:250` (`const supabaseAdmin = supabase as any`) is just a type-widened alias of the plain browser (anon-key, RLS-bound) Supabase client, despite the name — it has no service-role privileges. All of its reads/writes are still RLS-gated by the signed-in user's own `auth.uid()`; the name is misleading to anyone reading the code expecting privilege escalation, but there is no actual security issue (RLS still applies).

14. **[cosmetic] Audit trail is split across two mechanisms with different reliability.** A Postgres trigger (`process_audit_log()`) covers only `events`, `homepage_sections`, `homepage_widgets`, `pages`, `posts`; every other logged table (`colleges`, `departments`, `courses`, `facilities`, `committees`, `board_members`, `student_clubs`, `centers`, `menu_items`, `branches`, `department_activities`, `club_events`, and this domain's `user_roles`/`user_section_grants` removals) is logged only via best-effort client-side `audit_logs.insert()` calls in `AdminCrudManager`/`AdminTrashPage`/`user-management/actions.ts`, wrapped in try/catch that silently swallows failures (`console.error` only). Any write path that doesn't go through those specific UI components (staff wizards, CSV import, a future server action) produces **no audit trail at all** for its table, while the dashboard's "Recent Activity" feed presents all 271 rows as one uniform, complete log. `client_ip`/`user_agent` are populated only on the trigger path, so most rows have them null.

15. **[cosmetic] `admin_sections` has no `updated_at`-maintaining trigger**, unlike every other table in this domain (`update_roles_modtime`, `update_user_roles_modtime`, etc. all exist; there is no `update_admin_sections_modtime`). Its `updated_at` column will never change after insert.

16. **[cosmetic] Three near-duplicate `updated_at` trigger functions.** `update_updated_at_column()` (used by every table in this domain), plus `update_sports_updated_at()` and `set_scholarships_updated_at()` which do the exact same one-line `NEW.updated_at = now()` for just their own table — no functional difference, just unnecessary duplication.

17. **[cosmetic] Performance advisor findings not fixed**: duplicate index on `user_roles` (#12 above), 8 `auth_rls_initplan` warnings (re-evaluating `auth.uid()`/`is_global_admin()` per row instead of `(select auth.uid())`), 5 tables with overlapping permissive SELECT policies for `authenticated` (`admin_sections`, `permissions`, `role_permissions`, `roles`, `user_section_grants`), and 15 unindexed foreign keys in this domain's tables (listed above) — all low-risk at current (tiny) row counts but worth a cleanup migration.


#### Verification corrections

A second, independent pass re-checked this section against the live code and database. Corrections:

- Storage subsection cites the OAuth callback route path as 'supabase/auth/callback/route.ts', which does not exist in the repo; the correct path, used consistently elsewhere in the same document (gap 4's location field), is src/app/admin/auth/callback/route.ts.


---

## Everything else

Coverage method: `mcp__supabase__list_tables` was diffed against the 51 tables the other sections claim
("Already covered by other sections" list) — **every live public table is accounted for**, so this
section has no orphan tables to document. The gap is entirely in: public routes the domain sections'
route list missed, cross-cutting `src/lib` modules that don't belong to one table, storage buckets with
no live write path, and a few dead files left over from the TanStack/Vinxi → Next.js migration.

### Public routes missed by the domain sections

#### `/admissions` (index)
`src/app/(site)/admissions/page.tsx:1-80` (truncated read) — the admissions *landing* page. The other
sections' route list only has `/admissions/intake-fees`, `/admissions/scholarships` and
`/admissions/inquiry`; the index page itself (linked from the main nav as "Admissions") isn't in any
section.

- Pulls `getAllProgrammes()` (`src/lib/programmes.functions.ts`) and `getMiscSettings()`
  (`src/lib/site-settings.functions.ts`, `app_settings` key `misc` → `admission_year`) for the hero's
  "`{yr}` Batch" accent and dynamic FAQ copy.
- **Gap**: the 4-step "How to Apply" process (`steps` array, `src/app/(site)/admissions/page.tsx:21-26`)
  and all 4 FAQ question/answer pairs (`:34-39`) are hardcoded string literals in the page component, not
  rows from Supabase. This violates CLAUDE.md's "content lives in Supabase, not code" rule and means a
  non-technical admin cannot edit the admissions process steps or FAQ copy without a code change —
  compare to `FaqItem` usage elsewhere that often *is* fed from DB content.

#### `/campus-life/clubs/[slug]` (club detail page) and `/campus-life/clubs/not-found.tsx`
`src/app/(site)/campus-life/clubs/[slug]/page.tsx`, `.../layout.tsx`, `.../not-found.tsx`. The covered
list only names `/campus-life/clubs/[slug]/events`, i.e. the sub-route — the club's own detail page
(bio/description/photos for one `student_clubs` row, presumably rendered via the shared `Entry`
machinery, see below) has no owning section. Its `not-found.tsx` (triggered when `student_clubs.slug`
doesn't resolve) is likewise undocumented.

#### `/departments/not-found.tsx`
`src/app/(site)/departments/not-found.tsx` exists but there is no `src/app/(site)/departments/page.tsx`
— i.e. a `not-found` boundary for a route (`/departments` with no `[dept]`) that was never built. Either
dead scaffolding or a missing index page that should list all departments (currently departments are only
reachable via `/colleges/[college]` or `/courses`).

No `src/app/api/**/route.ts` handlers and no other `route.ts` exist besides
`src/app/admin/auth/callback/route.ts` (already covered) — the site has no other API routes.

### Storage (cross-cutting — buckets not owned by one domain)

Live buckets (`storage.buckets`): `gallery` (public), `media` (public), `staff-photos` (public).

- **`media`** is the only bucket any code actually uploads to. `src/lib/upload-media-next.ts:26-71`
  (`uploadRawFile` / `uploadViaClientCompression`) is called with `bucketName: 'media'` from both call
  sites that exist: `src/components/admin-next/EntryPhotosEditor.tsx:179` and
  `src/components/admin-next/pages/AdminMediaPage.tsx:142`. `storage.objects` RLS has 4 policies, **all
  scoped to `bucket_id = 'media'`**: public `SELECT`, authenticated `INSERT`
  (`auth.role() = 'authenticated'`), and owner-or-`is_global_admin()` `UPDATE`/`DELETE`.
- **Gap (dead/misleading)**: `gallery` and `staff-photos` buckets exist live with **zero**
  `storage.objects` policies referencing them and **zero** call sites in `src/` passing those bucket
  names to the uploader. Either they're leftovers from the pre-migration (Lovable/Vite) app that nothing
  writes to any more, or there's an intended-but-unbuilt upload path (staff photos obviously *sound* like
  they should live in `staff-photos`, not `media`) — worth confirming with the team before treating as
  pure dead weight, since a public bucket with no write policy also means nobody but a service-role
  script could ever populate it.
- `src/lib/image-compression.ts` (client-side `@jsquash/*` WASM compression, per CLAUDE.md) is invoked
  from `uploadViaClientCompression` for image mime types; non-image files fall back to
  `uploadRawFile`. Server-side compression mode is confirmed non-functional, matching
  `docs/audits/deferred-issues.md`.

### Cross-cutting `src/lib` modules (not owned by any single table/domain)

| Module | Used by | What it does |
|---|---|---|
| `src/lib/utils.ts` (`cn()`) | 63 files across `components/ui`, `site-next`, `a11y` | Tailwind `clsx`+`twMerge` class helper — foundational, not domain-specific. |
| `src/lib/admin-sections.ts` | `src/app/admin/(dashboard)/settings/page.tsx`, `.../page.tsx` (dashboard home), plus implicitly `AdminSidebar.tsx`/`useUserScope.ts` | Registry of admin section ids/labels/routes that drives the sidebar, `admin_sections` table rows, and `user_section_grants` scoping — the thing every "which roles/scopes can reach it" claim in the other sections ultimately traces back to. Deserves its own read if a future pass wants a canonical admin-permissions story. |
| `src/lib/entry.ts` (14 importers: `EntryCard.tsx`, `EntryViewer.tsx`, `EntryEventsGrid.tsx`, `EntryAlbumSlideshow.tsx`, `DetailPageLayout.tsx`, `AchievementsGrid.tsx`, `DepartmentSections.tsx`, `EventsBrowser.tsx`, `SportsSection.tsx`, plus 5 page files) | A shared "Entry" abstraction so `events`/`achievements`/`facilities`/`centers`/`sports`/`student_clubs`/`posts` can all be rendered through one card/detail/gallery component family instead of one component per table. If the domain sections each documented their own table's admin+website path independently, none of them likely called out that the *rendering* layer is this single shared module — a bug here (e.g. a field mapping) would ripple across every one of those tables' public pages at once. |
| `src/lib/event-types.ts` | `campus-life/events/page.tsx`, `campus-life/events/[slug]/page.tsx` | Event category/type enum and labels layered on top of the `events` table. |
| `src/lib/font-scale.ts` + `src/hooks/useFontScale.ts` + `src/components/a11y/FontSizeControl.tsx` | `src/app/layout.tsx` (root, outside `(site)`) | Site-wide text-size accessibility control, entirely client-side (no DB). `src/components/a11y/` is a whole component directory no section's component list mentions. |
| `src/lib/scroll-engine.ts` + `src/hooks/useSmoothScroll.ts` + `ScrollEngineProvider.tsx` + `SmoothScrollToggle.tsx` | Root layout / `RecruitersMarquee.tsx` | Lenis-based smooth-scroll toggle with localStorage persistence (`isSmoothScrollEnabled`/`subscribeSmoothScrollEnabled` in `scroll-engine.ts`). |
| `src/lib/staff-order.ts`, `src/lib/staff-posts.ts` | both only from `src/lib/staff.functions.ts` | Sort-order and "post" (designation group) helpers layered on `staff_profiles`/`staff_posts` — small enough that the staff domain section should really have inlined these, but they're separate files the other section may not have opened. |
| `src/lib/muster-check.ts` | `AdminStaffWizardsPage.tsx`, `faculty-import.ts` | Cross-college uniqueness check for a staff member's muster number — explicitly **not enforced in the DB** per its own comment (`src/lib/muster-check.ts:7-8`, referencing an `add_staff_muster_number` migration). Pure application-level check; a direct SQL insert or a race between two admins can still create duplicate muster numbers. |
| `src/lib/import-scope.ts` | `faculty-import.ts`, `achievements-import.ts` | Pre-checks whether a CSV row's department is in the importing admin's scope, purely to produce a friendlier error — the comment says the real boundary is the `can_write_scoped_record` RLS policy, consistent with CLAUDE.md's "authorization is enforced by RLS" rule. |
| `src/lib/theme.ts` / `src/lib/theme-next.ts` | `theme.ts`: `PageHero.tsx`, `HeroPhotoLayer.tsx`, `CollegeLandingPage.tsx`, `colleges/[college]/page.tsx`, site `layout.tsx`. `theme-next.ts`: `HeroAppearancePanel.tsx` only | `theme.ts` holds `HeroAppearance` types/defaults/style builders (`heroOverlayStyles()` etc., per CLAUDE.md); `theme-next.ts` is the Next.js-safe **write** path (`setHeroAppearance`, browser client + RLS) that the admin hero panel actually calls. Both are legitimately live — flagging only because the domain sections' table list implies `app_settings`/hero is one line item, but the read/write split across two files is easy to miss. |
| `src/lib/home-popup.ts` / `src/lib/home-popup-next.ts` | `HomePopup.tsx` (read) / `HomePopupPanel.tsx` (write, `saveHomePopup`) | Same read/write split pattern as theme, for the `app_settings` homepage-popup key. |
| `src/lib/site-settings-types.ts` / `src/lib/site-settings-next.ts` | types: `AdminSettingsPage.tsx`, `CTABanner.tsx`; writes: `AdminSettingsPage.tsx` only (`saveContactInfo`, `saveMiscSettings`, `saveCtaButtonLabel`) | Same pattern again for contact-info/misc/CTA `app_settings` keys. |
| `src/lib/submissions-next.ts` | `GrievanceForm.tsx`, `InquiryForm.tsx` | Client-side insert helpers for `inquiry_submissions`/grievance rows — worth the inquiries domain section double-checking this is the only write path and it correctly stamps `inquiry_forms.id`. |

### Confirmed dead code (zero importers anywhere in `src/`, checked with both quote styles)

- `src/lib/error-capture.ts` — comment says it exists so "server.ts can recover the stack when h3 has
  already swallowed the throw into a generic 500 Response." This is TanStack Start / Vinxi / h3
  terminology from the pre-Next.js app; there is no `server.ts` or h3 runtime left in this Next.js repo.
  Dead migration leftover.
- `src/lib/error-page.ts` (`renderErrorPage()`, a hand-built HTML error page string) — same story, no
  caller.
- `src/lib/lovable-error-reporting.ts` — wraps a `window.claude`-style `captureException` hook for the
  Lovable.dev platform; no longer referenced now that the app isn't running inside Lovable's preview
  iframe runtime.
- `src/lib/smooth-scroll.ts` (`SMOOTH_SCROLL_STORAGE_KEY`, `isSmoothScrollStoredEnabled`,
  `storeSmoothScrollEnabled`) — a **second, unused implementation** of the exact feature
  `src/lib/scroll-engine.ts` already implements and that `useSmoothScroll.ts`/`SmoothScrollToggle.tsx`
  actually use. Two competing localStorage keys for the same toggle is the kind of thing that causes a
  "my smooth-scroll preference didn't save" bug report if someone edits the wrong file.

All four are importable by path but have no `import` statement anywhere in `src/` referencing them (verified by grepping both `'@/lib/x'` and `"@/lib/x"` forms) — safe to delete, or worth a one-line comment explaining why they're kept if there's a reason (e.g. reference code for a revert).

### Global/shared UI not owned by one domain

`src/components/site-next/Header.tsx`, `Footer.tsx`, and everything in `src/components/site-next/nav/`
(`CampusMegaPanel`, `CollegesMegaPanel`, `DesktopNavItem`, `DesktopUtilityBar`, `LinksMegaPanel`,
`MobileNavPanel`, `MobileUtilityBar`) render on every public page via `src/app/(site)/layout.tsx` and are
driven by `menus.functions.ts` (menus/menu_items — presumably covered in a nav/menus domain section) plus
the college/department/course lists passed in as props for the mega panels. Likewise
`src/components/admin-next/AdminShell.tsx`, `AdminSidebar.tsx`, `AdminHeader.tsx` and
`ChangePasswordModal.tsx` are the fixed admin chrome around every `/admin/(dashboard)/*` page, driven by
`admin-sections.ts` + `useUserScope.ts`. Noting these here only to make sure a coverage matrix reader
doesn't assume they're "uncovered" — they're global chrome, not table-owned, so they rightly don't have a
table section.

`src/components/site-next/SiteSearch.tsx` + `src/lib/search-index.ts` +
`scripts/build-search-index.ts` are a self-contained feature: the build script crawls a **running**
server (per CLAUDE.md) and writes `public/search-index.json`; `search-index.ts` fetches and caches that
static file at `/search-index.json` once per page session (`src/lib/search-index.ts:47-54`); `SiteSearch`
renders the client-side search UI. This means search results are frozen at last-deploy time — any
content published through the admin panel between deploys won't appear in site search until the next
build runs `scripts/build-search-index.ts`. Not a bug per se, but worth the admin-facing docs saying so
explicitly, since "I published a page and it's not searchable" will otherwise look like a defect.

### Coverage matrix

**Every live public table → section**: all 51 tables returned by `mcp__supabase__list_tables` (`trusts,
institutes, colleges, departments, facilities, centers, cells, committees, courses, user_profiles, roles,
permissions, role_permissions, user_roles, seo_metadata, pages, menus, menu_items, redirects,
homepage_sections, homepage_widgets, homepage_items, designations, staff_profiles,
staff_department_assignments, content_categories, posts, events, achievements, gallery_albums,
gallery_media, downloads, recruiters, mous, accreditations, student_clubs, media_folders, media_files,
inquiry_forms, inquiry_submissions, audit_logs, staff_achievements, placement_cells, sports,
app_settings, placed_students, board_members, scholarships, admin_sections, user_section_grants,
staff_posts`) are present in the "already covered" table list given to this section — **no table is
unassigned**. (`cells` has 0 live rows; confirm with the covering section whether it's a built-but-unused
feature or just empty.)

**Public routes → section** (uncovered ones, assign to the nearest domain or split out):

| Route | Covered by |
|---|---|
| `/admissions` | **Uncovered** — should join whichever section owns `/admissions/intake-fees` / `/admissions/scholarships` / `/admissions/inquiry` |
| `/campus-life/clubs/[slug]` | **Uncovered** — should join the section covering `/campus-life/clubs/[slug]/events` and `student_clubs` |
| `/campus-life/clubs/not-found.tsx` | **Uncovered** — same section as above |
| `/departments/not-found.tsx` | **Uncovered** — orphan not-found with no sibling index page; flag to whichever section owns `/departments/[dept]` |

All other public routes in the repo match a route already in the "already covered" list.

**Admin routes/screens → section**: every directory under `src/app/admin/(dashboard)/*` and every
screen named in the "already covered" admin_screens list matches a file found on disk — no uncovered
admin route.

**`src/lib` modules and components referenced by nothing (dead code)**:

| Path | Status |
|---|---|
| `src/lib/error-capture.ts` | Dead — no importers (pre-Next.js h3/Vinxi leftover) |
| `src/lib/error-page.ts` | Dead — no importers (same era) |
| `src/lib/lovable-error-reporting.ts` | Dead — no importers (Lovable.dev platform hook) |
| `src/lib/smooth-scroll.ts` | Dead — duplicate of `scroll-engine.ts`, which is the one actually wired up |

Everything else under `src/lib/`, `src/components/site-next/`, and `src/components/admin-next/` has at
least one importer (verified for every file listed as "0 importers" in a first naive single-quote-only
grep pass — all turned out to use single-quote imports and are in fact live; see module table above).

#### Gaps (coverage sweep)

- **[misleading] `/admissions` hardcodes its process steps and FAQ copy in the component instead of Supabase.** `src/app/(site)/admissions/page.tsx:21-26,34-39` define the 4-step "How to Apply" list and all 4 FAQ Q&As as literals. CLAUDE.md: "Content lives in Supabase, not code. Don't hardcode content that the admin panel edits." A non-technical admin cannot change the admission year's FAQ wording or the process steps without a developer editing code and redeploying.
- **[dead] Two live, public storage buckets (`gallery`, `staff-photos`) have no RLS write policy and no code path that uploads to them.** `storage.buckets` lists `gallery`/`media`/`staff-photos`; `storage.objects` RLS policies only reference `bucket_id = 'media'`; every `uploadMediaFile(...)` call site in `src/` passes `bucketName: 'media'`. Either rename/retire the unused buckets or wire up the staff-photo/gallery-specific upload paths that their names imply.
- **[dead] `src/lib/smooth-scroll.ts` duplicates `src/lib/scroll-engine.ts`'s localStorage-backed smooth-scroll toggle, with a different storage key, and is never imported.** The live toggle (`useSmoothScroll.ts` → `scroll-engine.ts`) is the only one wired to `SmoothScrollToggle.tsx`. A future edit to the wrong file would silently do nothing.
- **[dead] `src/lib/error-capture.ts` and `src/lib/error-page.ts` are pre-Next.js (TanStack Start/Vinxi/h3) error-handling leftovers with zero importers**, and `src/lib/lovable-error-reporting.ts` is a Lovable.dev-platform error-reporting hook also with zero importers — none of the three do anything in the current Next.js app.
- **[dead/cosmetic] `src/app/(site)/departments/not-found.tsx` exists with no corresponding `src/app/(site)/departments/page.tsx` index route**, so the not-found boundary can only ever trigger for a URL segment pattern (`/departments` exactly, no `[dept]`) that nothing links to.
- **[misleading] `/campus-life/clubs/[slug]` (the club's own detail page) isn't accounted for in the domain coverage list**, only its `/events` sub-route is — worth confirming the base club page actually renders club content (bio/photos) correctly end-to-end, since it rode along unverified.
- **[cosmetic] `src/lib/muster-check.ts` staff muster-number uniqueness is application-level only, not DB-enforced** (confirmed by the file's own comment referencing an `add_staff_muster_number` migration that doesn't add a constraint) — a direct insert via SQL/service-role, or a race between two concurrent admin saves, can create duplicate muster numbers that the UI believes are unique.
- **[cosmetic] Site search (`SiteSearch.tsx`/`search-index.ts`) is generated once per build from a crawl of a running server (`scripts/build-search-index.ts`, per CLAUDE.md), not live** — content published via the admin panel between deploys won't be searchable until the next build runs. Not documented anywhere for admins, so a reasonable support question ("why can't I find the page I just published?") has no answer in-product.


---

## Reverse indexes

### Table → section

| Table | Documented in |
|---|---|
| `accreditations` | About pages, campus life, admissions info |
| `achievements` | Events, news, gallery, achievements |
| `admin_sections` | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| `app_settings` | Homepage, settings, menus, media, site shell |
| `audit_logs` | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| `board_members` | About pages, campus life, admissions info |
| `cells` | Placement & recruiters |
| `cells (confirmed covered elsewhere but flagged here as 0 live rows, worth re-checking with the covering section)` | Everything else (coverage sweep) |
| `centers` | About pages, campus life, admissions info |
| `colleges` | Organisation & academics |
| `committees` | About pages, campus life, admissions info |
| `content_categories` | Events, news, gallery, achievements |
| `courses` | Organisation & academics |
| `departments` | Organisation & academics |
| `designations` | Staff & faculty |
| `downloads` | About pages, campus life, admissions info |
| `events` | Events, news, gallery, achievements |
| `facilities` | Organisation & academics |
| `gallery_albums` | Events, news, gallery, achievements |
| `gallery_media` | Events, news, gallery, achievements |
| `homepage_items` | Homepage, settings, menus, media, site shell |
| `homepage_sections` | Homepage, settings, menus, media, site shell |
| `homepage_widgets` | Homepage, settings, menus, media, site shell |
| `inquiry_forms` | Inquiries, grievance & public forms |
| `inquiry_submissions` | Inquiries, grievance & public forms |
| `institutes` | Organisation & academics |
| `media_files` | Homepage, settings, menus, media, site shell |
| `media_folders` | Homepage, settings, menus, media, site shell |
| `menu_items` | Homepage, settings, menus, media, site shell |
| `menus` | Homepage, settings, menus, media, site shell |
| `mous` | About pages, campus life, admissions info |
| `pages` | About pages, campus life, admissions info |
| `permissions` | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| `placed_students` | Placement & recruiters |
| `placement_cells` | Placement & recruiters |
| `posts` | Events, news, gallery, achievements |
| `recruiters` | Placement & recruiters |
| `redirects` | Homepage, settings, menus, media, site shell |
| `role_permissions` | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| `roles` | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| `scholarships` | About pages, campus life, admissions info |
| `seo_metadata` | Events, news, gallery, achievements |
| `sports` | About pages, campus life, admissions info |
| `staff_achievements` | Staff & faculty |
| `staff_department_assignments` | Staff & faculty |
| `staff_posts` | Staff & faculty |
| `staff_profiles` | Staff & faculty |
| `student_clubs` | About pages, campus life, admissions info |
| `trusts` | Organisation & academics |
| `user_profiles` | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| `user_roles` | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| `user_section_grants` | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |

### Public route → section

| Route | Documented in |
|---|---|
| `(no /contact route exists despite a 'Contact Form' row in inquiry_forms)` | Inquiries, grievance & public forms |
| `/` | Homepage, settings, menus, media, site shell, Placement & recruiters |
| `/ (homepage NewsEventsSection/EventsNewsSlider)` | Events, news, gallery, achievements |
| `/about` | About pages, campus life, admissions info |
| `/about/accreditation` | About pages, campus life, admissions info |
| `/about/board-of-management` | About pages, campus life, admissions info |
| `/about/chairman-message` | About pages, campus life, admissions info |
| `/about/committees` | About pages, campus life, admissions info |
| `/about/history-vision-mission` | About pages, campus life, admissions info |
| `/about/media` | About pages, campus life, admissions info |
| `/about/principal-message` | About pages, campus life, admissions info |
| `/achievements/[slug]` | Events, news, gallery, achievements |
| `/admin (dashboard layout + page.tsx)` | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| `/admin/appearance (redirect only)` | Homepage, settings, menus, media, site shell |
| `/admin/auth/callback` | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| `/admin/homepage` | Homepage, settings, menus, media, site shell |
| `/admin/login` | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| `/admin/media` | Homepage, settings, menus, media, site shell |
| `/admin/menus` | Homepage, settings, menus, media, site shell |
| `/admin/settings` | Homepage, settings, menus, media, site shell |
| `/admin/staff-wizards` | Staff & faculty |
| `/admin/tables/[tableId]` | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| `/admin/tables/designations` | Staff & faculty |
| `/admin/tables/staff_posts` | Staff & faculty |
| `/admin/trash` | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| `/admin/user-management` | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| `/admissions (index)` | Everything else (coverage sweep) |
| `/admissions/inquiry (src/app/(site)/admissions/inquiry/page.tsx)` | Inquiries, grievance & public forms |
| `/admissions/intake-fees` | Organisation & academics |
| `/admissions/scholarships` | About pages, campus life, admissions info |
| `/anti-ragging` | About pages, campus life, admissions info |
| `/campus-life` | About pages, campus life, admissions info |
| `/campus-life/clubs/[slug]` | About pages, campus life, admissions info, Everything else (coverage sweep) |
| `/campus-life/clubs/[slug]/events` | About pages, campus life, admissions info |
| `/campus-life/clubs/not-found.tsx` | Everything else (coverage sweep) |
| `/campus-life/events` | Events, news, gallery, achievements |
| `/campus-life/events/[slug]` | Events, news, gallery, achievements |
| `/campus-life/facilities` | Organisation & academics |
| `/campus-life/facilities/[...slug]` | Organisation & academics |
| `/campus-life/nss-ncc` | About pages, campus life, admissions info |
| `/campus-life/sports-and-athletics` | About pages, campus life, admissions info |
| `/campus-life/student-groups` | About pages, campus life, admissions info |
| `/careers` | Placement & recruiters |
| `/coe` | About pages, campus life, admissions info |
| `/colleges` | Organisation & academics |
| `/colleges/[college]` | Organisation & academics, Placement & recruiters |
| `/courses` | Organisation & academics |
| `/courses/[course]` | Organisation & academics, Placement & recruiters |
| `/courses/[course]/faculty` | Organisation & academics |
| `/courses/engineering/[dept]` | Organisation & academics |
| `/courses/engineering/[dept]/faculty` | Organisation & academics |
| `/departments/[dept]` | Organisation & academics |
| `/departments/[dept]/achievements` | Events, news, gallery, achievements, Organisation & academics |
| `/departments/[dept]/activities` | Events, news, gallery, achievements, Organisation & academics |
| `/departments/[dept]/labs` | Organisation & academics |
| `/departments/[dept]/labs/[slug]` | Organisation & academics |
| `/departments/[dept]/staff` | Organisation & academics, Staff & faculty |
| `/departments/not-found.tsx` | Everything else (coverage sweep) |
| `/downloads` | About pages, campus life, admissions info |
| `/gallery` | Events, news, gallery, achievements |
| `/gallery/[albumId]` | Events, news, gallery, achievements |
| `/grievance` | About pages, campus life, admissions info |
| `/grievance (src/app/(site)/grievance/page.tsx)` | Inquiries, grievance & public forms |
| `/news` | Events, news, gallery, achievements |
| `/news/[slug]` | Events, news, gallery, achievements |
| `/parents` | About pages, campus life, admissions info |
| `/placement` | Placement & recruiters |
| `/placement/[college]` | Placement & recruiters |
| `/programs/[program]` | Organisation & academics |
| `/staff/[staff]` | Staff & faculty |
| `/student-corner/[slug]` | About pages, campus life, admissions info |
| `/student-login (src/app/(site)/student-login/page.tsx)` | Inquiries, grievance & public forms |

### Admin screen → section

| Admin screen | Documented in |
|---|---|
| /admin/colleges | Organisation & academics |
| /admin/events (AdminCrudManager tableId=events) | Events, news, gallery, achievements |
| /admin/inquiries (src/app/admin/(dashboard)/inquiries/page.tsx -> AdminInquiriesPage.tsx) | Inquiries, grievance & public forms |
| /admin/labs | Organisation & academics |
| /admin/placement-cells (redirect stub -> /admin/tnp-hub) | Placement & recruiters |
| /admin/placement-stats (redirect stub -> /admin/tnp-hub) | Placement & recruiters |
| /admin/placements (redirect stub -> /admin/tnp-hub) | Placement & recruiters |
| /admin/posts (AdminCrudManager tableId=posts) | Events, news, gallery, achievements |
| /admin/recruiters | Placement & recruiters |
| /admin/scholarships | About pages, campus life, admissions info |
| /admin/scholarships (admissions, not academics, despite sidebar grouping) | Organisation & academics |
| /admin/sports | About pages, campus life, admissions info |
| /admin/tables/accreditations | About pages, campus life, admissions info |
| /admin/tables/achievements | Events, news, gallery, achievements |
| /admin/tables/board_members | About pages, campus life, admissions info |
| /admin/tables/centers | About pages, campus life, admissions info |
| /admin/tables/committees | About pages, campus life, admissions info |
| /admin/tables/content_categories | Events, news, gallery, achievements |
| /admin/tables/courses | Organisation & academics |
| /admin/tables/departments | Organisation & academics |
| /admin/tables/downloads | About pages, campus life, admissions info |
| /admin/tables/facilities | Organisation & academics |
| /admin/tables/gallery_albums | Events, news, gallery, achievements |
| /admin/tables/gallery_media | Events, news, gallery, achievements |
| /admin/tables/mous | About pages, campus life, admissions info |
| /admin/tables/pages | About pages, campus life, admissions info |
| /admin/tables/placed_students (unlinked, direct-URL only) | Placement & recruiters |
| /admin/tables/seo_metadata (generic, plus embedded SeoEditor popover on events/posts forms) | Events, news, gallery, achievements |
| /admin/tables/student_clubs | About pages, campus life, admissions info |
| /admin/tnp-hub | Placement & recruiters |
| /admin/trash | About pages, campus life, admissions info |
| /admin/trash (includes inquiry_forms/inquiry_submissions rows) | Inquiries, grievance & public forms |
| Admin login (email/password + Google OAuth) - src/app/admin/login/page.tsx | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| AdminCrudManager generic tables for designations and staff_posts | Staff & faculty |
| AdminHomepagePage (Items / Hero Appearance / Popup tabs) | Homepage, settings, menus, media, site shell |
| AdminMediaPage | Homepage, settings, menus, media, site shell |
| AdminMenusPage | Homepage, settings, menus, media, site shell |
| AdminSettingsPage (Contact Info / General Settings / CTA button) | Homepage, settings, menus, media, site shell |
| AdminSidebar / AdminShell - src/components/admin-next/AdminSidebar.tsx | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| AdminStaffWizardsPage (General/Department/Achievements/Expertise tabs, faculty + achievements CSV import) | Staff & faculty |
| AdminTrashPage (staff_profiles, designations, staff_posts, staff_department_assignments listed; staff_achievements missing; several dead non-existent table names listed) | Staff & faculty |
| Dashboard home with stat cards + activity feed - src/app/admin/(dashboard)/page.tsx | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| EntryPhotosEditor (embedded in events/posts/achievements/facilities/centers/sports/student_clubs edit forms) | Events, news, gallery, achievements |
| Generic table CRUD for roles/permissions/role_permissions/admin_sections/user_profiles/user_roles/audit_logs - src/components/admin-next/AdminCrudManager.tsx via /admin/tables/[tableId] | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| Trash & Recovery - src/components/admin-next/pages/AdminTrashPage.tsx | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |
| User Management (create users, assign roles/sections, reset passwords) - src/components/admin-next/pages/AdminUserManagementPage.tsx + user-management/actions.ts | Auth, roles, RLS, audit, trash, admin shell, DB-wide objects |


---

## Gaps (master list)

Every issue found across all domains, read-only — nothing below has been fixed or changed in the database. Ratings: **broken** (doesn't work / data never reaches site / security hole), **misleading** (UI or docs imply something that isn't true), **dead** (unused table/column/code), **cosmetic** (minor inconsistency). Items marked *(unverified)* were not independently re-confirmed by the verification pass but no contradicting evidence was found either.

Counts: **30 broken**, **27 misleading**, **32 dead**, **22 cosmetic** — 111 total.


### 🔴 Broken

| Domain | Issue | Location | Suggested fix |
|---|---|---|---|
| Organisation & academics | trusts RLS allows any authenticated user full CRUD, no role check | `live RLS on public.trusts (pg_policies)` | Replace the policy with a scope-aware or global-admin-only check matching institutes' pattern. |
| Organisation & academics | courses audit columns have no FK constraint | `live public.courses constraints (pg_constraint) vs. supabase/migrations/` | Add the missing FK constraints in a new migration, or document the divergence. |
| Organisation & academics | department/course reads never filter deleted_at | `src/lib/departments.functions.ts (all exported read functions, lines ~72-221)` | Add .is('deleted_at', null) to every read, matching colleges.functions.ts. |
| Organisation & academics | trusts and institutes have no admin screen despite scope-aware write RLS | `src/components/admin-next/AdminSidebar.tsx:44-56; src/app/admin/(dashboard)/user-management/actions.ts` | Add a generic /admin/tables/trusts and /admin/tables/institutes screen or a dedicated single-record settings page. |
| Staff & faculty | Soft-deleted staff still render publicly | `src/components/admin-next/pages/AdminStaffWizardsPage.tsx:271-281; src/lib/staff.functions.ts:44-51; src/lib/department-content.functions.ts:27-46` | Add .is('deleted_at', null) to both read paths and tighten the RLS USING clause. |
| Staff & faculty | 'activity' achievement type invisible on site and unmanageable in admin | `src/components/admin-next/pages/AdminStaffWizardsPage.tsx:18-27; src/app/(site)/staff/[staff]/page.tsx:15-32; src/lib/achievements-import.ts:12` | Add 'activity' to all three lists plus a display label, or migrate those rows to an existing type. |
| Staff & faculty | staff_profiles INSERT RLS policy has no scope check | `Supabase RLS policy 'Scoped insert staff_profiles' on public.staff_profiles` | Tighten WITH CHECK to require is_global_admin() or a scope check consistent with update/delete policies on the same table. |
| Staff & faculty | Department assignments and achievements are hard-deleted, not soft-deleted, from the admin UI | `src/components/admin-next/pages/AdminStaffWizardsPage.tsx:329-337 and :359-367` | Change both handlers to update deleted_at/deleted_by instead of issuing a real delete. |
| Events, news, gallery, achievements | Gallery show_in_public_gallery checkbox does nothing (confirmed) | `src/lib/gallery.functions.ts:29-39,41-66; src/components/admin-next/EntryPhotosEditor.tsx:80,134` | Add .eq('show_in_public_gallery', true) to both public queries. |
| Events, news, gallery, achievements | seo_metadata/seo_id never read by any public route (confirmed) | `src/components/admin-next/SeoEditor.tsx; src/app/(site)/news/[slug]/page.tsx:19-31; src/app/(site)/achievements/[slug]/page.tsx; src/app/(site)/campus-life/events/[slug]/page.tsx` | Wire generateMetadata to read the linked seo_metadata row, or remove SeoEditor/seo_id until wired up. |
| Events, news, gallery, achievements | Public SELECT RLS has no status/deleted_at filter across this domain (confirmed) | `pg_policies on public.events/posts/gallery_albums/gallery_media/achievements/content_categories/seo_metadata (live DB)` | Add RLS-level status/deleted_at filters for defense in depth. |
| Placement & recruiters | getRecruiterLogos() unfiltered by status/deleted_at | `src/lib/homepage.functions.ts:32-40` | Add .eq('status','published').is('deleted_at', null) to getRecruiterLogos(). |
| Placement & recruiters | Placed-student removal is a hard DELETE | `src/lib/placement.functions.ts:345` | Add deleted_at to placed_students and soft-delete instead. |
| Placement & recruiters | savePlacementContent has no transaction | `src/lib/placement.functions.ts:267-387` | Wrap in a Postgres RPC transaction or add rollback/compensation logic. |
| Placement & recruiters | AdminTrashPage would error on placed_students (no deleted_at column) and contradicts the section's own hedge | `src/components/admin-next/pages/AdminTrashPage.tsx:31-32,77` | Remove placed_students from SOFT_DELETE_TABLES until it has a deleted_at column, or add the column and wire it through savePlacementContent's delete path (same fix as the hard-DELETE gap). |
| Homepage, settings, menus, media, site shell | AdminMenusPage's 'Add Navigation Link' form cannot create any new menu item | `src/components/admin-next/pages/AdminMenusPage.tsx:150,181,464-471` | Change the select's option values to 'external'/'internal' (and wire an actual page picker + page_id for 'internal'), matching the live enum. |
| Homepage, settings, menus, media, site shell | Media Library disconnected from real uploads (confirmed) | `src/components/admin-next/MediaUploader.tsx; src/lib/upload-media-next.ts:26-73; src/components/admin-next/pages/AdminMediaPage.tsx` | Insert a media_files row from uploadMediaFile(), or remove/relabel the Media Library page. |
| About pages, campus life, admissions info | Soft-deleted rows stay visible on the public site for 5 tables | `src/lib/board-members.functions.ts; src/lib/committees.functions.ts; src/lib/accreditations.functions.ts; src/lib/mous.functions.ts; src/lib/clubs.functions.ts` | Add .is('deleted_at', null) to each public query function. |
| About pages, campus life, admissions info | scholarships table has no soft delete; admin delete is a hard delete | `src/lib/scholarships-next.ts:25-28` | Add deleted_at/deleted_by columns via migration, switch deleteScholarship to a soft-delete update, register in AdminTrashPage. |
| About pages, campus life, admissions info | scholarships RLS write policy checks a literal role code instead of is_global_admin() | `RLS policy 'Admins can manage scholarships' on public.scholarships (live DB)` | Align the policy to use is_global_admin() via migration, after confirming intended role set. |
| About pages, campus life, admissions info | /admissions/scholarships is always empty in production | `public.scholarships (live DB, 0 rows); src/app/(site)/admissions/scholarships/page.tsx` | Migrate existing scholarship entries from pages.metadata.facilities.scholarships into the real scholarships table, then delete the stale JSON copy. |
| About pages, campus life, admissions info | mous.activities (text[]) likely has no array editor in the generic admin grid | `src/components/admin-next/AdminCrudManager.tsx:190-233 (TABLE_CONFIGS)` | Verify by hand in the admin UI; add a proper array-field renderer or a TABLE_CONFIGS.mous entry if confirmed broken. |
| About pages, campus life, admissions info | centers.slug has no UNIQUE constraint | `public.centers constraints (live DB) - only PRIMARY KEY (id), no UNIQUE on slug` | Add a UNIQUE constraint on centers.slug via migration. |
| Inquiries, grievance & public forms | Anonymous INSERT has zero validation/abuse protection | `Live RLS policy 'Public insert inquiry_submissions' on inquiry_submissions` | As documented. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | No restore path for soft-deleted RBAC rows | `src/components/admin-next/pages/AdminTrashPage.tsx:9-45; src/components/admin-next/AdminCrudManager.tsx:386-387` | Add these tables to SOFT_DELETE_TABLES, or add a 'show deleted' toggle to AdminCrudManager. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | Section grants are always hardcoded to the first institute | `src/app/admin/(dashboard)/user-management/actions.ts:159-183` | Let the UI pick a scope level and target id, matching the user_roles assignment flow. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | 'library' admin section is orphaned (unlocks nothing) | `src/lib/admin-sections.ts (ROUTE_SECTION_MAP)` | Add the missing route mapping, or stop offering 'library' as a grantable section. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | Google OAuth login has no visible admin allowlist/domain restriction | `src/app/admin/login/actions.ts:43; src/app/admin/auth/callback/route.ts` | Confirm in the Supabase Auth dashboard that Google sign-up is restricted (allowed domains / disabled public signup); document the setting. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | RBAC lookup tables are readable by any authenticated user | `RLS policies on public.roles / public.permissions / public.role_permissions / public.admin_sections / public.user_section_grants` | Scope these SELECT policies to is_global_admin() or equivalent, unless broad read is genuinely intended. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | get_table_schema_info RPC is callable by anon | `public.get_table_schema_info (function); called from src/components/admin-next/AdminCrudManager.tsx:288` | REVOKE EXECUTE ... FROM anon, or switch to SECURITY INVOKER. |

### 🟠 Misleading

| Domain | Issue | Location | Suggested fix |
|---|---|---|---|
| Organisation & academics | departments.about/vision/mission/intake_ug duplicated inside metadata jsonb | `src/components/admin-next/AdminCrudManager.tsx:37-90 (DepartmentMetaEditor); src/lib/departments.functions.ts (Department interface)` | Pick one representation (prefer the first-class columns, since that's what the website reads) and stop writing the duplicate into metadata. |
| Organisation & academics | facilities.accent_color is actually used as card subtitle text, not a color | `src/app/(site)/campus-life/facilities/page.tsx:27` | Rename the field/column to reflect its real use, or add a real subtitle column. |
| Organisation & academics | courses.programme_slug is admin-editable but never read | `src/lib/programmes.functions.ts:59-70` | Either wire programme_slug into the lookup, or remove the field from the admin form. |
| Staff & faculty | qualification column collected but never shown/edited beyond CSV import | `src/lib/staff.functions.ts:46-47,108-129` | Either wire these columns into the admin UI and a display location, or drop them from the CSV template. |
| Staff & faculty | Designation titles can go stale after soft delete | `src/lib/staff.functions.ts:88-94; src/lib/department-content.functions.ts:29-33` | Filter or fall back when the joined designation is deleted/not published. |
| Staff & faculty | office_hours and social_links have no admin UI field in the General tab *(unverified)* | `src/app/(site)/staff/[staff]/page.tsx; src/components/admin-next/pages/AdminStaffWizardsPage.tsx (General tab)` | Add office-hours and social-links editors to the General tab if confirmed absent. |
| Events, news, gallery, achievements | achievements-import.ts imports into staff_achievements, not achievements (confirmed) | `src/lib/achievements-import.ts:91,112,121` | Rename file and document the distinction. |
| Events, news, gallery, achievements | achievements has no scoped/section-grant write RLS path (confirmed) | `pg_policies on public.achievements (live DB); src/lib/admin-sections.ts:111-127; src/lib/department-content.functions.ts (getAchievementsByDepartmentId)` | Add a Scoped write policy mirroring events and/or a ROUTE_SECTION_MAP entry. |
| Events, news, gallery, achievements | gallery_albums.slug never used as route key (confirmed) | `src/app/(site)/gallery/page.tsx:38` | Switch to slug-based routing or drop the slug requirement. |
| Placement & recruiters | Two admin screens both edit recruiters | `src/lib/placement.functions.ts:254-269; src/components/admin-next/AdminCrudManager.tsx:190` | As stated in the gap. |
| Placement & recruiters | Recruiter logos identical on every college/course page | `src/app/(site)/colleges/[college]/page.tsx:8,27; src/app/(site)/courses/[course]/page.tsx:7,15` | As stated in the gap. |
| Placement & recruiters | Admin route guard stricter than RLS write policy | `src/lib/admin-sections.ts (GLOBAL_ONLY_ROUTE_PREFIXES); live RLS policies` | As stated in the gap. |
| Homepage, settings, menus, media, site shell | Gap #14 in the section mischaracterizes link_type as 'not wired to an input' / purely cosmetic | `src/components/admin-next/pages/AdminMenusPage.tsx:147-156, 461-472` | Correct gap #11 to note link_type IS exposed (just via a wrong enum mapping) and reclassify gap #14 from cosmetic to broken, merging it with the new finding above about new-item creation failing. |
| Homepage, settings, menus, media, site shell | CLAUDE.md misdescribes build-search-index.ts (confirmed) | `scripts/build-search-index.ts:3-9; CLAUDE.md` | Update CLAUDE.md's description of the script. |
| Homepage, settings, menus, media, site shell | Footer nav links are hardcoded, not CMS-driven (confirmed) | `src/components/site-next/Footer.tsx:43-55` | Drive the Footer from a 'footer_navigation' menu code, or document it as intentionally static. |
| Homepage, settings, menus, media, site shell | Footer drops unmapped social platforms (confirmed) | `src/components/site-next/Footer.tsx:19-25` | Add a generic fallback icon for unmapped platforms or restrict the Settings form to supported platforms. |
| Homepage, settings, menus, media, site shell | homepage_items.pretitle editable but never rendered (confirmed) | `src/components/admin-next/pages/AdminHomepagePage.tsx:94,179,341-342; src/components/site-next/HeroNew.tsx` | Render pretitle in HeroNew.tsx or remove the field from the admin form. |
| Homepage, settings, menus, media, site shell | menu_items.icon editable but never rendered (confirmed) | `src/components/admin-next/pages/AdminMenusPage.tsx; src/lib/menus.functions.ts:44` | Select and render icon in nav components, or remove the field from the admin form. |
| About pages, campus life, admissions info | About page content is a hand-edited raw JSON blob with no form or validation | `src/components/admin-next/AdminCrudManager.tsx:1060-1062; src/lib/pages.functions.ts:4-58` | Build dedicated per-section admin forms for About content, or validate JSON against the AboutPageData shape before saving. |
| About pages, campus life, admissions info | student_clubs.accent_color is rendered as a text label, not a color | `src/app/(site)/campus-life/student-groups/page.tsx:37 (clubs) and :69 (centers)` | Use accent_color for actual styling and show a real category/type field as the label for both clubs and centers. |
| Inquiries, grievance & public forms | Grievance page promises workflow that doesn't exist | `src/app/(site)/grievance/page.tsx:12,19-23` | As documented; note the PageHero subtitle (line 12) also carries an SLA claim in addition to the aside list already cited -- minor additional evidence, not a correction. |
| Inquiries, grievance & public forms | ON DELETE CASCADE contradicts 'submissions will remain archived' message | `src/components/admin-next/pages/AdminInquiriesPage.tsx:141 (confirm text), 146 (soft update); live FK inquiry_submissions_form_id_fkey ON DELETE CASCADE` | As documented. |
| Inquiries, grievance & public forms | Student Login page oversells non-existent portal | `src/components/site-next/StudentLoginForm.tsx:15-19; src/app/(site)/student-login/page.tsx (PageHero subtitle prop)` | As documented. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | 4 'role codes' are referenced in code but only 2 exist | `src/app/lib/auth/admin.ts:31` | Clarify in code comments/docs that scope labels are not role codes, or create the missing role rows if they're intended to exist. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | 5 RBAC tables have no sidebar entry and aren't scope-gated by route | `src/components/admin-next/AdminSidebar.tsx; src/lib/admin-sections.ts` | Add sidebar links if these should be admin-manageable, or add them to the global-only route/table lists if they should be hidden. |
| Everything else (coverage sweep) | /admissions hardcodes process steps and FAQs instead of Supabase | `src/app/(site)/admissions/page.tsx:21-39` | Move process steps and FAQ content into a Supabase table (e.g. a generic content_blocks/faqs table or app_settings key) editable from the admin panel. |
| Everything else (coverage sweep) | /campus-life/clubs/[slug] detail page is missing from the domain coverage list | `src/app/(site)/campus-life/clubs/[slug]/page.tsx; src/app/(site)/campus-life/clubs/[slug]/layout.tsx; src/app/(site)/campus-life/clubs/not-found.tsx` | Have the student_clubs-owning section verify this route renders correctly end-to-end. |

### ⚪ Dead

| Domain | Issue | Location | Suggested fix |
|---|---|---|---|
| Organisation & academics | CODE_TO_STATIC_ID map and static_id field are entirely unused | `src/lib/departments.functions.ts:36-65` | Delete CODE_TO_STATIC_ID, the static_id field, and mapRow's reference to it. |
| Organisation & academics | getFacilitiesByType has no call sites and skips the deleted_at filter | `src/lib/facilities.functions.ts:60-70` | Remove the function, or fix the missing deleted_at filter if kept for future use. |
| Organisation & academics | Sports and Transport Facilities sections are permanently empty | `src/app/(site)/campus-life/facilities/page.tsx; supabase/migrations/20260923140200_merge_sports_and_drop_legacy_tables.sql` | Remove the dead sections/categories from the facilities list page, or repoint sports rendering at the sports table. |
| Staff & faculty | AdminTrashPage SOFT_DELETE_TABLES lists 6 non-existent tables and omits staff_achievements | `src/components/admin-next/pages/AdminTrashPage.tsx:9-35` | Remove the 6 dead entries and add staff_achievements once its delete flow is switched to soft delete. |
| Staff & faculty | Unused duplicate getStaffByDepartmentId in staff.functions.ts | `src/lib/staff.functions.ts:135-188` | Delete the unused function to avoid future edits landing in the wrong copy. |
| Events, news, gallery, achievements | gallery_media.caption has no field in EntryPhotosEditor (confirmed) | `src/components/admin-next/EntryPhotosEditor.tsx (full file); src/components/site-next/PhotoLightbox.tsx; src/components/site-next/GalleryAlbumView.tsx` | Add a caption/alt-text field per photo in EntryPhotosEditor. |
| Events, news, gallery, achievements | content_categories module_type has no CHECK constraint (confirmed) | `content_categories schema (live DB); src/lib/posts.functions.ts:30` | Document valid module_type values and add a CHECK constraint; filter posts' category join by status and module_type. |
| Events, news, gallery, achievements | events.metadata.highlights typed but never rendered (confirmed) | `src/lib/events.functions.ts:32` | Build a structured highlights editor/renderer or remove the shape. |
| Events, news, gallery, achievements | gallery_media.media_type='video' has no admin path (confirmed) | `src/components/admin-next/EntryPhotosEditor.tsx:51,182; src/lib/gallery.functions.ts:112` | Build video support or drop 'video' from the constraint. |
| Placement & recruiters | recruiters.department_id and college_codes 0/288 populated, never read | `recruiters.department_id, recruiters.college_codes columns` | As stated in the gap. |
| Placement & recruiters | placed_students.department_id and package_lpa editable only via unlinked admin route | `src/components/admin-next/AdminSidebar.tsx:76-77; src/app/admin/(dashboard)/tables/[tableId]/page.tsx` | As stated in the gap. |
| Placement & recruiters | Four of five placement_cells rows never rendered | `src/lib/placement.functions.ts:16,59; src/app/(site)/placement/[college]/page.tsx` | As stated in the gap. |
| Placement & recruiters | placement_cells.default_student_placeholder_url fully dead | `supabase/migrations/20260729133600_...; src/lib/placement.functions.ts:162-182` | As stated in the gap. |
| Placement & recruiters | recruiters.website_url editable but never shown | `recruiters.website_url column; src/components/site-next/RecruitersMarquee.tsx` | As stated in the gap. |
| Placement & recruiters | placed_students.college_id collected but never displayed | `src/lib/placement.functions.ts:63,106; src/components/site-next/PlacementPage.tsx` | As stated in the gap. |
| Placement & recruiters | cells table completely unused | `supabase/migrations/20260812000000_phase0_baseline.sql:611-624` | As stated in the gap. |
| Homepage, settings, menus, media, site shell | homepage_sections/homepage_widgets unused (confirmed) | `src/components/admin-next/AdminCrudManager.tsx:134; src/components/admin-next/pages/AdminTrashPage.tsx:23-24` | Drop the tables or build the intended section/widget page builder. |
| Homepage, settings, menus, media, site shell | redirects table unused (confirmed) | `supabase table 'redirects'; next.config.ts:59-72` | Drop the table, or build an admin UI + reader that merges DB rows into the redirect list. |
| About pages, campus life, admissions info | Published 'alumni' pages row has no corresponding route *(unverified)* | `public.pages row slug='alumni' (live DB); no src/app/(site)/alumni directory` | Either build the /alumni route or archive/delete the orphaned row. |
| About pages, campus life, admissions info | Duplicate stale content copies inside pages.metadata *(unverified)* | `pages.metadata on slug='about' row (live DB); src/lib/pages.functions.ts:4-58` | Delete both unused arrays from the about row's metadata once confirmed unused. |
| Inquiries, grievance & public forms | fields_config and recipient_emails stored but never consumed | `src/lib/submissions-next.ts:34-46` | As documented. |
| Inquiries, grievance & public forms | inquiry_submissions.status and .notes unused by admin UI | `src/components/admin-next/pages/AdminInquiriesPage.tsx (submissions row rendering, notes cell)` | As documented. |
| Inquiries, grievance & public forms | EnquiryForm never rendered anywhere | `src/components/site-next/EnquiryForm.tsx:16-22` | As documented. |
| Inquiries, grievance & public forms | Orphaned 'Contact Form' inquiry_forms row (slug: contact) | `Live inquiry_forms row id 687c3b7a-ef53-420e-8ac8-d6d471b5cb22` | As documented. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | permissions and role_permissions tables are entirely unused *(unverified)* | `public.permissions, public.role_permissions` | Confirmed dead per docs/audits/deferred-issues.md; safe to drop or formally deprecate. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | user_role_enum type is live but unreferenced | `supabase/migrations/20260728120000_schema_restructure.sql; live pg_type` | Drop the type in a future migration once confirmed unused. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | current_user_is_dept_admin_for() function is unused | `public.current_user_is_dept_admin_for (function)` | Drop if confirmed unused, or wire it into the department_admin write policies it seems intended for. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | Duplicate index on user_roles | `public.user_roles indexes` | Drop one of the two duplicate indexes. |
| Everything else (coverage sweep) | gallery and staff-photos storage buckets have no RLS write policy and no upload call site | `storage.buckets / storage.objects RLS; src/lib/upload-media-next.ts; src/components/admin-next/EntryPhotosEditor.tsx:179; src/components/admin-next/pages/AdminMediaPage.tsx:142` | Either retire the unused buckets or add the intended upload paths (e.g. route staff photos to staff-photos bucket) plus matching RLS policies. |
| Everything else (coverage sweep) | src/lib/smooth-scroll.ts duplicates scroll-engine.ts and is never imported | `src/lib/smooth-scroll.ts vs src/lib/scroll-engine.ts` | Delete src/lib/smooth-scroll.ts, or document why it's kept. |
| Everything else (coverage sweep) | error-capture.ts, error-page.ts, lovable-error-reporting.ts have zero importers | `src/lib/error-capture.ts; src/lib/error-page.ts; src/lib/lovable-error-reporting.ts` | Delete, or add a comment noting why they're retained. |
| Everything else (coverage sweep) | departments/not-found.tsx has no sibling index page | `src/app/(site)/departments/not-found.tsx` | Either build a /departments index page listing all departments, or remove the orphan not-found.tsx. |

### 🟡 Cosmetic

| Domain | Issue | Location | Suggested fix |
|---|---|---|---|
| Organisation & academics | Scholarships listed under the Academics sidebar group | `src/components/admin-next/AdminSidebar.tsx:44-56` | Move the Scholarships link into the Admissions sidebar group. |
| Organisation & academics | departments.mission typed as string | string[] but column is plain text | `src/lib/departments.functions.ts:17` | Narrow the type to string \| null unless array storage is actually intended. |
| Staff & faculty | staff_achievements.status is a plain text column, never read by any query | `Supabase schema public.staff_achievements.status` | Either start filtering on it or drop the column. |
| Staff & faculty | staff_achievements.deleted_by FK points to auth.users instead of user_profiles | `Supabase schema public.staff_achievements` | Repoint the FK to user_profiles(id) for consistency, in a migration. |
| Events, news, gallery, achievements | events.tag still used as subtitle fallback despite deprecated comment (confirmed) | `src/app/(site)/campus-life/events/page.tsx:40,52; src/lib/events.functions.ts:9` | Finish migrating off tag or update the comment. |
| Events, news, gallery, achievements | EntryPhotosEditor.tsx/AdminCrudManager.tsx line-number citations not independently re-verified *(unverified)* | `src/components/admin-next/EntryPhotosEditor.tsx:256-259; src/components/admin-next/AdminCrudManager.tsx:943,979-980,531-541,627-658` | Spot-check these exact line numbers against current file state before relying on them for navigation. |
| Placement & recruiters | No updated_at refresh trigger on placement_cells/placed_students *(unverified)* | `placement_cells and placed_students tables` | As stated in the gap. |
| Placement & recruiters | recruiters audit columns likely unpopulated *(unverified)* | `recruiters.created_by/updated_by/deleted_by` | As stated in the gap. |
| Homepage, settings, menus, media, site shell | section_error: gap #15's framing of hero blur settings is plausible but not independently re-verified *(unverified)* | `src/lib/theme.ts:43-94` | No change needed; flagged only as not independently re-verified in this pass. |
| About pages, campus life, admissions info | /admin/tables/committees is global-only despite scope-aware RLS | `src/lib/admin-sections.ts:20,87,121` | Remove committees from GLOBAL_ONLY_ROUTE_PREFIXES/GLOBAL_ONLY_TABLE_IDS if scoped management is wanted, or treat as intentionally dead. |
| About pages, campus life, admissions info | board_members has no updated_at trigger | `public.board_members triggers (live DB) - empty result set` | Add the standard update_updated_at_column() BEFORE UPDATE trigger via migration. |
| Inquiries, grievance & public forms | Admin-only global-vs-scoped mismatch for /admin/inquiries | `src/lib/admin-sections.ts:31,116` | As documented. |
| Inquiries, grievance & public forms | InquiryForm Year field is fixed single-option select | `src/components/site-next/InquiryForm.tsx (Year field, Programme/Year grid)` | As documented. |
| Inquiries, grievance & public forms | GrievanceForm generates and shows a client-side reference number without persisting it as a queryable column | `src/components/site-next/GrievanceForm.tsx:19-29; inquiry_submissions.submitted_data (jsonb)` | Add a generated/indexed reference_number column (or a GIN/expression index on submitted_data->>'reference_number') so admins can look up a grievance by reference number directly. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | AdminCrudManager's 'supabaseAdmin' is not actually a service-role client | `src/components/admin-next/AdminCrudManager.tsx:250` | Rename the variable to avoid implying service-role access. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | Audit trail is split across two inconsistent mechanisms | `public.process_audit_log trigger coverage; src/components/admin-next/AdminCrudManager.tsx:476-489; src/components/admin-next/pages/AdminTrashPage.tsx` | Extend the DB trigger to cover all audited tables, or document the gap clearly. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | admin_sections has no updated_at-maintaining trigger | `public.admin_sections (trigger list)` | Add the standard update_updated_at_column() trigger. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | Three near-duplicate updated_at trigger functions *(unverified)* | `public.update_sports_updated_at, public.set_scholarships_updated_at` | Replace both with the shared update_updated_at_column() trigger. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | Unaddressed Postgres advisor findings in this domain *(unverified)* | `mcp__supabase__get_advisors output (security + performance)` | Low risk at current row counts; address in a cleanup migration before tables grow. |
| Auth, roles, RLS, audit, trash, admin shell, DB-wide objects | Storage subsection cites a nonexistent OAuth file path | `Section text, 'Auth config' paragraph in the Storage subsection` | Fix the path to src/app/admin/auth/callback/route.ts to match gap 4 and the rest of the document. |
| Everything else (coverage sweep) | Staff muster-number uniqueness is app-level only, not DB-enforced | `src/lib/muster-check.ts:7-8` | Add a partial unique constraint/trigger in a migration scoped per college, or accept the risk explicitly in docs. |
| Everything else (coverage sweep) | Site search index is build-time only, not live, with no admin-facing explanation | `scripts/build-search-index.ts; src/lib/search-index.ts:47-54; src/components/site-next/SiteSearch.tsx` | Document this staleness for admins, or move to a live Supabase full-text search query. |
