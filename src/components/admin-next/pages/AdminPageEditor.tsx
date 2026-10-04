"use client";

// Dedicated editor for a `pages` singleton (about / admissions / alumni), per
// ADR 0003: the page's whole content is its metadata JSON, edited section by
// section with typed inputs — not as raw JSON in the generic tables screen.

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { AlertTriangle, FileText, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { MetadataEditor, type MetadataEditorGroup } from "@/components/admin-next/MetadataEditor";
import type { AdminUser } from "@/app/lib/auth/admin";

export function AdminPageEditor({
  slug,
  heading,
  description,
  groups,
  validate,
  admin,
}: {
  slug: string;
  heading: string;
  description: string;
  groups?: MetadataEditorGroup[];
  validate?: (value: any) => string | null;
  admin: AdminUser;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<any | null>(null);
  // A string here means the JSON view holds unparseable text — kept so the
  // draft survives re-renders; save is blocked until it parses.
  const [metadata, setMetadata] = useState<Record<string, any> | string>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("pages")
        .select("id, slug, title, status, metadata, updated_at")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      setRow(data);
      setMetadata(data?.metadata ?? {});
    } catch (err: any) {
      toast.error(`Failed to load the page: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!row) return;
    if (typeof metadata === "string") {
      toast.error("The JSON view has invalid JSON — fix the highlighted error before saving.");
      return;
    }
    if (validate) {
      const validationError = validate(metadata);
      if (validationError) {
        toast.error(`Invalid content — ${validationError}`);
        return;
      }
    }

    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("pages")
        .update({ metadata, updated_by: admin.id })
        .eq("id", row.id);
      if (error) throw error;

      // Best-effort audit trail, same as AdminCrudManager.
      try {
        await supabase.from("audit_logs").insert({
          user_id: admin.id,
          action: "UPDATE",
          table_name: "pages",
          record_id: row.id,
          old_values: row.metadata ?? {},
          new_values: metadata,
        } as any);
      } catch (err) {
        console.error("Failed to write to audit_logs:", err);
      }

      toast.success("Page content saved!");
      await load();
    } catch (err: any) {
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-crimson" />
      </div>
    );
  }

  if (!row) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
        <h2 className="mt-3 text-lg font-bold text-navy">No &quot;{slug}&quot; page row found</h2>
        <p className="mt-2 text-sm text-slate-600">
          The <code className="rounded bg-slate-100 px-1 font-mono text-xs">pages</code> table has
          no row with slug{" "}
          <code className="rounded bg-slate-100 px-1 font-mono text-xs">{slug}</code>. Create it
          first (Website CMS → the generic Pages table), then edit its content here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight text-navy md:text-3xl">
            <FileText className="h-7 w-7 text-crimson" />
            {heading}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${
              row.status === "published"
                ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                : "border-amber-300 bg-amber-100 text-amber-700"
            }`}
          >
            {row.status}
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded bg-crimson px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-crimson/20 hover:bg-crimson/90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <MetadataEditor
        value={metadata}
        onChange={(next) =>
          setMetadata(typeof next === "string" ? next : (next as Record<string, any>))
        }
        defaultOpen
        groups={groups}
      />
    </div>
  );
}
