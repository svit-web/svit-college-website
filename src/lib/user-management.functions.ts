// Global-admin-only user management: create portal users, assign/remove
// scoped roles, edit profiles, and reset passwords. All writes go through
// the Supabase Auth Admin API + supabaseAdmin (service role), so every
// handler re-checks the caller is a global admin server-side before doing
// anything — never trust a client-supplied isAdmin flag for these.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

export interface PortalUser {
  id: string;
  email: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  firstName: string;
  lastName: string;
  roles: PortalUserRole[];
}

export interface ScopeOption {
  id: string;
  name: string;
}

async function assertGlobalAdmin(supabaseAdmin: any, userId: string) {
  const { data: roleRows, error } = await supabaseAdmin
    .from("user_roles")
    .select("scope_type, status, role:role_id(code)")
    .eq("user_id", userId)
    .eq("status", "published");
  if (error) throw new Error(error.message);

  const isGlobalAdmin = (roleRows ?? []).some(
    (r: any) => r.role?.code === "admin" && r.scope_type === "global"
  );
  if (!isGlobalAdmin) {
    throw new Error("Forbidden: only a global admin can do this.");
  }
}

// The "admin" role code is treated as unconditionally global by
// useUserScope.ts regardless of what scope_type its user_roles row carries —
// an (admin, scope_type=department) row would grant that user full global
// access in the UI while still passing scope-blind legacy checks elsewhere.
// Reject that combination at the one place both grant paths go through.
function assertRoleScopeSane(roleCode: string, scopeType: string) {
  if (roleCode === "admin" && scopeType !== "global") {
    throw new Error('The "Administrator" role can only be granted at Global scope.');
  }
}

export const listPortalUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PortalUser[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertGlobalAdmin(supabaseAdmin, context.userId);

    const [{ data: authList, error: authErr }, { data: profiles, error: profErr }, { data: roleRows, error: roleErr }, { data: trusts }, { data: colleges }, { data: departments }] =
      await Promise.all([
        supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
        supabaseAdmin.from("user_profiles").select("id, first_name, last_name"),
        supabaseAdmin
          .from("user_roles")
          .select("id, user_id, scope_type, trust_id, college_id, department_id, role:role_id(code, name)")
          .eq("status", "published"),
        supabaseAdmin.from("trusts").select("id, name"),
        supabaseAdmin.from("colleges").select("id, name"),
        supabaseAdmin.from("departments").select("id, name"),
      ]);
    if (authErr) throw new Error(authErr.message);
    if (profErr) throw new Error(profErr.message);
    if (roleErr) throw new Error(roleErr.message);

    const trustNames = new Map((trusts ?? []).map((t: any) => [t.id, t.name]));
    const collegeNames = new Map((colleges ?? []).map((c: any) => [c.id, c.name]));
    const departmentNames = new Map((departments ?? []).map((d: any) => [d.id, d.name]));
    const profileById = new Map((profiles ?? []).map((p: any) => [p.id, p]));

    const scopeLabel = (r: any) => {
      if (r.scope_type === "global") return "Global";
      if (r.scope_type === "trust") return `Trust: ${trustNames.get(r.trust_id) ?? "Unknown"}`;
      if (r.scope_type === "college") return `College: ${collegeNames.get(r.college_id) ?? "Unknown"}`;
      if (r.scope_type === "department") return `Department: ${departmentNames.get(r.department_id) ?? "Unknown"}`;
      return r.scope_type;
    };

    const rolesByUser = new Map<string, PortalUserRole[]>();
    for (const r of roleRows ?? []) {
      const list = rolesByUser.get(r.user_id) ?? [];
      list.push({
        userRoleId: r.id,
        roleCode: r.role?.code ?? "",
        roleName: r.role?.name ?? "",
        scopeType: r.scope_type,
        trustId: r.trust_id,
        collegeId: r.college_id,
        departmentId: r.department_id,
        scopeLabel: scopeLabel(r),
      });
      rolesByUser.set(r.user_id, list);
    }

    return (authList?.users ?? []).map((u: any) => {
      const profile = profileById.get(u.id);
      return {
        id: u.id,
        email: u.email ?? null,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        firstName: profile?.first_name ?? "",
        lastName: profile?.last_name ?? "",
        roles: rolesByUser.get(u.id) ?? [],
      };
    });
  });

export const listScopeOptions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertGlobalAdmin(supabaseAdmin, context.userId);

    const [{ data: trusts }, { data: colleges }, { data: departments }, { data: roles }] = await Promise.all([
      supabaseAdmin.from("trusts").select("id, name").is("deleted_at", null).order("name"),
      supabaseAdmin.from("colleges").select("id, name").is("deleted_at", null).order("name"),
      supabaseAdmin.from("departments").select("id, name").is("deleted_at", null).order("name"),
      supabaseAdmin.from("roles").select("code, name").is("deleted_at", null).order("name"),
    ]);

    return {
      trusts: (trusts ?? []) as ScopeOption[],
      colleges: (colleges ?? []) as ScopeOption[],
      departments: (departments ?? []) as ScopeOption[],
      roles: (roles ?? []) as { code: string; name: string }[],
    };
  });

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

export const createPortalUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown): CreatePortalUserInput => input as CreatePortalUserInput)
  .handler(async ({ data: input, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertGlobalAdmin(supabaseAdmin, context.userId);

    if (!input.email || !input.password || !input.roleCode || !input.scopeType) {
      throw new Error("Email, password, role, and scope are required.");
    }
    if (input.password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }
    assertRoleScopeSane(input.roleCode, input.scopeType);

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { first_name: input.firstName, last_name: input.lastName },
    });
    if (createErr) throw new Error(createErr.message);

    const newUserId = created.user?.id;
    if (!newUserId) throw new Error("User creation did not return an id.");

    const { data: role, error: roleErr } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("code", input.roleCode)
      .maybeSingle();
    if (roleErr) throw new Error(roleErr.message);
    if (!role) throw new Error(`Unknown role code: ${input.roleCode}`);

    const { error: assignErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: newUserId,
      role_id: role.id,
      scope_type: input.scopeType as "global" | "trust" | "college" | "department",
      trust_id: input.scopeType === "trust" ? input.trustId : null,
      college_id: input.scopeType === "college" ? input.collegeId : null,
      department_id: input.scopeType === "department" ? input.departmentId : null,
      status: "published",
      created_by: context.userId,
    });
    if (assignErr) throw new Error(assignErr.message);

    return { userId: newUserId };
  });

interface AssignRoleInput {
  userId: string;
  roleCode: string;
  scopeType: string;
  trustId?: string | null;
  collegeId?: string | null;
  departmentId?: string | null;
}

export const assignPortalUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown): AssignRoleInput => input as AssignRoleInput)
  .handler(async ({ data: input, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertGlobalAdmin(supabaseAdmin, context.userId);
    assertRoleScopeSane(input.roleCode, input.scopeType);

    const { data: role, error: roleErr } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("code", input.roleCode)
      .maybeSingle();
    if (roleErr) throw new Error(roleErr.message);
    if (!role) throw new Error(`Unknown role code: ${input.roleCode}`);

    const { error: assignErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: input.userId,
      role_id: role.id,
      scope_type: input.scopeType as "global" | "trust" | "college" | "department",
      trust_id: input.scopeType === "trust" ? input.trustId : null,
      college_id: input.scopeType === "college" ? input.collegeId : null,
      department_id: input.scopeType === "department" ? input.departmentId : null,
      status: "published",
      created_by: context.userId,
    });
    if (assignErr) throw new Error(assignErr.message);

    return { ok: true };
  });

export const removePortalUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((userRoleId: unknown): string => userRoleId as string)
  .handler(async ({ data: userRoleId, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertGlobalAdmin(supabaseAdmin, context.userId);

    const { error } = await supabaseAdmin
      .from("user_roles")
      .update({ deleted_at: new Date().toISOString(), deleted_by: context.userId, status: "archived" })
      .eq("id", userRoleId);
    if (error) throw new Error(error.message);

    return { ok: true };
  });

interface UpdateProfileInput {
  userId: string;
  firstName: string;
  lastName: string;
}

export const updatePortalUserProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown): UpdateProfileInput => input as UpdateProfileInput)
  .handler(async ({ data: input, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertGlobalAdmin(supabaseAdmin, context.userId);

    const { error } = await supabaseAdmin
      .from("user_profiles")
      .update({
        first_name: input.firstName,
        last_name: input.lastName,
        updated_by: context.userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.userId);
    if (error) throw new Error(error.message);

    return { ok: true };
  });

interface ResetPasswordInput {
  userId: string;
  newPassword: string;
}

export const adminSetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown): ResetPasswordInput => input as ResetPasswordInput)
  .handler(async ({ data: input, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertGlobalAdmin(supabaseAdmin, context.userId);

    if (!input.newPassword || input.newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(input.userId, {
      password: input.newPassword,
    });
    if (error) throw new Error(error.message);

    return { ok: true };
  });
