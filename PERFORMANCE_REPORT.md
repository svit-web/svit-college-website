# Performance Optimization — Before/After Report

Applied against `optimization_plan.md`. Every number below is measured, not
estimated — a real `next build` + `next start` (production mode) on a temp
port, timed with `curl` and Playwright, before any code changed and again
after. Where I deferred part of the plan, it's stated plainly with why,
not silently skipped.

## Method

1. Stopped the dev server (it shares `.next/` with any build — can't run
   both at once), ran `rm -rf .next && next build`, then `next start` on a
   throwaway port.
2. Measured three pages, chosen to represent the three categories at stake:
   - `/` — static, build-time prerendered, unaffected either way (control)
   - `/colleges/svica` — dynamic route this round of work targets
   - `/staff/501-NMT` — dynamic route deliberately **not** touched this
     round (see "What's deferred"), included specifically as a negative
     control to prove the measurement method isn't just noise
3. For each: 5 raw TTFB samples via Node's `http` client, plus one full
   Playwright page load capturing `performance` timing and actual
   transferred bytes.
4. Repeated the identical script after applying the changes and rebuilding.
5. Restored the dev server afterward so the working environment is
   unchanged.

Logs/build output this is drawn from: `/tmp/build-before.log`,
`/tmp/build-final.log`, and the two Playwright JSON captures (ephemeral,
not committed — the numbers are transcribed below).

## Headline result

| Route | Before (TTFB, median of 5) | After (TTFB, median of 5) | Change |
|---|---|---|---|
| `/` (static) | ~7ms | ~6ms | unchanged (control) |
| `/colleges/svica` (dynamic) | **~187ms** | **~5ms** | **−97%** |
| `/staff/501-NMT` (deferred, see below) | ~217ms | ~208ms | unchanged (as expected) |

`/colleges/svica` going from "live Supabase query on every request" to
"served from a prerendered file" is the real result of this round. The
`/staff/501-NMT` row is there on purpose: it's a route I deliberately did
**not** cache (explained below), and it shows no improvement — which is
exactly what should happen if the measurement is trustworthy rather than
system-load noise. If every route had magically gotten faster, that would
be the number to distrust.

## Full before/after numbers

### `/` (static, control)

| Metric | Before | After |
|---|---|---|
| TTFB samples (ms) | 24, 6, 6, 7, 6 | 22, 6, 4, 5, 15 |
| Full page load | 4346ms | 4068ms |
| JS transferred | 1.26 MB | 1.29 MB |
| Total transferred | 6.50 MB | 7.08 MB |

No real change expected or seen — already fully static before this round.
The small JS/total increase is the bundle-analyzer dependency and the
`PageTransition`/`loading.tsx` work from earlier in this session, not
noise and not a regression worth chasing.

### `/colleges/svica` (dynamic → now SSG)

| Metric | Before | After |
|---|---|---|
| TTFB samples (ms) | 187, 159, 156, 214, 203 | 5, 5, 9, 4, 4 |
| Full page load | 2878ms | 1958ms |
| `x-nextjs-cache` header | *(absent — not cached)* | `HIT` |
| `Cache-Control` | `private, no-cache, no-store, max-age=0, must-revalidate` | `s-maxage=300, stale-while-revalidate=31535700` |

### `/staff/501-NMT` (dynamic, deliberately deferred)

| Metric | Before | After |
|---|---|---|
| TTFB samples (ms) | 217, 207, 218, 288, 248 | 204, 223, 208, 238, 200 |
| Full page load | 2313ms | 1397ms* |

\* Full-load time dropped somewhat even though TTFB didn't — consistent
with the shared layout/chrome data (nav, footer) now being cached even
though this specific page's own query is not. TTFB, the number that
actually reflects *this route's* caching state, is unchanged, as expected.

## What was applied

### A1 — Middleware scoped to `/admin` only
`middleware.ts`'s matcher was `/((?!_next/static|_next/image|favicon.ico|...)...)`
— everything except static assets — meaning every public page paid for a
Supabase `auth.getClaims()` round-trip that only `/admin/*` ever needed.
Changed to `matcher: ['/admin/:path*']`.

Verified: `/admin` still 307-redirects to login when unauthenticated (same
as before — `(dashboard)/layout.tsx`'s own `getAdminUser()` check is the
real authorization gate per CLAUDE.md, middleware only refreshed the
session cookie), `/admin/login` still 200s, public pages unaffected.

I did not isolate this change's TTFB delta separately from A2–A4 below —
all changes were measured together as one before/after pair. The dynamic
route drop is dominated by the caching change (187ms → 5ms is obviously
a cache hit, not a saved auth call), so this one is reported as an
architectural fact, not a line in the headline table.

### A2 — `(site)/layout.tsx`'s shared queries cached
Added `export const revalidate = 300` to the layout that runs ~12 parallel
Supabase queries (nav, footer, hero chrome) on every page. This single
line is what turned every static page from fully-static-until-manually-
invalidated into ISR-cached — visible in the build table as every `○`
route gaining a `5m / 1y` revalidate/expire column that wasn't there
before.

### A3/A4 — Dynamic routes converted to ISR via `generateStaticParams`

This is where the real work was, and where the plan as written needed a
correction mid-implementation:

**`export const revalidate` alone does nothing on a page with a dynamic
segment and no `generateStaticParams`.** I assumed otherwise initially (per
the plan's A4 wording), added `revalidate = 300` to all 19 dynamic
`[param]` pages, rebuilt, and checked the actual response header:
`Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` —
explicitly uncached. Confirmed with `NEXT_PRIVATE_DEBUG_CACHE=1` and by
checking `x-nextjs-cache` (absent). The route segment config alone doesn't
make Next treat the page as prerenderable; it needs `generateStaticParams`
to tell Next which paths exist.

Fixed by adding real `generateStaticParams` (reusing each route's existing
list-fetching function — no new Supabase queries invented) to:

| Route | Paths generated | List function reused |
|---|---|---|
| `colleges/[college]` | 6 | `getAllColleges` |
| `achievements/[slug]` | 122 | `getAllAchievements` |
| `campus-life/events/[slug]` | 62 | `getAllEvents` |
| `campus-life/clubs/[slug]` | 14 | `getAllStudentClubs` |
| `campus-life/clubs/[slug]/events` | 14 | `getAllStudentClubs` |
| `campus-life/facilities/[...slug]` | 10 | `getAllFacilities` |
| `gallery/[slug]` | 11 | `getAllGalleryAlbums` |
| `news/[slug]` | 3 | `getAllPosts` |
| `student-corner/[slug]` | 7 | `getVisibleCenters` |
| `courses/[course]` | 7 | `getAllProgrammes` (matches on `code`, not `slug` — see code comment) |
| `departments/[dept]` | 23 | `getAllDepartments` |
| `departments/[dept]/achievements` | 23 | `getAllDepartments` |
| `departments/[dept]/activities` | 23 | `getAllDepartments` |
| `departments/[dept]/labs` | 23 | `getAllDepartments` |
| `departments/[dept]/labs/[slug]` | 104 | `getAllDepartments` × `getLabsByDepartmentId` (nested) |

**Total: ~450 pages newly prerendered**, all confirmed in the build output
as `●` (SSG). Verified at runtime, not just trusted from the build log —
`/colleges/svica`'s `x-nextjs-cache: HIT` and 5ms TTFB above is that
verification.

Build time cost: 28s (before, 59 routes, 0 dynamic) → 51.6s (after, 59
routes + ~450 dynamically-generated ones). An extra ~24s on every deploy
for roughly 7.5x the prerendered page count — reasonable.

One bug caught during this: my first pass at `departments/[dept]/labs/[slug]`
crashed the build (`A required parameter (slug) was not provided as a
string`) because a `catch(() => [])` wasn't enough — some lab rows had a
non-string `slug` the TypeScript type claimed couldn't happen. Fixed with
an explicit `typeof l.slug === "string" && l.slug.length > 0` filter.

### What's deferred (and why — not silently dropped)

Two routes kept `revalidate = 300` with a comment correcting the record
(it's not doing anything yet) rather than real caching, because getting
`generateStaticParams` right for them needs new aggregation code, not just
reusing an existing list function, and I'd rather hand that back for
review than rush it:

- **`staff/[staff]`** — 368 pages per the sitemap, and no existing
  "every staff member" list function (only `getStaffByEmployeeCode`,
  singular). Also the single biggest build-time addition of anything in
  this list — worth its own reviewed change.
- **`programs/[program]`** — looks up by a course UUID
  (`getCourseWithDept`), and there's no flat "every course id" function —
  enumerating them means a new query across every department's courses
  plus top-level programmes.

Two routes had the blanket `revalidate` export **removed entirely**: my
first pass added it to all 19 `[param]` pages mechanically, including two
that turned out to do no data fetching at all —
`courses/[course]/faculty` (always `notFound()`) and `placement/[college]`
(a pure `redirect("/placement")`). Caught by reading the files before
trusting the comment; left with no route-segment config, same as before.

### B5 — Bundle analyzer added
`@next/bundle-analyzer`, wired into `next.config.ts` behind
`ANALYZE=true` — off by default, zero effect on normal builds. Run
`ANALYZE=true npx next build` for an interactive treemap.

One wrinkle: the project's `bunfig.toml` has a 24-hour supply-chain guard
(`minimumReleaseAge`) that blocked the latest published version
(`16.4.2`, <24h old at the time). Pinned to `16.4.1` (published a day
earlier) instead of adding an exclusion — the guard did its job; working
around it wasn't warranted for a dev-only dependency. `bun.lock` and
`package-lock.json` both regenerated and are consistent with
`package.json` (confirmed via `bun install`, run through `npx bun` since
`bun` itself isn't on this machine's PATH).

### B3 — Recharts audit
`grep` confirms zero imports of `src/components/ui/chart.tsx` (the
Recharts wrapper) anywhere in the codebase, admin or public. It's
unreachable dead code — not shipped to any bundle, nothing to fix.

## What was *not* attempted this round (unchanged from the plan)

Per the plan's own sequencing, Phases 4–5 (B1/B2 client-component
code-splitting and audit, C3 live image-size audit, E1 finer Suspense
boundaries) weren't attempted — they need either a bundle-analyzer run to
target correctly (now possible, not yet done) or access to live Supabase
storage data I don't have in this session. Recommended as the next pass,
using the bundle analyzer just added.

## Guardrail check (from `optimization_plan.md`)

- **"Avoid caching that produces stale content"**: every cache added here
  is invalidated by the existing `revalidatePublicSite()` →
  `revalidatePath('/', 'layout')` call on admin writes (confirmed this
  invalidates ISR-cached dynamic routes too, not just the literal path, per
  Next's own docs on `revalidatePath('/', 'layout')` — "invalidate all
  cached data for revalidation on the next page visit"). The 5-minute
  `revalidate` window is only the periodic fallback if that hook is ever
  missed.
- **"Admin must not regress"**: verified admin auth flow (redirect on
  unauthenticated access) still works after the middleware scope change.
- **"Multi-college is core"**: every `generateStaticParams` added iterates
  the full list from Supabase (`getAllColleges`, `getAllDepartments`,
  etc.) — none of it is hardcoded to one college.

## Everything changed this pass

`middleware.ts`, `next.config.ts`, `src/app/(site)/layout.tsx`, plus
`generateStaticParams`/comment fixes across 19 files under
`src/app/(site)/**/[*]/page.tsx`, and `package.json`/`package-lock.json`/
`bun.lock` for the bundle-analyzer devDependency. Nothing is committed.
