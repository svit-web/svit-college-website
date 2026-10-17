// Shared server-side Supabase client for public content reads (no cookies,
// no auth context — the anon/publishable key relies on RLS's public SELECT
// policies). Used by *.functions.ts files for Server Component data fetching.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export function publicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (
          (key.startsWith("sb_publishable_") || key.startsWith("sb_secret_")) &&
          headers.get("Authorization") === `Bearer ${key}`
        ) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export function unwrap<T>(
  result: { data: T | null; error: { message: string } | null },
  label: string,
): T {
  if (result.error) {
    console.error(`Error fetching ${label}:`, result.error);
    throw result.error;
  }
  return result.data as T;
}
