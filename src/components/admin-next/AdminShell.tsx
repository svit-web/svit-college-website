'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import type { AdminUser } from '@/app/lib/auth/admin';
import { logout } from '@/app/admin/login/actions';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AdminErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
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
            <p className="mt-2 text-sm text-slate-600">This panel encountered an unexpected error. Please try refreshing.</p>
            <p className="mt-2 text-xs text-rose-600 font-mono break-all">{this.state.error?.message}</p>
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

export function AdminShell({
  admin,
  scopeLevel,
  children,
}: {
  admin: AdminUser;
  scopeLevel: 'global' | 'trust' | 'college' | 'department' | 'none';
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <AdminSidebar
        admin={admin}
        scopeLevel={scopeLevel}
        logout={logout}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AdminHeader admin={admin} logout={logout} onMobileMenuToggle={() => setMobileOpen((o) => !o)} />
        <main className="admin-scroll flex-1 overflow-y-auto admin-bg p-4 md:p-6 lg:p-8">
          <AdminErrorBoundary>
            <Suspense fallback={<RouteLoadingSkeleton />}>{children}</Suspense>
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}

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
