import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  Layout,
  Layers,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Loader2,
  Grid,
  Sliders
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/homepage")({
  component: AdminHomepageLayoutPage
});

interface SectionNode {
  id: string;
  title: string | null;
  section_type: string;
  sort_order: number;
  is_active: boolean;
  config: any;
}

interface WidgetNode {
  id: string;
  section_id: string;
  title: string | null;
  widget_type: string;
  sort_order: number;
  config: any;
}

function AdminHomepageLayoutPage() {
  const { user } = useAdminAuth();
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"items" | "sections" | "widgets">("sections");

  // Sections State
  const [sections, setSections] = useState<SectionNode[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionNode | null>(null);
  const [sectionForm, setSectionForm] = useState({
    title: "",
    section_type: "grid",
    is_active: true,
    sort_order: 10,
    config: "{}"
  });

  // Widgets State
  const [widgets, setWidgets] = useState<WidgetNode[]>([]);
  const [loadingWidgets, setLoadingWidgets] = useState(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<WidgetNode | null>(null);
  const [widgetForm, setWidgetForm] = useState({
    section_id: "",
    title: "",
    widget_type: "html",
    sort_order: 10,
    config: "{}"
  });

  // Load sections and widgets
  useEffect(() => {
    loadSections();
    loadWidgets();
  }, []);

  async function loadSections() {
    setLoadingSections(true);
    try {
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*")
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (err: any) {
      toast.error(`Error loading homepage sections: ${err.message}`);
    } finally {
      setLoadingSections(false);
    }
  }

  async function loadWidgets() {
    setLoadingWidgets(true);
    try {
      const { data, error } = await supabase
        .from("homepage_widgets")
        .select("*")
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setWidgets(data || []);
    } catch (err: any) {
      toast.error(`Error loading homepage widgets: ${err.message}`);
    } finally {
      setLoadingWidgets(false);
    }
  }

  // Rearrange Section order
  const handleShiftSection = async (section: SectionNode, direction: "up" | "down") => {
    const idx = sections.findIndex((s) => s.id === section.id);
    if (idx === -1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const targetSection = sections[targetIdx];

    try {
      const [r1, r2] = await Promise.all([
        supabase.from("homepage_sections").update({ sort_order: targetSection.sort_order }).eq("id", section.id),
        supabase.from("homepage_sections").update({ sort_order: section.sort_order }).eq("id", targetSection.id)
      ]);
      if (r1.error) throw r1.error;
      if (r2.error) throw r2.error;
      
      toast.success("Sections rearranged.");
      loadSections();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Section Save (Create or Update)
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedConfig = {};
      try {
        parsedConfig = JSON.parse(sectionForm.config);
      } catch {
        throw new Error("Invalid Configuration JSON content");
      }

      const payload = {
        title: sectionForm.title,
        section_type: sectionForm.section_type,
        is_active: sectionForm.is_active,
        sort_order: Number(sectionForm.sort_order),
        config: parsedConfig,
        status: "published"
      };

      if (editingSection) {
        const { error } = await supabase
          .from("homepage_sections")
          .update(payload as any)
          .eq("id", editingSection.id);

        if (error) throw error;
        toast.success("Homepage section updated!");
      } else {
        const { error } = await supabase
          .from("homepage_sections")
          .insert(payload as any);

        if (error) throw error;
        toast.success("Homepage section added!");
      }

      setIsSectionModalOpen(false);
      setEditingSection(null);
      loadSections();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Section Open edit
  const handleOpenEditSection = (section: SectionNode) => {
    setEditingSection(section);
    setSectionForm({
      title: section.title || "",
      section_type: section.section_type || "grid",
      is_active: section.is_active,
      sort_order: section.sort_order,
      config: JSON.stringify(section.config || {}, null, 2)
    });
    setIsSectionModalOpen(true);
  };

  // Section Delete (soft)
  const handleDeleteSection = async (section: SectionNode) => {
    const confirmed = window.confirm("Are you sure you want to remove this homepage section? All widgets assigned to it will be orphaned.");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("homepage_sections")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id
        })
        .eq("id", section.id);

      if (error) throw error;
      toast.success("Section removed.");
      loadSections();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Widget Save (Create or Update)
  const handleSaveWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedConfig = {};
      try {
        parsedConfig = JSON.parse(widgetForm.config);
      } catch {
        throw new Error("Invalid Configuration JSON content");
      }

      const payload = {
        section_id: widgetForm.section_id,
        title: widgetForm.title,
        widget_type: widgetForm.widget_type,
        sort_order: Number(widgetForm.sort_order),
        config: parsedConfig,
        status: "published"
      };

      if (editingWidget) {
        const { error } = await supabase
          .from("homepage_widgets")
          .update(payload as any)
          .eq("id", editingWidget.id);

        if (error) throw error;
        toast.success("Widget details updated!");
      } else {
        const { error } = await supabase
          .from("homepage_widgets")
          .insert(payload as any);

        if (error) throw error;
        toast.success("Widget added!");
      }

      setIsWidgetModalOpen(false);
      setEditingWidget(null);
      loadWidgets();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Widget Open edit
  const handleOpenEditWidget = (widget: WidgetNode) => {
    setEditingWidget(widget);
    setWidgetForm({
      section_id: widget.section_id || "",
      title: widget.title || "",
      widget_type: widget.widget_type || "html",
      sort_order: widget.sort_order,
      config: JSON.stringify(widget.config || {}, null, 2)
    });
    setIsWidgetModalOpen(true);
  };

  // Widget Delete
  const handleDeleteWidget = async (widget: WidgetNode) => {
    const confirmed = window.confirm("Remove this widget from section?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("homepage_widgets")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id
        })
        .eq("id", widget.id);

      if (error) throw error;
      toast.success("Widget removed.");
      loadWidgets();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy md:text-3xl flex items-center gap-3">
          <Layout className="h-8 w-8 text-crimson" />
          Homepage Layout Configurator
        </h1>
        <p className="text-sm text-slate-500">
          Design layout sections, add interactive widgets, and manage banner slider promos.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("sections")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "sections"
              ? "border-crimson text-navy"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Layout Sections</span>
        </button>

        <button
          onClick={() => setActiveTab("widgets")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "widgets"
              ? "border-crimson text-navy"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Widgets & Blocks</span>
        </button>

        <button
          onClick={() => setActiveTab("items")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "items"
              ? "border-crimson text-navy"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Grid className="h-4 w-4" />
          <span>Slider Banners & Items</span>
        </button>
      </div>

      {/* Content tabs renders */}
      <div className="space-y-6">
        
        {/* TAB 1: Sections Manager */}
        {activeTab === "sections" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-lg">
              <span className="text-sm text-slate-500 font-semibold">Rearrange homepage row items:</span>
              <button
                onClick={() => {
                  setEditingSection(null);
                  setSectionForm({
                    title: "",
                    section_type: "grid",
                    is_active: true,
                    sort_order: (sections.length + 1) * 10,
                    config: "{}"
                  });
                  setIsSectionModalOpen(true);
                }}
                className="flex items-center gap-2 rounded bg-crimson px-4 py-2 text-xs font-semibold text-white hover:bg-crimson/90"
              >
                <Plus className="h-4 w-4" />
                <span>Add Layout Section</span>
              </button>
            </div>

            {loadingSections ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-crimson" />
              </div>
            ) : sections.length > 0 ? (
              <div className="space-y-3">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-crimson/10 text-crimson border border-crimson/20 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">{sec.title || "Unnamed Section"}</h4>
                        <p className="text-[10px] text-crimson uppercase tracking-wide font-mono mt-0.5">
                          Type: {sec.section_type} • Config: {JSON.stringify(sec.config)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleShiftSection(sec, "up")}
                        disabled={idx === 0}
                        className="rounded p-1.5 text-slate-600 hover:bg-slate-100 hover:text-navy disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleShiftSection(sec, "down")}
                        disabled={idx === sections.length - 1}
                        className="rounded p-1.5 text-slate-600 hover:bg-slate-100 hover:text-navy disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <span className="h-4 w-px bg-slate-100" />
                      <button
                        onClick={() => handleOpenEditSection(sec)}
                        className="rounded p-1.5 text-slate-600 hover:bg-slate-100 hover:text-navy"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(sec)}
                        className="rounded p-1.5 text-slate-600 hover:bg-rose-500/15 hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-white border border-slate-200 rounded-lg">
                <Layers className="h-12 w-12 mx-auto text-slate-800" />
                <h3 className="text-navy font-bold mt-4">No sections defined</h3>
                <p className="text-xs text-slate-500 mt-2">Add homepage layout sections to structure page rows.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Widgets Manager */}
        {activeTab === "widgets" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-lg">
              <span className="text-sm text-slate-500 font-semibold">Integrate active homepage widget blocks:</span>
              <button
                onClick={() => {
                  setEditingWidget(null);
                  setWidgetForm({
                    section_id: sections[0]?.id || "",
                    title: "",
                    widget_type: "html",
                    sort_order: 10,
                    config: "{}"
                  });
                  setIsWidgetModalOpen(true);
                }}
                className="flex items-center gap-2 rounded bg-crimson px-4 py-2 text-xs font-semibold text-white hover:bg-crimson/90"
              >
                <Plus className="h-4 w-4" />
                <span>Add Widget Block</span>
              </button>
            </div>

            {loadingWidgets ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-crimson" />
              </div>
            ) : widgets.length > 0 ? (
              <div className="space-y-3">
                {widgets.map((widget) => {
                  const parentSection = sections.find((s) => s.id === widget.section_id);
                  return (
                    <div
                      key={widget.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100 transition"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">{widget.title || "Unnamed Widget"}</h4>
                        <p className="text-[10px] text-crimson uppercase tracking-wide font-mono mt-0.5">
                          Type: {widget.widget_type} • Section: {parentSection?.title || "(Orphaned/None)"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditWidget(widget)}
                          className="rounded p-1.5 text-slate-600 hover:bg-slate-100 hover:text-navy"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWidget(widget)}
                          className="rounded p-1.5 text-slate-600 hover:bg-rose-500/15 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-12 bg-white border border-slate-200 rounded-lg">
                <Sliders className="h-12 w-12 mx-auto text-slate-800" />
                <h3 className="text-navy font-bold mt-4">No widgets defined</h3>
                <p className="text-xs text-slate-500 mt-2">Create customizable sidebar or grid layout widgets.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Per-college Homepage Items Manager */}
        {activeTab === "items" && (
          <HomepageItemsManager userId={user?.id} />
        )}

      </div>

      {/* ➕ MODAL: Add / Edit Layout Section */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 p-4 z-50">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-navy mb-4">
              {editingSection ? "Edit Section Details" : "Create Layout Section"}
            </h3>
            
            <form onSubmit={handleSaveSection} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase">Section title / Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Latest Events"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full rounded border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase">Section Type</label>
                  <select
                    value={sectionForm.section_type}
                    onChange={(e) => setSectionForm(p => ({ ...p, section_type: e.target.value }))}
                    className="w-full rounded border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="hero">Hero slider/carousel</option>
                    <option value="grid">Grid (e.g. departments/courses)</option>
                    <option value="statistics">Numerical stats counter</option>
                    <option value="features">Feature grids</option>
                    <option value="widgets">Widgets collection holder</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase">Sort Order</label>
                  <input
                    type="number"
                    value={sectionForm.sort_order}
                    onChange={(e) => setSectionForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
                    className="w-full rounded border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase flex items-center gap-1">
                  <span>Configuration settings (JSON format)</span>
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder='e.g. { "cols": 3, "darkTheme": true }'
                  value={sectionForm.config}
                  onChange={(e) => setSectionForm(p => ({ ...p, config: e.target.value }))}
                  className="w-full rounded border border-slate-200 bg-white font-mono px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="rounded border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:text-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-crimson px-4 py-2 text-xs font-semibold text-white hover:bg-crimson/90"
                >
                  {editingSection ? "Save Changes" : "Create Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ➕ MODAL: Add / Edit Widget Block */}
      {isWidgetModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 p-4 z-50">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-navy mb-4">
              {editingWidget ? "Edit Widget Block" : "Integrate Widget Block"}
            </h3>
            
            <form onSubmit={handleSaveWidget} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase">Widget Name / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Admission Alerts Bar"
                  value={widgetForm.title}
                  onChange={(e) => setWidgetForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full rounded border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase">Parent Section Group</label>
                  <select
                    value={widgetForm.section_id}
                    onChange={(e) => setWidgetForm(p => ({ ...p, section_id: e.target.value }))}
                    className="w-full rounded border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase">Widget Type</label>
                  <select
                    value={widgetForm.widget_type}
                    onChange={(e) => setWidgetForm(p => ({ ...p, widget_type: e.target.value }))}
                    className="w-full rounded border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="html">Custom HTML / Text</option>
                    <option value="links">Social Links Grid</option>
                    <option value="alerts">Admission Alerts ticker</option>
                    <option value="feed">RSS/Notice feed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase">Sort Order</label>
                <input
                  type="number"
                  value={widgetForm.sort_order}
                  onChange={(e) => setWidgetForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
                  className="w-full rounded border border-slate-200 bg-white font-mono px-3.5 py-2 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase flex items-center gap-1">
                  <span>Widget configuration settings (JSON format)</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder='e.g. { "htmlContent": "<h3>Vasad Info</h3>", "color": "blue" }'
                  value={widgetForm.config}
                  onChange={(e) => setWidgetForm(p => ({ ...p, config: e.target.value }))}
                  className="w-full rounded border border-slate-200 bg-white font-mono px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsWidgetModalOpen(false)}
                  className="rounded border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:text-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-crimson px-4 py-2 text-xs font-semibold text-white hover:bg-crimson/90"
                >
                  {editingWidget ? "Save Widget" : "Integrate Widget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
  hero_slide: "Hero Slides (legacy)",
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

              {/* Image URL — hero, carousel_slide, promo_card, hero_slide */}
              {["hero", "carousel_slide", "promo_card", "hero_slide"].includes(form.item_type) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Image URL</label>
                  <input value={form.image_url} onChange={(e) => f("image_url", e.target.value)}
                    placeholder="https://... (paste Supabase storage URL)"
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none" />
                  {form.image_url && (
                    <img src={form.image_url} alt="preview" className="mt-1 h-24 w-full rounded object-cover border border-slate-200" />
                  )}
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
