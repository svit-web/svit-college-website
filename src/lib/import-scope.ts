import type { UserScope } from '@/hooks/useUserScope';

/**
 * Mirrors the department/college restriction already applied client-side in
 * AdminStaffWizardsPage's `scopedDepartmentIds` memo (global/trust scopes are
 * treated as unrestricted there too — the DB's `can_write_scoped_record` RLS
 * check is the real enforcement boundary; this is just a pre-check so CSV
 * import can report a clear per-row error instead of a raw Postgres error).
 */
export function canWriteDepartment(scope: UserScope, department: { id: string; college_id?: string | null }): boolean {
  // A user can hold grants on more than one department/college — check
  // against the full set, not just the single representative id.
  if (scope.level === 'department') {
    return scope.departmentIds.includes(department.id);
  }
  if (scope.level === 'college') {
    return !!department.college_id && scope.collegeIds.includes(department.college_id);
  }
  return true;
}
