'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { requireAdmin, isAdmin } from '@/app/lib/auth/admin';

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
export async function sendPasswordResetForUser(userId: string) {
  const admin = await requireAdmin();
  if (!isAdmin(admin)) {
    throw new Error('Forbidden: only a global admin can do this.');
  }

  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

  const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (userErr) throw new Error(userErr.message);

  const email = userData?.user?.email;
  if (!email) throw new Error('This user has no email on file to send a reset link to.');

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // no-op: this action never needs to mutate the caller's session cookies
        },
      },
    }
  );

  const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email);
  if (resetErr) throw new Error(resetErr.message);

  return { email };
}
