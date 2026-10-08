import { useMemo } from "react";
import type { AdminRole } from "@/app/lib/auth/admin";
import { FULL_ACCESS_ROLE_CODES } from "@/lib/admin-sections";

export type ScopeLevel =
  | "global"
  | "trust"
  | "institute"
  | "college"
  | "department"
  | "section"
  | "none";

export interface UserScope {
  level: ScopeLevel;
  // For section-only users (level "section"): the scope of the section-role
  // grant itself — the valid scope_level to write into scoped tables
  // (scope_type / college_id / department_id defaults), since "section" is
  // not a scope tier.
  sectionScope?: Exclude<ScopeLevel, "section" | "none">;
  trustId?: string | null;
  collegeId?: string | null;
  departmentId?: string | null;
}

// Broadest-to-narrowest scope ranking — a user holding multiple role grants
// is treated as operating at their widest one. Mirrors the server-side
// SCOPE_RANK in src/app/lib/auth/admin.ts.
const SCOPE_RANK: Record<string, number> = {
  global: 0,
  trust: 1,
  institute: 1.5,
  college: 2,
  department: 3,
};

// Single source of truth for "what is this signed-in admin allowed to touch."
// Used by AdminSidebar (section visibility), the admin route guard (direct-nav
// redirects), AdminCrudManager (row filtering + write permission), and the
// staff wizard (faculty visibility) so all four agree on the same scope.
//
// Users whose roles are all outside FULL_ACCESS_ROLE_CODES (e.g. a Sports
// Secretary) get level "section" — their reach comes solely from section
// grants, and a scoped section-role row must never widen anyone's level to
// its own scope tier. Mirrors getScopeLevel in src/app/lib/auth/admin.ts.
export function useUserScope(roles: AdminRole[] | undefined | null): UserScope {
  return useMemo(() => {
    if (!roles || roles.length === 0) return { level: "none" };

    const rankOf = (r: AdminRole) => SCOPE_RANK[r.scope_type] ?? 99;
    const broadest = (list: AdminRole[]) =>
      list.reduce((acc, r) => (rankOf(r) < rankOf(acc) ? r : acc), list[0]);

    const fullAccessRoles = roles.filter((r) =>
      (FULL_ACCESS_ROLE_CODES as readonly string[]).includes(r.code),
    );

    if (fullAccessRoles.length === 0) {
      const carrier = broadest(roles);
      return {
        level: "section",
        sectionScope: (carrier.scope_type as Exclude<ScopeLevel, "section" | "none">) || undefined,
        trustId: carrier.trust_id,
        collegeId: carrier.college_id,
        departmentId: carrier.department_id,
      };
    }

    const best = broadest(fullAccessRoles);

    return {
      level: fullAccessRoles.some((r) => r.code === "admin")
        ? "global"
        : (best.scope_type as ScopeLevel) || "none",
      trustId: best.trust_id,
      collegeId: best.college_id,
      departmentId: best.department_id,
    };
  }, [roles]);
}
