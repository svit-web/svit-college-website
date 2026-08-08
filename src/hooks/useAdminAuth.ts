import { useEffect, useState, useCallback, useRef } from "react";
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

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
  [key: string]: unknown;
}

// Allowed admin-level role codes — only these grant portal access
const AUTHORIZED_ROLE_CODES = ["admin", "editor", "department_admin", "college_admin"] as const;

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Ref to prevent duplicate concurrent checkAuth calls
  const checkingRef = useRef(false);

  const checkAuth = useCallback(async (currentUserId?: string) => {
    // Guard against duplicate concurrent invocations
    if (checkingRef.current) return;
    checkingRef.current = true;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(true);
        setUser(null);
        setProfile(null);
        setRoles([]);
        setIsAuthorized(false);
        return;
      }

      const sessionUser = session.user;

      // Skip re-fetch if user hasn't changed (e.g. token refresh, or a
      // tab-focus SIGNED_IN re-fire for the same session). Checked before
      // setLoading(true) so an unchanged session never flips the admin
      // portal into its full-screen loading state.
      if (currentUserId && currentUserId === sessionUser.id) {
        return;
      }

      setLoading(true);
      setUser(sessionUser);

      // Fetch profile + roles in parallel
      const [profileResult, rolesResult] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .maybeSingle(),
        supabase
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
          .eq("user_id", sessionUser.id)
          .eq("status", "published")
      ]);

      setProfile((profileResult.data as UserProfile) || null);

      const formattedRoles: AdminRole[] = ((rolesResult.data as any[]) || []).map((ur: any) => ({
        code: ur.role?.code || "",
        name: ur.role?.name || "",
        scope_type: ur.scope_type,
        trust_id: ur.trust_id,
        college_id: ur.college_id,
        department_id: ur.department_id,
      }));

      setRoles(formattedRoles);

      // Only authorize users with explicitly permitted role codes
      const hasAuthorizedRole = formattedRoles.some((r) =>
        (AUTHORIZED_ROLE_CODES as readonly string[]).includes(r.code)
      );
      setIsAuthorized(hasAuthorizedRole);
    } catch (err) {
      // Don't leak auth errors to console in production
      setIsAuthorized(false);
    } finally {
      setLoading(false);
      checkingRef.current = false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let currentUserId: string | undefined;

    async function init() {
      await checkAuth();
      // Track current user ID after initial check to skip token refresh re-fetches
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) currentUserId = session?.user?.id;
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_IN") {
          // Re-check, but skip the loading flash if it's the same user
          // (supabase-js re-fires SIGNED_IN with the same session on tab focus)
          await checkAuth(currentUserId);
          currentUserId = session?.user?.id;
        } else if (event === "TOKEN_REFRESHED") {
          // Skip re-fetch if it's the same user — token refreshes happen every hour
          if (session?.user?.id === currentUserId) return;
          await checkAuth(currentUserId);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setRoles([]);
          setIsAuthorized(false);
          setLoading(false);
          currentUserId = undefined;
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkAuth]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

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
