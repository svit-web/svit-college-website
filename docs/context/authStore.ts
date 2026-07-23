import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Session } from '@supabase/supabase-js';

// Mirrors user_roles.scope_type from your schema (scope_level enum)
export type ScopeType = 'global' | 'trust' | 'institute' | 'college' | 'department';

export interface UserRoleAssignment {
  roleId: string;
  roleCode: string; // roles.code
  scopeType: ScopeType;
  trustId: string | null;
  instituteId: string | null;
  collegeId: string | null;
  departmentId: string | null;
}

export interface AuthUser {
  id: string; // auth.users.id / user_profiles.id
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

interface AuthState {
  session: Session | null;
  user: AuthUser | null;
  roles: UserRoleAssignment[];
  permissionCodes: string[]; // flattened from role_permissions for the user's roles
  isHydrated: boolean; // true once initial session check has completed

  // actions
  setSession: (session: Session | null) => void;
  setUser: (user: AuthUser | null) => void;
  setRolesAndPermissions: (roles: UserRoleAssignment[], permissionCodes: string[]) => void;
  setHydrated: (value: boolean) => void;
  clearAuth: () => void;

  // derived helpers (kept as functions, not stored state, so they never go stale)
  hasPermission: (code: string) => boolean;
  hasRole: (roleCode: string) => boolean;
  /** Checks role + optional scope match, e.g. hasScopedRole('dept_admin', { departmentId }) */
  hasScopedRole: (
    roleCode: string,
    scope?: Partial<Pick<UserRoleAssignment, 'trustId' | 'instituteId' | 'collegeId' | 'departmentId'>>
  ) => boolean;
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    session: null,
    user: null,
    roles: [],
    permissionCodes: [],
    isHydrated: false,

    setSession: (session) => set({ session }),
    setUser: (user) => set({ user }),
    setRolesAndPermissions: (roles, permissionCodes) => set({ roles, permissionCodes }),
    setHydrated: (value) => set({ isHydrated: value }),
    clearAuth: () =>
      set({ session: null, user: null, roles: [], permissionCodes: [], isHydrated: true }),

    hasPermission: (code) => get().permissionCodes.includes(code),

    hasRole: (roleCode) => get().roles.some((r) => r.roleCode === roleCode),

    hasScopedRole: (roleCode, scope) => {
      const match = get().roles.filter((r) => r.roleCode === roleCode);
      if (match.length === 0) return false;
      if (!scope) return true;
      return match.some((r) => {
        if (r.scopeType === 'global') return true;
        if (scope.trustId && r.trustId && r.trustId !== scope.trustId) return false;
        if (scope.instituteId && r.instituteId && r.instituteId !== scope.instituteId) return false;
        if (scope.collegeId && r.collegeId && r.collegeId !== scope.collegeId) return false;
        if (scope.departmentId && r.departmentId && r.departmentId !== scope.departmentId) return false;
        return true;
      });
    },
  }))
);

// ---- Selector hooks (return primitives/stable refs to avoid re-renders) ----
export const useAuthUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.session !== null);
export const useAuthHydrated = () => useAuthStore((s) => s.isHydrated);
export const usePermission = (code: string) => useAuthStore((s) => s.permissionCodes.includes(code));
