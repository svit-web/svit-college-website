import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuthContext } from "@/contexts/AdminAuthContext";
import {
  Layout,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Grid,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { HeroAppearancePanel } from "./admin.appearance";

export const Route = createFileRoute("/admin/homepage")({
  component: AdminHomepageLayoutPage
});

function AdminHomepageLayoutPage() {
  const { user } = useAdminAuthContext();
  const [activeTab, setActiveTab] = useState<"items" | "appearance">("items");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy md:text-3xl flex items-center gap-3">
          <Layout className="h-8 w-8 text-crimson" />
          Homepage
        </h1>
        <p className="text-sm text-slate-500">
          Manage everything that appears on the homepage — slides, content items, and visual appearance.
        </p>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("items")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition ${activeTab === "items" ? "border-crimson text-navy" : "border-transparent text-slate-600 hover:text-slate-900"}`}
        >
          <Grid className="h-4 w-4" />
          <span>Homepage Items</span>
        </button>
        <button
          onClick={() => setActiveTab("appearance")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition ${activeTab === "appearance" ? "border-crimson text-navy" : "border-transparent text-slate-600 hover:text-slate-900"}`}
        >
          <Palette className="h-4 w-4" />
          <span>Hero Appearance</span>
        </button>
      </div>

      <div>
        {activeTab === "items" && <HomepageItemsManager userId={user?.id} />}
        {activeTab === "appearance" && <HeroAppearancePanel />}
      </div>
    </div>
  );
}

// ─── Per-college Homepage Items Manager ───────────────────────────────────────

const ITEM_TYPE_LABELS: Record<string, string> = {
  hero: "Hero Section",
  carousel_slide: "Carousel Slides",
  promo_card: "Promo / CTA Card",
  stat: "Stats Strip",
  why_choose: "Why Choose Us",
  trust_badge: "Trust Badges",
  highlight_card: "Highlight Cards",
  quick_link: "Quick Links",
  job: "Job Listings",
};

const ITEM_TYPES = Object.keys(ITEM_TYPE_LABELS);

const EMPTY_FORM = {
  item_type: "stat",
  scope_type: "global",
  college_id: null as string | null,
  title: "",
  subtitle: "",
  body: "",
  icon_name: "",
  eyebrow: "",
  title_accent: "",
  image_url: "",
  link_href: "",
  link_label: "",
  secondary_link_href: "",
  secondary_link_label: "",
  sort_order: 10,
  is_active: true,
  status: "published",
};

function HomepageItemsManager({ userId }: { userId: string | undefined }) {
  const [colleges, setColleges] = useState<{ id: string; name: string; code: string }[]>([]);
  const [selectedScope, setSelectedScope] = useState<"global" | string>("global");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    supabase
      .from("colleges")
      .select("id, name, code")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setColleges(data || []));
  }, []);

  useEffect(() => { loadItems(); }, [selectedScope]);

  async function loadItems() {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from("homepage_items")
        .select("id, item_type, scope_type, college_id, title, subtitle, body, icon_name, eyebrow, title_accent, image_url, link_href, link_label, secondary_link_href, secondary_link_label, metadata, sort_order, is_active, status")
        .is("deleted_at", null)
        .order("item_type", { ascending: true })
        .order("sort_order", { ascending: true });

      if (selectedScope === "global") {
        query = query.eq("scope_type", "global");
      } else {
        query = query.eq("scope_type", "college").eq("college_id", selectedScope);
      }

      const { data, error } = await query;
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      toast.error(`Failed to load items: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditingItem(null);
    setForm({
      ...EMPTY_FORM,
      scope_type: selectedScope === "global" ? "global" : "college",
      college_id: selectedScope === "global" ? null : selectedScope,
    });
    setIsModalOpen(true);
  }

  function openEdit(item: any) {
    setEditingItem(item);
    setForm({
      item_type: item.item_type || "stat",
      scope_type: item.scope_type || "global",
      college_id: item.college_id || null,
      title: item.title || "",
      subtitle: item.subtitle || "",
      body: item.body || "",
      icon_name: item.icon_name || "",
      eyebrow: item.eyebrow || "",
      title_accent: item.title_accent || "",
      image_url: item.image_url || "",
      link_href: item.link_href || "",
      link_label: item.link_label || "",
      secondary_link_href: item.secondary_link_href || "",
      secondary_link_label: item.secondary_link_label || "",
      sort_order: item.sort_order ?? 10,
      is_active: item.is_active ?? true,
      status: item.status || "published",
    });
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: any = {
        ...form,
        college_id: form.scope_type === "college" ? form.college_id : null,
      };

      if (editingItem) {
        const { error } = await (supabase as any).from("homepage_items").update(payload).eq("id", editingItem.id);
        if (error) throw error;
        toast.success("Item updated!");
      } else {
        const { error } = await (supabase as any).from("homepage_items").insert({ ...payload, created_by: userId });
        if (error) throw error;
        toast.success("Item created!");
      }
      setIsModalOpen(false);
      loadItems();
    } catch (err: any) {
      toast.error(`Save failed: ${err.message}`);
    }
  }

  async function handleDelete(item: any) {
    if (!confirm("Delete this item? It will move to the trash.")) return;
    const { error } = await (supabase as any)
      .from("homepage_items")
      .update({ deleted_at: new Date().toISOString(), deleted_by: userId })
      .eq("id", item.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted!"); loadItems(); }
  }

  const grouped = items.reduce((acc, item) => {
    const key = item.item_type || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const f = (key: keyof typeof EMPTY_FORM, val: any) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="space-y-4">
      {/* Scope selector */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-1">Scope:</span>
        <button
          onClick={() => setSelectedScope("global")}
          className={`rounded px-3 py-1.5 text-xs font-semibold transition ${selectedScope === "global" ? "bg-navy text-white" : "bg-slate-100 text-slate-800 hover:bg-slate-200"}`}
        >
          Global
        </button>
        {colleges.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedScope(c.id)}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition ${selectedScope === c.id ? "bg-navy text-white" : "bg-slate-100 text-slate-800 hover:bg-slate-200"}`}
          >
            {c.code}
          </button>
        ))}
        <button
          onClick={openAdd}
          className="ml-auto flex items-center gap-2 rounded bg-crimson px-4 py-1.5 text-xs font-semibold text-white hover:bg-crimson/90"
        >
          <Plus className="h-3.5 w-3.5" /> Add Item
        </button>
      </div>

      {/* Items list */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-crimson" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <Grid className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-bold text-navy">No items for this scope</h3>
          <p className="mt-2 text-xs text-slate-500">
            Add stats, trust badges, or why-choose items — they'll appear on the{" "}
            {selectedScope === "global" ? "global (all colleges)" : colleges.find((c) => c.id === selectedScope)?.code ?? "selected college"} landing page.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([type, typeItems]) => (
            <div key={type} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-navy">
                  {ITEM_TYPE_LABELS[type] ?? type}
                </span>
                <span className="text-xs text-slate-400">{(typeItems as any[]).length} item{(typeItems as any[]).length !== 1 ? "s" : ""}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {(typeItems as any[]).map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image_url && (
                        <img src={item.image_url} alt="" className="h-10 w-16 rounded object-cover shrink-0 border border-slate-200" />
                      )}
                      <div className="min-w-0">
                        {item.eyebrow && <div className="text-[10px] font-semibold uppercase tracking-widest text-gold">{item.eyebrow}</div>}
                        <div className="text-sm font-semibold text-slate-800 truncate">{item.title || "(no title)"}</div>
                        {item.subtitle && <div className="text-xs text-slate-500 truncate">{item.subtitle}</div>}
                        {item.icon_name && (
                          <div className="mt-0.5 font-mono text-[10px] text-slate-400">{item.icon_name}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.status === "published" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}>
                        {item.status}
                      </span>
                      <button onClick={() => openEdit(item)} className="rounded p-1 text-slate-500 hover:text-navy hover:bg-slate-100 transition">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(item)} className="rounded p-1 text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="mb-4 font-display text-lg font-bold text-navy">
              {editingItem ? "Edit Item" : "Add Homepage Item"}
            </h3>
            <form onSubmit={handleSave} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
              {/* Item type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-600">Item Type</label>
                <select
                  value={form.item_type}
                  onChange={(e) => f("item_type", e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                >
                  {ITEM_TYPES.map((t) => (
                    <option key={t} value={t}>{ITEM_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              {/* Eyebrow — hero, carousel_slide, promo_card, hero_slide */}
              {["hero", "carousel_slide", "promo_card", "hero_slide"].includes(form.item_type) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Eyebrow / Kicker</label>
                  <input value={form.eyebrow} onChange={(e) => f("eyebrow", e.target.value)}
                    placeholder='e.g. "Admissions Open 2026–27"'
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none" />
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-600">
                  {form.item_type === "stat" ? 'Value (e.g. "5000+")' : "Title"}
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => f("title", e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                />
              </div>

              {/* Title Accent — hero only */}
              {form.item_type === "hero" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Title Accent (highlighted word)</label>
                  <input value={form.title_accent} onChange={(e) => f("title_accent", e.target.value)}
                    placeholder="word in title to highlight in gold"
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none" />
                </div>
              )}

              {/* Subtitle */}
              {["stat", "why_choose", "carousel_slide", "highlight_card", "hero", "promo_card"].includes(form.item_type) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">
                    {form.item_type === "stat" ? 'Label (e.g. "Students")' : "Subtitle"}
                  </label>
                  <input
                    value={form.subtitle}
                    onChange={(e) => f("subtitle", e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                  />
                </div>
              )}

              {/* Body */}
              {["why_choose", "job", "hero_slide", "hero", "promo_card", "carousel_slide"].includes(form.item_type) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Body / Description</label>
                  <textarea
                    rows={3}
                    value={form.body}
                    onChange={(e) => f("body", e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                  />
                </div>
              )}

              {/* Icon name */}
              {["why_choose", "trust_badge", "highlight_card", "quick_link"].includes(form.item_type) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Icon Name (Lucide)</label>
                  <input
                    value={form.icon_name}
                    onChange={(e) => f("icon_name", e.target.value)}
                    placeholder="e.g. BadgeCheck, GraduationCap, Briefcase, Building2"
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                  />
                </div>
              )}

              {/* Image upload — hero, carousel_slide, promo_card, highlight_card, hero_slide */}
              {["hero", "carousel_slide", "promo_card", "highlight_card", "hero_slide"].includes(form.item_type) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Image</label>
                  <MediaUploader
                    value={form.image_url}
                    onChange={(url) => f("image_url", url)}
                    bucketName="media"
                  />
                </div>
              )}

              {/* Primary CTA link */}
              {["hero", "carousel_slide", "promo_card", "highlight_card", "quick_link", "hero_slide"].includes(form.item_type) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-600">CTA Link</label>
                    <input value={form.link_href} onChange={(e) => f("link_href", e.target.value)}
                      placeholder="/admissions"
                      className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-600">CTA Label</label>
                    <input value={form.link_label} onChange={(e) => f("link_label", e.target.value)}
                      placeholder="Apply Now"
                      className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none" />
                  </div>
                </div>
              )}

              {/* Secondary CTA — promo_card only */}
              {form.item_type === "promo_card" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-600">Secondary Link</label>
                    <input value={form.secondary_link_href} onChange={(e) => f("secondary_link_href", e.target.value)}
                      placeholder="/downloads"
                      className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-600">Secondary Label</label>
                    <input value={form.secondary_link_label} onChange={(e) => f("secondary_link_label", e.target.value)}
                      placeholder="Download Brochure"
                      className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none" />
                  </div>
                </div>
              )}

              {/* Sort order + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Sort Order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => f("sort_order", Number(e.target.value))}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => f("status", e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hpi_active"
                  checked={form.is_active}
                  onChange={(e) => f("is_active", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-200 text-crimson"
                />
                <label htmlFor="hpi_active" className="text-sm text-slate-600">Active</label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:text-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-crimson px-4 py-2 text-xs font-semibold text-white hover:bg-crimson/90"
                >
                  {editingItem ? "Save Changes" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
