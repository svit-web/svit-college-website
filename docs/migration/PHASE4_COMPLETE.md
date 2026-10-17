# 🎉 PHASE 4 COMPLETE — Scheduled & Time-Aware Content

**Date:** 2026-07-23
**Status:** ✅ **100% COMPLETE** (typechecked, built, AND verified against live Postgres data)

---

## 🎯 SCOPE FOR THIS PHASE

Phase 3 wired up 29 tables but only ever used `status` (published/draft/archived) as the visibility gate. Several tables already had **date-based scheduling/expiry columns that existed but were never enforced** — a genuine gap worth closing before calling the integration "done." No schema changes were needed; every fix below is query-layer logic using columns that were already there.

1. **Posts** — respect `published_at` (don't show before it) and `expires_at` (auto-hide after it); surface `is_featured` visually
2. **Events** — bucket "upcoming" vs "past" using `end_date` when set, not just `start_date` (so a multi-day event doesn't vanish into "past" the moment it starts)
3. **Accreditations** — new integration (was completely unwired since Phase 1's audit) using `expiry_date` so a lapsed accreditation disappears automatically instead of needing a manual unpublish

---

## ✅ WHAT CHANGED

### 1. Posts — publish window + featured flag
`src/lib/posts.functions.ts` — `getAllPosts` and `getPostBySlug` now add:
```
.or(`published_at.is.null,published_at.lte.${nowIso}`)
.or(`expires_at.is.null,expires_at.gt.${nowIso}`)
```
Two `.or()` calls chained together AND them (verified this is how `postgrest-js` builds the URL — `searchParams.append`, not `.set`, so PostgREST receives two separate `or=` params which it ANDs). A post now only shows if it's published **and** within its scheduled window. `getPostBySlug` applies the same window, so a direct link to a not-yet-live or expired post 404s exactly like an unpublished one — no way to "peek" outside the schedule via URL.

`getAllPosts` also now orders `is_featured` first, and `/news` shows a gold-bordered card with a "★ Featured" badge for those posts — the column existed since Phase 3D but was silently ignored in the UI until now.

### 2. Events — `end_date`-aware bucketing
`src/lib/campus-life.functions.ts` — `getUpcomingEvents`/`getPastEvents` now use:
```
.or(`end_date.gte.${today},and(end_date.is.null,start_date.gte.${today})`)   // upcoming
.or(`end_date.lt.${today},and(end_date.is.null,start_date.lt.${today})`)    // past
```
When `end_date` is null (both current rows), this is identical to the old `start_date`-only behavior — **zero regression** for existing data, purely additive for future multi-day events.

### 3. Accreditations — new, expiry-aware integration
`src/lib/accreditations.functions.ts` + `.ts` — `getActiveAccreditations()` filters `status = 'published' AND (expiry_date IS NULL OR expiry_date > today)`.

Wired into `/about`'s "Recognitions" table (previously 100% static `c.accreditation.recognitions`), database-first with static fallback. An admin can now add a time-limited accreditation and it'll automatically stop showing the day it expires.

---

## 🔬 VERIFICATION — BEYOND TYPECHECK/BUILD

This phase involved genuinely subtle query logic (compound OR/AND filters via PostgREST), so I verified it three ways, not just "it compiles":

1. **`npx tsc --noEmit`** → 0 errors
2. **`npx vite build`** → clean production build
3. **Ran the actual SQL equivalent of every new filter against live Postgres** via the Supabase MCP tools:
   - Confirmed `postgrest-js`'s `.or()` implementation uses `searchParams.append` (not `.set`), so chaining two `.or()` calls really does produce an AND of two OR-groups, not a silent overwrite
   - Ran the events upcoming/past SQL against the real 2 rows in `events` — confirmed both correctly bucket as "past" (their start dates are before today, 2026-07-23) and neither double-counts
   - Ran a **rolled-back** test insert (`BEGIN; INSERT ...; SELECT ...; ROLLBACK;`) against `accreditations` with an expired/null/future `expiry_date` row to confirm the visibility logic is correct in all three cases, then **re-queried immediately after** to confirm the rollback actually reverted the test rows and left no residue in the live database
   - Confirmed `posts.published_at`/`expires_at` are `timestamptz` columns, so ISO-string ⚖️ comparisons via `.lte`/`.gt` are valid (couldn't test with real rows — `posts` currently has 0)

---

## 🔍 A SIDE-FINDING WORTH FLAGGING

While verifying, I discovered `SUPABASE_SCHEMA.md` (generated during Phase 1's audit) is now **stale** — several tables have real data that didn't exist when it was written:

| Table | Doc said | Actually has |
|-------|----------|--------------|
| accreditations | 0 | **4** |
| centers | — | **8** |
| facilities | — | **13** |
| placement_statistics | 0 | **6** |
| staff_profiles | 0 | **1** |
| student_clubs | — | **4** |
| posts, testimonials, downloads, inquiry_forms | 0 | still 0 |

This is good news, not a problem: it means several Phase 3 integrations (placement stats, facilities, centers, student clubs) are **already showing real live data** on the site right now, not just static fallback — I spot-checked the placement stats math (sum/max/average across the 6 real rows) and confirmed no `NaN`/`Infinity` edge cases since every numeric field in the live rows is populated.

I did **not** update `SUPABASE_SCHEMA.md` itself — it was a one-time audit snapshot, not a file the app depends on, and re-generating it wasn't part of this phase's scope. Worth regenerating next time someone wants an accurate table-by-table picture.

---

## 📊 CUMULATIVE STATUS (Phases 1–4)

- **29 / 53 tables** with live query infrastructure (unchanged count — Phase 4 didn't add a new table to the roster except `accreditations`, bringing it to **30 / 53**)
- All Phase 2 cache invalidation continues to apply — `posts`, `events`, and `accreditations` were already mapped in `cache-utils.ts`, no changes needed there
- Every phase from 1 through 4 has been verified with `tsc --noEmit` + `vite build`, and this phase additionally verified against live Postgres data — not just written and assumed correct

---

## 🧪 HOW TO TEST

**Posts scheduling:**
1. Admin Portal → Website CMS → Blog Posts — create a post with `published_at` set a week in the future, mark `published`
2. Visit `/news` — it should **not** appear yet
3. Edit `published_at` to a past date — refresh — it now appears
4. Set `expires_at` to yesterday — it disappears again automatically

**Featured posts:**
1. Toggle `is_featured` on any published, in-window post
2. It should appear first on `/news` with a gold border and "★ Featured" badge

**Multi-day events:**
1. Create an event with `start_date` a few days ago and `end_date` a few days from now
2. It should still appear under "upcoming" on `/campus-life/events`, not "past"

**Accreditation expiry (already live with real data — no setup needed):**
1. Visit `/about#accreditation` — should show the 4 real accreditations (AICTE, GTU, NIRF, NBA)
2. In admin, set one's `expiry_date` to yesterday — it disappears from the site within ~5 seconds (Phase 2 cache invalidation) without touching its `status`

---

**Status:** Phase 4 complete and verified against both code and live data. Ready for whatever's next.
