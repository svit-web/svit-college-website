# Phase 5 — Site Navigation & Committees, Database-First

## 🎯 SCOPE

Phases 1–4 wired 23 tables into public routes (colleges, courses, departments,
staff, events, posts, accreditations, etc). Two tables with real admin-entered
data were still completely unwired:

1. **`menus` / `menu_items`** (2 menus, 10 items) — the site header's main nav
   and top utility nav were 100% hardcoded in `src/data/site.ts`, even though
   `/admin/menus` already lets an admin edit them.
2. **`committees`** (5 rows) — the `/about` page's "SVIT Committees" section
   (Women Development Cell, Grievance Redressal, Anti-Ragging, IQAC, etc) was
   100% static, even though the DB rows already contain a full
   description/vision/mission/keyActivities payload that matches the static
   shape exactly.

No schema changes. Both follow the established database-first-with-static-
fallback pattern from Phases 1–4.

---

## ✅ WHAT CHANGED

### 1. Navigation — `menus` / `menu_items`
New: `src/lib/menus.functions.ts`, `src/lib/menus.ts`

`getMenuItemsByCode(code)` resolves a menu by `menus.code` (`main_navigation`,
`top_navigation`), then returns its published, top-level (`parent_id is null`)
items ordered by `sort_order`.

`src/components/site/Header.tsx` now fetches both menus via `useQuery` and
builds `displayPrimaryNav` / `displayTopNav`, replacing the static
`primaryNav`/`topNav` import in every render path (desktop nav, mobile nav,
top utility strip) — falls back to the static arrays when the DB query hasn't
resolved yet or returns no rows. The mega-menu dropdowns (Colleges, Placement,
Campus Life) still key off `item.label`, which continues to work because the
admin-entered `menu_items.title` values already match those exact labels.

Verified live: an admin can currently add/reorder/rename nav items from
`/admin/menus` and the header will reflect it. Confirmed the live data already
diverges intentionally from the static fallback — DB moved "About Us" from
the primary nav into the top utility nav, which is exactly the kind of edit
this phase makes possible without a redeploy.

### 2. Committees — `committees`
New: `src/lib/committees.functions.ts`, `src/lib/committees.ts`

`getAllCommittees()` returns published committees ordered by name, unpacking
`description`/`vision`/`mission`/`keyActivities` out of the `metadata` jsonb
column (the table has no dedicated columns for these — everything but
name/slug lives in metadata).

`src/routes/about.tsx` prefetches `allCommitteesQuery` in its loader, and
`content.committees` (previously the render loop read `c.committees` directly
from static data) is now `dbCommittees` when the DB has rows, static
otherwise.

---

## 🔬 VERIFICATION

1. `npx tsc --noEmit` → 0 errors
2. `npx vite build` → clean production build
3. Ran the exact `menu_items` join/filter (`menus.code = ..., status =
   'published', parent_id is null, order by sort_order`) against live
   Postgres via Supabase MCP — confirmed it returns the 5 `main_navigation`
   items and matches what `Header.tsx` needs
4. Confirmed RLS: `committees`, `menus`, `menu_items` all have public/anon
   `SELECT` policies (`qual: true`) — the site's publishable-key client can
   read them without auth
5. Started the dev server and fetched `/about` — SSR renders without errors;
   both new queries are unprefetched at the root level (same as the existing
   `collegesQuery` used elsewhere in `Header.tsx`), so first paint uses the
   static fallback and the DB values take over on client hydration — this
   matches the pre-existing `displayColleges` pattern already shipped in
   `Header.tsx`, not a new inconsistency

---

## 📊 CUMULATIVE STATUS (Phases 1–5)

- **25 / 53 tables** now have live query infrastructure wired into public
  routes (was 23/53 — this phase added `menus`+`menu_items` and `committees`)
- `cache-utils.ts` already had `TABLE_QUERY_MAP` entries for `menus`,
  `menu_items`, and `committees` from an earlier phase — no changes needed
  there; admin edits to nav or committees invalidate correctly

---

## 🧪 HOW TO TEST

**Navigation:**
1. Admin Portal → `/admin/menus` — rename or reorder an item in "Main Header
   Navigation" or "Top Utility Navigation"
2. Reload the public site — header reflects the change within Phase 2's
   cache-invalidation window

**Committees:**
1. Visit `/about#committees` — should show the 5 real committees (Women
   Development Cell, Grievance Redressal Cell, Sexual Harassment Cell,
   Anti-Ragging Committee, IQAC) with their live vision/mission/key
   activities
2. In `/admin/tables/committees`, edit a committee's `metadata` or add a new
   one with `status = published` — it appears on `/about` without a
   redeploy

---

**Status:** Phase 5 complete and verified against code, live Postgres data,
and RLS policies.
