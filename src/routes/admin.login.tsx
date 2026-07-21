import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (resetMode) {
        // Password reset via email
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/admin/login`,
        });
        if (error) throw error;
        toast.success("Password reset email sent! Check your inbox.");
        setResetMode(false);
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back to SVIT Admin Portal!");
        navigate({ to: "/admin" });
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-sans antialiased text-slate-100">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950">
        <div className="h-[400px] w-[600px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white">
            SVIT Vasad
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {resetMode ? "Reset your portal password" : "Sign in to administrative dashboard"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {resetMode && (
              <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 text-xs text-indigo-300">
                Enter your email address and we'll send you a password reset link.
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                <input
                  required
                  type="email"
                  placeholder="admin@svitvasad.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/50 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-600 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {!resetMode && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-400">Password</label>
                  <button
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/50 py-2.5 pl-9 pr-10 text-sm text-white placeholder-slate-600 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-2.5 right-3 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{resetMode ? "Send Reset Email" : "Access Portal"}</span>
              )}
            </button>
          </form>

          {/* Toggle to reset mode / back */}
          <div className="mt-6 text-center">
            {resetMode ? (
              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="text-xs font-semibold text-slate-400 hover:text-indigo-400 transition"
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
