import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface AdminRole {
  code: string;
  name: string;
  scope_type: string;
  trust_id?: string | null;
  college_id?: string | null;
  department_id?: string | null;
}

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (mounted) {
            setUser(null);
            setProfile(null);
            setRoles([]);
            setIsAuthorized(false);
            setLoading(false);
          }
          return;
        }

        const currentUser = session.user;
        if (mounted) setUser(currentUser);

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        }

        if (mounted) setProfile(profileData);

        // Fetch roles
        const { data: userRolesData, error: rolesError } = await supabase
          .from("user_roles")
          .select(`
            scope_type,
            trust_id,
            college_id,
            department_id,
            role:role_id (
              code,
              name
            )
          `)
          .eq("user_id", currentUser.id)
          .eq("status", "published");

        if (rolesError) {
          console.error("Error fetching user roles:", rolesError);
        }

        const formattedRoles: AdminRole[] = (userRolesData || []).map((ur: any) => ({
          code: ur.role?.code || "",
          name: ur.role?.name || "",
          scope_type: ur.scope_type,
          trust_id: ur.trust_id,
          college_id: ur.college_id,
          department_id: ur.department_id,
        }));

        if (mounted) {
          setRoles(formattedRoles);
          // Authorized if user has any active role (like admin, editor, etc.)
          const hasRole = formattedRoles.length > 0;
          setIsAuthorized(hasRole);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          checkAuth();
        } else if (event === "SIGNED_OUT") {
          if (mounted) {
            setUser(null);
            setProfile(null);
            setRoles([]);
            setIsAuthorized(false);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    profile,
    roles,
    loading,
    isAuthorized,
    isAdmin: roles.some((r) => r.code === "admin"),
    isEditor: roles.some((r) => r.code === "editor" || r.code === "admin"),
    logout,
  };
}
