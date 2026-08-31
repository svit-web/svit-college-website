'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { BookOpen, Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { login, loginWithGoogle, requestPasswordReset } from './actions';
import { useFontScale } from '@/hooks/useFontScale';

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3.01h3.87c2.27-2.09 3.58-5.17 3.58-8.83Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.87-3.01c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A11.998 11.998 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A11.998 11.998 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.61l4 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  // No visible control here — just keeps the page in sync with whatever
  // admin font-size preference was last saved (e.g. arriving from the
  // dashboard after logging out), rather than inheriting the public site's.
  useFontScale('admin');
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  useEffect(() => {
    if (searchParams.get('error') === 'oauth') {
      toast.error('Google sign-in failed. Please try again.');
    }
  }, [searchParams]);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result?.error) {
        toast.error(result.error);
      }
      // On success, loginWithGoogle() redirects server-side.
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (resetMode) {
        const result = await requestPasswordReset(email);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Password reset email sent! Check your inbox.');
          setResetMode(false);
        }
      } else {
        const result = await login(email, password);
        if (result?.error) {
          toast.error(result.error);
        }
        // On success, login() redirects server-side.
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy via-navy-light to-navy-deep p-4 font-sans antialiased">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[700px] rounded-full bg-gold/10 blur-[150px]" />
        <div className="h-[300px] w-[400px] rounded-full bg-crimson/10 blur-[120px] translate-x-40 translate-y-40" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo Branding */}
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-gold/30 text-gold shadow-lg shadow-gold/20">
            <BookOpen className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white">
            SVIT <span className="text-gold">Vasad</span>
          </h2>
          <p className="mt-2 text-sm text-white/70">
            {resetMode ? 'Reset your portal password' : 'Sign in to administrative dashboard'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/95 backdrop-blur-xl p-8 shadow-2xl shadow-black/20">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-crimson/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            <span>Sign in with Google</span>
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {resetMode && (
              <div className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-xs text-gold-dark font-medium">
                Enter your email address and we'll send you a password reset link.
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                <input
                  required
                  type="email"
                  placeholder="admin@svitvasad.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-navy placeholder-slate-400 transition focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/20"
                />
              </div>
            </div>

            {!resetMode && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-xs font-medium text-crimson hover:text-crimson/80 transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm text-navy placeholder-slate-400 transition focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-2.5 right-3 text-slate-500 hover:text-navy transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-crimson py-3 text-sm font-semibold text-white shadow-lg shadow-crimson/30 transition hover:bg-crimson/90 focus:outline-none focus:ring-2 focus:ring-crimson focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{resetMode ? 'Send Reset Email' : 'Access Portal'}</span>
              )}
            </button>
          </form>

          {/* Toggle to reset mode / back */}
          <div className="mt-6 text-center">
            {resetMode ? (
              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="text-xs font-semibold text-slate-600 hover:text-crimson transition"
              >
                ← Back to sign in
              </button>
            ) : (
              <p className="text-xs text-slate-600">
                New admin accounts must be created by a system administrator.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
