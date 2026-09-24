import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/integrations/supabase/types';
import { revalidatePublicSite } from '@/app/admin/actions';

const WRITE_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);
let revalidateTimer: ReturnType<typeof setTimeout> | null = null;

// Public pages are prerendered, so an admin edit only shows up once the cache
// is dropped. Every admin save path goes through this client, so this is the
// one place that catches them all. Debounced so a CSV import or a batch of
// saves costs one revalidation, not one per row.
function schedulePublicRevalidation() {
  if (revalidateTimer) clearTimeout(revalidateTimer);
  revalidateTimer = setTimeout(() => {
    revalidateTimer = null;
    revalidatePublicSite().catch((err) => console.error('Public site revalidation failed', err));
  }, 400);
}

const revalidatingFetch: typeof fetch = async (input, init) => {
  const res = await fetch(input, init);
  if (typeof window === 'undefined' || !window.location.pathname.startsWith('/admin')) return res;

  const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  // Table writes only: RPCs here are reads, and a storage upload alone changes
  // nothing on the site until its URL is saved to a row.
  if (res.ok && WRITE_METHODS.has(method) && url.includes('/rest/v1/') && !url.includes('/rest/v1/rpc/')) {
    schedulePublicRevalidation();
  }
  return res;
};

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { fetch: revalidatingFetch } }
  );
}
