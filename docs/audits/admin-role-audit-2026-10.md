# Admin Panel Role Audit — Core CRUD (2026-10-13)

Audit driven live against the admin panel (self-hosted prod Supabase) using `website@svitvasad.ac.in`
(global admin) and 3 temporary scoped accounts. Checklist and methodology: see the approved plan
(`/Users/porus/.claude/plans/abstract-puzzling-mccarthy.md`).

Temp accounts (hard-deleted at end of audit):
- `temp.collegeadmin@svitvasad.ac.in` — role `editor`, scope college = SVIT
- `temp.deptadmin@svitvasad.ac.in` — role `editor`, scope department = Computer Engineering (SVIT)
- `temp.sportssec@svitvasad.ac.in` — role `sports_secretary`, scope college = SVIT, section grant `sports`

## Pre-existing findings (fixed before this audit started)

1. **Stale soft-deleted `user_roles` rows leak into scope computation.** `getAdminUser()`
   (`src/app/lib/auth/admin.ts`) queried `user_roles`/`user_section_grants` without filtering
   `deleted_at`, so a reassigned user's old broader-scope grant could silently out-rank their current
   role. Fixed: added `.is('deleted_at', null)`.
2. **College-scope write check missed department-only tables.** `AdminCrudManager.tsx`'s generic
   `writePermissions` rule required a literal `college_id` column for college-scope write access, but
   `courses`/`facilities`/etc. only carry `department_id` (college resolved transitively via
   `departments.college_id` in RLS). Fixed: college-scope branch now also matches `department_id`.
3. **`college_admin` / `department_admin` role codes referenced in code but never seeded in prod DB.**
   `public.roles` only has `admin`, `editor`, `sports_secretary`. Every real scoped admin uses role
   code `editor` + `scope_type`. Not necessarily a bug (role code is cosmetic — scope_type does the
   real gating) but worth flagging: `FULL_ACCESS_ROLE_CODES`/`AUTHORIZED_ROLE_CODES` and RLS functions
   reference `college_admin`/`department_admin` as if real, which is dead code in production today.

## Admin (global) sanity pass

Spot-checked: Colleges, Departments, Courses, Facilities, Events, Board Members, User Management,
Trash. All load without error, Add button present, row edit/delete icons present. No issues found.

Bonus confirmation: User Management's access-label rendering correctly reflects all 3 temp accounts'
roles/scopes (`Editor · College: ...`, `Editor · Department: Computer Engineering`,
`Sports Secretary · College: ... ` + `Section: Sports & Athletics`), so the scope-label UI itself is
reading `user_roles`/`user_section_grants` correctly — the bugs found so far are specifically in the
*write-permission* computation, not in how scope is displayed.

## College Admin scope

Account: `temp.collegeadmin@svitvasad.ac.in` (editor, scope college = SVIT).

| Area | Result |
|---|---|
| Colleges | Update-only, no Add/Delete — correct (`selfScopeLevel: 'college'` override). |
| Departments | Add/Edit/Delete present, scoped to SVIT (11 rows). Live-tested: created + deleted a real department row successfully end-to-end (RLS write confirmed, not just the UI flag). |
| Courses | Add present, no Read-Only (the pre-existing fix verified for this role too). |
| Facilities | Add present, 99/123 rows correctly scoped to SVIT's departments. |
| Centers ("Student Groups — Societies") | Add present, 9 rows. (Note: this is *not* under Academics in the nav as assumed in the plan — it's under Campus Life, labeled "Student Groups — Societies". No bug, just a nav-location correction to the plan's assumption.) |
| Committees / Committee Members | Add present, 5 rows — reachable and writable via direct `college_id` scope match, independent of the `about_us` section grant (RLS doesn't require the section for scope-direct tables). Plan's assumption that these were section-gated-only was incomplete. |
| Achievements | Add present, 0 rows (no existing SVIT-scoped achievements) — correct, scope-following via `department_id` → college join, independent of `campus_life`/`sports` section. |
| Board Members | Route redirects to `/admin` dashboard — correctly blocked (`GLOBAL_ONLY_ROUTE_PREFIXES`). |
| Placed Students | Route redirects to `/admin` dashboard — correctly blocked. |
| Gallery Albums | Route redirects to `/admin` dashboard — correctly blocked. |
| Events | Add present, 0 rows — by design: college admins only see events with `scope_type: 'college'` set directly on the row, not ones inherited from a department (explicit code comment in `TABLE_CONFIGS.events`). Not a bug. |
| **Staff Profiles** | **BUG FOUND AND FIXED.** Showed Read-Only despite 190 correctly-scoped rows visible. Root cause: `staff_profiles` has no `college_id`/`department_id` column — scope is resolved via the `staff_department_assignments` join table in RLS (`can_write_scoped_record` against the assignment's department → college). The generic column-matching rule in `AdminCrudManager.tsx` can't see that relationship and fell through to `none` for every non-global scope, even though RLS already permits insert for any scoped admin and update/delete for rows assigned to departments in scope. Fixed by adding a `staff_profiles` override to `TABLE_CONFIGS` granting college/department-level write, mirroring what RLS allows. Verified fixed in-browser post-patch (Add now shows, 190 rows, no Read-Only). |
| Institutes, Labs | Nav items present; not deep-tested in this pass (same generic-rule family as Departments/Courses — low risk, can fold into the exhaustive pass if an issue ever surfaces). |

## Department Admin scope

Account: `temp.deptadmin@svitvasad.ac.in` (editor, scope department = Computer Engineering, SVIT).

| Area | Result |
|---|---|
| Departments | Update-only on own row (1 row shown) — correct. |
| Courses | Add present, 3 rows (own department only) — correct, and confirms the earlier `courses` write-permission fix holds at department scope too. |
| Facilities | Add present, 11 rows (own department only) — correct. |
| Staff Profiles | Add present, 41 rows (own department only) — confirms the `staff_profiles` fix (found during the College Admin pass) also fixes department scope. |
| Colleges | Route redirects to `/admin` — correctly blocked (`COLLEGE_OR_ABOVE_ROUTE_PREFIXES`). |
| Centers | Route redirects to `/admin` — correctly blocked. |
| Nav | No "Colleges" item shown in sidebar for this scope — correct. |

No new bugs found for this role — it exercises the same `TABLE_CONFIGS`/generic-rule code paths as College Admin, both of which were already fixed.

## Sports Secretary scope

Account: `temp.sportssec@svitvasad.ac.in` (role `sports_secretary`, section grant `sports` @ college SVIT).

| Area | Result |
|---|---|
| Nav | Only Dashboard + Campus Life (Sports & Athletics, Achievements) shown — correct. |
| `/admin/sports` | Full CRUD (Add Sport, edit/delete icons) on the 13 sports disciplines — correct. |
| Achievements | 5 rows shown, all `category: sports`, all `scope_type: global`. Add form: `Category` select is **disabled**, locked to `sports` only; `Scope Type` select is also disabled, locked to `college`. A sports secretary cannot create or see a non-sports achievement even via client manipulation — correct and matches the RLS carve-out exactly. |
| Any non-section route (`/admin/tables/courses`, `/admin/tables/departments`, etc.) | Redirects to `/admin` dashboard — correct, this role has no scope-tier access at all, only section grants. |

No bugs found for this role.

## Summary of fixes applied

All fixes are in `src/components/admin-next/AdminCrudManager.tsx` and `src/app/lib/auth/admin.ts`, on `nextjs-migration`.

1. **Stale soft-deleted `user_roles` rows leaking into scope computation** (`admin.ts`) — found before
   this audit, from a real department-level editor's bug report. Added `.is('deleted_at', null)`.
2. **College scope not recognized for department-only tables (courses, facilities, etc.)**
   (`AdminCrudManager.tsx` generic rule) — found before this audit, same bug report. College-scope
   branch now also matches `department_id` columns, matching RLS's transitive `departments.college_id`
   resolution.
3. **Staff Profiles showed Read-Only for every scoped admin** (`AdminCrudManager.tsx` `TABLE_CONFIGS`)
   — found during this audit's College Admin pass. `staff_profiles` has no direct scope column (scope
   resolved via the `staff_department_assignments` join table in RLS), so the generic rule always fell
   through to `none`. Added an explicit override granting college/department-level write.

## Cleanup

Temp accounts (`temp.collegeadmin@`, `temp.deptadmin@`, `temp.sportssec@svitvasad.ac.in`) and all their
`user_roles`/`user_section_grants`/`user_profiles`/`auth.identities`/`auth.users` rows were hard-deleted
after the audit. The one test department row (`ZZZ-AUDIT-TEST-DEPARTMENT`) created to verify a live
write was hard-deleted immediately after confirming the save worked. Verified zero residue via SQL
count after cleanup.

## Deferred — exhaustive pass (future)

Per the plan: CSV imports (faculty/achievements), staff profile wizards, media upload/compression,
HeroAppearance/appearance settings, Trash restore flow, Audit Log correctness, Menus builder,
multi-college edge cases (a user with grants on 2+ colleges), and institute-/trust-scope identities are
not covered by this pass and should be audited separately.
