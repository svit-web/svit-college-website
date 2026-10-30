# 09 — Library editors can read what /admin/library needs

**Symptom:** a Librarian (`library` section grant) opening `/admin/library` got
"No facility with slug library was found", although the record is published.

**Cause:** logged-in users read `facilities`, `colleges` and `departments` only
through the scope-aware "Scoped read …" policies (global admins, or admins whose
college/department owns the row). A section-only user has no scope, so:
- the library facility row was invisible. Postgres UPDATE only reaches rows SELECT
  can see, so saves would also have silently changed nothing, even though
  "Scoped update facilities" allows the `library` grant;
- *Books per college* (colleges) and the *Staff* department picker (departments) came back empty.

## Migration: `supabase/migrations/20261030130000_library_section_reads.sql` (pending)
Additive (OR'd) SELECT policies, matching only users who hold the grant:
- `Section read facilities`: rows whose `admin_section_id` is a section the user holds (mirrors the update policy).
- `Library section read colleges` / `Library section read departments`: published, non-deleted rows for `library` grant holders. These rows are public to logged-out visitors anyway.

Other admins' scoped reads (and the dropdowns built from them) are unchanged.

## Rights audit for a Librarian
| Table | Read | Write |
|---|---|---|
| facilities (library row) | fixed here | `Scoped update facilities` via `admin_section_id` |
| colleges, departments | fixed here (published only) | none (not needed) |
| library_resources, library_info_items | own policies | `can_write_section('library')` |
| downloads | authenticated read | `can_write_section('library')` |
| gallery_albums / gallery_media | authenticated read | album create needs `is_any_admin()` (change 08), media via `can_write_entry_album` → `admin_section_id` |
| storage `media` bucket | public | any authenticated user |
| audit_logs | none | insert own (trigger) |

## Files
`src/components/admin-next/pages/AdminLibraryPage.tsx`: the "not found" message now
also names the permission cause (missing Library section at Global scope).

## Verify
Log in as the Librarian, open `/admin/library`. Overview loads, *Books per college*
lists colleges, the *Staff* picker lists departments, and saving shows in the public page.
