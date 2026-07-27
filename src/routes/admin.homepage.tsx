import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminCrudManager } from "@/components/admin/AdminCrudManager";
import {
  Layout,
  Layers,
  Settings,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Loader2,
  Grid,
  CheckCircle,
  Eye,
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
        <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl flex items-center gap-3">
          <Layout className="h-8 w-8 text-crimson" />
          Homepage Layout Configurator
        </h1>
        <p className="text-sm text-slate-400">
          Design layout sections, add interactive widgets, and manage banner slider promos.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("sections")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "sections"
              ? "border-crimson text-white"
              : "border-transparent text-slate-450 hover:text-slate-200"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Layout Sections</span>
        </button>

        <button
          onClick={() => setActiveTab("widgets")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "widgets"
              ? "border-crimson text-white"
              : "border-transparent text-slate-450 hover:text-slate-200"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Widgets & Blocks</span>
        </button>

        <button
          onClick={() => setActiveTab("items")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "items"
              ? "border-crimson text-white"
              : "border-transparent text-slate-450 hover:text-slate-200"
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
            <div className="flex justify-between items-center bg-slate-950 p-4 border border-slate-850 rounded-lg">
              <span className="text-sm text-slate-400 font-semibold">Rearrange homepage row items:</span>
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
                    className="flex items-center justify-between rounded-xl border border-slate-850 bg-slate-900/10 p-4 hover:bg-slate-900/25 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-crimson/10 text-crimson border border-crimson/20 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">{sec.title || "Unnamed Section"}</h4>
                        <p className="text-[10px] text-crimson uppercase tracking-wide font-mono mt-0.5">
                          Type: {sec.section_type} • Config: {JSON.stringify(sec.config)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleShiftSection(sec, "up")}
                        disabled={idx === 0}
                        className="rounded p-1.5 text-slate-450 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleShiftSection(sec, "down")}
                        disabled={idx === sections.length - 1}
                        className="rounded p-1.5 text-slate-450 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <span className="h-4 w-px bg-slate-800" />
                      <button
                        onClick={() => handleOpenEditSection(sec)}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(sec)}
                        className="rounded p-1.5 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-slate-950 border border-slate-850 rounded-lg">
                <Layers className="h-12 w-12 mx-auto text-slate-800" />
                <h3 className="text-white font-bold mt-4">No sections defined</h3>
                <p className="text-xs text-slate-500 mt-2">Add homepage layout sections to structure page rows.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Widgets Manager */}
        {activeTab === "widgets" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-950 p-4 border border-slate-850 rounded-lg">
              <span className="text-sm text-slate-400 font-semibold">Integrate active homepage widget blocks:</span>
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
                      className="flex items-center justify-between rounded-xl border border-slate-850 bg-slate-900/10 p-4 hover:bg-slate-900/25 transition"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">{widget.title || "Unnamed Widget"}</h4>
                        <p className="text-[10px] text-crimson uppercase tracking-wide font-mono mt-0.5">
                          Type: {widget.widget_type} • Section: {parentSection?.title || "(Orphaned/None)"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditWidget(widget)}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWidget(widget)}
                          className="rounded p-1.5 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-12 bg-slate-950 border border-slate-850 rounded-lg">
                <Sliders className="h-12 w-12 mx-auto text-slate-800" />
                <h3 className="text-white font-bold mt-4">No widgets defined</h3>
                <p className="text-xs text-slate-500 mt-2">Create customizable sidebar or grid layout widgets.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Carousel Items Manager */}
        {activeTab === "items" && (
          <div className="rounded-xl border border-slate-850 bg-slate-950 p-1">
            <AdminCrudManager tableId="homepage_items" />
          </div>
        )}

      </div>

      {/* ➕ MODAL: Add / Edit Layout Section */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 p-4 z-50">
          <div className="w-full max-w-lg rounded-lg border border-slate-850 bg-slate-950 p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              {editingSection ? "Edit Section Details" : "Create Layout Section"}
            </h3>
            
            <form onSubmit={handleSaveSection} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-450 uppercase">Section title / Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Latest Events"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full rounded font-mono px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-450 uppercase">Section Type</label>
                  <select
                    value={sectionForm.section_type}
                    onChange={(e) => setSectionForm(p => ({ ...p, section_type: e.target.value }))}
                    className="w-full rounded font-mono px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="hero">Hero slider/carousel</option>
                    <option value="grid">Grid (e.g. departments/courses)</option>
                    <option value="statistics">Numerical stats counter</option>
                    <option value="features">Feature grids</option>
                    <option value="widgets">Widgets collection holder</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-450 uppercase">Sort Order</label>
                  <input
                    type="number"
                    value={sectionForm.sort_order}
                    onChange={(e) => setSectionForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
                    className="w-full rounded font-mono px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-450 uppercase flex items-center gap-1">
                  <span>Configuration settings (JSON format)</span>
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder='e.g. { "cols": 3, "darkTheme": true }'
                  value={sectionForm.config}
                  onChange={(e) => setSectionForm(p => ({ ...p, config: e.target.value }))}
                  className="w-full rounded font-mono px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="rounded border border-slate-850 px-4 py-2 text-xs text-slate-400 hover:text-white"
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
          <div className="w-full max-w-lg rounded-lg border border-slate-850 bg-slate-950 p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              {editingWidget ? "Edit Widget Block" : "Integrate Widget Block"}
            </h3>
            
            <form onSubmit={handleSaveWidget} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-450 uppercase">Widget Name / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Admission Alerts Bar"
                  value={widgetForm.title}
                  onChange={(e) => setWidgetForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full rounded font-mono px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-450 uppercase">Parent Section Group</label>
                  <select
                    value={widgetForm.section_id}
                    onChange={(e) => setWidgetForm(p => ({ ...p, section_id: e.target.value }))}
                    className="w-full rounded font-mono px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-450 uppercase">Widget Type</label>
                  <select
                    value={widgetForm.widget_type}
                    onChange={(e) => setWidgetForm(p => ({ ...p, widget_type: e.target.value }))}
                    className="w-full rounded font-mono px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="html">Custom HTML / Text</option>
                    <option value="links">Social Links Grid</option>
                    <option value="alerts">Admission Alerts ticker</option>
                    <option value="feed">RSS/Notice feed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-450 uppercase">Sort Order</label>
                <input
                  type="number"
                  value={widgetForm.sort_order}
                  onChange={(e) => setWidgetForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
                  className="w-full rounded font-mono px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-450 uppercase flex items-center gap-1">
                  <span>Widget configuration settings (JSON format)</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder='e.g. { "htmlContent": "<h3>Vasad Info</h3>", "color": "blue" }'
                  value={widgetForm.config}
                  onChange={(e) => setWidgetForm(p => ({ ...p, config: e.target.value }))}
                  className="w-full rounded font-mono px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsWidgetModalOpen(false)}
                  className="rounded border border-slate-850 px-4 py-2 text-xs text-slate-400 hover:text-white"
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
