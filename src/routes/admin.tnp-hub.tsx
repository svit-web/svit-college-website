import { useState, useEffect, useCallback } from "react";
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
  { code: "svica", label: "SVICA (Applied Sci.)", link: "/placement/svica", desc: "Applied Sciences & MCA Placement Page" },
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
    supabase.from("colleges").select("id, slug, name").eq("status", "published").then(({ data }) => {
      setColleges((data as CollegeRecord[]) ?? []);
    });
    fetchOverviewContent();
    fetchStudents();
    fetchRecruiters();
  }, [fetchOverviewContent, fetchStudents, fetchRecruiters]);

  useEffect(() => {
    if (activeTab === "colleges") {
      fetchCollegeCellContent(activeCollegeCode);
    }
  }, [activeTab, activeCollegeCode, fetchCollegeCellContent]);

  // Save Overview Content
  const handleSaveOverview = async () => {
    setOverviewSaving(true);
    const payload = {
      college_code: "overview",
      hero_title: overviewForm.hero_title || null,
      hero_subtitle: overviewForm.hero_subtitle || null,
      about_text: overviewForm.about_text || null,
      officer_name: overviewForm.officer_name || null,
      officer_designation: overviewForm.officer_designation || null,
      officer_phone: overviewForm.officer_phone || null,
      officer_email: overviewForm.officer_email || null,
      officer_photo_url: overviewForm.officer_photo_url || null,
    };
    const { error } = await sb.from("placement_cells").upsert(payload, { onConflict: "college_code" });
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

  const activeCollegeObj = COLLEGE_PAGES.find(c => c.code === activeCollegeCode)!;
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

      {/* Main 2 Sections */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition",
            activeTab === "overview"
              ? "border-crimson text-crimson"
              : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          1. Overview Page (/placement/overview)
        </button>
        <button
          onClick={() => setActiveTab("colleges")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition",
            activeTab === "colleges"
              ? "border-crimson text-crimson"
              : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          <Building2 className="h-4 w-4" />
          2. College Student Cards (svit, coa, svica, svion)
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

          {/* Sub College Pill Switcher */}
          <div className="flex gap-1.5 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/60 p-1.5 scrollbar-none">
            {COLLEGE_PAGES.map(col => {
              const isActive = activeCollegeCode === col.code;
              return (
                <button
                  key={col.code}
                  onClick={() => setActiveCollegeCode(col.code)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap",
                    isActive
                      ? "bg-navy text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                  )}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  {col.label}
                </button>
              );
            })}
          </div>

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

    </div>
  );
}
