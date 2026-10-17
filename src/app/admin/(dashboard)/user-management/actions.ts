'use server';

// Global-admin-only user management: create portal users, assign/remove
// scoped roles, edit profiles, and reset passwords. All writes go through
// the Supabase Auth Admin API + supabaseAdmin (service role), so every
// action re-checks the caller is a global admin server-side before doing
// anything — never trust a client-supplied isAdmin flag for these.
import { requireAdmin, isAdmin as isGlobalAdmin } from '@/app/lib/auth/admin';
import { FULL_ACCESS_ROLE_CODES } from '@/lib/admin-sections';

export interface PortalUserRole {
  userRoleId: string;
  roleCode: string;
  roleName: string;
  scopeType: string;
  trustId: string | null;
  collegeId: string | null;
  departmentId: string | null;
  scopeLabel: string;
}

export interface PortalUserSectionGrant {
  userSectionGrantId: string;
  sectionCode: string;
  sectionName: string;
  scopeLabel: string;
}

export interface PortalUser {
  id: string;
  email: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  firstName: string;
  lastName: string;
  roles: PortalUserRole[];
  sections: PortalUserSectionGrant[];
  // False when the user's access was toggled off via setPortalUserAccessEnabled
  // (all their grants archived with an access_disabled metadata tag).
  accessEnabled: boolean;
}

export interface ScopeOption {
  id: string;
  name: string;
}

export interface SectionOption {
  id: string;
  code: string;
  name: string;
}

async function assertGlobalAdmin() {
  const admin = await requireAdmin();
  if (!isGlobalAdmin(admin)) {
    throw new Error('Forbidden: only a global admin can do this.');
  }
  return admin;
}

// Next.js masks messages thrown from server actions in production builds (the
// client only sees a generic React #441 error), so expected, user-fixable
// failures are returned as { error } instead of thrown.
type ActionResult<T> = ({ error?: undefined } & T) | { error: string };

function roleAssignError(err: { code?: string; message: string }) {
  if (err.code === '23505') return 'This user already has that role at that scope.';
  return err.message;
}

function isFullAccessRole(code: string) {
  return (FULL_ACCESS_ROLE_CODES as readonly string[]).includes(code);
}

// Section-scoped roles (currently only sports_secretary) must never be
// granted at global scope — a global user_roles row reads as a full global
// admin in the scope-level logic, and even with the hardened RLS helpers it
// would make no sense for a single-section role.
function assertRoleScopeAllowed(roleCode: string, scopeType: string): string | null {
  if (!isFullAccessRole(roleCode) && scopeType !== 'college' && scopeType !== 'department') {
    return 'Section-scoped roles (e.g. Sports Secretary) can only be granted at College or Department scope.';
  }
  return null;
}

export async function listPortalUsers(): Promise<PortalUser[]> {
  await assertGlobalAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

  const [{ data: authList, error: authErr }, { data: profiles, error: profErr }, { data: roleRows, error: roleErr }, { data: sectionGrantRows, error: sectionGrantErr }, { data: disabledRoleRows, error: disabledRoleErr }, { data: disabledSectionRows, error: disabledSectionErr }, { data: trusts }, { data: colleges }, { data: departments }] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    supabaseAdmin.from('user_profiles').select('id, first_name, last_name'),
    supabaseAdmin.from('user_roles').select('id, user_id, scope_type, trust_id, college_id, department_id, role:role_id(code, name)').eq('status', 'published'),
    supabaseAdmin
      .from('user_section_grants')
      .select('id, user_id, scope_type, trust_id, college_id, department_id, section:section_id(code, name)')
      .eq('status', 'published'),
    // Grants archived by the enable/disable toggle (tagged so deliberately
    // removed grants are never mistaken for a disabled account).
    supabaseAdmin.from('user_roles').select('user_id').eq('status', 'archived').eq('metadata->>access_disabled', 'true'),
    supabaseAdmin.from('user_section_grants').select('user_id').eq('status', 'archived').eq('metadata->>access_disabled', 'true'),
    supabaseAdmin.from('trusts').select('id, name'),
    supabaseAdmin.from('colleges').select('id, name'),
    supabaseAdmin.from('departments').select('id, name'),
  ]);
  if (authErr) throw new Error(authErr.message);
  if (profErr) throw new Error(profErr.message);
  if (roleErr) throw new Error(roleErr.message);
  if (sectionGrantErr) throw new Error(sectionGrantErr.message);
  if (disabledRoleErr) throw new Error(disabledRoleErr.message);
  if (disabledSectionErr) throw new Error(disabledSectionErr.message);

  const disabledUserIds = new Set(
    [...(disabledRoleRows ?? []), ...(disabledSectionRows ?? [])].map((r: any) => r.user_id as string)
  );

  const trustNames = new Map((trusts ?? []).map((t: any) => [t.id, t.name]));
  const collegeNames = new Map((colleges ?? []).map((c: any) => [c.id, c.name]));
  const departmentNames = new Map((departments ?? []).map((d: any) => [d.id, d.name]));
  const profileById = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  const scopeLabel = (r: any) => {
    if (r.scope_type === 'global') return 'Global';
    if (r.scope_type === 'trust') return `Trust: ${trustNames.get(r.trust_id) ?? 'Unknown'}`;
    if (r.scope_type === 'college') return `College: ${collegeNames.get(r.college_id) ?? 'Unknown'}`;
    if (r.scope_type === 'department') return `Department: ${departmentNames.get(r.department_id) ?? 'Unknown'}`;
    return r.scope_type;
  };

  const rolesByUser = new Map<string, PortalUserRole[]>();
  for (const r of roleRows ?? []) {
    const list = rolesByUser.get(r.user_id) ?? [];
    list.push({
      userRoleId: r.id,
      roleCode: r.role?.code ?? '',
      roleName: r.role?.name ?? '',
      scopeType: r.scope_type,
      trustId: r.trust_id,
      collegeId: r.college_id,
      departmentId: r.department_id,
      scopeLabel: scopeLabel(r),
    });
    rolesByUser.set(r.user_id, list);
  }

  const sectionsByUser = new Map<string, PortalUserSectionGrant[]>();
  for (const sg of (sectionGrantRows ?? []) as any[]) {
    const list = sectionsByUser.get(sg.user_id) ?? [];
    list.push({
      userSectionGrantId: sg.id,
      sectionCode: sg.section?.code ?? '',
      sectionName: sg.section?.name ?? '',
      scopeLabel: scopeLabel(sg),
    });
    sectionsByUser.set(sg.user_id, list);
  }

  return (authList?.users ?? []).map((u: any) => {
    const profile = profileById.get(u.id);
    return {
      id: u.id,
      email: u.email ?? null,
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      firstName: profile?.first_name ?? '',
      lastName: profile?.last_name ?? '',
      roles: rolesByUser.get(u.id) ?? [],
      sections: sectionsByUser.get(u.id) ?? [],
      accessEnabled: !disabledUserIds.has(u.id),
    };
  });
}

export async function listSectionOptions(): Promise<SectionOption[]> {
  await assertGlobalAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

  const { data, error } = await supabaseAdmin
    .from('admin_sections')
    .select('id, code, name')
    .is('deleted_at', null)
    .order('name');
  if (error) throw new Error(error.message);

  return (data ?? []) as SectionOption[];
}

interface AssignSectionInput {
  userId: string;
  sectionId: string;
  scopeType: string;
  trustId?: string | null;
  collegeId?: string | null;
  departmentId?: string | null;
}

export async function assignPortalUserSection(input: AssignSectionInput) {
  const admin = await assertGlobalAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

  const { error: assignErr } = await supabaseAdmin.from('user_section_grants').insert({
    user_id: input.userId,
    section_id: input.sectionId,
    scope_type: input.scopeType as 'global' | 'trust' | 'college' | 'department',
    trust_id: input.scopeType === 'trust' ? input.trustId : null,
    college_id: input.scopeType === 'college' ? input.collegeId : null,
    department_id: input.scopeType === 'department' ? input.departmentId : null,
    status: 'published',
    created_by: admin.id,
  });
  if (assignErr) throw new Error(assignErr.message);

  return { ok: true };
}

export async function removePortalUserSection(userSectionGrantId: string) {
  const admin = await assertGlobalAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

  const { error } = await supabaseAdmin
    .from('user_section_grants')
    .update({ deleted_at: new Date().toISOString(), deleted_by: admin.id, status: 'archived' })
    .eq('id', userSectionGrantId);
  if (error) throw new Error(error.message);

  return { ok: true };
}

export async function listScopeOptions() {
  await assertGlobalAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

  const [{ data: trusts }, { data: colleges }, { data: departments }, { data: roles }] = await Promise.all([
    supabaseAdmin.from('trusts').select('id, name').is('deleted_at', null).order('name'),
    supabaseAdmin.from('colleges').select('id, name').is('deleted_at', null).order('name'),
    supabaseAdmin.from('departments').select('id, name').is('deleted_at', null).order('name'),
    supabaseAdmin.from('roles').select('code, name').is('deleted_at', null).order('name'),
  ]);

  return {
    trusts: (trusts ?? []) as ScopeOption[],
    colleges: (colleges ?? []) as ScopeOption[],
    departments: (departments ?? []) as ScopeOption[],
    roles: (roles ?? []) as { code: string; name: string }[],
  };
}

interface CreatePortalUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleCode: string;
  scopeType: string;
  trustId?: string | null;
  collegeId?: string | null;
  departmentId?: string | null;
}

export async function createPortalUser(input: CreatePortalUserInput): Promise<ActionResult<{ userId: string }>> {
  const admin = await assertGlobalAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

  if (!input.email || !input.password || !input.roleCode || !input.scopeType) {
    return { error: 'Email, password, role, and scope are required.' };
  }
  if (input.password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }
  if (input.roleCode === 'admin' && input.scopeType !== 'global') {
    return { error: 'The "Administrator" role can only be granted at Global scope.' };
  }
  const scopeViolation = assertRoleScopeAllowed(input.roleCode, input.scopeType);
  if (scopeViolation) return { error: scopeViolation };

  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { first_name: input.firstName, last_name: input.lastName },
  });
  if (createErr) {
    if (createErr.code === 'email_exists') {
      return { error: `An account for ${input.email} already exists. Use "Manage roles" on that user to grant access instead.` };
    }
    return { error: createErr.message };
  }

  const newUserId = created.user?.id;
  if (!newUserId) throw new Error('User creation did not return an id.');

  const { data: role, error: roleErr } = await supabaseAdmin.from('roles').select('id').eq('code', input.roleCode).maybeSingle();
  if (roleErr) throw new Error(roleErr.message);
  if (!role) throw new Error(`Unknown role code: ${input.roleCode}`);

  const { error: assignErr } = await supabaseAdmin.from('user_roles').insert({
    user_id: newUserId,
    role_id: role.id,
    scope_type: input.scopeType as 'global' | 'trust' | 'college' | 'department',
    trust_id: input.scopeType === 'trust' ? input.trustId : null,
    college_id: input.scopeType === 'college' ? input.collegeId : null,
    department_id: input.scopeType === 'department' ? input.departmentId : null,
    status: 'published',
    created_by: admin.id,
  });
  if (assignErr) return { error: `Account created, but assigning the role failed: ${roleAssignError(assignErr)}` };

  return { userId: newUserId };
}

interface AssignRoleInput {
  userId: string;
  roleCode: string;
  scopeType: string;
  trustId?: string | null;
  collegeId?: string | null;
  departmentId?: string | null;
}

export async function assignPortalUserRole(input: AssignRoleInput): Promise<ActionResult<{ ok: true }>> {
  const admin = await assertGlobalAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  if (input.roleCode === 'admin' && input.scopeType !== 'global') {
    return { error: 'The "Administrator" role can only be granted at Global scope.' };
  }
  const scopeViolation = assertRoleScopeAllowed(input.roleCode, input.scopeType);
  if (scopeViolation) return { error: scopeViolation };

  const { data: role, error: roleErr } = await supabaseAdmin.from('roles').select('id').eq('code', input.roleCode).maybeSingle();
  if (roleErr) throw new Error(roleErr.message);
  if (!role) throw new Error(`Unknown role code: ${input.roleCode}`);

  const { error: assignErr } = await supabaseAdmin.from('user_roles').insert({
    user_id: input.userId,
    role_id: role.id,
    scope_type: input.scopeType as 'global' | 'trust' | 'college' | 'department',
    trust_id: input.scopeType === 'trust' ? input.trustId : null,
    college_id: input.scopeType === 'college' ? input.collegeId : null,
    department_id: input.scopeType === 'department' ? input.departmentId : null,
    status: 'published',
    created_by: admin.id,
  });
  if (assignErr) return { error: roleAssignError(assignErr) };

  return { ok: true };
}

export async function removePortalUserRole(userRoleId: string) {
  const admin = await assertGlobalAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

  const { error } = await supabaseAdmin.from('user_roles').update({ deleted_at: new Date().toISOString(), deleted_by: admin.id, status: 'archived' }).eq('id', userRoleId);
  if (error) throw new Error(error.message);

  return { ok: true };
}

// Toggle a user's entire portal access on/off without deleting anything.
// Disabling archives ALL of their live grants (roles AND section grants —
// section grants alone still confer direct REST-API write powers), tagging
// each row in metadata so enabling restores exactly these rows and never
// resurrects grants an admin deliberately removed (the unique constraints on
// both tables are inert over NULL scope ids, so removed and re-granted rows
// can coexist).
export async function setPortalUserAccessEnabled(
  userId: string,
  enabled: boolean
): Promise<ActionResult<{ ok: true }>> {
  const admin = await assertGlobalAdmin();

  if (userId === admin.id) {
    return { error: 'You cannot disable your own account.' };
  }

  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const tables = ['user_roles', 'user_section_grants'] as const;

  if (enabled) {
    for (const table of tables) {
      const { data: tagged, error: fetchErr } = await supabaseAdmin
        .from(table)
        .select('id, metadata')
        .eq('user_id', userId)
        .eq('status', 'archived')
        .eq('metadata->>access_disabled', 'true');
      if (fetchErr) throw new Error(fetchErr.message);

      for (const row of tagged ?? []) {
        const metadata: Record<string, unknown> = {
          ...((row.metadata as Record<string, unknown> | null) ?? {}),
        };
        delete metadata.access_disabled;
        const { error: updateErr } = await supabaseAdmin
          .from(table)
          .update({
            status: 'published',
            deleted_at: null,
            deleted_by: null,
            updated_by: admin.id,
            metadata: metadata as any,
          })
          .eq('id', row.id);
        if (updateErr) throw new Error(updateErr.message);
      }
    }

    return { ok: true };
  }

  const now = new Date().toISOString();
  for (const table of tables) {
    const { data: live, error: fetchErr } = await supabaseAdmin
      .from(table)
      .select('id, metadata')
      .eq('user_id', userId)
      .eq('status', 'published');
    if (fetchErr) throw new Error(fetchErr.message);

    for (const row of live ?? []) {
      const { error: updateErr } = await supabaseAdmin
        .from(table)
        .update({
          status: 'archived',
          deleted_at: now,
          deleted_by: admin.id,
          updated_by: admin.id,
          metadata: {
            ...((row.metadata as Record<string, unknown> | null) ?? {}),
            access_disabled: true,
          } as any,
        })
        .eq('id', row.id);
      if (updateErr) throw new Error(updateErr.message);
    }
  }

  return { ok: true };
}

interface UpdateProfileInput {
  userId: string;
  firstName: string;
  lastName: string;
}

export async function updatePortalUserProfile(input: UpdateProfileInput) {
  const admin = await assertGlobalAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({ first_name: input.firstName, last_name: input.lastName, updated_by: admin.id, updated_at: new Date().toISOString() })
    .eq('id', input.userId);
  if (error) throw new Error(error.message);

  return { ok: true };
}

interface ResetPasswordInput {
  userId: string;
  newPassword: string;
}

export async function adminSetUserPassword(input: ResetPasswordInput) {
  await assertGlobalAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

  if (!input.newPassword || input.newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(input.userId, { password: input.newPassword });
  if (error) throw new Error(error.message);

  return { ok: true };
}

// Soft delete only: a hard delete of auth.users would hit the NO ACTION
// created_by/updated_by/deleted_by FKs on dozens of content tables (any
// admin who's actually edited content, unlike a throwaway test account,
// will have left a trail there) and fail outright. shouldSoftDelete=true
// sets deleted_at and blocks login instead of removing the row, so every
// created_by/updated_by reference stays valid.
export async function deletePortalUser(userId: string): Promise<ActionResult<{ ok: true }>> {
  const admin = await assertGlobalAdmin();

  if (userId === admin.id) {
    return { error: 'You cannot delete your own account.' };
  }

  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId, true);
  if (error) return { error: error.message };

  return { ok: true };
}
