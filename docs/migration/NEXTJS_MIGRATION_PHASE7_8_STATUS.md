# Next.js migration — Phase 7/8 status

**Date:** 2026-08-25
**Refers to the phase numbering in** `docs/migration/NEXTJS_MIGRATION_PLAN.md` §5 —
not the unrelated `PHASE1_COMPLETE.md`...`PHASE5_COMPLETE.md` docs in this same folder,
which track a different, earlier migration (static data → Supabase, pre-dating the
Next.js port).

This session found Phases 4–6 already substantially done (public site and admin panel
both live under `src/app` on Next.js App Router) despite no `PHASE4_COMPLETE.md` /
`PHASE6_COMPLETE.md` ever being written. What follows covers the remaining Phase 7
(Infrastructure) and Phase 8 (Cutover) work.

## Phase 7 — Infrastructure: done, repo-locally

- **`Dockerfile` rewritten** for `next.config.ts`'s `output: "standalone"`. The old
  Dockerfile still built via Nitro's `.output/server/index.mjs` entry — a leftover from
  before the port that nobody had touched (`git log` showed its last edit was a
  pre-migration commit). It would have deployed the wrong app entirely if used as-is.
- **`sharp` added as a real dependency.** It existed in `node_modules` (self-hosted image
  optimization needs it) but wasn't declared in `package.json` or `bun.lock` at all — a
  fresh `bun install --frozen-lockfile` (exactly what the Dockerfile's deps stage runs)
  would have silently produced a container without it.
- **Alpine consistency fixed.** The old multi-stage setup mixed a Debian-based build image
  (`oven/bun:1`) with an Alpine runtime (`node:22-alpine`) — sharp's native binary is
  platform/libc-specific, so a Debian-built sharp fails at request time inside an Alpine
  container. All three stages now use Alpine bases.
- **Build-time Supabase env vars.** `.dockerignore` correctly excludes `.env` (no secret
  should ever enter an image layer), but some public pages (`/placement`, and others)
  fetch from Supabase during `next build`'s static generation and need
  `NEXT_PUBLIC_SUPABASE_URL` etc. at build time. Added `ARG`/`ENV` declarations for the
  three `NEXT_PUBLIC_*` vars — safe to pass as build args since that prefix already means
  "inlined into the public client bundle." The build/deploy pipeline must pass them via
  `docker build --build-arg NEXT_PUBLIC_SUPABASE_URL=... --build-arg ...`.
- **GA4 ported** via `next/script` (`afterInteractive`) in `src/app/layout.tsx`, reading
  `NEXT_PUBLIC_GA4_ID` (unset today — the tag renders nothing until someone sets it; no
  `.env.example` existed to add a placeholder to).
- **`error.tsx` / `global-error.tsx` added** at the app root (neither existed before).
- **Verified end-to-end**, not just written: built the Docker image for real (`docker
  build`), ran the container, and hit the homepage, a dynamic route (`/colleges`), and
  `/admin/login` — all returned 200 against live dev Supabase data.

**Not done — needs your access, not mine:**
- Vercel project setup for preview deploys.
- Parity check between a Vercel preview and the Docker container (plan's Phase 7 gate) —
  needs an actual Vercel deployment to compare against.

## Phase 8 — Cutover: mechanical checks done, production steps are a handoff

**Done — URL diff against the Phase 0 baseline** (`docs/migration/PHASE8_URL_DIFF.md` has
full detail): built the app, ran it locally, captured all 460 baseline URLs with the
existing `scripts/capture-baseline-html.sh`, and diffed against the committed
`docs/baseline/metadata.tsv`. Result: **zero regressions** — identical HTTP status codes
(including the 7 intentional 404 tombstones and 5 redirects), identical redirect targets,
zero canonical/JSON-LD regressions. 327 title changes, all improvements (per-page
`generateMetadata` work), verified none of them fell back to the generic homepage title
from something more specific. Re-ran this same diff again after the TanStack deletion
below — still zero regressions.

**Not done — these need you, deliberately:**

1. **Repair prod's Supabase migration ledger** (`supabase migration repair --status
   applied` for the 52 pre-existing migrations) and verify with `db push --dry-run`. The
   plan calls this out as critical and something to never discover during cutover — I
   didn't touch prod's database at all this session.
2. **Apply the Phase 2 auth/RLS migrations to prod Supabase** — only safe after the ledger
   repair above.
3. **Merge `nextjs-migration` → `admin-portal-test` → `prod` and deploy.**
4. **Re-run the URL diff against prod data** before cutover — this session's diff used dev
   Supabase; prod has minor content drift (`homepage_items` 84 vs 85, `app_settings` 14 vs
   15 per the plan's own note) that could show up as different results.
5. **Lighthouse comparison** against the Phase 0 baseline, from the same region (dev is
   Sydney, prod is Tokyo — the plan flags mixing regions as making the comparison
   meaningless).
6. **Resubmit the sitemap to Search Console and watch for 30 days** — not something
   anyone can complete in one sitting.

## TanStack app: deleted

Confirmed safe and removed, on this branch (`nextjs-migration`) only:

- `src/routes/` (78 files), `src/components/site/` (23 files), `vite.config.ts`,
  `tsconfig.tanstack.json`, `src/routeTree.gen.ts`, `src/server.ts`, `src/start.ts`,
  `src/integrations/supabase/auth-attacher.ts`, `src/integrations/supabase/auth-middleware.ts`.
- Six `src/lib/*.functions.ts` files that were **wholly dead** (zero live imports from
  `src/app`/`src/components/admin-next`/`src/components/site-next`): `user-management`,
  `media-upload`, `admin-users`, `app-settings`, `courses`, plus `src/lib/submissions.ts`,
  `src/lib/upload-media.ts`, and the Vite-only `src/integrations/supabase/client.ts`
  (used `import.meta.env`, which doesn't exist under Next/webpack).
- Two dead hooks: `src/hooks/useAdminAuth.ts` (the old localStorage-session model the
  plan's §3 describes replacing) and `src/hooks/useImageCompressionMode.ts` (imported the
  now-deleted `app-settings.functions.ts`).
- Two files were **partially live** — `theme.functions.ts` and `site-settings.functions.ts`
  had real, still-used read functions (`getHeroAppearance`, `getMiscSettings`) sitting
  alongside dead `createServerFn`-based write functions already superseded by
  `theme-next.ts` / `site-settings-next.ts`. Stripped the dead TanStack write code and
  `requireSupabaseAuth`/`createServerFn` imports; kept the live reads. Same surgery on
  `scholarships.functions.ts` (kept `getAllScholarships`/`getAllScholarshipsAdmin`, removed
  the dead `upsertScholarship`/`deleteScholarship`).
- `package.json`: removed `@tailwindcss/vite`, `@tanstack/react-router`,
  `@tanstack/react-start`, `@tanstack/router-plugin`, `vite-tsconfig-paths`,
  `@lovable.dev/vite-tanstack-config`, `@vitejs/plugin-react`, `nitro`, `vite`, and the
  `dev:tanstack`/`build:tanstack`/`build:dev`/`preview` scripts. Kept `@tanstack/react-query`
  and `@tanstack/react-table` — both genuinely still used by the admin panel (React Query
  for a few data-grid cases, react-table for the CRUD grids, exactly as the plan's Phase 6
  notes call out as intentional retentions).

**Why this was safe to do now, contrary to what I said earlier in this conversation:** I'd
previously said deletion would "delete the app actively serving production" — that
overstated it. `prod` is a separate branch/deployment lineage (per the plan's own rollback
model in §4: "prod remains a live, deployable TanStack Start app... rollback is a redeploy,
not a restore"), not built from this branch's working tree. Deleting these files here
doesn't touch what's currently live; it only affects what *this branch* would produce if
deployed today — which the Phase 7 Dockerfile fix now handles correctly.

**Verified after deletion:** `tsc --noEmit` clean, `next build` clean (58 routes, one more
than before due to a pre-existing, unrelated in-progress `/admin/auth/callback` route — see
below), Docker build + run smoke test clean, and the full 460-URL baseline diff still shows
zero regressions.

## Found but not touched: uncommitted Google OAuth admin-login work

`src/app/admin/login/actions.ts` and `src/app/admin/login/page.tsx` had uncommitted changes
already sitting in the working tree before this session started — a Google OAuth sign-in
flow (`loginWithGoogle`, a `/admin/auth/callback` route, a Google button on the login form).
This is not something I wrote or touched; flagging it here so it doesn't get lost or mixed
up with the migration work in this same set of changes when you review the diff.
