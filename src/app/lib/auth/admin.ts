import { createClient } from '../supabase/server';

export interface AdminRole {
  code: string;
  name: string;
  scope_type: string;
  trust_id?: string | null;
  college_id?: string | null;
  department_id?: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  roles: AdminRole[];
}

// Allowed admin-level role codes — only these grant portal access
const AUTHORIZED_ROLE_CODES = ['admin', 'editor', 'department_admin', 'college_admin'] as const;

/**
 * Get the current admin user with roles from server-side session.
 * Returns null if not authenticated or not authorized.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch profile and roles in parallel
  const [profileResult, rolesResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('id, first_name, last_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('user_roles')
      .select(
        `
        scope_type,
        trust_id,
        college_id,
        department_id,
        role:role_id (
          code,
          name
        )
      `
      )
      .eq('user_id', user.id)
      .eq('status', 'published'),
  ]);

  const profile = profileResult.data;
  const rolesData = (rolesResult.data as any[]) || [];

  const roles: AdminRole[] = rolesData.map((ur) => ({
    code: ur.role?.code || '',
    name: ur.role?.name || '',
    scope_type: ur.scope_type,
    trust_id: ur.trust_id,
    college_id: ur.college_id,
    department_id: ur.department_id,
  }));

  // Only authorize users with explicitly permitted role codes
  const hasAuthorizedRole = roles.some((r) =>
    (AUTHORIZED_ROLE_CODES as readonly string[]).includes(r.code)
  );

  if (!hasAuthorizedRole) return null;

  return {
    id: user.id,
    email: user.email || '',
    first_name: profile?.first_name || null,
    last_name: profile?.last_name || null,
    avatar_url: profile?.avatar_url || null,
    roles,
  };
}

/**
 * Require admin access. Throws redirect to login if not authenticated.
 * Use in Server Components and Server Actions.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();

  if (!admin) {
    // In Server Components, this will be caught by Next.js and redirect
    throw new Error('Unauthorized');
  }

  return admin;
}

/**
 * Check if user has a specific role code
 */
export function hasRole(admin: AdminUser, roleCode: string): boolean {
  return admin.roles.some((r) => r.code === roleCode);
}

/**
 * Check if user has any of the specified role codes
 */
export function hasAnyRole(admin: AdminUser, roleCodes: string[]): boolean {
  return admin.roles.some((r) => roleCodes.includes(r.code));
}

/**
 * Check if user is a global admin
 */
export function isAdmin(admin: AdminUser): boolean {
  return hasRole(admin, 'admin');
}

/**
 * Check if user is an editor or admin
 */
export function isEditor(admin: AdminUser): boolean {
  return hasAnyRole(admin, ['admin', 'editor']);
}

/**
 * Get scope constraints for a user (for RLS-aware queries).
 * Derived from each role's own scope_type, not the role code — a role
 * code like "editor" can carry either a global or department-scoped grant.
 */
export function getScopeConstraints(admin: AdminUser): {
  scopeType: string;
  trustId?: string;
  collegeId?: string;
  departmentId?: string;
} | null {
  // Global admin, or any role explicitly granted at global scope
  if (hasRole(admin, 'admin') || admin.roles.some((r) => r.scope_type === 'global')) {
    return null;
  }

  // Department-scoped role
  const deptRole = admin.roles.find((r) => r.scope_type === 'department');
  if (deptRole) {
    return {
      scopeType: 'department',
      departmentId: deptRole.department_id || undefined,
    };
  }

  // College-scoped role
  const collegeRole = admin.roles.find((r) => r.scope_type === 'college');
  if (collegeRole) {
    return {
      scopeType: 'college',
      collegeId: collegeRole.college_id || undefined,
    };
  }

  // Trust-scoped role
  const trustRole = admin.roles.find((r) => r.scope_type === 'trust');
  if (trustRole) {
    return {
      scopeType: 'trust',
      trustId: trustRole.trust_id || undefined,
    };
  }

  return null;
}
