# 03 — Central Library staff, downloads & admin page

## Public page additions (`/campus-life/central-library`)
- **Library team:** published staff assigned to a chosen department, shown with the
  department pages' `StaffCard` (photo, designation, email, profile link). The
  department is stored in `facilities.metadata.staff_department_id`, *not*
  `facilities.department_id` (that would turn the row into a lab).
- **Forms & documents:** published `downloads` in the new category `library`
  (they still appear on `/downloads` too).

## Migration: `supabase/migrations/20261029130000_central_library_staff_downloads.sql` (pending)
- `downloads_category_check` now also allows `library`.
- Sets `metadata.staff_department_id` on the library facility to the department with code `LIB` (only if not already set).

## Admin: new page `/admin/library` (sidebar: Campus Life → Central Library)
Tabs: Overview & Photos (name, subtitle, description, status, photo album via the
shared `EntryPhotosEditor`) · Highlights (add/edit/reorder/remove) · Books per
college (one number per college) · Key figures · Timings · E-resources · Services ·
Rules · Staff (department picker) · Contacts · Downloads (points to Downloads / Forms).
- List tabs: add/edit dialog, up/down reorder, draft/published, soft delete to Trash.
- Warning banner when the library row is unpublished or linked to a department, with a **Publish & fix** button.
- Metadata edits re-read and merge `facilities.metadata`, so one tab never wipes another tab's keys.
- Access: global admins and the `library` section grant (`/admin/library` added to `admin-sections.ts`).
- The two earlier sidebar links to the raw tables were replaced by this one entry (the tables are still at `/admin/tables/library_*`).

## Files
- New: `src/app/admin/(dashboard)/library/page.tsx`, `src/components/admin-next/pages/AdminLibraryPage.tsx`, `src/lib/library-admin.ts` (browser writes under RLS).
- `src/lib/library.functions.ts`: staff and downloads. `src/components/site-next/CentralLibrarySections.tsx`: two new sections.
- `src/components/site-next/DepartmentSections.tsx`: `StaffCard` exported.
- `src/lib/admin-option-sets.ts` (Downloads category *Library*), `src/lib/admin-sections.ts`, `src/components/admin-next/AdminSidebar.tsx`.

## Verify
Log in → Campus Life → Central Library, save something in each tab, and check the public page.
Not clicked through end-to-end in this session (needs an admin login).

## Known gaps
The e-resource logo is a URL field (no upload button), and the page isn't in the search index yet.
