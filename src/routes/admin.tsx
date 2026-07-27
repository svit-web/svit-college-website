import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Loader2, AlertTriangle } from "lucide-react";
import React from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

// ─── Error Boundary Component ────────────────────────────────────────────────
interface ErrorBoundaryState { hasError: boolean; error: Error | null }

class AdminErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center p-8">
          <div className="rounded-xl border border-rose-500/30 bg-rose-50 p-8 text-center max-w-lg shadow-sm">
            <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
            <h3 className="mt-4 text-base font-bold text-navy">Page Error</h3>
            <p className="mt-2 text-sm text-slate-600">
              This panel encountered an unexpected error. Please try refreshing.
            </p>
            <p className="mt-2 text-xs text-rose-600 font-mono break-all">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 rounded-md bg-navy px-4 py-2 text-xs text-white hover:bg-navy-light transition font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Route Loading Skeleton ───────────────────────────────────────────────────
function RouteLoadingSkeleton() {
  return (
    <div className="space-y-6 p-2">
      <div className="h-8 w-56 rounded-lg bg-slate-200 animate-pulse" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-200 animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-slate-200 animate-pulse" />
    </div>
  );
}

// ─── Admin Layout ─────────────────────────────────────────────────────────────
function AdminLayout() {
  const { user, profile, roles, loading, isAuthorized, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === "/admin/login";

  useEffect(() => {
    if (!loading) {
      if (!isAuthorized && !isLoginPage) {
        navigate({ to: "/admin/login" });
      } else if (isAuthorized && isLoginPage) {
        navigate({ to: "/admin" });
      }
    }
  }, [loading, isAuthorized, isLoginPage, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center admin-bg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-crimson" />
          <p className="text-sm font-medium text-navy animate-pulse">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  // Login page — render directly without layout shell
  if (isLoginPage) {
    return <Outlet />;
  }

  // Not authorized — return nothing while redirect fires
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <AdminSidebar user={user} profile={profile} roles={roles} logout={logout} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader profile={profile} roles={roles} logout={logout} />
        <main className="admin-scroll flex-1 overflow-y-auto admin-bg p-6 md:p-8">
          {/* ErrorBoundary catches any thrown errors in child routes */}
          <AdminErrorBoundary>
            {/* Suspense shows a skeleton while lazy route chunks load */}
            <Suspense fallback={<RouteLoadingSkeleton />}>
              <Outlet />
            </Suspense>
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}
