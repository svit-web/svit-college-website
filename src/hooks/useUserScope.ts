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
  // Single representative grant (the first one at the broadest tier) — used
  // for form defaults, where only one value can be pre-filled anyway.
  trustId?: string | null;
  instituteId?: string | null;
  collegeId?: string | null;
  departmentId?: string | null;
  // Every id the user holds a grant for at their broadest tier — a user can
  // hold more than one role grant at the same scope tier (e.g. editor on two
  // colleges), and row-visibility/row-filtering must union across all of
  // them rather than picking just one. Always includes the single `*Id`
  // above as its first element when non-empty.
  trustIds: string[];
  instituteIds: string[];
  collegeIds: string[];
  departmentIds: string[];
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
    if (!roles || roles.length === 0)
      return { level: "none", trustIds: [], instituteIds: [], collegeIds: [], departmentIds: [] };

    const rankOf = (r: AdminRole) => SCOPE_RANK[r.scope_type] ?? 99;
    const broadest = (list: AdminRole[]) =>
      list.reduce((acc, r) => (rankOf(r) < rankOf(acc) ? r : acc), list[0]);
    // Every distinct id of a given column across all grants that share the
    // broadest-tier rank — ranks are 1:1 with scope_type, so this is the
    // same as "every grant at that scope_type".
    const idsAtRank = (list: AdminRole[], rank: number, key: "trust_id" | "institute_id" | "college_id" | "department_id") =>
      Array.from(new Set(list.filter((r) => rankOf(r) === rank).map((r) => r[key]).filter((v): v is string => !!v)));

    const fullAccessRoles = roles.filter((r) =>
      (FULL_ACCESS_ROLE_CODES as readonly string[]).includes(r.code),
    );

    if (fullAccessRoles.length === 0) {
      const carrier = broadest(roles);
      const rank = rankOf(carrier);
      return {
        level: "section",
        sectionScope: (carrier.scope_type as Exclude<ScopeLevel, "section" | "none">) || undefined,
        trustId: carrier.trust_id,
        instituteId: carrier.institute_id,
        collegeId: carrier.college_id,
        departmentId: carrier.department_id,
        trustIds: idsAtRank(roles, rank, "trust_id"),
        instituteIds: idsAtRank(roles, rank, "institute_id"),
        collegeIds: idsAtRank(roles, rank, "college_id"),
        departmentIds: idsAtRank(roles, rank, "department_id"),
      };
    }

    const best = broadest(fullAccessRoles);
    const bestRank = rankOf(best);

    return {
      level: fullAccessRoles.some((r) => r.code === "admin")
        ? "global"
        : (best.scope_type as ScopeLevel) || "none",
      trustId: best.trust_id,
      instituteId: best.institute_id,
      collegeId: best.college_id,
      departmentId: best.department_id,
      trustIds: idsAtRank(fullAccessRoles, bestRank, "trust_id"),
      instituteIds: idsAtRank(fullAccessRoles, bestRank, "institute_id"),
      collegeIds: idsAtRank(fullAccessRoles, bestRank, "college_id"),
      departmentIds: idsAtRank(fullAccessRoles, bestRank, "department_id"),
    };
  }, [roles]);
}
