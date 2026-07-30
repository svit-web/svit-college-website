import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Loader2, X,
  GraduationCap, Building2, Search, Filter,
  ImageIcon, User,
} from "lucide-react";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/placements")({
  component: PlacementsAdmin,
});

// ── Types ──────────────────────────────────────────────────────
interface College { id: string; slug: string; name: string }
interface Department { id: string; name: string; slug: string }
interface PlacedStudent {
  id: string;
  college_id: string;
  department_id: string | null;
  student_name: string;
  company_name: string;
  photo_url: string | null;
  batch_year: string | null;
  package_lpa: number | null;
  status: string;
  created_at: string;
  college?: { id: string; slug: string; name: string; short_code: string } | null;
  department?: { id: string; name: string } | null;
}

const emptyForm = {
  student_name: "",
  company_name: "",
  college_id: "",
  department_id: "",
  photo_url: "",
  batch_year: "",
  package_lpa: "",
  status: "published",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase() || "?";
}

// ── Main Component ─────────────────────────────────────────────
function PlacementsAdmin() {
  const sb = supabase as any;

  // ── State ────────────────────────────────────────────────────
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [students, setStudents] = useState<PlacedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterCollege, setFilterCollege] = useState("all");
  const [search, setSearch] = useState("");

  // ── Load colleges once ───────────────────────────────────────
  useEffect(() => {
    supabase
      .from("colleges")
      .select("id, slug, name")
      .eq("status", "published")
      .order("sort_order")
      .then(({ data }) => setColleges((data as unknown as College[]) ?? []));
  }, []);

  // ── Load departments when form college changes ────────────────
  useEffect(() => {
    if (!form.college_id) { setDepartments([]); return; }
    supabase
      .from("departments")
      .select("id, name, slug")
      .eq("college_id", form.college_id)
      .eq("status", "published")
      .order("name")
      .then(({ data }) => setDepartments((data as Department[]) ?? []));
  }, [form.college_id]);

  // ── Fetch students ───────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await sb
      .from("placed_students")
      .select("*, college:colleges(id, slug, name, short_code), department:departments(id, name)")
      .order("batch_year", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "PGRST205" || error.code === "42P01") {
        toast.error("placed_students table not found — run the SQL script first");
      } else {
        toast.error("Failed to load students: " + error.message);
      }
      setStudents([]);
    } else {
      setStudents((data ?? []) as PlacedStudent[]);
    }
    setLoading(false);
  }, [sb]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // ── Filtered view ────────────────────────────────────────────
  const filtered = students.filter(s => {
    const matchCollege = filterCollege === "all" || s.college_id === filterCollege;
    const matchSearch = search === "" ||
      s.student_name.toLowerCase().includes(search.toLowerCase()) ||
      s.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.department?.name ?? "").toLowerCase().includes(search.toLowerCase());
    return matchCollege && matchSearch;
  });

  // ── Group by college for display ─────────────────────────────
  const grouped = filtered.reduce<Record<string, PlacedStudent[]>>((acc, s) => {
    const key = s.college?.name ?? s.college_id;
    acc[key] = [...(acc[key] ?? []), s];
    return acc;
  }, {});

  // ── Form open/close ──────────────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, college_id: colleges[0]?.id ?? "" });
    setShowForm(true);
  };

  const openEdit = (s: PlacedStudent) => {
    setEditingId(s.id);
    setForm({
      student_name: s.student_name,
      company_name: s.company_name,
      college_id: s.college_id,
      department_id: s.department_id ?? "",
      photo_url: s.photo_url ?? "",
      batch_year: s.batch_year ?? "",
      package_lpa: s.package_lpa != null ? String(s.package_lpa) : "",
      status: s.status,
    });
    setShowForm(true);
  };

  // ── Save ─────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.student_name.trim()) { toast.error("Student name is required"); return; }
    if (!form.company_name.trim()) { toast.error("Company name is required"); return; }
    if (!form.college_id) { toast.error("Select an institute"); return; }

    setSaving(true);
    const payload = {
      student_name: form.student_name.trim(),
      company_name: form.company_name.trim(),
      college_id: form.college_id,
      department_id: form.department_id || null,
      photo_url: form.photo_url?.trim() || null,
      batch_year: form.batch_year.trim() || null,
      package_lpa: form.package_lpa ? parseFloat(form.package_lpa) : null,
      status: form.status,
    };

    if (editingId) {
      const { error } = await sb.from("placed_students").update(payload).eq("id", editingId);
      if (error) { toast.error("Update failed: " + error.message); }
      else { toast.success("Student updated!"); setShowForm(false); fetchStudents(); }
    } else {
      const { error } = await sb.from("placed_students").insert(payload);
      if (error) { toast.error("Insert failed: " + error.message); }
      else { toast.success("Student added!"); setShowForm(false); fetchStudents(); }
    }
    setSaving(false);
  };

  // ── Delete ───────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this student record? This cannot be undone.")) return;
    setDeleting(id);
    const { error } = await sb.from("placed_students").delete().eq("id", id);
    if (error) toast.error("Delete failed: " + error.message);
    else { toast.success("Deleted"); fetchStudents(); }
    setDeleting(null);
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-500" />
            Placed Students
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student placements — linked to institutes &amp; departments
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90 transition"
        >
          <Plus className="h-4 w-4" /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, company, dept..."
            className="w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-sm focus:border-crimson focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={filterCollege}
            onChange={e => setFilterCollege(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-700 focus:border-crimson focus:outline-none"
          >
            <option value="all">All Institutes</option>
            {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="text-xs text-slate-400 self-center ml-auto">
          {filtered.length} student{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Student Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-crimson" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center text-sm text-slate-400">
          No students found.{" "}
          <button onClick={openAdd} className="text-crimson underline">Add one</button>
        </div>
      ) : (
        Object.entries(grouped).map(([collegeName, list]) => (
          <div key={collegeName} className="space-y-3">
            {/* College heading */}
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-crimson shrink-0" />
              <h2 className="text-sm font-bold text-navy">{collegeName}</h2>
              <span className="rounded-full bg-navy/8 px-2 py-0.5 text-[10px] font-bold text-navy/50">
                {list.length}
              </span>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {list.map(s => (
                <div
                  key={s.id}
                  className="group relative flex flex-col overflow-hidden rounded-xl border-2 border-navy/10 bg-white hover:border-navy/30 transition-colors"
                >
                  {/* Photo */}
                  <div className="aspect-square w-full bg-slate-100 flex items-center justify-center overflow-hidden relative">
                    {s.photo_url ? (
                      <img src={s.photo_url} alt={s.student_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy/5 to-navy/15">
                        <span className="text-2xl font-bold text-navy/40">{initials(s.student_name)}</span>
                      </div>
                    )}
                    {/* Status badge */}
                    {s.status !== "published" && (
                      <span className="absolute top-1.5 right-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                        {s.status}
                      </span>
                    )}
                    {/* Hover actions */}
                    <div className="absolute inset-0 flex items-end justify-center gap-1.5 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                      <button
                        onClick={() => openEdit(s)}
                        className="rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-bold text-navy hover:bg-white transition"
                      >
                        <Pencil className="h-3 w-3 inline mr-0.5" />Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deleting === s.id}
                        className="rounded-lg bg-rose-500/90 px-2 py-1 text-[10px] font-bold text-white hover:bg-rose-500 transition"
                      >
                        {deleting === s.id
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <Trash2 className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2.5 text-center border-t border-navy/8">
                    <div className="font-semibold text-navy truncate text-xs">{s.student_name}</div>
                    {s.department?.name && (
                      <div className="text-[10px] font-medium text-crimson/80 truncate mt-0.5">{s.department.name}</div>
                    )}
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">@ {s.company_name}</div>
                    <div className="mt-1.5 flex items-center justify-center gap-1 flex-wrap">
                      {s.batch_year && (
                        <span className="rounded-full bg-navy/8 px-1.5 py-0.5 text-[9px] font-bold text-navy/60">{s.batch_year}</span>
                      )}
                      {s.package_lpa && (
                        <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">₹{s.package_lpa} LPA</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* ── Add / Edit Form Modal ─────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-bold text-navy text-base">
                {editingId ? "Edit Student" : "Add Placed Student"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Photo uploader */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" /> Student Photo
                </label>
                <MediaUploader
                  value={form.photo_url}
                  onChange={(url) => setForm(f => ({ ...f, photo_url: url }))}
                  type="image"
                  bucketName="media"
                />
              </div>

              {/* Student name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  <User className="h-3 w-3" /> Student Name <span className="text-rose-500">*</span>
                </label>
                <input
                  value={form.student_name}
                  onChange={e => setForm(f => ({ ...f, student_name: e.target.value }))}
                  placeholder="e.g. Raj Patel"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>

              {/* Institute dropdown — from DB */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Institute <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.college_id}
                  onChange={e => setForm(f => ({ ...f, college_id: e.target.value, department_id: "" }))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                >
                  <option value="">— Select institute —</option>
                  {colleges.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Department dropdown — filtered by selected college, from DB */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" /> Department / Programme
                </label>
                <select
                  value={form.department_id}
                  onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
                  disabled={!form.college_id || departments.length === 0}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none disabled:opacity-50"
                >
                  <option value="">— Select department (optional) —</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {form.college_id && departments.length === 0 && (
                  <p className="text-[10px] text-slate-400">No departments found for this institute</p>
                )}
              </div>

              {/* Company */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Placed At (Company) <span className="text-rose-500">*</span>
                </label>
                <input
                  value={form.company_name}
                  onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                  placeholder="e.g. Google, Amazon, Apollo Hospitals..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>

              {/* Batch year + Package */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Batch Year</label>
                  <input
                    value={form.batch_year}
                    onChange={e => setForm(f => ({ ...f, batch_year: e.target.value }))}
                    placeholder="e.g. 2024"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Package (LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.package_lpa}
                    onChange={e => setForm(f => ({ ...f, package_lpa: e.target.value }))}
                    placeholder="e.g. 12.5"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

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
