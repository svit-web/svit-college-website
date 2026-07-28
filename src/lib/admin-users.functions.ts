// Server-only actions for the Users & Profiles admin screen. These call the
// Supabase Auth Admin API (auth.users), which is never exposed via the
// public REST API — a service-role client is required, so this must stay
// server-side and never be imported into client-bundled route/component code.
import { createServerFn } from "@tanstack/react-start";

/**
 * Sends a standard Supabase password-reset email to a user, looked up by
 * their user_profiles.id (== auth.users.id). Doesn't touch any table —
 * purely an auth-layer action, same flow as the public "forgot password".
 */
export const sendPasswordResetForUser = createServerFn({ method: "POST" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { supabase } = await import("@/integrations/supabase/client");

    const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr) throw new Error(userErr.message);

    const email = userData?.user?.email;
    if (!email) throw new Error("This user has no email on file to send a reset link to.");

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email);
    if (resetErr) throw new Error(resetErr.message);

    return { email };
  });
