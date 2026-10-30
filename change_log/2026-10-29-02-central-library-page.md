# 02 — Central Library dedicated page

**URL:** `/campus-life/central-library`. All content comes from Supabase.

## Content sources
| Section | Source |
|---|---|
| Photo slideshow, name, subtitle, description | `facilities` row with slug `library` (+ its entry album) |
| Highlights | `facilities.metadata.highlights` |
| Key figures strip, books by college | `library_info_items` (kind `stat`) + `facilities.metadata.institute_libraries` (total added automatically) |
| Catalogue / remote-access buttons, e-resource cards | **new** table `library_resources` |
| Timings, services, rules, contacts | **new** table `library_info_items` (kind `timing` / `service` / `rule` / `contact`) |

Every section is hidden when it has no published rows. Only `http(s)` links are rendered.

## Migration: `supabase/migrations/20261029120000_central_library.sql` (applied)
- Creates `library_resources` and `library_info_items` (status, soft delete, audit columns, sort order).
- RLS: public reads published rows; writes for global admins or the `library` section grant (same rule as `downloads`).
- `updated_at` and audit-log triggers.
- Seeds only facts already on the site: 4 e-resources (IEEE Xplore, ASME, SpringerLink, ScienceDirect) and the "30,000+ Titles" figure.

## Files
- `src/app/(site)/campus-life/central-library/page.tsx` (new): route, metadata, ISR 300 s.
- `src/components/site-next/CentralLibrarySections.tsx` (new): the sections.
- `src/lib/library.functions.ts` (new): `getLibraryPage()`, `getLibraryResources()`, `getLibraryInfoItems()`.
- `next.config.ts`: 308 redirect `/campus-life/facilities/:category/library` → `/campus-life/central-library`.
- `src/app/(site)/campus-life/facilities/page.tsx`: the library card links to the dedicated page (even without `has_detail_page`).
- `src/app/sitemap.ts`: adds `/campus-life/central-library`, drops the old library leaf URL.
- `src/integrations/supabase/types.ts`: types for the two tables.
- Basic admin wiring: `AdminCrudManager.tsx` (dropdowns + help text), `admin-option-sets.ts` (`LIBRARY_RESOURCE_CATEGORY_OPTIONS`, `LIBRARY_INFO_KIND_OPTIONS`), `admin-sections.ts` (global-only routes + `library` grant), `AdminTrashPage.tsx` (both tables restorable).

## Data fix applied during the session (by the site owner, in the SQL editor)
The library facility was linked to the *Library Department* (`department_id` set).
The site treats any facility with a department as a department lab and hides it
from Campus Life, which caused the 404:
```sql
update public.facilities set department_id = null
where slug = 'library' and facility_type = 'building';
```
The admin page (change 03) now warns about this and offers a one-click fix.

## Verify
`/campus-life/central-library` shows the library; `/campus-life/facilities/academic/library` redirects there.
