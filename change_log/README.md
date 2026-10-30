# Change log

One file per change, named `YYYY-MM-DD-NN-short-name.md`. Each entry lists what
changed, the files touched, any migration to apply, and how to verify.

## 2026-10-29 (branch `nextjs-migration`, uncommitted at time of writing)

| # | Change | Migration |
|---|---|---|
| 01 | [Central Library in Campus Life navigation](2026-10-29-01-central-library-navigation.md) | — |
| 02 | [Central Library dedicated page](2026-10-29-02-central-library-page.md) | `20261029120000_central_library.sql` |
| 03 | [Central Library staff, downloads & admin page](2026-10-29-03-central-library-admin.md) | `20261029130000_central_library_staff_downloads.sql` |
| 04 | [Department "Show in main menu" flag](2026-10-29-04-departments-show-in-menu.md) | `20261029140000_departments_show_in_menu.sql` |
| 05 | [Footer contact numbers (college-wise)](2026-10-29-05-footer-contact-numbers.md) | `20261029150000_contact_numbers.sql` |
| 06 | [Footer links driven by Menus / Nav](2026-10-29-06-footer-navigation-menu.md) | `20261029160000_footer_navigation_menu.sql` |
| 07 | [Column filters on admin tables (Menu Items)](2026-10-29-07-admin-table-column-filters.md) | — |

**Apply migrations in the order above** on the self-hosted (production) Supabase,
then run `NOTIFY pgrst, 'reload schema';` (see `docs/infra/SELF_HOSTED_SUPABASE.md`).
Status at time of writing: 02's migration applied by the site owner; 03–06 pending.

`src/integrations/supabase/types.ts` was hand-edited to match the new tables and
columns; regenerate it from the live schema when convenient.
