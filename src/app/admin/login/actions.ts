'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

function makeClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore if called from Server Component
          }
        },
      },
    }
  );
}

export async function login(email: string, password: string) {
  const cookieStore = await cookies();
  const supabase = makeClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect('/admin');
}

export async function loginWithGoogle() {
  const cookieStore = await cookies();
  const supabase = makeClient(cookieStore);
  const origin = (await headers()).get('origin');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/admin/auth/callback` },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(data.url);
}

export async function requestPasswordReset(email: string) {
  const cookieStore = await cookies();
  const supabase = makeClient(cookieStore);

  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  const supabase = makeClient(cookieStore);

  await supabase.auth.signOut();
  redirect('/admin/login');
}
