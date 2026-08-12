import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/integrations/supabase/types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          // Get cookie from document.cookie
          const cookies = document.cookie.split(';');
          const cookie = cookies.find((c) => c.trim().startsWith(name + '='));
          return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined;
        },
        set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string }) {
          // Set cookie via document.cookie
          let cookie = `${name}=${encodeURIComponent(value)}`;
          if (options.path) cookie += `; path=${options.path}`;
          if (options.maxAge) cookie += `; max-age=${options.maxAge}`;
          if (options.domain) cookie += `; domain=${options.domain}`;
          document.cookie = cookie;
        },
        remove(name: string, options: { path?: string; domain?: string }) {
          // Remove cookie by setting max-age=0
          let cookie = `${name}=; max-age=0`;
          if (options.path) cookie += `; path=${options.path}`;
          if (options.domain) cookie += `; domain=${options.domain}`;
          document.cookie = cookie;
        },
      },
    }
  );
}
