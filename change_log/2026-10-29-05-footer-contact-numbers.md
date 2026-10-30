# 05 — Footer contact numbers (college-wise)

**Why:** the footer could show only one phone number (`app_settings.contact_info.phone`).

## Migration: `supabase/migrations/20261029150000_contact_numbers.sql` (pending)
New table `contact_numbers`: `college_id` (null = institute-wide), `label`,
`phone`, `kind` (`phone` / `mobile` / `whatsapp` / `fax`), `show_in_footer`,
`sort_order`, `status`, soft delete, audit columns.
- RLS: public reads published rows; global admins write everything; college-scoped admins write their own college's rows.
- `updated_at` and audit-log triggers.
- Seeds today's `contact_info.phone` as the first institute-wide row ("Phone"), so the footer looks the same after the migration.

## Footer behaviour
- One flat list, each line shown as `icon number (label)`: institute-wide numbers first, then college numbers in college order. No college-name headings (changed the same day from per-college groups with headings).
- Icon and link by kind: phone/mobile → `tel:`, WhatsApp → `wa.me`, fax → plain text.
- Falls back to `contact_info.phone` while the table is empty or the query fails.
- The Organization structured data (JSON-LD) still uses `contact_info.phone` as the one main number.

## Admin
Website CMS → **Footer Contact Numbers** (`/admin/tables/contact_numbers`, generic editor):
kind dropdown, college help text, *Show in website footer* toggle, restorable from Trash.
Hidden from department-scoped admins (`COLLEGE_OR_ABOVE_ROUTE_PREFIXES`).

## Files
`src/lib/site-settings.functions.ts` (`getFooterContactNumbers`), `src/app/(site)/layout.tsx`,
`src/components/site-next/Footer.tsx`, `src/lib/admin-option-sets.ts` (`CONTACT_NUMBER_KIND_OPTIONS`),
`src/components/admin-next/AdminCrudManager.tsx`, `AdminSidebar.tsx`, `AdminTrashPage.tsx`,
`src/lib/admin-sections.ts`, `src/integrations/supabase/types.ts`.

## Verify
Add a number with a college selected: it appears under that college's name in the footer.
