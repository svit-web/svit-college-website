import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { SITE_URL } from '@/lib/seo';

const TRUSTED_HOSTS = new Set([new URL(SITE_URL).hostname, 'localhost', '127.0.0.1']);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  // Behind the reverse proxy, request.url's Host is the internal container
  // address, not the public domain — prefer the forwarded headers so
  // redirects point somewhere the browser can actually reach. But that header
  // is attacker-controlled (any client can send it), so only trust it when it
  // names our own known host — otherwise an attacker could redirect a user
  // straight off an auth flow to an arbitrary domain. Falls back to SITE_URL,
  // not the raw container-internal `origin`, so a mismatch still produces a
  // real, reachable redirect instead of an internal address the browser can't resolve.
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';
  const redirectOrigin =
    forwardedHost && TRUSTED_HOSTS.has(forwardedHost.split(':')[0])
      ? `${forwardedProto}://${forwardedHost}`
      : SITE_URL;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${redirectOrigin}/admin`);
    }
  }

  return NextResponse.redirect(`${redirectOrigin}/admin/login?error=oauth`);
}
