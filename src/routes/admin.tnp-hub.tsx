import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Sparkles, ExternalLink, Eye, EyeOff, Save, Plus, Trash2, Pencil,
  ImageIcon, GraduationCap, ShieldCheck, UserCircle2, BarChart3, FileText,
  Building2, CheckCircle2, LayoutDashboard, Quote, Star
} from "lucide-react";
import { MediaUploader } from "@/components/admin/MediaUploader";
import {
  getAllPlacementContent,
  saveAllPlacementContent,
  DEFAULT_HIGHLIGHTS,
  type FullPlacementData,
  type PlacementHighlight,
  type PlacementYearPoint,
  type PlacedStudent,
  type RecruiterItem,
  type PlacementTestimonial,
  type SectionVisibility,
} from "@/lib/placement.functions";

export const Route = createFileRoute("/admin/tnp-hub")({
  component: TnpMasterHub,
});

const ICON_OPTIONS = [
  "Target",
  "MessagesSquare",
  "Briefcase",
  "CalendarCheck",
  "UserCheck",
  "Award",
  "BookOpen",
  "GraduationCap",
  "Building2",
  "Sparkles",
  "CheckCircle2",
  "TrendingUp",
];

export function TnpMasterHub() {
  const [data, setData] = useState<FullPlacementData>(() => getAllPlacementContent());
  const [activeTab, setActiveTab] = useState<"toggles" | "hero" | "about" | "trend" | "students" | "recruiters" | "officer" | "testimonials">("toggles");

  // Reload data from localStorage on mount
  useEffect(() => {
    setData(getAllPlacementContent());
  }, []);

  const handleSave = () => {
    saveAllPlacementContent(data);
    toast.success("Training & Placement Cell content saved successfully!");
  };

  const updateSections = (key: keyof SectionVisibility, val: boolean) => {
    setData((prev) => ({
      ...prev,
      sectionConfig: {
        ...prev.sectionConfig,
        sections: {
          ...prev.sectionConfig.sections,
          [key]: val,
        },
      },
    }));
  };

  // ── Highlight Management ──────────────────────────────────────────
  const [newHighlightIcon, setNewHighlightIcon] = useState("Target");
  const [newHighlightLabel, setNewHighlightLabel] = useState("");

  const addHighlight = () => {
    if (!newHighlightLabel.trim()) {
      toast.error("Highlight label is required");
      return;
    }
    const item: PlacementHighlight = {
      id: `h_${Date.now()}`,
      icon: newHighlightIcon,
      label: newHighlightLabel.trim(),
    };
    setData((prev) => ({
      ...prev,
      sectionConfig: {
        ...prev.sectionConfig,
        highlights: [...(prev.sectionConfig?.highlights || []), item],
      },
    }));
    setNewHighlightLabel("");
    toast.success("Highlight added");
  };

  const deleteHighlight = (id: string) => {
    setData((prev) => ({
      ...prev,
      sectionConfig: {
        ...prev.sectionConfig,
        highlights: (prev.sectionConfig?.highlights || []).filter((h) => h.id !== id),
      },
    }));
  };

  // ── Trend Data Management ──────────────────────────────────────────
  const [newYear, setNewYear] = useState("2026");
  const [newPlaced, setNewPlaced] = useState("220");
  const [newPct, setNewPct] = useState("95");

  const addTrendYear = () => {
    if (!newYear.trim()) {
      toast.error("Year is required");
      return;
    }
    const point: PlacementYearPoint = {
      year: newYear.trim(),
      studentsPlaced: parseInt(newPlaced, 10) || 0,
      placementPercentage: parseFloat(newPct) || 0,
    };
    setData((prev) => ({
      ...prev,
      graphicalData: [...prev.graphicalData, point],
    }));
    setNewYear(`${parseInt(newYear, 10) + 1 || 2027}`);
    toast.success("Trend data point added");
  };

  const deleteTrendYear = (year: string) => {
    setData((prev) => ({
      ...prev,
      graphicalData: prev.graphicalData.filter((g) => g.year !== year),
    }));
  };

  // ── Student Cards Management ──────────────────────────────────────
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState<PlacedStudent>({
    id: "",
    studentName: "",
    companyName: "",
    batchYear: "2024",
    photo: null,
    collegeId: "svit",
  });

  const openAddStudent = () => {
    setEditingStudentId(null);
    setStudentForm({
      id: `s_${Date.now()}`,
      studentName: "",
      companyName: "",
      batchYear: "2024",
      photo: null,
      collegeId: "svit",
    });
    setShowStudentModal(true);
  };

  const openEditStudent = (s: PlacedStudent) => {
    setEditingStudentId(s.id);
    setStudentForm({ ...s });
    setShowStudentModal(true);
  };

  const saveStudent = () => {
    if (!studentForm.studentName.trim() || !studentForm.companyName.trim()) {
      toast.error("Student name and company name are required");
      return;
    }

    if (editingStudentId) {
      setData((prev) => ({
        ...prev,
        placedStudents: prev.placedStudents.map((s) => (s.id === editingStudentId ? studentForm : s)),
      }));
      toast.success("Student card updated");
    } else {
      setData((prev) => ({
        ...prev,
        placedStudents: [studentForm, ...prev.placedStudents],
      }));
      toast.success("Student card added");
    }
    setShowStudentModal(false);
  };

  const deleteStudent = (id: string) => {
    setData((prev) => ({
      ...prev,
      placedStudents: prev.placedStudents.filter((s) => s.id !== id),
    }));
    toast.success("Student card deleted");
  };

  // ── Recruiter Logos Management ──────────────────────────────────
  const [showRecruiterModal, setShowRecruiterModal] = useState(false);
  const [editingRecruiterId, setEditingRecruiterId] = useState<string | null>(null);
  const [recruiterForm, setRecruiterForm] = useState<RecruiterItem>({
    id: "",
    companyName: "",
    logo: null,
  });

  const openAddRecruiter = () => {
    setEditingRecruiterId(null);
    setRecruiterForm({
      id: `r_${Date.now()}`,
      companyName: "",
      logo: null,
    });
    setShowRecruiterModal(true);
  };

  const openEditRecruiter = (r: RecruiterItem) => {
    setEditingRecruiterId(r.id);
    setRecruiterForm({ ...r });
    setShowRecruiterModal(true);
  };

  const saveRecruiter = () => {
    if (!recruiterForm.companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    if (editingRecruiterId) {
      setData((prev) => ({
        ...prev,
        recruiters: prev.recruiters.map((r) => (r.id === editingRecruiterId ? recruiterForm : r)),
      }));
      toast.success("Recruiter logo updated");
    } else {
      setData((prev) => ({
        ...prev,
        recruiters: [...prev.recruiters, recruiterForm],
      }));
      toast.success("Recruiter logo added");
    }
    setShowRecruiterModal(false);
  };

  const deleteRecruiter = (id: string) => {
    setData((prev) => ({
      ...prev,
      recruiters: prev.recruiters.filter((r) => r.id !== id),
    }));
    toast.success("Recruiter deleted");
  };

  // ── Testimonials Management ──────────────────────────────────────
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [testimonialForm, setTestimonialForm] = useState<PlacementTestimonial>({
    id: "",
    studentName: "",
    designation: "Software Engineer",
    companyName: "",
    batchYear: "2024",
    departmentName: "Computer Engineering",
    quote: "",
    photoUrl: null,
    rating: 5,
  });

  const openAddTestimonial = () => {
    setEditingTestimonialId(null);
    setTestimonialForm({
      id: `t_${Date.now()}`,
      studentName: "",
      designation: "Software Engineer",
      companyName: "",
      batchYear: "2024",
      departmentName: "Computer Engineering",
      quote: "",
      photoUrl: null,
      rating: 5,
    });
    setShowTestimonialModal(true);
  };

  const openEditTestimonial = (t: PlacementTestimonial) => {
    setEditingTestimonialId(t.id);
    setTestimonialForm({ ...t });
    setShowTestimonialModal(true);
  };

  const saveTestimonial = () => {
    if (!testimonialForm.studentName.trim() || !testimonialForm.quote.trim()) {
      toast.error("Student name and quote are required");
      return;
    }

    if (editingTestimonialId) {
      setData((prev) => ({
        ...prev,
        testimonials: (prev.testimonials || []).map((t) => (t.id === editingTestimonialId ? testimonialForm : t)),
      }));
      toast.success("Testimonial updated");
    } else {
      setData((prev) => ({
        ...prev,
        testimonials: [testimonialForm, ...(prev.testimonials || [])],
      }));
      toast.success("Testimonial added");
    }
    setShowTestimonialModal(false);
  };

  const deleteTestimonial = (id: string) => {
    setData((prev) => ({
      ...prev,
      testimonials: (prev.testimonials || []).filter((t) => t.id !== id),
    }));
    toast.success("Testimonial deleted");
  };

  return (
    <div className="max-w-5xl space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-crimson" />
            Training &amp; Placement Hub Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full control over /placement hero, metric ticker, about block, trend statistics, placed student showcase, recruiter wall, officer contact card, and testimonials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/placement"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            Preview Public /placement
          </a>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-1.5 text-xs font-bold text-white hover:bg-navy/90 transition shadow-xs"
          >
            <Save className="h-3.5 w-3.5 text-gold" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Admin Tab Selector */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: "toggles", label: "Section Toggles", icon: Eye },
          { id: "hero", label: "Hero & Ticker", icon: LayoutDashboard },
          { id: "about", label: "About & Services", icon: FileText },
          { id: "trend", label: "Trend Graph", icon: BarChart3 },
          { id: "students", label: "Placed Students", icon: GraduationCap },
          { id: "recruiters", label: "Recruiters", icon: ShieldCheck },
          { id: "officer", label: "TNP Officer", icon: UserCircle2 },
          { id: "testimonials", label: "Testimonials", icon: Quote },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                isActive
                  ? "bg-navy text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: SECTION TOGGLES ───────────────────────────────── */}
      {activeTab === "toggles" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Public Section Toggles</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Toggle any of the body sections on or off. Disabled sections will be hidden on the public /placement page without code changes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {[
              { key: "about", label: "About T&P Cell Block", desc: "Highlights list & institutional overview card" },
              { key: "trend", label: "Year-on-Year Trend Chart", desc: "Interactive bar chart & summary stats" },
              { key: "placedStudents", label: "Placed Students Showcase", desc: "Student cards with photos & pagination" },
              { key: "recruiters", label: "Recruiting Partners Logo Wall", desc: "Partner logo grid with pagination" },
              { key: "officer", label: "T&P Officer Contact Card", desc: "Leadership details, phone & email" },
              { key: "testimonials", label: "Student Testimonials", desc: "Placed student quotes, ratings & reviews" },
            ].map((s) => {
              const key = s.key as keyof SectionVisibility;
              const isEnabled = data.sectionConfig?.sections?.[key] ?? true;
              return (
                <div
                  key={s.key}
                  className={`flex items-start justify-between rounded-xl border p-4 transition ${
                    isEnabled ? "border-navy/30 bg-navy/5" : "border-slate-200 bg-slate-50 opacity-60"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-navy flex items-center gap-1.5">
                      {isEnabled ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
                      {s.label}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">{s.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => updateSections(key, !isEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      isEnabled ? "bg-navy" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: HERO & TICKER ─────────────────────────────────── */}
      {activeTab === "hero" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Hero Banner &amp; Metric Ticker Data</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Hero Title</label>
              <input
                type="text"
                value={data.heroTitle}
                onChange={(e) => setData({ ...data, heroTitle: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-navy focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Hero Subtitle</label>
              <input
                type="text"
                value={data.heroSubtitle}
                onChange={(e) => setData({ ...data, heroSubtitle: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-navy focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Highest Package (Free text)</label>
              <input
                type="text"
                value={data.highestPackage}
                onChange={(e) => setData({ ...data, highestPackage: e.target.value })}
                placeholder="e.g. ₹42 LPA"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-navy focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Average Package (Free text)</label>
              <input
                type="text"
                value={data.averagePackage}
                onChange={(e) => setData({ ...data, averagePackage: e.target.value })}
                placeholder="e.g. ₹11.5 LPA"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-navy focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: ABOUT & SERVICES ──────────────────────────────── */}
      {activeTab === "about" && (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Institutional About Paragraph</h2>
            <textarea
              rows={4}
              value={data.aboutText}
              onChange={(e) => setData({ ...data, aboutText: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-800 focus:border-navy focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Support Services &amp; Highlight Badges</h2>

            {/* Add Highlight row */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <select
                value={newHighlightIcon}
                onChange={(e) => setNewHighlightIcon(e.target.value)}
                className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-800 focus:outline-none bg-white"
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={newHighlightLabel}
                onChange={(e) => setNewHighlightLabel(e.target.value)}
                placeholder="Highlight title/description..."
                className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none bg-white"
              />

              <button
                type="button"
                onClick={addHighlight}
                className="inline-flex items-center gap-1 rounded-lg bg-navy px-3 py-1.5 text-xs font-bold text-white hover:bg-navy/90 transition"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>

            {/* List */}
            <div className="space-y-2">
              {(data.sectionConfig?.highlights || []).map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-navy/10 px-2 py-0.5 text-[10px] font-bold text-navy">
                      {h.icon}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">{h.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteHighlight(h.id)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: TREND GRAPH ───────────────────────────────────── */}
      {activeTab === "trend" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Year-on-Year Trend Graph Points</h2>

          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">Year</label>
              <input
                type="text"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                placeholder="2026"
                className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-800 bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">Students Placed</label>
              <input
                type="number"
                value={newPlaced}
                onChange={(e) => setNewPlaced(e.target.value)}
                placeholder="220"
                className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-800 bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">Placement %</label>
              <input
                type="number"
                value={newPct}
                onChange={(e) => setNewPct(e.target.value)}
                placeholder="95"
                className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-800 bg-white"
              />
            </div>
            <button
              type="button"
              onClick={addTrendYear}
              className="inline-flex items-center gap-1 rounded-lg bg-navy px-3 py-1.5 text-xs font-bold text-white hover:bg-navy/90 transition mt-4"
            >
              <Plus className="h-3.5 w-3.5" /> Add Year Point
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
            {data.graphicalData.map((pt) => (
              <div
                key={pt.year}
                className="relative flex flex-col items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-center"
              >
                <button
                  type="button"
                  onClick={() => deleteTrendYear(pt.year)}
                  className="absolute top-1.5 right-1.5 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <div className="font-display text-base font-extrabold text-navy">{pt.year}</div>
                <div className="text-xs font-bold text-emerald-600 mt-1">{pt.placementPercentage}%</div>
                <div className="text-[10px] font-semibold text-slate-500 mt-0.5">{pt.studentsPlaced} Placed</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 5: PLACED STUDENTS ───────────────────────────────── */}
      {activeTab === "students" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Placed Student Cards</h2>
              <p className="text-xs text-slate-500">Manage student photos, company names, and batch years for the showcase grid.</p>
            </div>
            <button
              type="button"
              onClick={openAddStudent}
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-bold text-white hover:bg-navy/90 transition"
            >
              <Plus className="h-3.5 w-3.5 text-gold" /> Add Student
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {data.placedStudents.map((s) => (
              <div
                key={s.id}
                className="group relative flex flex-col items-center rounded-xl border border-slate-200 bg-white p-3 text-center hover:border-navy transition"
              >
                <div className="h-14 w-14 rounded-full bg-navy/10 overflow-hidden flex items-center justify-center mb-2">
                  {s.photo ? (
                    <img src={s.photo} alt={s.studentName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-bold text-xs text-navy">{s.studentName.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="text-xs font-bold text-navy truncate w-full">{s.studentName}</div>
                <div className="text-[11px] font-semibold text-slate-600 truncate w-full">{s.companyName}</div>
                <div className="text-[10px] text-slate-400 mt-1">Batch {s.batchYear}</div>

                <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => openEditStudent(s)}
                    className="p-1 text-slate-500 hover:text-navy"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteStudent(s.id)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: RECRUITERS ────────────────────────────────────── */}
      {activeTab === "recruiters" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recruiting Partner Logos</h2>
              <p className="text-xs text-slate-500">Manage corporate recruiter names and logos.</p>
            </div>
            <button
              type="button"
              onClick={openAddRecruiter}
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-bold text-white hover:bg-navy/90 transition"
            >
              <Plus className="h-3.5 w-3.5 text-gold" /> Add Recruiter
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {data.recruiters.map((r) => (
              <div
                key={r.id}
                className="group relative flex flex-col items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-center hover:border-navy transition"
              >
                <div className="h-10 w-full flex items-center justify-center">
                  {r.logo ? (
                    <img src={r.logo} alt={r.companyName} className="max-h-8 max-w-[80%] object-contain" />
                  ) : (
                    <span className="font-bold text-xs text-navy">{r.companyName}</span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-800 truncate w-full mt-2">{r.companyName}</div>

                <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => openEditRecruiter(r)}
                    className="p-1 text-slate-500 hover:text-navy"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRecruiter(r.id)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 7: OFFICER ───────────────────────────────────────── */}
      {activeTab === "officer" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Placement Officer &amp; Leadership Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Officer Photo</label>
              <MediaUploader
                value={data.officer.photo || ""}
                onChange={(url) =>
                  setData({
                    ...data,
                    officer: { ...data.officer, photo: url || null },
                  })
                }
                type="image"
              />
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Officer Name</label>
                <input
                  type="text"
                  value={data.officer.name}
                  onChange={(e) =>
                    setData({
                      ...data,
                      officer: { ...data.officer, name: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-navy focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Designation</label>
                <input
                  type="text"
                  value={data.officer.designation}
                  onChange={(e) =>
                    setData({
                      ...data,
                      officer: { ...data.officer, designation: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-navy focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Phone</label>
                  <input
                    type="text"
                    value={data.officer.phone}
                    onChange={(e) =>
                      setData({
                        ...data,
                        officer: { ...data.officer, phone: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-navy focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Email</label>
                  <input
                    type="text"
                    value={data.officer.email}
                    onChange={(e) =>
                      setData({
                        ...data,
                        officer: { ...data.officer, email: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-navy focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 8: TESTIMONIALS ──────────────────────────────────── */}
      {activeTab === "testimonials" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Student &amp; Alumni Testimonials</h2>
              <p className="text-xs text-slate-500">Manage student review quotes, designation, company, and ratings.</p>
            </div>
            <button
              type="button"
              onClick={openAddTestimonial}
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-bold text-white hover:bg-navy/90 transition"
            >
              <Plus className="h-3.5 w-3.5 text-gold" /> Add Testimonial
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(data.testimonials || []).map((t) => (
              <div
                key={t.id}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-navy transition shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: t.rating || 5 }).map((_, starIdx) => (
                        <Star key={starIdx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => openEditTestimonial(t)}
                        className="p-1 text-slate-500 hover:text-navy"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTestimonial(t.id)}
                        className="p-1 text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 italic font-medium leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-navy/10 overflow-hidden flex items-center justify-center shrink-0">
                    {t.photoUrl ? (
                      <img src={t.photoUrl} alt={t.studentName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-bold text-xs text-navy">{t.studentName.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 truncate">{t.studentName}</div>
                    <div className="text-[11px] font-semibold text-crimson truncate">{t.designation} @ {t.companyName}</div>
                    <div className="text-[10px] text-slate-400 truncate">{t.departmentName} &bull; Batch {t.batchYear}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Student Card */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingStudentId ? "Edit Placed Student Card" : "Add Placed Student Card"}
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Student Name</label>
                <input
                  type="text"
                  value={studentForm.studentName}
                  onChange={(e) => setStudentForm({ ...studentForm, studentName: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Company Name</label>
                <input
                  type="text"
                  value={studentForm.companyName}
                  onChange={(e) => setStudentForm({ ...studentForm, companyName: e.target.value })}
                  placeholder="e.g. Google"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Batch Year</label>
                  <input
                    type="text"
                    value={studentForm.batchYear}
                    onChange={(e) => setStudentForm({ ...studentForm, batchYear: e.target.value })}
                    placeholder="2024"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Division</label>
                  <select
                    value={studentForm.collegeId}
                    onChange={(e) => setStudentForm({ ...studentForm, collegeId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-white"
                  >
                    <option value="svit">SVIT (Degree)</option>
                    <option value="coa">COA (Architecture)</option>
                    <option value="svica">SVICA (Comp. Apps)</option>
                    <option value="svion">SVION (Nursing)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Student Photo</label>
                <MediaUploader
                  value={studentForm.photo || ""}
                  onChange={(url) => setStudentForm({ ...studentForm, photo: url || null })}
                  type="image"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStudentModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveStudent}
                className="rounded-lg bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-navy/90"
              >
                Save Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Recruiter Logo */}
      {showRecruiterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingRecruiterId ? "Edit Recruiter Logo" : "Add Recruiter Logo"}
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Company Name</label>
                <input
                  type="text"
                  value={recruiterForm.companyName}
                  onChange={(e) => setRecruiterForm({ ...recruiterForm, companyName: e.target.value })}
                  placeholder="e.g. TCS"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Company Logo</label>
                <MediaUploader
                  value={recruiterForm.logo || ""}
                  onChange={(url) => setRecruiterForm({ ...recruiterForm, logo: url || null })}
                  type="image"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRecruiterModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveRecruiter}
                className="rounded-lg bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-navy/90"
              >
                Save Recruiter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Testimonial */}
      {showTestimonialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingTestimonialId ? "Edit Testimonial" : "Add Testimonial"}
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Student Name</label>
                <input
                  type="text"
                  value={testimonialForm.studentName}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, studentName: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Job Title/Role</label>
                  <input
                    type="text"
                    value={testimonialForm.designation}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, designation: e.target.value })}
                    placeholder="e.g. Software Engineer"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Company Name</label>
                  <input
                    type="text"
                    value={testimonialForm.companyName}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, companyName: e.target.value })}
                    placeholder="e.g. Google"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Batch Year</label>
                  <input
                    type="text"
                    value={testimonialForm.batchYear}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, batchYear: e.target.value })}
                    placeholder="2024"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Department / Institute</label>
                  <input
                    type="text"
                    value={testimonialForm.departmentName}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, departmentName: e.target.value })}
                    placeholder="e.g. Computer Engineering"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Testimonial Quote</label>
                <textarea
                  rows={3}
                  value={testimonialForm.quote}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })}
                  placeholder="Share the student's feedback and experience..."
                  className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Student Photo (Optional)</label>
                <MediaUploader
                  value={testimonialForm.photoUrl || ""}
                  onChange={(url) => setTestimonialForm({ ...testimonialForm, photoUrl: url || null })}
                  type="image"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTestimonialModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveTestimonial}
                className="rounded-lg bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-navy/90"
              >
                Save Testimonial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
