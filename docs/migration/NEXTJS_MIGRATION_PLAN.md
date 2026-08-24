# Next.js Migration Plan

**Status:** Phase 0 complete ✓
**Created:** 2026-08-12
**Source stack:** TanStack Start 1.168 (Vite 8 + Nitro) · React 19 · Tailwind v4 · Supabase
**Target stack:** Next.js 15 App Router · React 19 · Tailwind v4 · Supabase (`@supabase/ssr`)

---

## 1. Decisions (locked)

| Question | Decision |
|---|---|
| **Why port** | Ecosystem & maintainability — wider hiring pool, more docs, more integrations. *Not* SEO or routing; both already work today. |
| **Hosting** | Vercel for dev/preview, self-hosted Docker for production. Plan must keep both targets behaving identically. |
| **Admin panel** | Port fully to React Server Components. |
| **Auth** | Full `@supabase/ssr` cookie migration, including server-side role enforcement. Lands **before** any route porting. |

### What this port does and does not buy

Worth stating plainly so expectations are calibrated. The current stack **already** does server-side rendering, file-based routing, per-route metadata, and server-only data fetching. This migration is being undertaken for ecosystem reasons, and the SEO improvements bundled into Phase 5 are stack-independent — they could be done today on TanStack Start in a fraction of the time.

The port is justified by maintainability, not capability. Phases 0, 5, and 8 deliver real user-visible value; Phases 1–4 and 6 are lateral moves that must not regress anything.

---

## 2. Migration surface (measured)

```
src/routes            80 files   12,515 lines   ← 20 admin (7,854) + ~57 public (4,510) + root
src/components/ui     46 files    4,360 lines   ← shadcn/ui, mostly mechanical
src/components/site   23 files    3,842 lines
src/components/admin   5 files    2,379 lines
src/lib               39 files    4,028 lines   ← 28 *.functions.ts, 83 exported server fns
src/hooks              4 files      262 lines
                     ─────────────────────────
                     ~208 files  ~27,400 lines
```

**Deleted, not ported:** `src/routeTree.gen.ts` (65k lines, generated), `src/server.ts`, `src/start.ts`, `vite.config.ts`, `@lovable.dev/vite-tanstack-config`.

### API translation table

| TanStack Start | Next.js App Router | Uses | Difficulty |
|---|---|---|---|
| `createFileRoute()` | directory + `page.tsx` | 79 | Mechanical |
| `loader` | `async` Server Component | 44 | Moderate |
| `head:` | `generateMetadata()` | 42 | Mechanical |
| `useLoaderData()` | props / direct `await` | 44 | Moderate |
| `Link` (`to=`, `params=`) | `next/link` (`href=`) | 41 | Mechanical, high volume |
| `notFound()` | `notFound()` from `next/navigation` | 13 | 1:1 |
| `redirect()` | `redirect()` from `next/navigation` | 8 | 1:1 |
| `beforeLoad` | `middleware.ts` / layout guard | 5 | Needs judgment |
| `createServerFn` (GET) | plain `async` fn + `import "server-only"` | 73 | Mechanical |
| `createServerFn` (POST) | `"use server"` Server Action | 10 | Moderate |
| `requireSupabaseAuth` middleware | server-side session check | 5 | **Rewrite (Phase 2)** |
| `useNavigate` / `useRouter` / `useParams` | `next/navigation` equivalents | 4 | Mechanical |

### Route path mapping

TanStack's flat-dot convention expands into App Router directories:

```
index.tsx                        → app/page.tsx
about.tsx                        → app/about/layout.tsx
about.index.tsx                  → app/about/page.tsx
about.accreditation.tsx          → app/about/accreditation/page.tsx
departments.$dept.tsx            → app/departments/[dept]/layout.tsx
departments.$dept.index.tsx      → app/departments/[dept]/page.tsx
departments.$dept.staff.tsx      → app/departments/[dept]/staff/page.tsx
campus-life.facilities.$.tsx     → app/campus-life/facilities/[...slug]/page.tsx
admin.tables.$tableId.tsx        → app/admin/tables/[tableId]/page.tsx
```

**Non-negotiable:** every public URL must resolve identically after the port. This is an SEO-motivated codebase; a changed URL is a lost ranking. Phase 0 captures the URL inventory and Phase 8 diffs against it.

---

## 3. The auth rewrite (the critical path)

This is the highest-risk work in the migration and the reason admin cannot be ported first.

**Today:** `useAdminAuth` reads the session from `localStorage` via `supabase.auth.getSession()`. The client middleware `auth-attacher.ts` pulls the access token and attaches `Authorization: Bearer <token>` to every server-function RPC. Server-side, `requireSupabaseAuth` validates that header with `getClaims()` and builds a scoped Supabase client.

**Why it breaks:** Server Components render on the server with no client JavaScript in the loop. There is no `localStorage`, and there is no RPC carrying a bearer header — the component simply runs. Every RSC data read would be unauthenticated, and your scope-aware RLS policies (`20260805051746_scope_aware_write_rls.sql`, `20260806060203_scope_aware_read_rls.sql`, and four others) would silently return empty result sets rather than erroring. **Silent data loss, not a crash** — which makes this dangerous to discover late.

**Target:**

- `@supabase/ssr` with `createBrowserClient` / `createServerClient`, sessions in cookies
- `middleware.ts` refreshing the session on every request and writing rotated cookies
- Role resolution (`admin`, `editor`, `department_admin`, `college_admin`) moved server-side; `useAdminAuth`'s `user_profiles` + `user_roles` query becomes a cached server function
- `AdminAuthContext` reduced to a presentational context hydrated from a server-resolved value
- `requireSupabaseAuth`'s five call sites replaced with a server-side `requireAdmin()` helper
- `createCsrfMiddleware` dropped — Server Actions carry built-in origin validation

**Validation gate:** before any admin route is ported, prove with a scoped non-admin account (e.g. a `department_admin`) that RLS returns *correctly scoped* rows through a cookie session — not empty, not over-broad. Seed data exists in `supabase/seed_test_users.sql` and `testuser.md`.

---

## 4. Environments, rollback & schema parity

### Topology

| | Branch | Supabase project | Region | Role |
|---|---|---|---|---|
| **Dev** | `admin-portal-test` | `agezrfclusigfqysbxwb` ("test-gpu") | ap-southeast-2 | Disposable. All migration work happens here. |
| **Prod** | `prod` | `rpspvheghvtlaznricmr` ("prod") | ap-northeast-1 | Untouched until Phase 8 cutover. |
| **Legacy** | `main` | — | — | Original Lovable static code. Not a rollback target. |

Dev and prod are **fully separate Supabase projects**. This is the single biggest de-risking factor in the whole migration: the Phase 2 auth rewrite can freely alter RLS policies, roles, and session handling on dev without any possibility of touching production data.

### Rollback model

There are no file-level backups and none are needed. The safety net is that **`prod` remains a live, deployable TanStack Start app pointed at a separate database** for the entire migration. Rollback is a redeploy, not a restore.

Rules:

- Migration work happens on a `nextjs-migration` branch cut from `admin-portal-test`. Never commit to `prod`.
- **Tag each phase gate** (`nextjs-phase-4-complete`). Phase-per-commit alone gives poor granularity across a multi-week branch; tags make `git reset --hard <tag>` viable.
- Phase 8's deletion of the TanStack app is an isolated commit.
- Prod Supabase credentials must not appear in any dev `.env` during the migration.

### Two defects found during planning — fix before Phase 1

**1. `supabase/config.toml` points at a dead project.**
It declares `project_id = "mzlvjgtsrepzxynntbtt"`, which is **neither** dev nor prod and does not exist in the organisation. Any `supabase link` or `db push` run from this repo targets a nonexistent ref. Fix to the dev project and make environment selection explicit rather than implicit in a committed file.

**2. Prod has no migration history — this blocks cutover.**
Dev's ledger records 52 applied migrations. Prod's ledger is **empty**, yet prod carries the full 52-table schema with live data (250 staff profiles, 233 gallery media, 167 audit logs). Prod was evidently cloned or dumped from dev around 2026-08-07 rather than migrated into existence.

Schemas currently match — both projects have the same 52 tables, with only content drift (`homepage_items` 85 vs 84, `app_settings` 15 vs 14, `inquiry_submissions` 1 vs 0).

The consequence is specific and serious: Phase 2 will generate new auth/RLS migrations that must reach prod at cutover. With an empty ledger, `supabase db push` has no baseline and will attempt to replay all 52 existing migrations against a schema that already contains them — failing, or worse, partially applying destructive DDL.

**Repair prod's ledger before Phase 8** — mark the 52 existing migrations as applied (`supabase migration repair --status applied`) so subsequent pushes are incremental. Do this early, verify with a no-op `db push --dry-run`, and never discover it during cutover.

### Region caveat

Dev is in Sydney, prod in Tokyo. Latency-sensitive measurements taken on dev will not match production. Phase 0 Lighthouse baselines and the Phase 8 comparison must both be measured against the same environment or the comparison is meaningless.

### Feature freeze

**The project is fully paused for the duration of the migration.** No content or feature work ships to `admin-portal-test` while the port is underway.

This removes branch-divergence risk entirely — no rebase cadence is needed, and `nextjs-migration` cannot rot the way `main` did (213 commits behind). It also changes the coexistence strategy below.

### How long the two apps coexist

Because nobody needs the TanStack dev server for feature work, the two stacks only need to coexist while the Next.js work is **purely additive**:

| Phase | TanStack app | Why |
|---|---|---|
| 0–2 | Runnable | Next scaffolding and `@supabase/ssr` auth are new files; nothing shared is rewritten yet |
| 3 | **Breaks** | Converting `createServerFn` rewrites the shared `src/lib/*.functions.ts` the old app imports |
| 4–8 | Deleted | See below |

The only real friction during 0–2 is `tsconfig.json`: Next requires `jsx: "preserve"`, while the current config uses `jsx: "react-jsx"` with `allowImportingTsExtensions: true`. Keep the existing file as `tsconfig.tanstack.json` and let Next own `tsconfig.json`.

**Delete the TanStack app at the end of Phase 3, not Phase 8.** Once Phase 3 breaks it, carrying a dead app through four more phases adds noise and tempts half-migrations. The reference material that actually matters is the Phase 0 HTML snapshots and the deployed `prod` site — not stale source in the working tree. Git history holds the rest.

---

## 5. Phases

Each phase ends in a commit. No phase begins before its predecessor's gate passes.

### Phase 0 — Baseline & safety net
*No production code changes.*

- **Fix `supabase/config.toml`** to reference the dev project (§4).
- **Repair prod's migration ledger** and verify with `db push --dry-run` (§4). Cheap now, catastrophic if deferred to cutover.
- Cut the `nextjs-migration` branch from `admin-portal-test`.
- Enumerate every public URL, including dynamic ones expanded from Supabase (departments, staff, events, clubs, gallery albums, colleges, programs). The existing `public/sitemap.xml` covers only 42 hand-written URLs and is **not** a reliable inventory.
- Snapshot rendered SSR HTML for each URL (`curl` against a production build) → `docs/baseline/`. This is the diff target for Phase 8.
- Record Lighthouse SEO/performance scores for ~10 representative pages.
- Record current Search Console impressions/rankings to detect post-cutover regression.

**Gate:** URL inventory reviewed and agreed complete.

### Phase 1 — Scaffold
- Next.js 15 App Router + TypeScript, in-repo alongside the running TanStack app.
- Tailwind v4: swap `@tailwindcss/vite` → `@tailwindcss/postcss`; port `src/styles.css` verbatim.
- `next.config.ts` with `output: "standalone"` from day one — self-hosting is the production target and must not be an afterthought.
- Port `src/components/ui` (46 files). Most shadcn primitives are Radix-based and need `"use client"`; a few (`card`, `badge`, `separator`) can stay server components.
- Env rename: `VITE_SUPABASE_*` → `NEXT_PUBLIC_SUPABASE_*`. **Audit that `SUPABASE_SERVICE_ROLE_KEY` never acquires a `NEXT_PUBLIC_` prefix** — in Next that prefix inlines the value into the client bundle.

**Gate:** a blank page renders with the design system visually identical to current.

### Phase 2 — Auth foundation
Implements §3 in full. Nothing else ships in this phase.

**Gate:** the scoped-RLS validation described in §3.

### Phase 3 — Data layer
- 73 GET server fns → plain `async` functions with `import "server-only"`. The existing `serverClient()` helper in each `*.functions.ts` already isolates Supabase access cleanly, so this is largely unwrapping `createServerFn().handler()`.
- 10 POST server fns → `"use server"` Server Actions with `revalidatePath`/`revalidateTag`.
- Keep the module layout; rename `*.functions.ts` → `*.queries.ts` and `*.actions.ts` to make the server/client boundary legible.
- **Delete the TanStack app** as the final commit of this phase: `src/routes/`, `routeTree.gen.ts`, `src/server.ts`, `src/start.ts`, `vite.config.ts`, `tsconfig.tanstack.json`, `src/integrations/supabase/auth-attacher.ts`, `auth-middleware.ts`, and the Vite/Nitro/Lovable dependencies. Isolated commit, trivially revertable, with `prod` still deployed.

**Gate:** every converted function unit-covered or manually exercised against real Supabase data.

### Phase 4 — Public site (~57 routes, 4,510 lines)
Port in search-priority order: homepage → about → admissions → departments → courses → placement → campus-life → remainder.

Per route: `loader` → `async` component, `head` → `generateMetadata`, `Link` → `next/link`, push `"use client"` down to interactive leaves only.

**Known casualty:** the `AnimatePresence` page-transition wrapper in `__root.tsx:150` keyed on `location.pathname` has no clean App Router equivalent — exit animations during navigation are not supported the same way. Options: accept enter-only transitions, or adopt the View Transitions API. Decide when reached; do not silently drop it.

**Gate:** visual and content diff against Phase 0 snapshots for every ported route.

### Phase 5 — SEO (the actual value)
These are the improvements worth having, and several are gaps that exist today regardless of framework:

- `generateMetadata` on **all** routes — including the 15 currently missing `head()`: the homepage (`src/routes/index.tsx`), `staff.$staff.tsx`, `gallery.$albumId.tsx`, `gallery.index.tsx`, `about.index.tsx`, `placement.$college.tsx`, and all five `departments.$dept.*` sub-pages. These currently inherit the generic root title and compete against each other.
- `app/sitemap.ts` generating from Supabase — replaces the static, hand-maintained 42-URL file that new content never enters.
- `app/robots.ts` replacing the static `public/robots.txt`.
- **JSON-LD structured data** — currently zero across the codebase. `CollegeOrUniversity` on the homepage, `Person` for faculty profiles, `Event` for events, `BreadcrumbList` sitewide. Highest-leverage single SEO win for an educational institution.
- **Canonical URLs** — the `canonical_url` column and `SeoEditor.tsx` admin UI already exist and write to the DB, but nothing renders the tag. Wire to `metadata.alternates.canonical`.
- `next/image` on gallery, staff, and homepage carousels. Requires `sharp` in the Docker image.

**Gate:** structured data validated via Google Rich Results Test; sitemap URL count matches the Phase 0 inventory.

### Phase 6 — Admin to RSC (20 routes, 7,854 lines)
Largest phase by volume — 63% of route code. Depends on Phase 2 being solid.

- Admin layout, sidebar, header (`src/components/admin`, 2,379 lines).
- Route by route; server-side role guard per segment via layout, not client redirect.
- Writes become Server Actions; `revalidatePath` replaces React Query invalidation.
- Retain React Query only where it earns its place: `@tanstack/react-table` grids, optimistic updates, the media uploader.

**Note:** `@jsquash/*` image codecs used in media upload are WASM and browser-only — those components stay `"use client"` regardless of the RSC goal.

**Gate:** full admin CRUD exercised against each content type by a real admin and a scoped department admin.

### Phase 7 — Infrastructure
- Rewrite `Dockerfile` for `output: "standalone"` (`node server.js`), replacing the Nitro `.output/server/index.mjs` entry. Ensure `sharp` is present for image optimization — self-hosted Next does not get Vercel's image pipeline for free.
- Vercel project for preview deploys.
- GA4 via `next/script` (`afterInteractive`), replacing the inline tag in `RootShell`.
- Port the SSR error wrapper (`src/server.ts`) to `app/error.tsx` + `app/global-error.tsx`.
- **Verify parity between Vercel and Docker builds** — this is where the dual-target decision costs time. Anything relying on Vercel-only behavior must be caught here, not in production.

**Gate:** identical rendered output from a Vercel preview and a local Docker container.

### Phase 8 — Cutover
- Diff every URL against Phase 0 snapshots. Any divergence is a bug or needs a 301.
- Lighthouse comparison against the Phase 0 baseline, measured on the same environment (see the region caveat in §4); no SEO/performance regression permitted.
- Apply the Phase 2 auth/RLS migrations to prod Supabase — only safe because the ledger was repaired in Phase 0.
- Merge `nextjs-migration` → `admin-portal-test` → `prod`, and deploy.
- Resubmit sitemap to Search Console; monitor coverage and rankings for 30 days.

*(The TanStack app was already removed at the end of Phase 3.)*

**Gate:** 30-day Search Console watch with no ranking loss.

---

## 6. Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| Auth rewrite silently breaks scope-aware RLS — empty results, no error | **Critical** | Phase 2 validation gate with scoped test accounts before any route port. Confined to dev Supabase, so prod data is never at risk. |
| Prod migration ledger empty — `db push` at cutover replays 52 migrations onto an existing schema | **Critical** | Repair the ledger in Phase 0, not Phase 8 (§4) |
| `supabase/config.toml` targets a nonexistent project ref | **Medium** | Fix in Phase 0 (§4) |
| URL drift during flat-dot → directory conversion costs rankings | **High** | Phase 0 inventory + Phase 8 diff; 301s for anything that moves |
| Admin is 63% of route code; scope creep in Phase 6 | **High** | Strict route-by-route commits; resist refactoring while porting |
| Service-role key leaking into client bundle via `NEXT_PUBLIC_` | **High** | Explicit env audit in Phase 1; grep the built bundle in Phase 7 |
| Vercel/Docker behavioral divergence found late | **Medium** | `output: "standalone"` from Phase 1, not Phase 7; parity gate |
| ~~Long-lived branch divergence~~ | **Eliminated** | Project fully frozen for the migration (§4) |
| Page-transition animations lost | **Low** | Flagged in Phase 4 as an explicit decision, not a silent regression |
| Tailwind v4 + Next 15 integration friction | **Low** | Isolated to Phase 1 |

## 7. Sequencing rationale

Auth precedes everything because it is the only piece that can invalidate work already done — porting admin routes against the old bearer-token model would mean porting them twice. Public site precedes admin because it carries the SEO value and is a third of the volume, so it de-risks the pattern before the large surface. SEO work sits in Phase 5 rather than at the end because it is the one phase producing value the current stack does not already deliver.

## 8. Open items

- Decide the page-transition fate (Phase 4).
- Confirm the production domain handles `/sitemap.xml` from `app/sitemap.ts` (route) rather than `public/` (static file); the static file must be deleted or it will shadow the route.

**Resolved during planning:** `student-login.tsx` is a non-functional stub — the form only fires a "Portal integration coming soon" toast and touches no auth. It carries no migration risk and is unaffected by the Phase 2 auth rewrite.
