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
            {resetMode ? "Reset your portal password" : "Sign in to administrative dashboard"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/95 backdrop-blur-xl p-8 shadow-2xl shadow-black/20">
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
                    type={showPassword ? "text" : "password"}
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
