import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Lightweight backstop against a single IP looping on an expensive public
// route (e.g. /sitemap.xml, which fans out into 14 Supabase queries per hit —
// see docs/security/2026-10-19-traffic-incident-security-plan.md Phase 1b).
// Sliding-window-ish: a fixed 60s bucket per IP, reset when it rolls over.
//
// Caveat, deliberately not solved here: this is in-memory, per Node process.
// Correct for the current single-instance self-hosted deployment, but it
// silently stops protecting anything the moment this app runs as multiple
// replicas without moving the counter to shared storage — and it does
// nothing against a distributed (many-IP) attack, which belongs at
// Cloudflare, not in application code.
const RATE_LIMIT_MAX = 120; // requests
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
let requestsSinceSweep = 0;

// The Edge runtime middleware runs in has no setInterval/background timers,
// so sweep expired buckets opportunistically instead — otherwise every
// distinct IP ever seen (exactly what a flood of traffic produces) would sit
// in memory forever, the inverse of what this is supposed to prevent.
function sweepExpiredBuckets(now: number) {
  for (const [ip, bucket] of rateLimitBuckets) {
    if (now > bucket.resetAt) rateLimitBuckets.delete(ip);
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  requestsSinceSweep += 1;
  if (requestsSinceSweep >= 1000) {
    requestsSinceSweep = 0;
    sweepExpiredBuckets(now);
  }

  const bucket = rateLimitBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    rateLimitBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return new NextResponse('Too many requests', { status: 429 });
    }
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims() - it will error
  await supabase.auth.getClaims();

  return supabaseResponse;
}

export const config = {
  // Runs on every route except static assets. The Supabase session refresh
  // itself still only happens for /admin (branched inside the function body,
  // not here) — that stays scoped per optimization_plan.md A1 /
  // PERFORMANCE_REPORT.md, since only admin routes ever need it. Public
  // routes are back in the matcher only for the lightweight rate-limit check
  // above — see docs/security/2026-10-19-traffic-incident-security-plan.md
  // Phase 1b.
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
  ],
};
