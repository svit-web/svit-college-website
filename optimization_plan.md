# Performance Optimization Plan — SVIT Vasad Website

Plan only — nothing in this document has been implemented. Findings below come
from direct inspection of this codebase (`next.config.ts`, `middleware.ts`,
`(site)/layout.tsx`, `src/lib/*.functions.ts`, `package.json`, `Dockerfile`)
plus the project's own existing note in `docs/audits/deferred-issues.md` (#4),
which already flags part of this. Where I'm inferring rather than having
measured directly (e.g. actual photo sizes in Supabase storage), it's called
out as "needs measurement," not stated as fact.

## Top 5, by impact vs. effort

1. **Narrow the middleware matcher to `/admin`.** Right now it runs a Supabase
   auth round-trip (`supabase.auth.getClaims()`) on *every* request to the
   site — every public page, every navigation — when only `/admin/*` needs
   auth. One-line config change, near-zero risk, removes a network hop from
   100% of public traffic.
2. **Cache public Supabase reads.** `src/lib/*.functions.ts` call
   `supabase-js` directly, not Next's `fetch()`, so Next's Data Cache never
   applies — every read hits Supabase live, every time, including the ~12
   parallel queries `(site)/layout.tsx` runs on *every single page* for
   nav/footer data. `deferred-issues.md` #4 already identifies this and
   recommends `unstable_cache`/`"use cache"` per-table tags. The admin side
   already calls `revalidatePublicSite()` → `revalidatePath('/', 'layout')`
   after writes, so the invalidation plumbing exists — this is "wire caching
   into what's already there," not "build caching from scratch."
3. **Make the dynamic (`ƒ`) routes cacheable/static.** Per the same note,
   `/colleges/[college]`, `/staff/[staff]`, `/departments/[dept]`,
   `/placement/[college]`, `/programs/[program]`, `/campus-life/clubs/[slug]`
   etc. hit Supabase on every request with no caching at all. Known slugs are
   enumerable (we pulled ~850 of them from `sitemap.xml` earlier this
   session) — `generateStaticParams` + ISR would turn most of these into
   prerendered/cached pages.
4. **Trim client JS.** 59 of ~53 `site-next` components are `"use client"`.
   No `next/dynamic`/`React.lazy` is used anywhere in the codebase, so
   GSAP-driven decorative pieces (`CurtainImage`, `RecruitersMarquee`), modal
   components (`EntryViewer`, `PhotoLightbox`), and anything else not needed
   for first paint all ship eagerly instead of being code-split.
5. **Measure before optimizing further.** No bundle analyzer is configured
   and no Core Web Vitals are currently collected. Add
   `@next/bundle-analyzer` (dev-only) and a baseline Lighthouse/WebPageTest
   pass before touching anything, so each phase below has a before/after
   number instead of a guess.

## Full plan, by area

### A. Network & server-side data (biggest wins, lowest risk)

- **A1 — Middleware scope.** Change the `matcher` in `middleware.ts` from
  "everything except static assets" to `/admin/:path*` (plus
  `/admin/login`, `/admin/auth/callback`). Verify admin auth/session refresh
  still works end-to-end after the change — this is the one place a mistake
  would actually regress something (CLAUDE.md: "Admin must not regress").
- **A2 — Cache `(site)/layout.tsx`'s data.** Wrap `getCollegesGrid`,
  `getContactInfo`, `getMiscSettings`, `getAllDepartments`,
  `getAllFacilities`, `getFeaturedStudentClubs`, `getAllEvents`, `getSports`,
  `getVisibleCenters`, `getMainNavigation`, `getTopUtilityNavigation`,
  `getHeroAppearance` in `unstable_cache` (or Next 16's `"use cache"` if the
  project adopts it) with a tag per source table, so this doesn't re-run on
  every navigation. This data (nav/footer/hero chrome) changes rarely and is
  identical across every page, so it's the single highest-value caching
  target on the site.
- **A3 — Cache the rest of `src/lib/*.functions.ts`** (30 files) the same
  way, prioritized by how often each route is actually visited (home,
  colleges index, courses index, departments first — low-traffic pages like
  individual lab detail pages last).
- **A4 — Static/ISR the `[slug]` routes.** Add `generateStaticParams` for
  colleges, departments, staff, courses, programs, placement, campus-life
  clubs/events/facilities, using a `revalidate` window (or tag-based
  on-demand revalidation tied into the existing `revalidatePublicSite()`
  call) instead of hitting Supabase on every request.
- **A5 — Audit for redundant queries across layout + page.** Several
  `page.tsx` files already re-fetch things the layout also fetches (e.g.
  colleges, events) — once A2 caches the underlying function, duplicate
  calls become cheap (same cache entry), but it's worth a pass to just
  de-duplicate the fetches outright where the same data is needed twice on
  one request.
- **A6 — Edge/CDN caching for the self-hosted deploy.** The `Dockerfile`
  produces a `standalone` Next server (good), but I can't see a reverse
  proxy or CDN config from the repo — worth confirming static assets and
  cached HTML get edge-cached in front of the Node process, not just served
  fresh from it every time. Flag for review with whoever owns the
  self-hosted Supabase/deploy infra (`docs/infra/SELF_HOSTED_SUPABASE.md`).

### B. Rendering & client bundle size

- **B1 — Code-split non-critical client components.** `next/dynamic` (with
  `ssr: false` where the component is purely decorative/below-the-fold) for
  `CurtainImage`, `RecruitersMarquee`, `PhotoLightbox`, `EntryViewer` — these
  currently ship in the main bundle on every page that imports them, whether
  or not the user ever triggers them.
- **B2 — Audit the 59 `"use client"` files.** For each: does it need
  interactivity, or just data that could be fetched server-side and passed
  down as props? Every unnecessary client boundary adds to the hydration
  payload. This is a bigger, slower pass — do it after A2/A3 land, since
  some of these exist specifically to work around today's uncached fetches.
- **B3 — Confirm `recharts` (`src/components/ui/chart.tsx`) isn't shipped to
  the public site.** I didn't find it imported from `PlacementPage.tsx` (the
  public placement chart appears to be hand-built with plain CSS, not
  Recharts), but I didn't check every admin/public component — worth a
  one-time `grep` + bundle-analyzer confirmation. If it's genuinely
  admin-only, Next's route-level code-splitting already keeps it out of the
  public bundle and no action is needed; if something public does pull it
  in, that's ~5MB of unpacked dependency to isolate or replace.
- **B4 — Animation library overlap (lower priority, bigger refactor).** The
  site carries GSAP + ScrollTrigger + Lenis *and* framer-motion
  simultaneously. Some effects currently on GSAP could likely move to
  framer-motion (already loaded everywhere else) to avoid shipping two
  animation engines. Not a quick win — flag for a later pass, not this
  round.
- **B5 — Add `@next/bundle-analyzer`.** Dev-only dependency, wired behind an
  env flag, to get real per-route JS numbers instead of guessing from
  `node_modules` sizes.

### C. Images & fonts

- **C1 — Fonts: already in good shape.** `next/font` with `subsets: ["latin"]`
  for both Inter and Playfair Display — self-hosted, no render-blocking
  external font request, automatic `font-display` handling. No action here
  beyond keeping it that way as new weights/fonts get added.
- **C2 — `next/image` usage: mostly correct, spot-check the rest.** The hero
  (`HeroPhotoLayer`) already uses `fill` + `sizes="100vw"` +
  `priority={i === 0}` correctly. Worth a pass over the remaining `<Image>`
  usages (card grids, staff photos, gallery) to confirm `sizes` actually
  matches rendered width at each breakpoint — a wrong `sizes` value is a
  common way to silently request a larger image than needed.
- **C3 — Audit actual photo sizes/formats in Supabase storage (needs
  measurement, not inferred).** `docs/audits/deferred-issues.md` #3 already
  documents that server-side upload compression is broken on this project's
  build target, so client-side compression is the only thing keeping
  uploaded photos reasonably sized — worth pulling a sample of real
  `storage` URLs and checking actual file sizes/dimensions before assuming
  this is fine.
- **C4 — `public/og-image.jpg` (244KB).** Only served to social-share
  crawlers, not rendered on any page — low priority, but an easy win if
  optimizing a batch of assets anyway (re-export at a tighter compression
  level; OG images don't need to be large).
- **C5 — SVG handling.** `next.config.ts` already sets `dangerouslyAllowSVG`
  with a locked-down CSP for department/college logo SVGs from trusted
  storage — this looks correctly scoped already, just noting it so a future
  "lock down image config" pass doesn't accidentally break logos.

### D. Third-party scripts

- **D1 — GA4** already loads via `strategy="afterInteractive"` — correct,
  no change needed.
- **D2 — Sonner (toasts)** is lightweight; no action.
- **D3 — Sweep for anything else** loaded unconditionally on every page that
  could be deferred or scoped to where it's actually used (same audit as
  B2, really — do them together).

### E. Streaming & perceived performance

- **E1 — Page-level `loading.tsx` already exists** (added in this session)
  for every route under `(site)`. Next: add *inner* `<Suspense>` boundaries
  within heavier pages (department pages with 5+ parallel queries,
  placement pages) so fast-resolving content (hero, title) streams
  immediately while slower sections (staff lists, charts) stream in behind
  their own fallback — finer-grained than the one route-level bar.
- **E2 — Confirm hero images keep `priority`** as more hero variants get
  added (already correct today, just a "don't regress this" note).

### F. Build & deploy

- **F1 — Docker layering already reasonable** (separate deps/build/runtime
  stages, Alpine-matched `sharp` binary). No change needed unless build
  times become a problem.
- **F2 — Confirm standalone output size** stays reasonable as dependencies
  grow — worth tracking over time, not a one-time fix.
- **F3 — Confirm a CDN or edge cache sits in front of the self-hosted
  deploy** for static assets and cacheable HTML (see A6) — infra-level,
  needs the deploy owner.

## Suggested sequencing

1. **Phase 1 (do first — ~1 day, near-zero risk):** A1 (middleware scope),
   B5 (bundle analyzer), establish a Lighthouse/WebPageTest baseline. This
   phase alone should produce a measurable TTFB improvement site-wide.
2. **Phase 2 (moderate effort, needs care):** A2 — cache the layout's 12
   queries using the existing `revalidatePublicSite()` invalidation path.
   Verify admin edits still show up promptly after a write (CLAUDE.md
   treats stale content as a regression — this is the phase most likely to
   introduce that if rushed).
3. **Phase 3:** A3/A4 — cache remaining `*.functions.ts` reads and convert
   dynamic `[slug]` routes to ISR/static with `generateStaticParams`.
4. **Phase 4:** B1–B3 — code-split and audit client components, confirm
   recharts isolation, re-run the bundle analyzer to confirm JS actually
   shrank.
5. **Phase 5:** C1–C5, E1 — image/font micro-audit and finer Suspense
   boundaries on the heavier pages.
6. **Later / opportunistic:** B4 (animation library consolidation), F1–F3
   (infra-level, needs the deploy owner).

## Guardrails (tie back to this project's own rules)

- **"Avoid caching that produces stale colleges/staff/events/placements/
  inquiries"** (CLAUDE.md). Every caching change in Phases 2–3 must go
  through the existing tag/path invalidation (`revalidatePublicSite()`),
  never a bare time-only TTL that could leave an admin's edit invisible
  indefinitely.
- **Admin must not regress.** A1 (middleware narrowing) is the one change
  with direct admin-auth blast radius — test the full admin login/session
  flow after it, not just that public pages still load.
- **Multi-college is core.** A4's `generateStaticParams` work must cover
  every college/department/program, not just SVIT's — this project
  explicitly assumes more than one institute throughout.

## How to measure success

- Lighthouse (mobile + desktop) on a representative static page (`/`) and a
  representative dynamic page (`/colleges/svica`) — before Phase 1, and
  after each phase.
- TTFB on a cold request to a currently-dynamic route (e.g.
  `/staff/501-NMT`) before vs. after Phase 3.
- Bundle analyzer output (total JS for a representative page) before Phase 1
  and after Phase 4.
- Optional: wire up `web-vitals` reporting through the GA4 integration
  that's already in place, to get real field Core Web Vitals instead of only
  lab data — worth considering once the above phases land.
