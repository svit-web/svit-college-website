# 08 — Librarian role: Central Library admin only

**Why:** a department admin assigned to the Library Department saw every admin
section (Events, Facilities, …). Library staff should see and edit only the
Central Library page.

## How it works
Same pattern as Sports Secretary: a **section-only role** plus a **section grant**.
- Role **Librarian** (`librarian`), granted at **Department** scope (e.g. the
  Library Department). On its own it grants no writes; it only lets the user log
  in to the admin with scope level `section`.
- Section grant **Library**, at **Global** scope. This unlocks `/admin/library`
  (and Downloads / Forms, which the `library` section already covered) and is
  what RLS checks (`can_write_section('library')`). A department-scoped grant
  would not match, because the library policies don't pass a scope.
- A Librarian's sidebar shows only *Campus Life → Central Library* and
  *Website CMS → Downloads / Forms*. Any other admin URL redirects to `/admin`.

## Migration: `supabase/migrations/20261030120000_librarian_role.sql` (pending)
- Seeds role `librarian` and section `library` (idempotent).
- Adds `librarian` to `is_any_admin()`, needed to create the photo album the first time a photo is added.

## Files
- `src/app/lib/auth/admin.ts`: `librarian` added to `AUTHORIZED_ROLE_CODES`.
- `src/components/admin-next/pages/AdminUserManagementPage.tsx`: setup hint when Librarian is selected.
- `src/app/admin/(dashboard)/user-management/actions.ts`, `src/lib/admin-sections.ts`: comments and messages.
- `src/app/admin/(dashboard)/library/page.tsx`, `src/components/admin-next/pages/AdminLibraryPage.tsx`:
  the Staff tab hides the *Staff Profiles* link from section-only users (they can't open it).

## Setting up a librarian (global admin)
1. System → User Management → create the account (or open an existing one).
2. Role **Librarian**, scope **Department**, department **Library Department**.
3. Manage roles → Section Access → **Library**, scope **Global**.
4. Remove any other role on that account (e.g. Editor at department scope). A
   full-access role brings back the full sidebar.

## Known limitation
The `library` section can edit **all** Downloads (pre-existing rule from
`20261003135303_wire_library_section_to_downloads.sql`), not only the
*Library* category.
