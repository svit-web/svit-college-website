import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface TableViewState {
  page: number;
  pageSize: number;
  sortBy: string | null;
  sortDir: 'asc' | 'desc';
  search: string;
  filters: Record<string, string | number | boolean | null>;
  selectedIds: string[];
}

const DEFAULT_VIEW: TableViewState = {
  page: 1,
  pageSize: 25,
  sortBy: null,
  sortDir: 'asc',
  search: '',
  filters: {},
  selectedIds: [],
};

interface TableViewStoreState {
  // keyed by table name (e.g. 'staff_profiles', 'courses') so every
  // /admin/cms/:table screen gets independent, restorable state
  views: Record<string, TableViewState>;

  getView: (table: string) => TableViewState;
  setPage: (table: string, page: number) => void;
  setPageSize: (table: string, pageSize: number) => void;
  setSort: (table: string, sortBy: string | null, sortDir?: 'asc' | 'desc') => void;
  setSearch: (table: string, search: string) => void;
  setFilter: (table: string, key: string, value: TableViewState['filters'][string]) => void;
  clearFilters: (table: string) => void;
  setSelectedIds: (table: string, ids: string[]) => void;
  toggleSelectedId: (table: string, id: string) => void;
  resetView: (table: string) => void;
}

export const useTableViewStore = create<TableViewStoreState>()(
  subscribeWithSelector((set, get) => ({
    views: {},

    getView: (table) => get().views[table] ?? DEFAULT_VIEW,

    setPage: (table, page) =>
      set((s) => ({ views: { ...s.views, [table]: { ...(s.views[table] ?? DEFAULT_VIEW), page } } })),

    setPageSize: (table, pageSize) =>
      set((s) => ({
        views: { ...s.views, [table]: { ...(s.views[table] ?? DEFAULT_VIEW), pageSize, page: 1 } },
      })),

    setSort: (table, sortBy, sortDir = 'asc') =>
      set((s) => ({
        views: { ...s.views, [table]: { ...(s.views[table] ?? DEFAULT_VIEW), sortBy, sortDir } },
      })),

    setSearch: (table, search) =>
      set((s) => ({
        views: { ...s.views, [table]: { ...(s.views[table] ?? DEFAULT_VIEW), search, page: 1 } },
      })),

    setFilter: (table, key, value) =>
      set((s) => {
        const current = s.views[table] ?? DEFAULT_VIEW;
        return {
          views: {
            ...s.views,
            [table]: { ...current, filters: { ...current.filters, [key]: value }, page: 1 },
          },
        };
      }),

    clearFilters: (table) =>
      set((s) => ({
        views: { ...s.views, [table]: { ...(s.views[table] ?? DEFAULT_VIEW), filters: {}, page: 1 } },
      })),

    setSelectedIds: (table, ids) =>
      set((s) => ({
        views: { ...s.views, [table]: { ...(s.views[table] ?? DEFAULT_VIEW), selectedIds: ids } },
      })),

    toggleSelectedId: (table, id) =>
      set((s) => {
        const current = s.views[table] ?? DEFAULT_VIEW;
        const selectedIds = current.selectedIds.includes(id)
          ? current.selectedIds.filter((x) => x !== id)
          : [...current.selectedIds, id];
        return { views: { ...s.views, [table]: { ...current, selectedIds } } };
      }),

    resetView: (table) => set((s) => ({ views: { ...s.views, [table]: DEFAULT_VIEW } })),
  }))
);

// ---- Narrow selector hooks used by GenericDataTable so a keystroke in the
// search box (for table A) never re-renders the pagination controls of table B,
// and pagination doesn't re-render on sort, etc. ----
export const useTablePage = (table: string) => useTableViewStore((s) => s.getView(table).page);
export const useTablePageSize = (table: string) => useTableViewStore((s) => s.getView(table).pageSize);
export const useTableSort = (table: string) =>
  useTableViewStore((s) => {
    const v = s.getView(table);
    return { sortBy: v.sortBy, sortDir: v.sortDir };
  });
export const useTableSearch = (table: string) => useTableViewStore((s) => s.getView(table).search);
export const useTableFilters = (table: string) => useTableViewStore((s) => s.getView(table).filters);
export const useTableSelectedIds = (table: string) =>
  useTableViewStore((s) => s.getView(table).selectedIds);
