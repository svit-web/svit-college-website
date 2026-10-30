# 07 — Column filters on admin tables (Menu Items first)

**Why:** `/admin/tables/menu_items` mixes every menu's links in one long list, with
no way to narrow it down.

## Changes
- **Menu Items toolbar** now has filter dropdowns for **Menu**, **Parent**,
  **Link Type**, **Menu Type** and **Status**, next to the search box.
  - *Parent → "None (parent empty)"* shows only top-level items (e.g. footer column headings).
  - Filters combine with each other and with search; changing one returns to page 1.
- **Reusable for any generic table:** add `filters: ['column', …]` to that table's
  entry in `TABLE_CONFIGS`. Each column's options come from the column itself:
  linked table → its rows, enum or configured `options` → those values,
  true/false → Yes/No. Columns that can be empty also get a "None" choice.
- The toolbar row now wraps on narrow screens.

No migration. No change to permissions: the filters only narrow the rows RLS already returns.

## Files
`src/components/admin-next/AdminCrudManager.tsx`: `TableConfig.filters`, `NONE_FILTER`,
`columnFilters` state, query and toolbar, plus `menu_items.filters`.

## Verify
Admin → Website CMS → Menu Items. Pick *Menu = Footer Navigation* and you see only
footer links; add *Parent = None* and you see only the column headings.

## Known limitation
The Parent dropdown lists items from every menu, not only the selected one.
