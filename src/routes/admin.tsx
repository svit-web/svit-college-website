import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

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
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium text-slate-400 animate-pulse">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  // If we are on the login page, render login directly
  if (isLoginPage) {
    return <Outlet />;
  }

  // If not authorized and not on login page, render nothing while redirecting
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <AdminSidebar user={user} profile={profile} roles={roles} logout={logout} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader profile={profile} roles={roles} logout={logout} />
        <main className="flex-1 overflow-y-auto bg-slate-900/40 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
