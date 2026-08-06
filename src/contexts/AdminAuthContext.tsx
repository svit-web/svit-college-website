import { createContext, useContext, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { AdminRole, UserProfile } from "@/hooks/useAdminAuth";

export interface AdminAuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  roles: AdminRole[];
  loading: boolean;
  isAuthorized: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({
  value,
  children,
}: {
  value: AdminAuthContextValue;
  children: ReactNode;
}) {
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuthContext(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuthContext must be used within AdminAuthProvider");
  return ctx;
}
