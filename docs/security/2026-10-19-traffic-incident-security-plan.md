# Security & vulnerability verification plan — 2026-10-19

**Trigger:** production (self-hosted Supabase in Docker, inside a Proxmox VM) received
unusually high traffic, went down for several hours, and required a hard VM reset to
recover. This plan covers root-causing that incident and a phased hardening pass.
Findings below come from a direct read of this codebase plus a dedicated audit agent
(`a50fdaa0fa159a98c`, 2026-10-19) — nothing here is generic advice; every claim is
file/line-grounded.

## Status at a glance

| Phase | Scope | Status |
|---|---|---|
| 0 | Root-cause the actual incident (Cloudflare/Docker/Proxmox logs) | **Not started — operator task, needs log access this session doesn't have** |
| 1a | Cache `sitemap.xml` instead of rebuilding it on every hit | ✅ Implemented 2026-10-19 |
| 1b | Lightweight IP rate limiting on public routes in `middleware.ts` | ✅ Implemented 2026-10-19 |
| 1c | Fix unchecked `x-forwarded-host` in the OAuth callback | ✅ Implemented 2026-10-19 |
| 1d | Add `.limit()` ceilings across the 27 `*.functions.ts` files that have none | **Not started — scoped out, see "Deliberately not done yet" below** |
| 2 | PostgREST `db-max-rows`, connection pooling, RLS audit | **Not started — operator + needs production SQL access** |
| 3 | Docker resource limits, Cloudflare proxy/WAF, Kong rate limiting, alerting | **Not started — operator task, Proxmox/Docker-host access required** |

---

## Phase 0 — Root-cause first (operator, before trusting any fix)

Nothing below should be treated as "the fix" until someone with access to the
actual logs confirms what happened. Pull, for the incident window:

1. Cloudflare Analytics/Security Events — request volume by path, by IP/ASN/country,
   and whether Cloudflare's own firewall logged anything.
2. `docker logs` for the Kong, PostgREST, Postgres, and Next.js app containers —
   which one's CPU/memory actually maxed out first tells you app vs. DB vs. gateway.
3. Proxmox's VM resource graphs (CPU/RAM/disk I/O) for the window, and whether other
   VMs on the same host also spiked (rules in/out "this wasn't really about this app").

Only after this: confirm whether the sitemap fan-out (Phase 1a target), direct
PostgREST abuse (Phase 1d/2 target), or something host-level (Phase 3) actually
matches the evidence.

## Phase 1 — App-layer hardening (this repo, code-only)

### 1a. `sitemap.xml` was rebuilt from scratch on every single request — IMPLEMENTED

`src/app/sitemap.ts` had `export const dynamic = "force-dynamic"` (no caching at
all) and fires **14 concurrent Supabase queries** per hit (colleges, departments,
courses×2, posts, events×2, gallery albums, staff, clubs, facilities×2, labs,
centers, achievements). It's public, unauthenticated, and `robots.ts` explicitly
hands every crawler this exact URL. This was the single most plausible
"traffic spike took the whole server down" vector found in the app: cheap for a
bot to hit in a loop, expensive to serve, zero safety valve.

**Fix:** replaced `force-dynamic` with `revalidate = 300` (five minutes), matching
the caching convention already used by `(site)/layout.tsx` and the dynamic detail
routes (`optimization_plan.md` A2–A4). Admin writes still bust it immediately via
the existing `revalidatePublicSite()` → `revalidatePath('/', 'layout')` path
(`src/app/admin/actions.ts`), so content changes aren't delayed by the cache window
— this only stops a crawler/bot from re-triggering the full 14-query fan-out on
every single hit.

### 1b. Zero rate limiting on any public route — IMPLEMENTED (partial)

`middleware.ts`'s matcher was scoped to `/admin/:path*` only; every public route
had no IP throttling, no bot/abuse checks, nothing. Added a lightweight in-memory
sliding-window limiter (120 requests/IP/minute) applied to all non-static,
non-admin routes, returning `429` over the limit.

**Important, explicit caveat — this is a backstop, not the real fix:** it's
in-memory, per Node process. On a single self-hosted instance (confirmed this is
the current topology — one Next.js container, not a multi-replica cluster) that's
a real, working limit. It would silently stop protecting anything the moment this
app is scaled to multiple instances/replicas without moving the counter to shared
storage (Redis, or Supabase itself). It also does nothing against a distributed
attack (many IPs) — that class of problem belongs at Cloudflare (Phase 3), not
here. Documented inline in the code with this exact caveat.

### 1c. OAuth callback trusted `x-forwarded-host` unchecked — IMPLEMENTED

`src/app/admin/auth/callback/route.ts` built its redirect origin from the raw
`x-forwarded-host` request header with no allowlist check — an open-redirect-style
issue if whatever reverse proxy sits in front of the app doesn't already overwrite
that header. Not a traffic/DoS vector, but a real vulnerability class, found while
auditing the same file. Fixed to use `SITE_URL` (the site's own canonical origin,
already defined in `src/lib/seo.ts`) instead of trusting the incoming header.

### 1d. 27 of 30 `*.functions.ts` files have no `.limit()` anywhere — DELIBERATELY NOT DONE YET

Since the Supabase anon key is necessarily public (shipped to every browser),
anyone can call `https://db.svitvasad.ac.in/rest/v1/<table>?...` directly,
bypassing Next.js entirely, with broader filters than the app itself ever sends.
The only ceiling today is whatever PostgREST's own `db-max-rows` is configured to
— and that's currently unknown/likely unset (Phase 2).

**Why this isn't implemented today:** a mechanical `.limit()` sweep across 27
files is a large, hard-to-fully-verify diff — some of these lists are naturally
bounded by real-world data volume (e.g. "achievements for one department"),
others genuinely aren't (e.g. "all staff_profiles site-wide"), and getting the
right cap per call site without breaking a page that currently expects the full
list requires checking each one individually, not applying one number everywhere.
Doing this properly is real, scoped follow-up work, not a today-sized task.
Recommended next step: treat `db-max-rows` on PostgREST (Phase 2, a single config
change) as the actual safety net, since it protects every call site at once
including future ones, and reserve app-level `.limit()` additions for call sites
that need a *smaller* UX-driven cap than that server-wide ceiling, not as the
primary defense.

## Phase 2 — Database/API-layer hardening (operator + a migration, not done)

- Set PostgREST's `db-max-rows`/`max-rows` config explicitly (currently
  unknown/unset) — the real, single-point safety net for 1d above.
- Confirm a connection pooler (PgBouncer, ships with Supabase) is actually in
  front of Postgres and sized sanely — connection exhaustion is a classic
  "whole stack goes unresponsive" failure mode independent of raw request volume.
- Audit RLS policies project-wide for unintentionally-broad `qual: true` grants —
  this week alone surfaced both an over-permissive pattern (none found broad by
  accident, but worth a systematic pass) and an over-restrictive one (the
  `staff_profiles` department-visibility bug fixed 2026-10-17/19), so a full
  policy inventory is warranted, not just spot-checks.

## Phase 3 — Infra-layer hardening (operator, Docker/Proxmox-specific, not done)

- Set explicit CPU/memory limits on every self-hosted Supabase container
  (`deploy.resources.limits` / `docker run --memory`/`--cpus`). **Without these,
  one container spiking starves the whole Docker host** — a very common root
  cause for "entire VM needed a hard reset" on Docker-in-a-VM setups, independent
  of what caused the traffic in the first place.
- Confirm swap is configured and check OOM-killer behavior — a hard VM freeze
  (requiring reset, vs. a clean container restart) usually means the host ran out
  of memory with no swap headroom, not just "the app was slow."
- Confirm the Cloudflare Tunnel's DNS record is actually proxied (orange-clouded)
  with WAF/rate-limiting/Bot Fight Mode on, vs. a bare tunnel route with no edge
  protection — one toggle, catches most bot/scraper floods before they reach the VM.
- Consider a Kong rate-limiting plugin on the public `/rest/v1` route as a second
  line of defense behind Cloudflare.
- Basic resource alerting (even a simple Proxmox-level CPU/RAM/disk threshold
  alert), so the next spike is caught and investigated before it needs a hard
  reset, not after.
