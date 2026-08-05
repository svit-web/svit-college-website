// Generic key/value app_settings table access. For now the only key in use
// is "image_compression_mode" ("client" | "server"), toggled from
// /admin/settings. Reads are public (matches app_settings' RLS policy);
// writes are gated to global admins, re-checked server-side — never trust a
// client-supplied isAdmin flag for a privileged write.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabase } from "@/integrations/supabase/client";

export type ImageCompressionMode = "client" | "server";

const IMAGE_COMPRESSION_MODE_KEY = "image_compression_mode";

export const getImageCompressionMode = createServerFn({ method: "GET" }).handler(
  async (): Promise<ImageCompressionMode> => {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", IMAGE_COMPRESSION_MODE_KEY)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data?.value === "server" ? "server" : "client";
  }
);

export const setImageCompressionMode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((mode: unknown): ImageCompressionMode => {
    if (mode !== "client" && mode !== "server") {
      throw new Error('Invalid mode: expected "client" or "server"');
    }
    return mode;
  })
  .handler(async ({ data: mode, context }) => {
    // requireSupabaseAuth only proves who the caller is (context.userId) —
    // role authorization for this privileged write still has to happen here.
    const { data: roleRows, error: roleErr } = await context.supabase
      .from("user_roles")
      .select("scope_type, role:role_id(code)")
      .eq("user_id", context.userId)
      .eq("status", "published");
    if (roleErr) throw new Error(roleErr.message);

    const isGlobalAdmin = (roleRows ?? []).some(
      (r: any) => r.role?.code === "admin" && r.scope_type === "global"
    );
    if (!isGlobalAdmin) {
      throw new Error("Forbidden: only a global admin can change this setting.");
    }

    const { error: upsertErr } = await context.supabase.from("app_settings").upsert({
      key: IMAGE_COMPRESSION_MODE_KEY,
      value: mode,
      updated_at: new Date().toISOString(),
      updated_by: context.userId,
    });
    if (upsertErr) throw new Error(upsertErr.message);

    return { mode };
  });
