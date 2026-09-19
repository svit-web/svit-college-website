# CLAUDE.md

SVIT Vasad college website: public marketing site + admin panel. Next.js (App Router, v16, React 19)
+ Supabase (Postgres/Auth/Storage) + Tailwind v4 + Radix/shadcn UI. Migrated from Lovable/Vite/TanStack
Start; the port is functionally complete (branch `nextjs-migration`, main branch `main`).

Read first: `PRODUCT.md` (users, binding constraints), `CONTEXT.md` (domain glossary: Overlay hero vs
Split hero, HeroAppearance, Navbar wordmark, Colleges mega panel…), `docs/README.md` (docs index).

## Rules that bite

- **Next.js here has breaking changes** (see `AGENTS.md`). Check `node_modules/next/dist/docs/` before
  using Next APIs from memory. `middleware.ts` is still in use at the repo root.
- **Lovable sync**: never rewrite pushed history (no force-push / rebase / amend of pushed commits).
- **Branding/facts are binding**: "SVIT Vasad — Sardar Vallabhbhai Institute of Technology", AICTE-approved,
  15-acre Vasad, Gujarat. Don't change without approval.
- **Content lives in Supabase, not code.** Don't hardcode content that the admin panel edits. Avoid
  caching that produces stale colleges/staff/events/placements/inquiries.
- **Admin must not regress** (CSV imports, staff wizards, media/appearance, menus, CRUD, trash, audit log).
- **Multi-college is core**: assume more than one college/institute in routes, models, and features.
- Prettier: 100 cols, double quotes, semicolons, trailing commas (though `src/app/**` and middleware
  use single quotes — match the file you're editing).

## Commands

`npm run dev` (`next dev --webpack`) · `npm run build` (`next build` then `tsx scripts/build-search-index.ts`,
which crawls a *running* server into `public/search-index.json`) · `npm run lint` · `npm run format`.
No test suite exists. Node 24 (`.nvmrc`). Env (no `.env` committed): `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_PROJECT_ID`, `NEXT_PUBLIC_GA4_ID` (optional),
plus a service-role key read by `src/integrations/supabase/client.server.ts`. Some pages hit Supabase at
build time, so the build needs the public vars.

Lockfiles: `bun.lock` (used by Dockerfile), `package-lock.json`, `pnpm-lock.yaml` all exist — keep
`bun.lock` consistent with `package.json` if you change deps. `package-lock.json` currently has
uncommitted churn.

Deploy: `Dockerfile` (bun build → node:22-alpine, `output: "standalone"`; standalone skipped when `VERCEL`).
Alpine everywhere so `sharp`'s native binary matches.

## Layout

```
middleware.ts                 Supabase session refresh (getClaims) on all non-asset routes
next.config.ts                standalone output, supabase image patterns, legacy URL redirects
src/app/(site)/               public site (layout fetches nav/menu/settings data for Header/Footer)
src/app/admin/                login, auth/callback, actions.ts (server actions), (dashboard)/* admin pages
src/app/lib/supabase/         client.ts (browser) · server.ts (cookie-aware SSR client, per-request)
src/app/lib/auth/admin.ts     getAdminUser/requireAdmin, role + scope helpers
src/integrations/supabase/    types.ts (generated DB types) · client.server.ts (service-role, server only)
src/lib/*.functions.ts        data-access layer, one per domain (colleges, staff, events, placement…)
src/lib/supabase-public.ts    publicSupabase() cookie-less anon client + unwrap()
src/components/site-next/     public components (+ nav/) · admin-next/ (+ pages/) · ui/ (shadcn)
supabase/migrations/          SQL migrations · supabase/seeds/ seed data
docs/                         migration logs, audits, schema docs, session notes
scripts/                      search index, faculty import/seed generators, baseline capture
```

Route groups: public routes include about, admissions, campus-life (clubs/events/facilities/…),
colleges/[college], courses/[course], departments/[dept], programs/[program], staff/[staff], placement,
gallery/[albumId], news, downloads, grievance, alumni, etc. Dependent pages have their own `not-found.tsx`.

## Patterns

- **Public data**: async Server Components call `src/lib/*.functions.ts` (despite the name, these are
  plain async functions from the TanStack era, not server functions). They use `publicSupabase()` and rely
  on RLS public SELECT policies; filter `status = 'published'` and `deleted_at IS NULL`.
  `layout.tsx` wraps each call in `.catch(() => fallback)` so a failing query degrades instead of 500ing.
- **Admin auth**: `(dashboard)/layout.tsx` calls `getAdminUser()` → redirects to `/admin/login`. Authorized
  role codes: `admin`, `editor`, `department_admin`, `college_admin`. Roles come from `user_roles`
  (role FK + `scope_type`: global/trust/institute/college/department). Server actions must call
  `requireAdmin()` and check the role themselves (see `src/app/admin/actions.ts`); the service-role
  client is imported dynamically and only after that check.
- **Authorization is enforced by RLS** (`is_global_admin()`, `can_write_scoped_record`, scope-aware
  read/write policies). UI scoping (`useUserScope`, `getScopeConstraints`) is convenience only — new
  tables need RLS policies in a migration.
- **Soft deletes + audit logs**: rows carry `status` (draft/published/archived), `deleted_at`, audit cols;
  admin has a Trash page. Use soft delete, not hard delete.
- **Hero system**: `app_settings` key `hero_appearance` → `HeroAppearance`; `HeroPhotoLayer` renders
  photo slideshow (Ken Burns crossfade); `heroOverlayStyles()` for Overlay heroes only.
- **Nav** is Supabase-driven (`menus.functions.ts`) plus featured/ordering flags; Header receives many
  entity lists to build mega panels.
- **Media**: uploads go through client-side compression (`src/lib/image-compression.ts`, `@jsquash/*`);
  the server-side compression mode is non-functional (Cloudflare-era note in `deferred-issues.md`).
- **CSV imports**: `faculty-import.ts`, `achievements-import.ts` (papaparse) — scripts/ has Python
  generators for faculty seed SQL.
- Styling: Tailwind v4 tokens in `src/app/globals.css` (`paper/surface/ink/line` palette + shadcn vars);
  fonts Inter + Playfair Display; animation via framer-motion, GSAP, Lenis (smooth scroll toggle).

## Known gaps / cautions

- `docs/audits/deferred-issues.md`: `placement_cells` has no tracked `CREATE TABLE` migration; the
  `20260728120000` migration has inert dead `user_roles` SQL (live shape is the role-FK one).
- Docs are partly stale (`docs/sessions/*`, `docs/database/SUPABASE_SCHEMA.md`, `migration/implemented/status_summary.md`
  still reference TanStack routes/old counts). Treat the code and live DB as truth; `docs/migration/NEXTJS_MIGRATION_PHASE7_8_STATUS.md`
  is the latest migration status.
- Remaining cutover items (Vercel preview parity, production steps) need the owner's access.
- `typedRoutes` is disabled; no `.env.example` exists. Some `any` casts in the data layer/`admin.ts`.
- Root has leftover one-off files (`MIGRATION_COMPLETE.txt`, `FACULTY_*`, `faculty_summary.json`).
- Supabase project ref for the MCP server is in `.mcp.json`; migrations are applied to a live DB
  that has drifted from tracked history before — inspect the live schema before writing migrations.
