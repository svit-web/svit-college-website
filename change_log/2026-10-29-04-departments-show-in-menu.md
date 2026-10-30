# 04 — Department "Show in main menu" flag

**Why:** some departments shouldn't appear in the header's Colleges panel. One
example is the *Library Department*, which only exists to hold staff.

## Migration: `supabase/migrations/20261029140000_departments_show_in_menu.sql` (pending)
Adds `departments.show_in_menu boolean not null default true`, so every existing
department stays visible until unticked. To hide the library department:
```sql
update public.departments set show_in_menu = false where code = 'LIB';
```

## Changes
- `src/components/site-next/Header.tsx`: `departmentsByCollege` skips departments where `show_in_menu === false` (covers the desktop mega panel and the mobile menu).
- `src/components/admin-next/AdminCrudManager.tsx`: Departments form toggle *Show in main menu (Colleges panel)*, global admins only.
- `src/lib/departments.functions.ts`: `Department.show_in_menu`. Also `src/integrations/supabase/types.ts`.

Hidden departments keep all their own pages (`/departments/<code>/…`).

## Verify
Untick a department: it disappears from Colleges in the header, and its page still loads.
