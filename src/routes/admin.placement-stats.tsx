import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  TrendingUp,
  X,
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/placement-stats")({
  component: PlacementStatsAdmin,
});

const COLLEGE_OPTIONS = [
  { value: "all",        label: "All Colleges" },
  { value: "svit-degree",label: "SVIT (Degree)" },
  { value: "svit-coa",   label: "COA (Architecture)" },
  { value: "svica",      label: "SVICA (Applied Sciences)" },
  { value: "svion",      label: "SVION (Nursing)" },
];

const COLLEGE_DEPT_MAP: Record<string, string> = {
  "svit-degree": "svit",
  "svit-coa":    "coa",
  "svica":       "svica",
  "svion":       "svion",
};

const emptyForm = {
  academic_year: "",
  college_code: "svit-degree",
  placed_students: "",
  total_students: "",
  highest_package: "",
  average_package: "",
  recruiters_count: "",
  status: "published",
};

interface StatRow {
  id: string;
  academic_year: string;
  placed_students: number;
  total_students: number;
  highest_package: number | null;
  average_package: number | null;
  recruiters_count: number | null;
  status: string;
  department?: { name: string; college?: { name: string; slug: string } };
  college_code?: string;
}

function PlacementStatsAdmin() {
  const sb = supabase as any;
  const [stats, setStats] = useState<StatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCollege, setFilterCollege] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [sortField, setSortField] = useState("academic_year");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const { data, error } = await sb
      .from("placement_statistics")
      .select("*, department:departments(name, college:colleges(name, slug))")
      .order(sortField, { ascending: sortDir === "asc" });
    if (error) toast.error("Failed to load stats: " + error.message);
    else setStats((data || []).map((s: any) => ({
      ...s,
      college_code: s.department?.college?.slug ?? "unknown",
    })));
    setLoading(false);
  }, [sb, sortField, sortDir]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const filtered = stats.filter((s) => {
    const matchCollege = filterCollege === "all" || s.college_code === filterCollege;
    const matchSearch = search === "" ||
      s.academic_year.includes(search) ||
      (s.department?.college?.name ?? "").toLowerCase().includes(search.toLowerCase());
    return matchCollege && matchSearch;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (row: StatRow) => {
    setEditingId(row.id);
    setForm({
      academic_year: row.academic_year,
      college_code: row.college_code ?? "svit-degree",
      placed_students: String(row.placed_students),
      total_students: String(row.total_students),
      highest_package: String(row.highest_package ?? ""),
      average_package: String(row.average_package ?? ""),
      recruiters_count: String(row.recruiters_count ?? ""),
      status: row.status,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.academic_year.trim()) { toast.error("Academic year is required"); return; }
    if (!form.placed_students)      { toast.error("Placed students count is required"); return; }
    setSaving(true);

    // Find the department_id for this college
    const { data: depts } = await sb
      .from("departments")
      .select("id, college:colleges(slug)")
      .eq("colleges.slug", COLLEGE_DEPT_MAP[form.college_code] ?? form.college_code)
      .limit(1);

    const dept_id = depts?.[0]?.id ?? null;

    const payload = {
      department_id: dept_id,
      academic_year: form.academic_year.trim(),
      placed_students: parseInt(form.placed_students) || 0,
      total_students: parseInt(form.total_students) || 0,
      highest_package: form.highest_package ? parseFloat(form.highest_package) : null,
      average_package: form.average_package ? parseFloat(form.average_package) : null,
      recruiters_count: form.recruiters_count ? parseInt(form.recruiters_count) : null,
      status: form.status,
    };

    if (editingId) {
      const { error } = await sb.from("placement_statistics").update(payload).eq("id", editingId);
      if (error) toast.error("Update failed: " + error.message);
      else { toast.success("Stats updated!"); setShowForm(false); fetchStats(); }
    } else {
      const { error } = await sb.from("placement_statistics").insert(payload);
      if (error) toast.error("Insert failed: " + error.message);
      else { toast.success("Stats added!"); setShowForm(false); fetchStats(); }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this placement stat row? This cannot be undone.")) return;
    setDeleting(id);
    const { error } = await sb.from("placement_statistics").delete().eq("id", id);
    if (error) toast.error("Delete failed: " + error.message);
    else { toast.success("Deleted"); fetchStats(); }
    setDeleting(null);
  };

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }: { field: string }) =>
    sortField === field
      ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)
      : <ChevronDown className="h-3 w-3 opacity-30" />;

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-sky-500" />
            Placement Statistics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Year-wise placement data powering charts and stat highlights</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90 transition"
        >
          <Plus className="h-4 w-4" /> Add Year Stats
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search year or college..."
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
            {COLLEGE_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="text-xs text-slate-400 self-center ml-auto">{filtered.length} row{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-crimson" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {[
                  { label: "Year",       field: "academic_year" },
                  { label: "College",    field: "college_code" },
                  { label: "Placed",     field: "placed_students" },
                  { label: "Total",      field: "total_students" },
                  { label: "% Placed",   field: null },
                  { label: "Highest Pkg",field: "highest_package" },
                  { label: "Avg Pkg",    field: "average_package" },
                  { label: "Companies",  field: "recruiters_count" },
                  { label: "Status",     field: "status" },
                  { label: "",           field: null },
                ].map((col, i) => (
                  <th
                    key={i}
                    onClick={col.field ? () => toggleSort(col.field!) : undefined}
                    className={cn(
                      "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500",
                      col.field && "cursor-pointer hover:text-navy select-none"
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.field && <SortIcon field={col.field} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-sm text-slate-400">
                    No stats found. <button onClick={openAdd} className="text-crimson underline">Add a row</button>
                  </td>
                </tr>
              ) : filtered.map((row) => {
                const pct = row.total_students > 0
                  ? Math.round((row.placed_students / row.total_students) * 100)
                  : 0;
                return (
                  <tr key={row.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-navy">{row.academic_year}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {row.department?.college?.name ?? row.college_code}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-navy">{row.placed_students}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{row.total_students}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-navy" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-navy">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {row.highest_package ? `₹${row.highest_package} LPA` : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {row.average_package ? `₹${row.average_package} LPA` : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{row.recruiters_count ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
                        row.status === "published" ? "bg-emerald-500/15 text-emerald-700" : "bg-slate-200 text-slate-500"
                      )}>{row.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(row)}
                          className="rounded p-1 text-slate-400 hover:bg-navy/10 hover:text-navy transition"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          disabled={deleting === row.id}
                          className="rounded p-1 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition"
                          title="Delete"
                        >
                          {deleting === row.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-bold text-navy text-base">
                {editingId ? "Edit Placement Stats" : "Add Year Stats"}
              </h2>
              <button onClick={() => setShowForm(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Academic Year *</label>
                  <input
                    value={form.academic_year}
                    onChange={e => setForm(f => ({...f, academic_year: e.target.value}))}
                    placeholder="e.g. 2024-25"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-crimson focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">College *</label>
                  <select
                    value={form.college_code}
                    onChange={e => setForm(f => ({...f, college_code: e.target.value}))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-crimson focus:outline-none"
                  >
                    {COLLEGE_OPTIONS.filter(c => c.value !== "all").map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Students Placed *</label>
                  <input type="number" value={form.placed_students} onChange={e => setForm(f => ({...f, placed_students: e.target.value}))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-crimson focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Total Students</label>
                  <input type="number" value={form.total_students} onChange={e => setForm(f => ({...f, total_students: e.target.value}))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-crimson focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Highest Package (LPA)</label>
                  <input type="number" step="0.1" value={form.highest_package} onChange={e => setForm(f => ({...f, highest_package: e.target.value}))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-crimson focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Average Package (LPA)</label>
                  <input type="number" step="0.1" value={form.average_package} onChange={e => setForm(f => ({...f, average_package: e.target.value}))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-crimson focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Companies Visited</label>
                  <input type="number" value={form.recruiters_count} onChange={e => setForm(f => ({...f, recruiters_count: e.target.value}))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-crimson focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-crimson focus:outline-none">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy/90 transition disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Save Changes" : "Add Stats"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
