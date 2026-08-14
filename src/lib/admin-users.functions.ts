// Server-only actions for the Users & Profiles admin screen. These call the
// Supabase Auth Admin API (auth.users), which is never exposed via the
// public REST API — a service-role client is required, so this must stay
// server-side and never be imported into client-bundled route/component code.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertGlobalAdmin(supabaseAdmin: any, userId: string) {
  const { data: roleRows, error } = await supabaseAdmin
    .from("user_roles")
    .select("scope_type, role:role_id(code)")
    .eq("user_id", userId)
    .eq("status", "published");
  if (error) throw new Error(error.message);
  const ok = (roleRows ?? []).some((r: any) => r.role?.code === "admin" && r.scope_type === "global");
  if (!ok) throw new Error("Forbidden: only a global admin can do this.");
}

/**
 * Sends a standard Supabase password-reset email to a user, looked up by
 * their user_profiles.id (== auth.users.id). Doesn't touch any table —
 * purely an auth-layer action, same flow as the public "forgot password".
 *
 * Global-admin only: this uses the service-role client to resolve an
 * arbitrary auth.users.id to its email address and returns that email in
 * the response, so an unauthorized caller could otherwise use it to
 * enumerate user accounts / harvest email addresses, not just trigger a
 * reset email.
 */
export const sendPasswordResetForUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((userId: string) => userId)
  .handler(async ({ data: userId, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { supabase } = await import("@/integrations/supabase/client");

    await assertGlobalAdmin(supabaseAdmin, context.userId);

    const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr) throw new Error(userErr.message);

    const email = userData?.user?.email;
    if (!email) throw new Error("This user has no email on file to send a reset link to.");

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email);
    if (resetErr) throw new Error(resetErr.message);

    return { email };
  });
