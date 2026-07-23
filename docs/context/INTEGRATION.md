# Zustand Integration Guide — SVIT Admin Panel

## 1. Install

```bash
bun add zustand
```

No provider needed — Zustand stores are plain modules, so nothing to wrap around
your TanStack Router root (`router.tsx`).

## 2. Where these files go

Copy the 5 files from this delivery into your project:

```
src/store/
├── authStore.ts        # session, roles, permissions, scope checks
├── uiStore.ts           # sidebar/theme, persisted to localStorage
├── tableViewStore.ts     # per-table pagination/sort/filter/selection
├── optimisticStore.ts    # optimistic CRUD overlay, pairs with React Query
└── index.ts              # barrel export + useShallow re-export
```

## 3. Division of responsibility (important)

**Zustand does NOT replace React Query.** Server data (rows from Supabase) stays
in React Query — that's still your source of truth and cache. Zustand only owns:

| Concern | Store |
|---|---|
| Who's logged in, their roles/permissions | `authStore` |
| Sidebar collapsed, theme, mobile nav | `uiStore` |
| Which page/sort/filter/search a given `/admin/cms/:table` screen is on | `tableViewStore` |
| "This row is mid-save, show the new value before the server confirms" | `optimisticStore` |

This keeps `useSupabaseData.ts` (your 16 React Query hooks) untouched — Zustand
sits alongside it, not inside it.

## 4. Wiring auth into your existing Supabase client

In wherever you currently listen for `onAuthStateChange` (or add it, since
`client.ts` doesn't do this yet per the codebase scan):

```ts
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store';

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
  if (!session) {
    useAuthStore.getState().clearAuth();
    return;
  }
  // fetch user_profiles + user_roles + role_permissions here via React Query
  // or a one-off supabase call, then:
  useAuthStore.getState().setUser({ id: session.user.id, email: session.user.email ?? null, ... });
  useAuthStore.getState().setRolesAndPermissions(roles, permissionCodes);
  useAuthStore.getState().setHydrated(true);
});
```

Guard admin routes in your TanStack Router `beforeLoad`:

```ts
export const Route = createFileRoute('/admin')({
  beforeLoad: () => {
    const { session, isHydrated } = useAuthStore.getState();
    if (isHydrated && !session) throw redirect({ to: '/admin/login' });
  },
});
```

## 5. Using `tableViewStore` in `GenericDataTable`

```tsx
function GenericDataTable({ table }: { table: string }) {
  const page = useTablePage(table);
  const pageSize = useTablePageSize(table);
  const { sortBy, sortDir } = useTableSort(table);
  const search = useTableSearch(table);
  const { setPage, setSearch, setSort } = useTableViewStore.getState();

  // feed these primitives straight into your existing React Query hook:
  const { data } = useSupabaseTableQuery(table, { page, pageSize, sortBy, sortDir, search });

  // ...
}
```

Because each selector hook (`useTablePage`, `useTableSearch`, etc.) subscribes to
one primitive, typing in the search box for `staff_profiles` will **not**
re-render the pagination controls, and changing the sort column will **not**
re-render the search input. This is the "selectors returning primitives"
strategy your own performance-strategy notes called for.

## 6. Optimistic writes example

```ts
async function updateStaffTitle(id: string, title: string) {
  const { setPending, clearPending } = useOptimisticStore.getState();
  setPending('staff_profiles', id, { title }); // UI updates instantly

  const { error } = await supabase.from('staff_profiles').update({ title }).eq('id', id);

  if (error) {
    clearPending('staff_profiles', id); // rollback
    toast.error('Failed to update');
    return;
  }
  await queryClient.invalidateQueries({ queryKey: ['staff_profiles'] });
  clearPending('staff_profiles', id);
}
```

In the row-rendering component, merge server data with any pending patch:

```tsx
const row = useOptimisticStore((s) => s.withOptimistic('staff_profiles', serverRow));
```

## 7. Sidebar / theme (drop-in, no extra wiring)

```tsx
const collapsed = useSidebarCollapsed();
const { toggleSidebar } = useUIStore.getState();
```

Persisted automatically via `zustand/middleware`'s `persist` — survives reloads
without needing Supabase round-trips for a UI preference.

## 8. devtools (optional, recommended for P1)

Wrap any store with `devtools` from `zustand/middleware` during development to
inspect state changes in the Redux DevTools browser extension — useful while
building the CRUD engine across 52 tables. Not included by default to keep
production bundles lean; add it conditionally:

```ts
import { devtools } from 'zustand/middleware';

export const useTableViewStore = create<TableViewStoreState>()(
  devtools(subscribeWithSelector((set, get) => ({ /* ... */ }))
);
```

## 9. package.json

Add to `dependencies`:

```json
"zustand": "^5.0.3"
```

(matches your existing `@tanstack/react-query` v5 / React 19 versions — Zustand
5.x is the version with first-class React 19 support.)
