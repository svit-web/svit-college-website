import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // Behind the reverse proxy, request.url's Host is the internal container
  // address, not the public domain — prefer the forwarded headers so
  // redirects point somewhere the browser can actually reach.
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';
  const redirectOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${redirectOrigin}/admin`);
    }
  }

  return NextResponse.redirect(`${redirectOrigin}/admin/login?error=oauth`);
}
