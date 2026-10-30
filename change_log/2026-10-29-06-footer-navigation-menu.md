# 06 — Footer links driven by Menus / Nav

**Why:** the footer's *Quick Links* and *Important* columns were hard-coded in `Footer.tsx`.

## Migration: `supabase/migrations/20261029160000_footer_navigation_menu.sql` (pending)
Creates the menu `footer_navigation` and, only if it is empty, seeds today's two
columns and their links (including the external Alumni link). Safe to re-run.

**Fix (same day):** the first version failed with `menu_item_url_check`. That
constraint requires `link_type = 'internal'` rows to have a CMS `page_id`. Every row
is now `link_type = 'external'` with a `url`, matching how the existing menus store
site paths. Column headings use the placeholder url `#`.

## Behaviour
- Each **root item** of `footer_navigation` is a footer column heading (up to 4),
  and its **children** are the links. Links starting with `http(s)` open in a new tab.
- The desktop grid widens with the number of columns (the brand block keeps 2 tracks).
- Falls back to the previous built-in columns while the menu is missing or empty.

## Admin
Website CMS → Menus / Nav → select *Footer Navigation (footer_navigation)*.
An info box explains the column/link structure. No new admin screens.

## Files
`src/lib/menus.functions.ts` (`getFooterNavigation`), `src/app/(site)/layout.tsx`,
`src/components/site-next/Footer.tsx` (`DEFAULT_COLUMNS`, `columnsFromMenu`),
`src/components/admin-next/pages/AdminMenusPage.tsx` (hint).

## Verify
Rename a column or add a link in Menus / Nav: the footer updates on the next page load.

## Not done
The optional HTML `/sitemap` page was not built.
