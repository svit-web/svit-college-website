import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { toast } from "sonner";
import {
  Building2,
  LayoutDashboard,
  Save,
  Loader2,
  UserCircle2,
  CheckCircle2,
  Phone,
  Mail,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/placement-cells")({
  component: PlacementCellsAdmin,
});

const COLLEGES = [
  { code: "overview",    label: "Overview",           icon: LayoutDashboard },
  { code: "svit-degree", label: "SVIT (Degree)",      icon: Building2 },
  { code: "svit-coa",    label: "COA (Architecture)", icon: Building2 },
  { code: "svica",       label: "SVICA (Applied Sci.)",icon: Building2 },
  { code: "svion",       label: "SVION (Nursing)",    icon: Building2 },
];

const emptyForm = {
  about_text: "",
  hero_title: "",
  hero_subtitle: "",
  officer_name: "",
  officer_designation: "",
  officer_phone: "",
  officer_email: "",
  officer_photo_url: "",
  default_student_placeholder_url: "",
};

type FormState = typeof emptyForm;

function PlacementCellsAdmin() {
  const sb = supabase as any;
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const fetchCell = useCallback(async (code: string) => {
    setLoading(true);
    const { data, error } = await sb
      .from("placement_cells")
      .select("*")
      .eq("college_code", code)
      .maybeSingle();
    if (error) {
      toast.error("Failed to load: " + error.message);
    } else if (data) {
      setForm({
        about_text: data.about_text || "",
        hero_title: data.hero_title || "",
        hero_subtitle: data.hero_subtitle || "",
        officer_name: data.officer_name || "",
        officer_designation: data.officer_designation || "",
        officer_phone: data.officer_phone || "",
        officer_email: data.officer_email || "",
        officer_photo_url: data.officer_photo_url || "",
        default_student_placeholder_url: data.default_student_placeholder_url || "",
      });
    } else {
      setForm(emptyForm);
    }
    setLoading(false);
  }, [sb]);

  useEffect(() => {
    fetchCell(activeTab);
  }, [activeTab, fetchCell]);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      college_code: activeTab,
      about_text: form.about_text,
      hero_title: form.hero_title || null,
      hero_subtitle: form.hero_subtitle || null,
      officer_name: form.officer_name || null,
      officer_designation: form.officer_designation || null,
      officer_phone: form.officer_phone || null,
      officer_email: form.officer_email || null,
      officer_photo_url: form.officer_photo_url || null,
      default_student_placeholder_url: form.default_student_placeholder_url || null,
    };
    const { error } = await sb
      .from("placement_cells")
      .upsert(payload, { onConflict: "college_code" });
    if (error) toast.error("Save failed: " + error.message);
    else toast.success("Placement cell saved successfully!");
    setSaving(false);
  };

  const set = (key: keyof FormState, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const activeCollege = COLLEGES.find((c) => c.code === activeTab)!;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-navy flex items-center gap-2">
          <UserCircle2 className="h-5 w-5 text-crimson" />
          Placement Cells Content
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Edit about text, hero banner, and placement officer info for each institution
        </p>
      </div>

      {/* College Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 pb-0">
        {COLLEGES.map((col) => {
          const Icon = col.icon;
          return (
            <button
              key={col.code}
              onClick={() => setActiveTab(col.code)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition",
                activeTab === col.code
                  ? "border-crimson text-crimson"
                  : "border-transparent text-slate-500 hover:text-navy"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {col.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-crimson" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-5">
            {/* Hero */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" /> Hero Banner
              </p>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-slate-500">Page Title</label>
                <input
                  value={form.hero_title}
                  onChange={(e) => set("hero_title", e.target.value)}
                  placeholder={`${activeCollege.label} — Placements`}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-slate-500">Subtitle</label>
                <input
                  value={form.hero_subtitle}
                  onChange={(e) => set("hero_subtitle", e.target.value)}
                  placeholder="Connecting talent with opportunity..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>
            </div>

            {/* About */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> About T&P Cell
              </p>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-slate-500">Description</label>
                <textarea
                  rows={6}
                  value={form.about_text}
                  onChange={(e) => set("about_text", e.target.value)}
                  placeholder="Describe the Training & Placement Cell for this institution..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Default student placeholder */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Default Student Placeholder
              </p>
              <MediaUploader
                value={form.default_student_placeholder_url}
                onChange={(url) => set("default_student_placeholder_url", url)}
                type="image"
                bucketName="media"
              />
              <p className="text-[10px] text-slate-400">Used as fallback when a student has no photo uploaded.</p>
            </div>
          </div>

          {/* Right column — Placement Officer */}
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <UserCircle2 className="h-3.5 w-3.5" /> Placement Officer
              </p>

              {/* Officer photo */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-slate-500">Officer Photo</label>
                <MediaUploader
                  value={form.officer_photo_url}
                  onChange={(url) => set("officer_photo_url", url)}
                  type="image"
                  bucketName="media"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-slate-500">Full Name</label>
                <input
                  value={form.officer_name}
                  onChange={(e) => set("officer_name", e.target.value)}
                  placeholder="e.g. Mr. Nilesh Patel"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-slate-500">Designation</label>
                <input
                  value={form.officer_designation}
                  onChange={(e) => set("officer_designation", e.target.value)}
                  placeholder="e.g. Training & Placement Officer"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-slate-500 flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Phone
                </label>
                <input
                  type="tel"
                  value={form.officer_phone}
                  onChange={(e) => set("officer_phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-slate-500 flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email
                </label>
                <input
                  type="email"
                  value={form.officer_email}
                  onChange={(e) => set("officer_email", e.target.value)}
                  placeholder="tpo@svitvasad.ac.in"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white hover:bg-navy/90 transition disabled:opacity-60"
            >
              {saving
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <CheckCircle2 className="h-4 w-4" />}
              {saving ? "Saving..." : `Save ${activeCollege.label} Cell`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
