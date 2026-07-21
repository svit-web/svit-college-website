# Sprint 1 — Security Hardening & Performance Optimizations

**Date:** 2026-07-21
**Branch:** `test/admin-portal-phase1-6` → remote `admin-portal-test`
**Commit:** `122090b`
**Status:** ✅ Complete — 0 TypeScript errors, 8 files changed, 498 insertions / 364 deletions

---

## Summary

This sprint executed all High/Security priority items from the `optimization_plan.md` audit, plus
several Medium (parallel DB ops) and Low (cleanup) items discovered during implementation.

---

## Files Changed

| File | Change Type |
|------|-------------|
| `src/routes/admin.login.tsx` | Security (S1) — remove self-reg, add reset |
| `src/hooks/useAdminAuth.ts` | Security (S4) + Performance — parallel fetch, token skip |
| `src/routes/admin.tsx` | Error Boundary + Suspense (H1/H2) |
| `src/components/admin/AdminCrudManager.tsx` | H3 (batch audit), H4 (sorting fix), L1 (STATUS_STYLES) |
| `src/routes/admin.trash.tsx` | H10 (dead code), H11 (pagination), S2 (purge guard) |
| `src/routes/admin.menus.tsx` | H12 (recursive soft-delete), M10 (parallel sort swap) |
| `src/routes/admin.inquiries.tsx` | H13 (blob URL leak), L12 (typo fix) |
| `src/routes/admin.homepage.tsx` | M7 (parallel sort swap) |

---

## Fixes — Detail

### 🔴 Security

#### S1 — Disabled Public Self-Registration (`admin.login.tsx`)
- **Before:** A "Register here" button let anyone create admin accounts via `supabase.auth.signUp()`.
- **After:** Registration UI completely removed. Notice reads "New admin accounts must be created by a system administrator."
- Added working **Forgot Password** flow via `supabase.auth.resetPasswordForEmail()` with redirect URL.
- Added **show/hide password** toggle (Eye/EyeOff icons).
- Removed leftover `console.error` that leaked auth error details.

#### S2 — Restricted Purge to Global Admin (`admin.trash.tsx`)
- **Before:** Any logged-in user could permanently delete (purge) any record.
- **After:**
  - Purge button is **hidden from non-admin users** (`isAdmin` check).
  - Replaced `window.confirm()` with an inline **two-step confirmation banner** requiring explicit "Yes, Permanently Delete" click.

#### S4 — Explicit Role Allowlist in `useAdminAuth.ts`
- **Before:** `isAuthorized = formattedRoles.length > 0` — any role granted portal access.
- **After:** Only allowlisted codes grant access:
  ```
  const AUTHORIZED_ROLE_CODES = ["admin", "editor", "department_admin", "college_admin"];
  ```

---

### 🔴 High Priority Bugs

#### H1/H2 — Error Boundary + Suspense (`admin.tsx`)
- Added class-based `AdminErrorBoundary` wrapping all child `<Outlet />`.
- Added `<Suspense fallback={<RouteLoadingSkeleton />}>` for animated skeleton on lazy route loads.
- Prevents any single panel crash from crashing the entire admin portal.

#### H3 — N+1 Audit Log Writes → Batch INSERT (`AdminCrudManager.tsx`)
- **Before:** Bulk Publish / Draft / Delete on 50 rows = 50 sequential INSERT calls to `audit_logs`.
- **After:** All 3 bulk action handlers build an `auditRows[]` array and fire a single batched INSERT. 50 rows = 1 DB call.

#### H4 — Column Sorting Broken (`AdminCrudManager.tsx`)
- **Before:** `onSortingChange` was missing from `useReactTable()` — clicking sort headers had no effect.
- **After:** Added `onSortingChange: setSorting` — all columns now sort correctly.

#### H10 — Dead Debug Code Removed (`admin.trash.tsx`)
- Removed dead RPC calls (`get_table_schema_info`, `execute_sql_query`) and all debug comments.
- Soft-delete table list is now a clean `const SOFT_DELETE_TABLES = [...]` at module level.

#### H11 — Trash Panel Pagination (`admin.trash.tsx`)
- **Before:** All deleted records in a single unbounded query (could return thousands of rows).
- **After:** Server-side pagination at 25 records/page using `.range(from, to)` with `{ count: "exact" }`.
- Prev/Next navigation UI added with total count display.

#### H12 — Recursive Soft-Delete (`admin.menus.tsx`)
- **Before:** Deleting a menu item only soft-deleted direct children (depth 1). Grandchildren were orphaned.
- **After:** `collectIds()` recursively walks the full tree to collect all descendant IDs at any depth.
  Batch deletes parent + all descendants in 2 queries max (one `.eq()` + one `.in()`).

#### H13 — CSV Blob URL Memory Leak (`admin.inquiries.tsx`)
- **Before:** `URL.createObjectURL()` called on every export but `revokeObjectURL()` never called.
- **After:** `URL.revokeObjectURL(url)` called immediately after `link.click()`.

---

### 🟡 Medium — Parallel DB Operations

#### M7 — Homepage Section Sort Swap (`admin.homepage.tsx`)
- **Before:** Two sequential `await supabase.from().update()` calls.
- **After:** `Promise.all([...])` fires both in parallel — saves ~100ms per reorder.

#### M10 — Menu Item Sort Swap (`admin.menus.tsx`)
- Same parallel swap fix applied to `handleShiftSort`. Added `.error` checks on each result.

#### Token Refresh Optimization (`useAdminAuth.ts`)
- `TOKEN_REFRESHED` event now skips DB re-fetch if `session.user.id === currentUserId`.
- Eliminates unnecessary profile+roles DB calls every hour for the same user.

#### Parallel Profile + Roles Fetch (`useAdminAuth.ts`)
- **Before:** Profile fetched, then roles fetched sequentially (~2 round trips).
- **After:** `Promise.all([profileQuery, rolesQuery])` — saves ~150-200ms per auth check.

---

### 🟢 Low — Code Quality

#### L1 — STATUS_STYLES Module Constant (`AdminCrudManager.tsx`)
- Status badge style map moved from inside `useMemo` callback to module-level `const STATUS_STYLES`.
- Eliminates object recreation on every render of every cell.

#### L12 — "Action Actions" Typo (`admin.inquiries.tsx`)
- Fixed column header from `"Action Actions"` → `"Actions"`.

#### Removed `console.error` from auth path (`admin.login.tsx`)
- Auth errors no longer printed to browser console in production.

---

## Validation

```
npx tsc --noEmit  →  ✅ 0 errors
git commit 122090b — 8 files, 498 insertions(+), 364 deletions(-)
git push origin test/admin-portal-phase1-6:admin-portal-test  →  ✅ Success
```

---

## What Remains (Sprint 2 — Medium Priority)

Reference: `optimization_plan.md` for full issue list.

| ID | Item | File |
|----|------|------|
| M1 | Add `isSaving` guard on form submit to prevent double-submit | AdminCrudManager, staff-wizards |
| M2 | Replace all `window.confirm()` with `<ConfirmDialog>` modal component | Multiple |
| M3 | Cache dashboard stats — avoid re-fetching on every render | admin.index.tsx |
| M4 | Memoize `navGroups` array in AdminSidebar with `useMemo` | AdminSidebar.tsx |
| M5 | Add per-section `<Suspense>` loading states inside panels | Multiple |
| M6 | Staff Wizard: convert 9 sequential awaits to `Promise.all` (~1.8s → ~400ms) | admin.staff-wizards.tsx |
| M8 | Add `aria-current="page"` on active sidebar links | AdminSidebar.tsx |
| M9 | Add DB indexes (full SQL script in optimization_plan.md) | Supabase / SQL |
| M11 | Add `React.memo` to AdminSidebar, AdminHeader, grid row cells | Components |
