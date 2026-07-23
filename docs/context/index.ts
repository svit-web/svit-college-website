export { useAuthStore, useAuthUser, useIsAuthenticated, useAuthHydrated, usePermission } from './authStore';
export type { AuthUser, UserRoleAssignment, ScopeType } from './authStore';

export { useUIStore, useSidebarCollapsed, useTheme } from './uiStore';

export {
  useTableViewStore,
  useTablePage,
  useTablePageSize,
  useTableSort,
  useTableSearch,
  useTableFilters,
  useTableSelectedIds,
} from './tableViewStore';
export type { TableViewState } from './tableViewStore';

export { useOptimisticStore, usePendingPatch } from './optimisticStore';

// Re-export zustand's shallow comparator so components pulling multiple
// fields from one store in a single call still avoid extra re-renders:
//
//   const { page, pageSize } = useTableViewStore(
//     useShallow((s) => ({ page: s.getView('courses').page, pageSize: s.getView('courses').pageSize }))
//   );
export { useShallow } from 'zustand/react/shallow';
