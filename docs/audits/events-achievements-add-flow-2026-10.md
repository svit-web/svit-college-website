# Events & Achievements "Add New" Flow — Deep Audit (2026-10-13)

Scope: extensively testing the Add/Edit flow for Events and Achievements across every admin role
(global, trust, institute, college, department, sports_secretary), looking for functional bugs,
confusing UX for a non-technical Indian college professor, and backend-only issues invisible in the
frontend. Follows on from `admin-role-audit-2026-10.md` (role/permission audit).

Method: live reproduction against the running admin panel + production DB (temp accounts created and
hard-deleted afterward, same pattern as the prior audit), plus direct inspection of
`AdminCrudManager.tsx`, DB triggers/constraints/RLS via the self-hosted Supabase MCP, and the public
site's data-fetching layer (`src/lib/*.functions.ts`, `src/app/(site)/**`).

## Critical — breaks the single most natural workflow

### 1. A college admin cannot pick a department for their own event or achievement — reproducible, cryptic error

**Reproduced live** as `temp.collegeadmin2@svitvasad.ac.in` (College Admin, SVIT): opened "Add New
Event", left Scope Type at its only real option ("College"), picked "Computer Engineering" in the
Department dropdown (completely natural — "this is a Computer Engineering department event"), filled
title/date, clicked Create Record. Result:

> `Save failed: new row for relation "events" violates check constraint "events_scope_consistency"`

Shown verbatim as the toast message, in English a non-technical professor cannot act on at all. No
hint that the fix is "clear the Department field" or "that field isn't for you." The row is correctly
*not* saved (no silent corruption here), but the admin has no way to discover why, and will likely
give up, retype everything, or ask IT.

**Why it happens**: `scope_type` is locked to the admin's own level, but the Department/College FK
dropdowns are left fully editable for anyone whose level isn't an exact match (`AdminCrudManager.tsx`
only disables the `department_id` field when `userScope.level === 'department'` — a college-level
admin's department picker stays live). The DB's `events_scope_consistency` / equivalent check on
`achievements` requires `department_id IS NULL` when `scope_type = 'college'`. The UI invites exactly
the input the DB rejects.

**Who hits this**: every college admin and every sports_secretary (section-scoped to `college`) who
tries to tag their event/achievement to a specific department — i.e., most of them, most of the time.

### 2. The opposite failure mode: a department can be silently saved against the wrong college

**Reproduced live** as global admin: created an event with `scope_type: 'department'`, Department =
"Nursing" (whose real college is Sardar Vallabhbhai Patel Institute of Nursing), College =
"Sardar Vallabhbhai Institute of Technology" (a different college entirely). This **saved
successfully** with "Changes saved!" — no error, no warning. Verified in the DB: the row genuinely
has `college_id` and `department_id` pointing at two unrelated colleges.

This is the mirror-image gap of #1: the CHECK constraint validates *which fields are null*, never
*whether a non-null department_id's actual college matches the non-null college_id*. Anyone who
free-selects both fields (the Department and College pickers are two independent dropdowns with zero
cross-filtering or validation) can create this inconsistency with no feedback at all. Depending on
which column the public site's queries key off, this event could render under the wrong college's
pages, or not render where expected — either way, a confusing, hard-to-find data error that looks fine
in the admin table (department and college both show names, just not *the right pairing*).

**Practical fix shape** (not applied — flagging for your decision): either (a) make the Department
dropdown auto-set/lock College when chosen (and vice versa), (b) narrow the Department dropdown to
only the selected College's departments, or (c) add a DB trigger validating `departments.college_id =
college_id` whenever both are set — ideally all three, since (a)/(b) fix the UX and (c) closes the gap
for any future direct-SQL or script writes.

## Confusing / non-obvious — professor adds content, it doesn't show up, no error anywhere

### 3. An achievement with no department picked becomes permanently unreachable

There is no "all achievements" public listing page — only `/achievements/[slug]` (must already know
the exact URL) and `/departments/[dept]/achievements` (filtered by `department_id`). The admin form
does **not** require `department_id` — it's a perfectly legal, saveable, published achievement with
department left blank. A professor adding a personal/college-level achievement with no department
selected (since nothing in the form told them it was effectively required for visibility) gets a
"published" row that no visitor will ever find by browsing the site.

### 4. A department event only shows on its own department's "Activities" page for 6 of 12 `event_type` values

`getDepartmentActivities()` filters events to `event_type IN ('expert_session', 'industrial_visit',
'seminar', 'workshop', 'sttp', 'fdp')`. The admin form's Event Type dropdown offers 12 options
(including Fest, Cultural, Technical, Sports, Competition, Other) and the field is optional with no
explanation. A professor who picks "Technical" for their department's tech fest — the single most
natural label choice — will see their event on the sitewide `/campus-life/events` list but **not** on
their own department's page, with no indication anything is wrong.

### 5. Slug collisions are silently renumbered, with no feedback

Both tables auto-append `-2`, `-3`, etc. on a slug collision via a DB trigger. The admin's success
toast still just says "Changes saved!" — an admin who typed a slug expecting it to match a flyer, QR
code, or shared link could get `event-fest-2` with zero indication the slug changed from what they
typed.

### 6. The "Department"/"College" FK dropdowns are not scope-narrowed and can include dead data

`loadFKOptions()` (`AdminCrudManager.tsx:413-448`) is the single generic function that populates
*every* foreign-key dropdown across the entire admin panel — Department, College, Club, Head of
Department, Designation, etc. It queries the referenced table with **no filter on `status` or
`deleted_at` at all**, ordered alphabetically.

**Confirmed concretely**: the "Club" dropdown on the Add Event form includes an entry literally titled
*"Two-days workshop on 'Performance and Safety of Solar PV Modules'"* — not a club name at all. Checked
the row directly: `status: 'archived'`, `deleted_at: 2026-10-06`. It's a soft-deleted, archived row
that should never be selectable anywhere, yet it's sitting in the live dropdown indistinguishable from
real clubs.

This is systemic, not Events-specific. Counted stale (deleted/non-published) rows per table that feeds
an FK dropdown somewhere in the admin panel:

| Table | Stale/deleted rows that still appear in its dropdown |
|---|---|
| `staff_profiles` | **155** (out of ~233 total) |
| `student_clubs` | 2 |
| `departments` | 0 |
| `colleges` | 0 |
| `institutes` | 0 |
| `designations` | 0 |

The `staff_profiles` number is the one that matters most in practice: any form with a staff picker
(e.g. "Head of Department" on the Departments form) has a dropdown where roughly two-thirds of the
options are archived/deleted people, sorted alphabetically with zero visual distinction from active
staff. A professor picking a Head of Department has a coin-flip's worse-than-even chance of the name
they want being buried among ex-staff.

## Silent-save trap

### 7. Dropping a photo on an unsaved Event/Achievement immediately publishes it — before you click Save

`EntryPhotosEditor` calls back into the form's "ensure this record is saved" path the instant a photo
is dropped on a *brand-new, not-yet-saved* record — which inserts the row immediately with
`status: 'published'` (the form's default). If the admin then clicks **Cancel** (or the × button),
nothing cleans up that just-inserted row: Cancel just closes the modal. The admin believes nothing was
saved (they never clicked "Create Record"); in reality a live, published, possibly half-filled
event/achievement now exists on the public site.

This is the highest-severity finding in terms of "silent and hard to notice" — a professor exploring
the form, adding a photo to see how it looks, then backing out, ends up publishing incomplete content
without any save confirmation ever appearing.

## Backend-only — invisible from the frontend entirely

### 8. Site search goes stale for events, and never covers achievements at all

`scripts/build-search-index.ts` only runs at `npm run build` time (confirmed, matches `CLAUDE.md`) and
only indexes **events** — achievements are never included in the search index, in any build. A
professor who adds an event today won't find it via on-site search until the next production deploy.
An achievement will never show up in search results, full stop, regardless of how many times the site
is redeployed — this isn't a staleness window, it's a permanent gap.

### 9. `events` has a DB-level audit trigger; `achievements` does not

`events` has `audit_events_trigger` → `process_audit_log()`, firing unconditionally on every
INSERT/UPDATE/DELETE at the database level (captures full before/after state + IP/UA), independent of
the admin UI. `achievements` has no equivalent trigger — its only audit trail is the client-side
`logAuditAction()` call in `AdminCrudManager.tsx`, and if that call fails, the failure is swallowed
(`console.error`, no toast, no retry). Any future script or direct-SQL write to `achievements` leaves
zero audit trail; the same on `events` is always captured. Low practical likelihood today, but an
inconsistent safety net between two otherwise-parallel tables.

## Confirmed NOT a problem

- **"Max 8 featured events" is a real, DB-enforced rule**, not just a UI label. A trigger
  (`events_enforce_featured_rules()`) raises a hard Postgres exception both when the featured count
  would exceed 8 and when a non-global user attempts to feature/unfeature anything — independent of
  and in addition to the client-side `lockedForNonGlobal` UI lock. No gap here.
- **Department-scoped events correctly auto-fill `college_id`** from the department's own college via
  `events_before_write()` when a department admin saves (their College field is blank in the form) —
  this specific path is handled correctly and doesn't hit the #1/#2 class of bug.

## Not investigated (flagged for a future pass)

- The Achievements/Events CSV import path (if one exists) — not covered by this directive.
- Whether the same `scope_type` + FK-dropdown mismatch (findings #1/#2) exists on other scope-typed
  tables with the same nullable `college_id`+`department_id` pair, e.g. `homepage_items`,
  `placed_students` — worth a quick follow-up, same bug class likely applies.
- Full role-by-role click-through of Achievements (only Events was reproduced live end-to-end for the
  college-admin failure mode; Achievements shares the same `TABLE_CONFIGS`/trigger pattern per code
  inspection but wasn't independently live-tested for #1/#2).

## Fixes applied (2026-10-14)

All 9 findings fixed. See `supabase/migrations/20261013140000_events_achievements_scope_integrity.sql`
and `src/components/admin-next/AdminCrudManager.tsx` for the bulk of the work, plus
`src/lib/achievements.functions.ts`, `scripts/build-search-index.ts`, and `src/lib/search-index.ts` for #8.

- **#1** (college admin crash): Department field now disables itself whenever `scope_type` isn't
  `'department'`, on any table with a `scope_type` column — the invalid combination is no longer
  enterable through the UI. Verified live: the exact previously-crashing steps now save cleanly.
- **#2** (silent mismatch): new `validate_department_college_match()` DB trigger on both tables rejects
  a department/college pairing that doesn't belong together, with a readable message
  (`Department "X" belongs to a different college than the one selected`) instead of silently saving.
  The UI also stops offering `college_id` as independently editable once `scope_type = 'department'`
  (it's auto-derived from the department, same as events already did — achievements gained the same
  `achievements_before_write` backfill trigger events had). Verified live via direct SQL insert.
- **#6** (stale FK dropdowns): `loadFKOptions()` now filters every FK picker to
  `deleted_at IS NULL AND status = 'published'`, falling back to unfiltered for tables lacking those
  columns. Verified live: the archived "club" row is gone from the Club picker; the Head of Department
  picker went from 546 options (155 stale) to exactly 391 published ones.
- **#3**: `achievements.department_id` now shows help text explaining it's required for the achievement
  to be reachable anywhere on the public site.
- **#4**: `events.event_type` now shows help text naming which values make the event appear on its own
  department's Activities page.
- **#5**: the save-success toast now names the actual slug when the DB's collision-renumbering trigger
  changed it from what was typed.
- **#7**: the auto-insert triggered by dropping a photo on a new record now defaults to `status: draft`
  instead of `published`, so an abandoned Cancel no longer leaves live content on the public site.
- **#8**: achievements are now indexed for site search (`getAllAchievements()`, filtered to
  `has_detail_page: true` so no result links to a 404) — 122 entries confirmed in a local rebuild. The
  build-time-only staleness for both events and achievements remains a known, documented limitation
  (not fixed — would need an on-demand reindex or a move to live DB search, a larger infra decision).
- **#9**: `achievements` now has `audit_achievements_trigger`, matching `events`' DB-level audit trail.

All verification used temporary accounts created and hard-deleted the same way as both audits (zero
residue confirmed via SQL count afterward); no test content rows were left behind.
