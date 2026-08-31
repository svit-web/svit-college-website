import { useMemo } from "react";
import type { AdminRole } from "@/app/lib/auth/admin";

export type ScopeLevel = "global" | "trust" | "college" | "department" | "none";

export interface UserScope {
  level: ScopeLevel;
  trustId?: string | null;
  collegeId?: string | null;
  departmentId?: string | null;
}

// Broadest-to-narrowest scope ranking — a user holding multiple role grants
// is treated as operating at their widest one.
const SCOPE_RANK: Record<string, number> = { global: 0, trust: 1, college: 2, department: 3 };

// Single source of truth for "what is this signed-in admin allowed to touch."
// Used by AdminSidebar (section visibility), the admin route guard (direct-nav
// redirects), AdminCrudManager (row filtering + write permission), and the
// staff wizard (faculty visibility) so all four agree on the same scope.
export function useUserScope(roles: AdminRole[] | undefined | null): UserScope {
  return useMemo(() => {
    if (!roles || roles.length === 0) return { level: "none" };

    const isGlobalAdmin = roles.some((r) => r.code === "admin");

    const best = roles.reduce((acc, r) => {
      const rank = SCOPE_RANK[r.scope_type] ?? 99;
      const bestRank = SCOPE_RANK[acc.scope_type] ?? 99;
      return rank < bestRank ? r : acc;
    }, roles[0]);

    return {
      level: isGlobalAdmin ? "global" : ((best.scope_type as ScopeLevel) || "none"),
      trustId: best.trust_id,
      collegeId: best.college_id,
      departmentId: best.department_id,
    };
  }, [roles]);
}
