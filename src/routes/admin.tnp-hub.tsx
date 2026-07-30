import { useState, useEffect, useCallback, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  GraduationCap,
  Building2,
  UserCircle2,
  FileText,
  ImageIcon,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Search,
  Filter,
  CheckCircle2,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/tnp-hub")({
  component: TnpMasterHub,
});

// ── College List for Per-College Pages ─────────────────────────
const COLLEGE_PAGES = [
  { code: "svit-degree", label: "SVIT (Degree)", link: "/placement/svit-degree", desc: "Engineering & Degree Placement Page" },
  { code: "svit-coa", label: "COA (Architecture)", link: "/placement/svit-coa", desc: "Architecture Placement Page" },
  { code: "svica", label: "SVICA (Comp. Apps)", link: "/placement/svica", desc: "Computer Applications Placement Page" },
  { code: "svion", label: "SVION (Nursing)", link: "/placement/svion", desc: "Nursing Placement Page" },
];

interface CollegeRecord { id: string; slug: string; name: string }
interface PlacedStudent {
  id: string;
  college_id: string;
  student_name: string;
  company_name: string;
  photo_url: string | null;
  batch_year: string | null;
  status: string;
  created_at: string;
  college?: CollegeRecord | null;
}

interface Recruiter {
  id: string;
  company_name: string;
  logo_url: string | null;
}

export function TnpMasterHub() {
  const sb = supabase as any;

  // Active Main Section: "overview" or "colleges"
  const [activeTab, setActiveTab] = useState<"overview" | "colleges">("overview");

  // Active College Page when in "colleges" tab
  const [activeCollegeCode, setActiveCollegeCode] = useState("svit-degree");

  // ── Overview Cell Content ────────────────────────────────────
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewSaving, setOverviewSaving] = useState(false);
  const [overviewForm, setOverviewForm] = useState({
    hero_title: "",
    hero_subtitle: "",
    about_text: "",
    officer_name: "",
    officer_designation: "",
    officer_phone: "",
    officer_email: "",
    officer_photo_url: "",
  });

  // ── College Cell Content ─────────────────────────────────────
  const [collegeCellLoading, setCollegeCellLoading] = useState(false);
  const [collegeCellSaving, setCollegeCellSaving] = useState(false);
  const [collegeCellForm, setCollegeCellForm] = useState({
    default_student_placeholder_url: "",
  });

  // ── Placed Students & Recruiters State ────────────────────────
  const [colleges, setColleges] = useState<CollegeRecord[]>([]);
  const [students, setStudents] = useState<PlacedStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [recruitersLoading, setRecruitersLoading] = useState(false);

  // Student Modal state
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState({
    company_name: "",
    batch_year: "2024",
    college_id: "",
    photo_url: "",
  });

  // Recruiter Modal state
  const [showRecruiterModal, setShowRecruiterModal] = useState(false);
  const [editingRecruiterId, setEditingRecruiterId] = useState<string | null>(null);
  const [recruiterForm, setRecruiterForm] = useState({ company_name: "", logo_url: "" });

  // New College Division Modal state
  const [showAddCollegeModal, setShowAddCollegeModal] = useState(false);
  const [addCollegeForm, setAddCollegeForm] = useState({ name: "", slug: "" });
  const [addCollegeSaving, setAddCollegeSaving] = useState(false);
  const [deletingDivision, setDeletingDivision] = useState(false);

  // Fetch Placement Divisions from placement_cells table
  const fetchPlacementDivisions = useCallback(async () => {
    const { data } = await sb
      .from("placement_cells")
      .select("college_code")
      .neq("college_code", "overview");

    const EXCLUDED_SLUGS = ["abc123", "svit-diploma", "thesilicon", "the-silicon", "diploma"];
    const valid: CollegeRecord[] = (data ?? [])
      .filter((pc: any) => !EXCLUDED_SLUGS.includes(pc.college_code))
      .map((pc: any) => {
        const slug = pc.college_code;
        let label = slug;
        if (slug === "svit-degree") label = "SVIT (Degree)";
        else if (slug === "svit-coa") label = "COA (Architecture)";
        else if (slug === "svica") label = "SVICA (Comp. Apps)";
        else if (slug === "svion") label = "SVION (Nursing)";
        return { id: slug, slug, name: label };
      });

    const defaults: CollegeRecord[] = [
      { id: "svit-degree", slug: "svit-degree", name: "SVIT (Degree)" },
      { id: "svit-coa", slug: "svit-coa", name: "COA (Architecture)" },
      { id: "svica", slug: "svica", name: "SVICA (Comp. Apps)" },
      { id: "svion", slug: "svion", name: "SVION (Nursing)" },
    ];
    const map = new Map<string, CollegeRecord>();
    defaults.forEach(d => map.set(d.slug, d));
    valid.forEach(v => map.set(v.slug, v));

    setColleges(Array.from(map.values()));
  }, [sb]);

  const handleDeleteCollegeDivision = async (code: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove the "${name}" placement division?`)) {
      return;
    }
    setDeletingDivision(true);

    const { error } = await sb.from("placement_cells").delete().eq("college_code", code);
    if (error) {
      toast.error("Failed to remove division: " + error.message);
      setDeletingDivision(false);
      return;
    }

    toast.success(`Removed ${name} division!`);
    setDeletingDivision(false);

    fetchPlacementDivisions();
    setActiveCollegeCode("svit-degree");
  };

  const handleAddCollegeDivision = async () => {
    if (!addCollegeForm.name.trim()) { toast.error("College Division Name is required"); return; }
    const rawSlug = addCollegeForm.slug.trim() || addCollegeForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    setAddCollegeSaving(true);

    const payload: Record<string, any> = {
      college_code: rawSlug,
      about_text: `The Training & Placement Cell at ${addCollegeForm.name.trim()} conducts career guidance programs and campus placement drives.`,
    };

    let { error: pcErr } = await sb.from("placement_cells").upsert(payload, { onConflict: "college_code" });

    // Fallback: minimal upsert with only college_code
    if (pcErr) {
      const fallbackRes = await sb.from("placement_cells").upsert({ college_code: rawSlug }, { onConflict: "college_code" });
      pcErr = fallbackRes.error;
    }

    if (pcErr) {
      toast.error("Failed to create division: " + pcErr.message);
      setAddCollegeSaving(false);
      return;
    }

    toast.success(`Created ${addCollegeForm.name.trim()} placement division!`);
    setShowAddCollegeModal(false);
    setAddCollegeForm({ name: "", slug: "" });
    setAddCollegeSaving(false);

    fetchPlacementDivisions();
    setActiveCollegeCode(rawSlug);
  };

  // ── 1. Fetch Overview Content ───────────────────────────────
  const fetchOverviewContent = useCallback(async () => {
    setOverviewLoading(true);
    const { data } = await sb
      .from("placement_cells")
      .select("*")
      .eq("college_code", "overview")
      .maybeSingle();

    if (data) {
      setOverviewForm({
        hero_title: data.hero_title || "",
        hero_subtitle: data.hero_subtitle || "",
        about_text: data.about_text || "",
        officer_name: data.officer_name || "",
        officer_designation: data.officer_designation || "",
        officer_phone: data.officer_phone || "",
        officer_email: data.officer_email || "",
        officer_photo_url: data.officer_photo_url || "",
      });
    }
    setOverviewLoading(false);
  }, [sb]);

  // ── 2. Fetch College Cell Content ───────────────────────────
  const fetchCollegeCellContent = useCallback(async (code: string) => {
    setCollegeCellLoading(true);
    const { data } = await sb
      .from("placement_cells")
      .select("default_student_placeholder_url")
      .eq("college_code", code)
      .maybeSingle();

    if (data) {
      setCollegeCellForm({
        default_student_placeholder_url: data.default_student_placeholder_url || "",
      });
    } else {
      setCollegeCellForm({ default_student_placeholder_url: "" });
    }
    setCollegeCellLoading(false);
  }, [sb]);

  // ── 3. Fetch Students & Recruiters ──────────────────────────
  const fetchStudents = useCallback(async () => {
    setStudentsLoading(true);
    const { data } = await sb
      .from("placed_students")
      .select("*, college:colleges(id, slug, name)")
      .order("created_at", { ascending: false });
    setStudents((data ?? []) as PlacedStudent[]);
    setStudentsLoading(false);
  }, [sb]);

  const fetchRecruiters = useCallback(async () => {
    setRecruitersLoading(true);
    const { data } = await sb
      .from("recruiters")
      .select("id, company_name, logo_url")
      .order("company_name", { ascending: true });
    setRecruiters((data ?? []) as Recruiter[]);
    setRecruitersLoading(false);
  }, [sb]);

  useEffect(() => {
    fetchPlacementDivisions();
    fetchOverviewContent();
    fetchStudents();
    fetchRecruiters();
  }, [fetchPlacementDivisions, fetchOverviewContent, fetchStudents, fetchRecruiters]);

  useEffect(() => {
    if (activeTab === "colleges") {
      fetchCollegeCellContent(activeCollegeCode);
    }
  }, [activeTab, activeCollegeCode, fetchCollegeCellContent]);

  // Save Overview Content
  const handleSaveOverview = async () => {
    setOverviewSaving(true);
    const payload: Record<string, any> = {
      college_code: "overview",
      about_text: overviewForm.about_text || null,
      officer_name: overviewForm.officer_name || null,
      officer_designation: overviewForm.officer_designation || null,
      officer_phone: overviewForm.officer_phone || null,
      officer_email: overviewForm.officer_email || null,
      officer_photo_url: overviewForm.officer_photo_url || null,
    };
    if (overviewForm.hero_title) payload.hero_title = overviewForm.hero_title;
    if (overviewForm.hero_subtitle) payload.hero_subtitle = overviewForm.hero_subtitle;

    let { error } = await sb.from("placement_cells").upsert(payload, { onConflict: "college_code" });

    // Fallback if hero_subtitle/hero_title columns don't exist yet on placement_cells schema cache
    if (error && (error.message.includes("column") || error.message.includes("schema cache"))) {
      delete payload.hero_title;
      delete payload.hero_subtitle;
      const fallbackRes = await sb.from("placement_cells").upsert(payload, { onConflict: "college_code" });
      error = fallbackRes.error;
    }

    if (error) toast.error("Save failed: " + error.message);
    else toast.success("Overview page content saved successfully!");
    setOverviewSaving(false);
  };

  // Save College Cell Content
  const handleSaveCollegeCell = async () => {
    setCollegeCellSaving(true);
    const payload = {
      college_code: activeCollegeCode,
      default_student_placeholder_url: collegeCellForm.default_student_placeholder_url || null,
    };
    const { error } = await sb.from("placement_cells").upsert(payload, { onConflict: "college_code" });
    if (error) toast.error("Save failed: " + error.message);
    else toast.success(`Saved ${activeCollegeCode.toUpperCase()} placeholder image!`);
    setCollegeCellSaving(false);
  };

  // Save Student Card
  const handleSaveStudent = async () => {
    if (!studentForm.company_name.trim()) { toast.error("Company Name is required"); return; }
    if (!studentForm.college_id) { toast.error("Select a college"); return; }

    const payload = {
      student_name: "Student",
      company_name: studentForm.company_name.trim(),
      batch_year: studentForm.batch_year.trim() || "2024",
      college_id: studentForm.college_id,
      photo_url: studentForm.photo_url.trim() || null,
      status: "published",
    };

    if (editingStudentId) {
      await sb.from("placed_students").update(payload).eq("id", editingStudentId);
      toast.success("Student card updated!");
    } else {
      await sb.from("placed_students").insert(payload);
      toast.success("Student card added!");
    }
    setShowStudentModal(false);
    fetchStudents();
  };

  // Delete Student Card
  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Delete this student card?")) return;
    await sb.from("placed_students").delete().eq("id", id);
    toast.success("Student card deleted");
    fetchStudents();
  };

  // Save Recruiter Logo
  const handleSaveRecruiter = async () => {
    if (!recruiterForm.company_name.trim()) { toast.error("Company Name is required"); return; }
    const payload = {
      company_name: recruiterForm.company_name.trim(),
      logo_url: recruiterForm.logo_url.trim() || null,
      status: "published",
    };
    if (editingRecruiterId) {
      await sb.from("recruiters").update(payload).eq("id", editingRecruiterId);
      toast.success("Recruiter logo updated!");
    } else {
      await sb.from("recruiters").insert(payload);
      toast.success("Recruiter logo added!");
    }
    setShowRecruiterModal(false);
    fetchRecruiters();
  };

  // Delete Recruiter Logo
  const handleDeleteRecruiter = async (id: string) => {
    if (!confirm("Delete this recruiter logo?")) return;
    await sb.from("recruiters").delete().eq("id", id);
    toast.success("Recruiter deleted");
    fetchRecruiters();
  };

  const dynamicCollegePages = useMemo(() => {
    const ORDER = ["svit-degree", "svit-coa", "svica", "svion"];
    const pageMap = new Map<string, { code: string; label: string; link: string; desc: string }>();

    // Seed default 4 colleges
    COLLEGE_PAGES.forEach(p => pageMap.set(p.code, p));

    // Merge database colleges
    (colleges || []).forEach(c => {
      let label = c.name;
      if (c.slug === "svit-degree") label = "SVIT (Degree)";
      else if (c.slug === "svit-coa") label = "COA (Architecture)";
      else if (c.slug === "svica") label = "SVICA (Comp. Apps)";
      else if (c.slug === "svion") label = "SVION (Nursing)";
      pageMap.set(c.slug, {
        code: c.slug,
        label,
        link: `/placement/${c.slug}`,
        desc: `${label} Placement Section`,
      });
    });

    const list = Array.from(pageMap.values());
    return list.sort((a, b) => {
      const idxA = ORDER.indexOf(a.code);
      const idxB = ORDER.indexOf(b.code);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  }, [colleges]);

  const activeCollegeObj = dynamicCollegePages.find(c => c.code === activeCollegeCode) || COLLEGE_PAGES[0];
  const currentCollegeDbId = colleges.find(c => c.slug === activeCollegeCode)?.id;
  const filteredStudentsForCollege = students.filter(s => s.college_id === currentCollegeDbId);

  return (
    <div className="max-w-5xl space-y-6 pb-20">

      {/* Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-crimson" />
            Placement Content Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage public content, officer contacts, recruiter logos, and student cards for <code className="text-crimson font-mono font-semibold">http://localhost:8080/placement</code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={activeTab === "overview" ? "/placement/overview" : activeCollegeObj.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" /> Preview Page
          </a>
        </div>
      </div>

      {/* Division Navigation Bar (Matches Frontend Dashboard 1-to-1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-xs">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap",
              activeTab === "overview"
                ? "bg-navy text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-crimson" />
            Overview
          </button>

          {dynamicCollegePages.map(col => {
            const isActive = activeTab === "colleges" && activeCollegeCode === col.code;
            return (
              <button
                key={col.code}
                onClick={() => {
                  setActiveCollegeCode(col.code);
                  setActiveTab("colleges");
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap",
                  isActive
                    ? "bg-navy text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Building2 className="h-3.5 w-3.5" />
                {col.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowAddCollegeModal(true)}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-navy/30 bg-slate-50 px-3 py-1.5 text-xs font-bold text-navy hover:bg-navy/5 transition shrink-0"
        >
          <Plus className="h-3.5 w-3.5 text-crimson" /> Add New Division
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* SECTION 1: OVERVIEW PAGE CONTROLS                        */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-5">

          {overviewLoading ? (
            <div className="flex h-36 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-crimson" />
            </div>
          ) : (
            <>
              {/* Card 1: Hero Banner */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-crimson" /> Overview Hero Banner
                  </h2>
                  <span className="text-[10px] text-slate-400">Top of /placement/overview</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Hero Title</label>
                    <input
                      value={overviewForm.hero_title}
                      onChange={e => setOverviewForm(f => ({ ...f, hero_title: e.target.value }))}
                      placeholder="SVIT Group — Placements"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-crimson focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Hero Subtitle</label>
                    <input
                      value={overviewForm.hero_subtitle}
                      onChange={e => setOverviewForm(f => ({ ...f, hero_subtitle: e.target.value }))}
                      placeholder="Connecting talent with opportunity..."
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-crimson focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: About T&P Cell Description */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-crimson" /> About T&amp;P Cell Paragraph
                  </h2>
                  <span className="text-[10px] text-slate-400">Section #about</span>
                </div>
                <div className="space-y-1">
                  <textarea
                    rows={4}
                    value={overviewForm.about_text}
                    onChange={e => setOverviewForm(f => ({ ...f, about_text: e.target.value }))}
                    placeholder="The Central Training & Placement Cell at SVIT Group facilitates student growth..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-crimson focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Card 3: TNP Officer & Coordinator (Last Section) */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCircle2 className="h-3.5 w-3.5 text-crimson" /> TNP Officer &amp; Coordinator (Last Section)
                  </h2>
                  <span className="text-[10px] text-slate-400">Section #officer</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Officer Photo</label>
                    <MediaUploader
                      value={overviewForm.officer_photo_url}
                      onChange={url => setOverviewForm(f => ({ ...f, officer_photo_url: url }))}
                      type="image"
                      bucketName="media"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Full Name</label>
                      <input
                        value={overviewForm.officer_name}
                        onChange={e => setOverviewForm(f => ({ ...f, officer_name: e.target.value }))}
                        placeholder="e.g. Training & Placement Officer"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-crimson focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Designation</label>
                      <input
                        value={overviewForm.officer_designation}
                        onChange={e => setOverviewForm(f => ({ ...f, officer_designation: e.target.value }))}
                        placeholder="e.g. Head - Training & Placement Cell"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-crimson focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Phone</label>
                        <input
                          value={overviewForm.officer_phone}
                          onChange={e => setOverviewForm(f => ({ ...f, officer_phone: e.target.value }))}
                          placeholder="+91 2692 274489"
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-crimson focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Email</label>
                        <input
                          value={overviewForm.officer_email}
                          onChange={e => setOverviewForm(f => ({ ...f, officer_email: e.target.value }))}
                          placeholder="tnp@svitvasad.ac.in"
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-crimson focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Overview Button */}
              <button
                onClick={handleSaveOverview}
                disabled={overviewSaving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-xs font-bold text-white hover:bg-navy/90 transition disabled:opacity-60 shadow-xs"
              >
                {overviewSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                {overviewSaving ? "Saving..." : "Save Overview Page Content"}
              </button>

              {/* Card 4: Recruiting Partners List */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 mt-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-crimson" /> Recruiting Partner Logos (Section #recruiters)
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setEditingRecruiterId(null);
                      setRecruiterForm({ company_name: "", logo_url: "" });
                      setShowRecruiterModal(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-navy px-3 py-1 text-xs font-bold text-white hover:bg-navy/90 transition"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Logo
                  </button>
                </div>

                {recruitersLoading ? (
                  <div className="flex h-24 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-crimson" />
                  </div>
                ) : recruiters.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No recruiter logos added yet.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                    {recruiters.map(r => (
                      <div key={r.id} className="group relative flex flex-col items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 text-center hover:border-crimson transition">
                        <div className="flex h-12 w-full items-center justify-center">
                          {r.logo_url ? (
                            <img src={r.logo_url} alt={r.company_name} className="max-h-8 w-full object-contain" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-slate-300" />
                          )}
                        </div>
                        <div className="mt-1 font-bold text-[10px] text-slate-900 truncate w-full">{r.company_name}</div>
                        <div className="mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingRecruiterId(r.id);
                              setRecruiterForm({ company_name: r.company_name, logo_url: r.logo_url || "" });
                              setShowRecruiterModal(true);
                            }}
                            className="p-1 text-slate-500 hover:text-navy"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button onClick={() => handleDeleteRecruiter(r.id)} className="p-1 text-rose-500 hover:text-rose-700">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* SECTION 2: 4 COLLEGE PLACEMENT PAGES                     */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === "colleges" && (
        <div className="space-y-5">

          {collegeCellLoading ? (
            <div className="flex h-36 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-crimson" />
            </div>
          ) : (
            <>
              {/* Single Unified Placed Students Album Cards (ONLY Photo + Company + Batch) */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-crimson" /> {activeCollegeObj.label} Placed Student Cards
                    </h2>
                    <p className="text-[10px] text-slate-400">Cards show ONLY student photo, company name, and batch year on frontend</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDeleteCollegeDivision(activeCollegeObj.code, activeCollegeObj.label)}
                      disabled={deletingDivision}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition disabled:opacity-50"
                      title="Remove this division"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove Division
                    </button>
                    <button
                      onClick={() => {
                        setEditingStudentId(null);
                        setStudentForm({
                          company_name: "",
                          batch_year: "2024",
                          college_id: currentCollegeDbId || "",
                          photo_url: "",
                        });
                        setShowStudentModal(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-navy px-3 py-1.5 text-xs font-bold text-white hover:bg-navy/90 transition shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Student Card
                    </button>
                  </div>
                </div>

                {studentsLoading ? (
                  <div className="flex h-24 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-crimson" />
                  </div>
                ) : filteredStudentsForCollege.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">
                    No student cards added for {activeCollegeObj.label} yet. Click <strong>Add Student Card</strong> above.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {filteredStudentsForCollege.map(s => (
                      <div
                        key={s.id}
                        className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white hover:border-crimson transition shadow-xs text-center"
                      >
                        {/* Student Photo Preview */}
                        <div className="aspect-square w-full bg-slate-100 flex items-center justify-center overflow-hidden relative">
                          {s.photo_url || collegeCellForm.default_student_placeholder_url ? (
                            <img
                              src={s.photo_url || collegeCellForm.default_student_placeholder_url}
                              alt={s.company_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy/5 to-navy/15">
                              <UserCircle2 className="h-10 w-10 text-navy/20" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-end justify-center gap-1 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
                            <button
                              onClick={() => {
                                setEditingStudentId(s.id);
                                setStudentForm({
                                  company_name: s.company_name,
                                  batch_year: s.batch_year || "2024",
                                  college_id: s.college_id,
                                  photo_url: s.photo_url || "",
                                });
                                setShowStudentModal(true);
                              }}
                              className="rounded bg-white px-2 py-0.5 text-[9px] font-bold text-navy hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(s.id)}
                              className="rounded bg-rose-500 px-2 py-0.5 text-[9px] font-bold text-white hover:bg-rose-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Public Card Info (Company + Batch) */}
                        <div className="p-2 border-t border-slate-100">
                          <div className="font-bold text-slate-900 truncate text-xs">{s.company_name}</div>
                          <div className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                            Batch {s.batch_year || "2024"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── MODAL: ADD / EDIT STUDENT CARD (Photo + Company + Batch + College) ── */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="font-bold text-slate-900 text-xs">
                {editingStudentId ? "Edit Student Placement Card" : "Add Student Placement Card"}
              </h2>
              <button onClick={() => setShowStudentModal(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Company Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Company Name <span className="text-rose-500">*</span></label>
                <input
                  value={studentForm.company_name}
                  onChange={e => setStudentForm(f => ({ ...f, company_name: e.target.value }))}
                  placeholder="e.g. Google, TCS, Apollo..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>

              {/* Batch Year */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Batch Year <span className="text-rose-500">*</span></label>
                <input
                  value={studentForm.batch_year}
                  onChange={e => setStudentForm(f => ({ ...f, batch_year: e.target.value }))}
                  placeholder="e.g. 2024"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>

              {/* Institute */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">College / Division <span className="text-rose-500">*</span></label>
                <select
                  value={studentForm.college_id}
                  onChange={e => setStudentForm(f => ({ ...f, college_id: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-crimson focus:outline-none"
                >
                  <option value="">— Select College —</option>
                  {colleges.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Student Photo */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Student Photo (Optional)</label>
                <MediaUploader
                  value={studentForm.photo_url}
                  onChange={url => setStudentForm(f => ({ ...f, photo_url: url }))}
                  type="image"
                  bucketName="media"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-2.5">
              <button onClick={() => setShowStudentModal(false)} className="rounded-lg px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button
                onClick={handleSaveStudent}
                className="rounded-lg bg-navy px-4 py-1.5 text-xs font-bold text-white hover:bg-navy/90 transition"
              >
                {editingStudentId ? "Save Changes" : "Add Card"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT RECRUITER ────────────────────────── */}
      {showRecruiterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xs rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="font-bold text-slate-900 text-xs">
                {editingRecruiterId ? "Edit Recruiter Logo" : "Add Recruiter Logo"}
              </h2>
              <button onClick={() => setShowRecruiterModal(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Company Name <span className="text-rose-500">*</span></label>
                <input
                  value={recruiterForm.company_name}
                  onChange={e => setRecruiterForm(f => ({ ...f, company_name: e.target.value }))}
                  placeholder="e.g. Tata Consultancy Services"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Company Logo Image</label>
                <MediaUploader
                  value={recruiterForm.logo_url}
                  onChange={url => setRecruiterForm(f => ({ ...f, logo_url: url }))}
                  type="image"
                  bucketName="media"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-2.5">
              <button onClick={() => setShowRecruiterModal(false)} className="rounded-lg px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button
                onClick={handleSaveRecruiter}
                className="rounded-lg bg-navy px-4 py-1.5 text-xs font-bold text-white hover:bg-navy/90 transition"
              >
                {editingRecruiterId ? "Save Changes" : "Add Logo"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── MODAL: ADD NEW COLLEGE DIVISION ────────────────────── */}
      {showAddCollegeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="font-bold text-slate-900 text-xs">Add New College Division</h2>
              <button onClick={() => setShowAddCollegeModal(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">College / Division Name <span className="text-rose-500">*</span></label>
                <input
                  value={addCollegeForm.name}
                  onChange={e => setAddCollegeForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. SVIT Pharmacy, SVIT Polytechnic..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">URL Slug (Optional)</label>
                <input
                  value={addCollegeForm.slug}
                  onChange={e => setAddCollegeForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="e.g. svit-pharmacy"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-crimson focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400">Leave blank to auto-generate from name</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-2.5">
              <button onClick={() => setShowAddCollegeModal(false)} className="rounded-lg px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button
                onClick={handleAddCollegeDivision}
                disabled={addCollegeSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-1.5 text-xs font-bold text-white hover:bg-navy/90 transition disabled:opacity-60"
              >
                {addCollegeSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {addCollegeSaving ? "Creating..." : "Create Division"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
