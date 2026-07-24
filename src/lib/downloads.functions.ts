import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

function serverClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (
          (key.startsWith('sb_publishable_') || key.startsWith('sb_secret_')) &&
          headers.get('Authorization') === `Bearer ${key}`
        ) {
          headers.delete('Authorization');
        }
        headers.set('apikey', key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const getAllDownloads = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from('downloads')
    .select('id, title, file_url, file_type, category, metadata')
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('category')
    .order('title');
  if (error) throw new Error(error.message);
  return data ?? [];
});
