'use client';

import { createClient } from '@/app/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/auth-test');
      router.refresh();
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-card rounded-lg border shadow-lg">
        <h1 className="text-2xl font-bold text-navy mb-6 text-center">
          Admin Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="admin@svit.ac.in"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground mb-2">Test accounts (from seed_test_users.sql):</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <code className="bg-muted px-1 rounded">admin@svit.ac.in</code> - Global admin</li>
            <li>• <code className="bg-muted px-1 rounded">dept_admin@svit.ac.in</code> - Department scoped</li>
            <li>• <code className="bg-muted px-1 rounded">college_admin@svit.ac.in</code> - College scoped</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">Password: Check <code className="bg-muted px-1 rounded">testuser.md</code></p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-4 py-2 px-4 border border-input rounded-md text-muted-foreground hover:bg-muted"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
