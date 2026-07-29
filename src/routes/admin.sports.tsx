import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Trash2, Edit2, Loader2, Trophy, Medal } from "lucide-react";
import { toast } from "sonner";
import { MediaUploader } from "@/components/admin/MediaUploader";

export const Route = createFileRoute("/admin/sports")({
  component: AdminSportsPage,
});

const CATEGORIES = ["outdoor", "indoor", "aquatic", "combat"] as const;
const LEVELS = ["university", "state", "national", "international"] as const;

const LEVEL_COLORS: Record<string, string> = {
  international: "bg-purple-100 text-purple-700",
  national:      "bg-amber-100 text-amber-700",
  state:         "bg-blue-100 text-blue-700",
  university:    "bg-emerald-100 text-emerald-700",
};

const EMPTY_SPORT = {
  name: "",
  slug: "",
  category: "outdoor" as const,
  description: "",
  cover_image_url: "",
  is_active: true,
  sort_order: 10,
  status: "published",
};

const EMPTY_ACH = {
  sport_id: "",
  title: "",
  description: "",
  achievement_date: "",
  level: "university" as const,
  position: "",
  image_url: "",
  is_active: true,
  sort_order: 10,
  status: "published",
};

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function AdminSportsPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const userId = user?.id;
  const [tab, setTab] = useState<"sports" | "achievements">("sports");

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-crimson" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="font-display text-2xl font-bold text-navy flex items-center gap-2">
            <Trophy className="h-6 w-6 text-gold" /> Sports & Athletics
          </h1>
          <p className="mt-1 text-sm text-slate-500">Manage sports disciplines and achievements shown on the Campus page.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab("sports")}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${tab === "sports" ? "bg-navy text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            Sports / Disciplines
          </button>
          <button
            onClick={() => setTab("achievements")}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${tab === "achievements" ? "bg-navy text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            Achievements
          </button>
        </div>

        {tab === "sports"       && <SportsManager userId={userId} />}
        {tab === "achievements" && <AchievementsManager userId={userId} />}
      </div>
    </div>
  );
}

// ─── Sports CRUD ──────────────────────────────────────────────────────────────

function SportsManager({ userId }: { userId: string | undefined }) {
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ ...EMPTY_SPORT });

  useEffect(() => { loadSports(); }, []);

  async function loadSports() {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("sports")
      .select("id, name, slug, category, description, cover_image_url, is_active, sort_order, status, metadata")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    else setSports(data ?? []);
    setLoading(false);
  }

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_SPORT });
    setModalOpen(true);
  }

  function openEdit(s: any) {
    setEditing(s);
    setForm({
      name: s.name ?? "",
      slug: s.slug ?? "",
      category: s.category ?? "outdoor",
      description: s.description ?? "",
      cover_image_url: s.cover_image_url ?? "",
      is_active: s.is_active ?? true,
      sort_order: s.sort_order ?? 10,
      status: s.status ?? "published",
    });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        const { error } = await (supabase as any).from("sports").update({ ...form, updated_by: userId }).eq("id", editing.id);
        if (error) throw error;
        toast.success("Sport updated!");
      } else {
        const { error } = await (supabase as any).from("sports").insert({ ...form, created_by: userId });
        if (error) throw error;
        toast.success("Sport added!");
      }
      setModalOpen(false);
      loadSports();
    } catch (err: any) { toast.error(err.message); }
  }

  async function handleDelete(s: any) {
    if (!confirm(`Delete "${s.name}"?`)) return;
    const { error } = await (supabase as any).from("sports").update({ deleted_at: new Date().toISOString(), deleted_by: userId }).eq("id", s.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); loadSports(); }
  }

  const f = (key: keyof typeof EMPTY_SPORT, val: any) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <span className="text-xs font-bold uppercase tracking-wider text-navy">Sports Disciplines ({sports.length})</span>
          <button onClick={openAdd} className="flex items-center gap-1.5 rounded bg-crimson px-3 py-1.5 text-xs font-semibold text-white hover:bg-crimson/90">
            <Plus className="h-3.5 w-3.5" /> Add Sport
          </button>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-crimson" /></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sports.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition">
                {s.cover_image_url && (
                  <img src={s.cover_image_url} alt={s.name} className="h-10 w-16 rounded object-cover shrink-0 border border-slate-200" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{s.name}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 capitalize">{s.category}</span>
                    {!s.is_active && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-600">Inactive</span>}
                  </div>
                  {s.description && <p className="text-xs text-slate-400 truncate mt-0.5">{s.description}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(s)} className="rounded p-1 text-slate-400 hover:text-navy hover:bg-slate-100 transition"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(s)} className="rounded p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            {sports.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-400">No sports yet. Click "Add Sport" to get started.</div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="mb-4 font-display text-lg font-bold text-navy">{editing ? "Edit Sport" : "Add Sport"}</h3>
            <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Name *</label>
                  <input required value={form.name} onChange={(e) => { f("name", e.target.value); if (!editing) f("slug", toSlug(e.target.value)); }}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Slug *</label>
                  <input required value={form.slug} onChange={(e) => f("slug", e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-800 focus:border-crimson focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-600">Category</label>
                <select value={form.category} onChange={(e) => f("category", e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none">
                  {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-600">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => f("description", e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-600">Cover Photo</label>
                <MediaUploader value={form.cover_image_url} onChange={(url) => f("cover_image_url", url)} bucketName="media" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={(e) => f("sort_order", Number(e.target.value))}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Status</label>
                  <select value={form.status} onChange={(e) => f("status", e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="sport_active" checked={form.is_active} onChange={(e) => f("is_active", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-200 text-crimson" />
                <label htmlFor="sport_active" className="text-sm text-slate-600">Active</label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:text-navy">Cancel</button>
                <button type="submit" className="rounded bg-crimson px-4 py-2 text-xs font-semibold text-white hover:bg-crimson/90">{editing ? "Save Changes" : "Add Sport"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Achievements CRUD ─────────────────────────────────────────────────────────

function AchievementsManager({ userId }: { userId: string | undefined }) {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ ...EMPTY_ACH });

  useEffect(() => {
    loadAchievements();
    (supabase as any).from("sports").select("id, name").is("deleted_at", null).order("sort_order").then(({ data }: any) => setSports(data ?? []));
  }, []);

  async function loadAchievements() {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("sports_achievements")
      .select("id, sport_id, title, description, achievement_date, level, position, image_url, is_active, sort_order, status, sport:sport_id(name)")
      .is("deleted_at", null)
      .order("achievement_date", { ascending: false });
    if (error) toast.error(error.message);
    else setAchievements(data ?? []);
    setLoading(false);
  }

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_ACH });
    setModalOpen(true);
  }

  function openEdit(a: any) {
    setEditing(a);
    setForm({
      sport_id: a.sport_id ?? "",
      title: a.title ?? "",
      description: a.description ?? "",
      achievement_date: a.achievement_date ?? "",
      level: a.level ?? "university",
      position: a.position ?? "",
      image_url: a.image_url ?? "",
      is_active: a.is_active ?? true,
      sort_order: a.sort_order ?? 10,
      status: a.status ?? "published",
    });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...form, sport_id: form.sport_id || null };
      if (editing) {
        const { error } = await (supabase as any).from("sports_achievements").update({ ...payload, updated_by: userId }).eq("id", editing.id);
        if (error) throw error;
        toast.success("Achievement updated!");
      } else {
        const { error } = await (supabase as any).from("sports_achievements").insert({ ...payload, created_by: userId });
        if (error) throw error;
        toast.success("Achievement added!");
      }
      setModalOpen(false);
      loadAchievements();
    } catch (err: any) { toast.error(err.message); }
  }

  async function handleDelete(a: any) {
    if (!confirm(`Delete "${a.title}"?`)) return;
    const { error } = await (supabase as any).from("sports_achievements").update({ deleted_at: new Date().toISOString(), deleted_by: userId }).eq("id", a.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); loadAchievements(); }
  }

  const f = (key: keyof typeof EMPTY_ACH, val: any) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <span className="text-xs font-bold uppercase tracking-wider text-navy">Achievements ({achievements.length})</span>
          <button onClick={openAdd} className="flex items-center gap-1.5 rounded bg-crimson px-3 py-1.5 text-xs font-semibold text-white hover:bg-crimson/90">
            <Plus className="h-3.5 w-3.5" /> Add Achievement
          </button>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-crimson" /></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {achievements.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition">
                {a.image_url && <img src={a.image_url} alt={a.title} className="h-10 w-16 rounded object-cover shrink-0 border border-slate-200" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800 truncate">{a.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${LEVEL_COLORS[a.level] ?? "bg-slate-100 text-slate-500"}`}>{a.level}</span>
                    {a.position && <span className="text-[10px] text-slate-400">{a.position}</span>}
                  </div>
                  {a.sport?.name && <div className="text-xs text-crimson mt-0.5">{a.sport.name}</div>}
                </div>
                <div className="text-xs text-slate-400 shrink-0 mr-2">{a.achievement_date ? new Date(a.achievement_date).getFullYear() : ""}</div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(a)} className="rounded p-1 text-slate-400 hover:text-navy hover:bg-slate-100 transition"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(a)} className="rounded p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            {achievements.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-400">No achievements yet.</div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="mb-4 font-display text-lg font-bold text-navy">{editing ? "Edit Achievement" : "Add Achievement"}</h3>
            <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-600">Title *</label>
                <input required value={form.title} onChange={(e) => f("title", e.target.value)}
                  placeholder="e.g. GTU Inter-University Champions"
                  className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-600">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => f("description", e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Sport</label>
                  <select value={form.sport_id} onChange={(e) => f("sport_id", e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none">
                    <option value="">— Institution-wide —</option>
                    {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Level</label>
                  <select value={form.level} onChange={(e) => f("level", e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none">
                    {LEVELS.map((l) => <option key={l} value={l} className="capitalize">{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Position / Result</label>
                  <input value={form.position} onChange={(e) => f("position", e.target.value)}
                    placeholder="1st Place, Runner-up, Bronze…"
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:border-crimson focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Date</label>
                  <input type="date" value={form.achievement_date} onChange={(e) => f("achievement_date", e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-600">Photo (optional)</label>
                <MediaUploader value={form.image_url} onChange={(url) => f("image_url", url)} bucketName="media" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={(e) => f("sort_order", Number(e.target.value))}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Status</label>
                  <select value={form.status} onChange={(e) => f("status", e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="ach_active" checked={form.is_active} onChange={(e) => f("is_active", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-200 text-crimson" />
                <label htmlFor="ach_active" className="text-sm text-slate-600">Active</label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:text-navy">Cancel</button>
                <button type="submit" className="rounded bg-crimson px-4 py-2 text-xs font-semibold text-white hover:bg-crimson/90">{editing ? "Save Changes" : "Add Achievement"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
