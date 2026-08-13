'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Sends a standard Supabase password-reset email to a user, looked up by
 * their user_profiles.id (== auth.users.id). Doesn't touch any table —
 * purely an auth-layer action, same flow as the public "forgot password".
 */
export async function sendPasswordResetForUser(userId: string) {
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
