import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Settings as SettingsIcon, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useImageCompressionMode, IMAGE_COMPRESSION_MODE_QUERY_KEY } from "@/hooks/useImageCompressionMode";
import { setImageCompressionMode } from "@/lib/app-settings.functions";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { roles, loading } = useAdminAuth();
  const isAdmin = roles.some((r) => r.code === "admin");
  const { mode, isLoading } = useImageCompressionMode();
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  if (!loading && !isAdmin) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-amber-600">
          <ShieldAlert className="h-4 w-4" />
          Global Admin access required
        </p>
        <p className="mt-1 text-sm text-slate-500">
          You don't have permission to view or change system settings.
        </p>
      </div>
    );
  }

  const handleToggle = async (checked: boolean) => {
    const nextMode = checked ? "server" : "client";
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await setImageCompressionMode({
        data: nextMode,
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });

      await queryClient.invalidateQueries({ queryKey: IMAGE_COMPRESSION_MODE_QUERY_KEY });
      toast.success(`Image compression now runs ${checked ? "server-side" : "in the browser"}.`);
    } catch (err: any) {
      toast.error(`Failed to update setting: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy md:text-3xl flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-crimson" />
          Settings
        </h1>
        <p className="text-sm text-slate-500">System-wide configuration. Global Admin only.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-navy">Server-side image compression</p>
            <p className="mt-1 text-sm text-slate-500 max-w-md">
              When on, uploaded images are compressed by a server function instead of in the
              browser. Both modes compress losslessly for PNGs and to near-lossless WebP for
              photos.
            </p>
            <p className="mt-2 text-xs text-amber-600">
              Temporarily unavailable: the WASM codecs used for compression don't yet load
              correctly under this app's Cloudflare Workers server runtime. Uploads always use
              browser-side compression until that's fixed.
            </p>
          </div>
          <Switch
            checked={mode === "server"}
            onCheckedChange={handleToggle}
            disabled
          />
        </div>
      </div>
    </div>
  );
}
