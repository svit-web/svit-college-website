import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  GraduationCap,
  Loader2,
  ImageIcon,
  Search,
  Building2,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/placements")(({
  component: PlacedStudentsAdmin,
}));

const COLLEGE_OPTIONS = [
  { value: "overview", label: "Overview (All Colleges)" },
  { value: "svit-degree", label: "SVIT (Degree)" },
  { value: "svit-coa", label: "COA (Architecture)" },
  { value: "svica", label: "SVICA (Applied Sciences)" },
  { value: "svion", label: "SVION (Nursing)" },
];

const STATUS_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

interface PlacedStudent {
  id: string;
  college_code: string;
  student_name: string;
  company_name: string;
  photo_url: string | null;
  status: string;
  created_at: string;
}

const emptyForm = {
  student_name: "",
  company_name: "",
  college_code: "svit-degree",
  photo_url: "",
  status: "published",
};

function PlacedStudentsAdmin() {
  const sb = supabase as any;

  const [students, setStudents] = useState<PlacedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCollege, setFilterCollege] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await sb
      .from("placed_students")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load students: " + error.message);
    else setStudents(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filtered = students.filter((s) => {
    const matchCollege = filterCollege === "all" || s.college_code === filterCollege;
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    const matchSearch =
      search === "" ||
      s.student_name.toLowerCase().includes(search.toLowerCase()) ||
      s.company_name.toLowerCase().includes(search.toLowerCase());
    return matchCollege && matchStatus && matchSearch;
  });

  // Group by college
  const grouped: Record<string, PlacedStudent[]> = {};
  filtered.forEach((s) => {
    const key = s.college_code;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (s: PlacedStudent) => {
    setEditingId(s.id);
    setForm({
      student_name: s.student_name,
      company_name: s.company_name,
      college_code: s.college_code,
      photo_url: s.photo_url || "",
      status: s.status,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.student_name.trim()) { toast.error("Student name is required"); return; }
    if (!form.company_name.trim()) { toast.error("Company name is required"); return; }
    setSaving(true);
    const payload = {
      student_name: form.student_name.trim(),
      company_name: form.company_name.trim(),
      college_code: form.college_code,
      photo_url: form.photo_url || null,
      status: form.status,
    };
    if (editingId) {
      const { error } = await sb.from("placed_students").update(payload).eq("id", editingId);
      if (error) toast.error("Update failed: " + error.message);
      else { toast.success("Student updated successfully"); setShowForm(false); fetchStudents(); }
    } else {
      const { error } = await sb.from("placed_students").insert(payload);
      if (error) toast.error("Insert failed: " + error.message);
      else { toast.success("Student added successfully"); setShowForm(false); fetchStudents(); }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete student "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    const { error } = await sb.from("placed_students").delete().eq("id", id);
    if (error) toast.error("Delete failed: " + error.message);
    else { toast.success("Student deleted"); fetchStudents(); }
    setDeleting(null);
  };

  const collegeLabelMap = Object.fromEntries(COLLEGE_OPTIONS.map(c => [c.value, c.label]));

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-500" />
            Placed Students Album
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student records and photos for each institution's placement page
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90 transition"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-sm text-slate-800 focus:border-crimson focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={filterCollege}
            onChange={(e) => setFilterCollege(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-700 focus:border-crimson focus:outline-none"
          >
            <option value="all">All Colleges</option>
            {COLLEGE_OPTIONS.filter(c => c.value !== "overview").map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-700 focus:border-crimson focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="text-xs text-slate-400 self-center ml-auto">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-crimson" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-white text-center">
          <GraduationCap className="h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No students found</p>
          <button onClick={openAdd} className="text-xs text-crimson underline hover:no-underline">Add the first student</button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([code, list]) => (
            <div key={code}>
              <div className="mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-navy/50" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-navy">
                  {collegeLabelMap[code] ?? code}
                </h2>
                <span className="ml-1 rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-bold text-navy">
                  {list.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {list.map((s) => (
                  <div
                    key={s.id}
                    className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white transition hover:border-navy/40 hover:shadow-md"
                  >
                    {/* Status badge */}
                    <div className={cn(
                      "absolute top-2 left-2 z-10 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                      s.status === "published" ? "bg-emerald-500/20 text-emerald-700" :
                      s.status === "draft" ? "bg-amber-500/20 text-amber-700" :
                      "bg-slate-400/20 text-slate-600"
                    )}>
                      {s.status}
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-1 right-1 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEdit(s)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow border border-slate-200 text-navy hover:bg-navy hover:text-white transition"
                        title="Edit"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.student_name)}
                        disabled={deleting === s.id}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow border border-slate-200 text-rose-500 hover:bg-rose-500 hover:text-white transition"
                        title="Delete"
                      >
                        {deleting === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      </button>
                    </div>

                    {/* Photo */}
                    <div className="aspect-square w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                      {s.photo_url ? (
                        <img src={s.photo_url} alt={s.student_name} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-slate-300" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 border-t border-slate-100 text-center">
                      <p className="font-semibold text-navy text-sm truncate">{s.student_name}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">@ {s.company_name}</p>
                    </div>
                  </div>
                ))}

                {/* Add new card shortcut */}
                <button
                  onClick={openAdd}
                  className="aspect-square flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 transition"
                >
                  <Plus className="h-6 w-6" />
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide">Add</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-y-auto max-h-[90vh]">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-bold text-navy text-base flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-500" />
                {editingId ? "Edit Student" : "Add New Student"}
              </h2>
              <button onClick={() => setShowForm(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Photo uploader */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Student Photo</label>
                <MediaUploader
                  value={form.photo_url}
                  onChange={(url) => setForm(f => ({ ...f, photo_url: url }))}
                  type="image"
                  bucketName="media"
                />
              </div>

              {/* Student Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Student Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={form.student_name}
                  onChange={(e) => setForm(f => ({ ...f, student_name: e.target.value }))}
                  placeholder="e.g. Raj Patel"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>

              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Placed At (Company) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))}
                  placeholder="e.g. Google, Amazon, TCS..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>

              {/* College */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Institution / College <span className="text-rose-500">*</span></label>
                <select
                  value={form.college_code}
                  onChange={(e) => setForm(f => ({ ...f, college_code: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                >
                  {COLLEGE_OPTIONS.filter(c => c.value !== "overview").map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Status</label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, status: opt.value }))}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                        form.status === opt.value
                          ? "border-navy bg-navy text-white"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-navy/40"
                      )}
                    >
                      {form.status === opt.value ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5 opacity-30" />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy/90 transition disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Save Changes" : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
