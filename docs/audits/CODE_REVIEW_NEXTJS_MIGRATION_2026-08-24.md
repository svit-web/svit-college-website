# Code Review — `nextjs-migration` branch (2026-08-24)

Two-axis review (Standards / Spec) run via the `code-review` skill against `origin/main...HEAD`.

**Diff scope:** 244 commits, 495 files changed, ~93,620 insertions / ~7,999 deletions.

## Coverage

Reviewed in depth: the auth/session layer (`middleware.ts`, `src/app/lib/auth/admin.ts`, `src/app/lib/supabase/{client,server}.ts`, `src/app/admin/actions.ts`, `src/app/admin/login/actions.ts`, `src/app/auth-test/login/actions.ts`), the admin RBAC data layer (`src/app/admin/(dashboard)/user-management/actions.ts`, `useAdminAuth.ts`, `useUserScope.ts`), a sample of ~16 `src/lib/*.functions.ts` data-access modules, `AdminCrudManager.tsx` (both `admin-next` and legacy copies) plus its recent fix commits, and three of the largest RLS migrations.

Skimmed for anything glaring: `next.config.ts`, `package.json`/`tsconfig.json`, remaining `*.functions.ts` files, the site-next component tree.

Not reviewed: ~40 doc/planning markdown files, seed scripts, the full `admin-next/pages/*` screens (Tnp Hub, Staff Wizards, Sports — each 500–950 lines), and most of `src/components/site*`/`src/routes/*` (old TanStack tree, largely unchanged carry-forward).

Given the scale (495 files vs. a normal focused diff), this was a targeted sample of the highest-risk surface, not exhaustive coverage.

## Standards

No repo-documented coding standards exist (no `CODING_STANDARDS.md`, no `CONTRIBUTING.md`). `eslint.config.js` exists but is tooling-enforced, so it's out of scope here. `AGENTS.md` only contains a Lovable sync notice and a Next.js-version warning, not coding standards. All findings below are judgement-call smells (Fowler, *Refactoring* ch.3 baseline) — none are hard violations of a documented rule, since no such rule exists in this repo.

### 1. Duplicated Code — auth/Supabase client layer
`src/app/lib/supabase/server.ts` defines a canonical `createClient()` cookie-adapter. Four other files reimplement it inline instead of importing it:
- `middleware.ts` (lines 15–39)
- `src/app/admin/actions.ts` (lines 306–319)
- `src/app/admin/login/actions.ts` (own `makeClient` helper, lines 339–359)
- `src/app/auth-test/login/actions.ts` (pastes the block twice — once in `login`, once in `logout`, lines ~9–27 and ~40–58)

Any future change to cookie/session handling (e.g. adding `getClaims()` consistently, or fixing a cookie-option bug) now has 5 call sites to update by hand.

### 2. Duplicated Code (self-acknowledged) — scope ranking
`getScopeLevel()` in `src/app/lib/auth/admin.ts` (lines 246–258) reimplements the exact reduce-over-`SCOPE_RANK` logic already in `src/hooks/useUserScope.ts` (lines 15–38) — the new function's own comment says it "mirrors the old client-side `useUserScope()` hook exactly." Two independent implementations of the same ranking rule (`{global:0, trust:1, college:2, department:3}`) exist across a client/server boundary that type-checking won't catch drifting.

### 3. Repeated Switches / Primitive Obsession — scope key
The `{scope_type, trust_id, college_id, department_id}` clump recurs as its own if/else cascade in at least three places:
- `getScopeConstraints()` (`admin.ts`, lines 197–236)
- `getScopeLevel()` (`admin.ts`, lines 246–258)
- `scopeLabel()` (`user-management/actions.ts`, lines 77–83)

Each independently branches on the same four `scope_type` values. A single `ScopeKey` type plus one resolver function (label, RLS-filter, and rank derived from it) would replace three parallel switches.

### 4. Duplicated Code — role-insert payload
In `user-management/actions.ts`, `createPortalUser` (lines 173–183) and `assignPortalUserRole` (lines 206–216) build an identical `user_roles` insert payload — same three-way `scopeType === 'x' ? input.xId : null` ternaries — differing only in whether a new user is created first. Worth extracting into one `buildScopedRoleInsert(input, createdBy)` helper.

### 5. Shotgun Surgery — AdminCrudManager duplication (worst finding)
`src/components/admin/AdminCrudManager.tsx` (1359 lines, legacy TanStack) and `src/components/admin-next/AdminCrudManager.tsx` (1130 lines, new Next.js) are two independent copies of the same generic-CRUD-table logic (schema loading, FK label resolution, pagination, form rendering).

This is not hypothetical — the commit history shows it already cost real rework:
- `0ecc926` fixed a `staff_profiles` FK-label bug only in `admin-next`.
- `817aa40` (next commit) had to go back and port the same fix to the legacy copy plus 7 more tables.
- `e10c557` did the same dance for an unauthenticated password-reset/email-disclosure hole, needing parallel patches in `src/app/admin/actions.ts` and `src/components/admin/AdminCrudManager.tsx`.

Each bug in this shared logic shape currently costs two edits, and at least one point in the history shows the second copy briefly left unpatched (a security-relevant one, in the `e10c557` case). Presumably an accepted interim cost while the old app stays reachable via `npm run dev:tanstack`, but worth tracking as ongoing risk until the legacy copy is retired.

### 6. Duplicated Code — data-access layer
16+ files under `src/lib/*.functions.ts` (`committees.functions.ts`, `board-members.functions.ts`, `centers.functions.ts`, `accreditations.functions.ts`, `mous.functions.ts`, etc.) repeat the identical shape:

```ts
publicSupabase().from(table).select('*').eq('status', 'published').order(...)
if (error) { console.error('Error fetching X:', error); throw error; }
return data as T[];
```

35 near-identical error-handling blocks total. A small `fetchPublished<T>(table, orderBy)` wrapper in `supabase-public.ts` would collapse most of these files to a type declaration plus a one-line call, and centralize the error-logging behavior.

### 7. Duplicated Code / Primitive Obsession — RLS migrations
`20260805051746_scope_aware_write_rls.sql` repeats, per table, three near-identical `can_write_scoped_record(trust_id, institute_id, college_id, department_id)` calls (insert/update-using/update-check/delete) with most positional args hardcoded to `null`. This is a positional 4-tuple "scope key" passed by convention rather than a named type — easy to transpose two null-padded args by mistake when adding the next table (courses/facilities already need a subquery to resolve `college_id` via `departments`, increasing that risk).

**Standards summary:** 7 findings, all judgement calls (no documented standard to violate hard). Worst: **#5**, the AdminCrudManager Shotgun Surgery — demonstrated, not theoretical, since the duplication already produced a shipped, unpatched-copy security bug.

## Spec

Skipped — no spec doc and no `docs/agents/issue-tracker.md` found in this repo. Run `/setup-matt-pocock-skills` to wire up issue-tracker-based spec review for future reviews.
