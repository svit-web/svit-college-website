import { useEffect, useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuthContext } from "@/contexts/AdminAuthContext";
import { MediaUploader } from "@/components/admin/MediaUploader";
import {
  Users,
  Plus,
  Trash2,
  Loader2,
  Save,
  Award,
  Search,
  X,
  Tag,
  School,
  ChevronDown,
  UserCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/staff-wizards")({
  component: StaffProfilesPage,
});

type AchievementType = "award" | "patent" | "publication" | "research" | "qualification" | "experience";

const ACHIEVEMENT_TYPES: { value: AchievementType; label: string }[] = [
  { value: "qualification", label: "Qualification / Degree" },
  { value: "experience", label: "Work Experience" },
  { value: "award", label: "Award / Honor" },
  { value: "patent", label: "Patent" },
  { value: "publication", label: "Publication" },
  { value: "research", label: "Research Project" },
];

type Tab = "general" | "department" | "achievements" | "expertise";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "general", label: "General", icon: UserCircle },
  { id: "department", label: "Department", icon: School },
  { id: "achievements", label: "Achievements", icon: Award },
  { id: "expertise", label: "Expertise", icon: Tag },
];

function StaffProfilesPage() {
  const { user } = useAdminAuthContext();

  const [staffList, setStaffList] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Slide-over state
  const [panelOpen, setPanelOpen] = useState(false);
  const [isNewMode, setIsNewMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("general");

  // Masters
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);

  // Detail state
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [generalForm, setGeneralForm] = useState<Record<string, any>>({});
  const [generalSaving, setGeneralSaving] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [expertise, setExpertise] = useState<string[]>([]);

  // Add forms
  const [newAssignment, setNewAssignment] = useState({ department_id: "", designation_id: "", is_primary: false });
  const [newAchievement, setNewAchievement] = useState<{ type: AchievementType; title: string; year: string; description: string }>({
    type: "award", title: "", year: "", description: "",
  });
  const [newTag, setNewTag] = useState("");
  const [newStaffForm, setNewStaffForm] = useState({ title: "Dr.", first_name: "", last_name: "", email: "", phone: "" });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadStaffList();
    loadMasters();
  }, []);

  useEffect(() => {
    if (selectedId && !isNewMode) {
      loadDetails(selectedId);
    }
  }, [selectedId]);

  async function loadStaffList() {
    setListLoading(true);
    try {
      const { data, error } = await supabase
        .from("staff_profiles")
        .select(`
          id, title, first_name, last_name, email, status, expertise, metadata,
          staff_department_assignments(
            is_primary,
            department:department_id(name),
            designation:designation_id(title)
          )
        `)
        .is("deleted_at", null)
        .order("first_name");
      if (error) throw error;
      setStaffList(data || []);
    } catch (err: any) {
      // Fallback: load without join if no assignments exist yet
      try {
        const { data } = await supabase
          .from("staff_profiles")
          .select("id, title, first_name, last_name, email, status, expertise, metadata")
          .is("deleted_at", null)
          .order("first_name");
        setStaffList(data || []);
      } catch {}
    } finally {
      setListLoading(false);
    }
  }

  async function loadMasters() {
    const [{ data: d }, { data: des }] = await Promise.all([
      supabase.from("departments").select("id, name, code").is("deleted_at", null).order("name"),
      supabase.from("designations").select("id, title").is("deleted_at", null).order("title"),
    ]);
    setDepartments(d || []);
    setDesignations(des || []);
  }

  async function loadDetails(staffId: string) {
    setDetailsLoading(true);
    try {
      const [
        { data: gen },
        { data: asgn },
        { data: achv },
      ] = await Promise.all([
        supabase.from("staff_profiles").select("*").eq("id", staffId).maybeSingle(),
        supabase.from("staff_department_assignments")
          .select("id, department_id, designation_id, is_primary, department:department_id(name,code), designation:designation_id(title)")
          .eq("staff_id", staffId).is("deleted_at", null),
        (supabase as any).from("staff_achievements")
          .select("*").eq("staff_id", staffId).is("deleted_at", null).order("year", { ascending: false }),
      ]);
      setGeneralForm(gen || {});
      setAssignments(asgn || []);
      setAchievements(achv || []);
      setExpertise(gen?.expertise || []);
    } catch (err: any) {
      toast.error(`Failed to load profile: ${err.message}`);
    } finally {
      setDetailsLoading(false);
    }
  }

  function openCard(id: string) {
    setSelectedId(id);
    setIsNewMode(false);
    setActiveTab("general");
    setPanelOpen(true);
  }

  function openNew() {
    setSelectedId(null);
    setIsNewMode(true);
    setActiveTab("general");
    setNewStaffForm({ title: "Dr.", first_name: "", last_name: "", email: "", phone: "" });
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setSelectedId(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const { data, error } = await supabase
        .from("staff_profiles")
        .insert({ ...newStaffForm, status: "published" })
        .select().single();
      if (error) throw error;
      toast.success("Staff profile created!");
      await loadStaffList();
      setSelectedId(data.id);
      setIsNewMode(false);
      setActiveTab("general");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleSaveGeneral(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setGeneralSaving(true);
    try {
      const currentMeta = (generalForm.metadata as Record<string, any>) ?? {};
      const { error } = await supabase.from("staff_profiles").update({
        title: generalForm.title,
        first_name: generalForm.first_name,
        last_name: generalForm.last_name,
        email: generalForm.email,
        phone: generalForm.phone,
        bio: generalForm.bio,
        joining_year: generalForm.joining_year ? Number(generalForm.joining_year) : null,
        past_experience_years: generalForm.past_experience_years ? Number(generalForm.past_experience_years) : null,
        metadata: { ...currentMeta, photoUrl: generalForm._photoUrl ?? currentMeta.photoUrl ?? null },
        status: generalForm.status || "published",
        updated_by: user?.id,
      }).eq("id", selectedId);
      if (error) throw error;
      toast.success("Profile saved!");
      loadStaffList();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setGeneralSaving(false);
    }
  }

  async function handleSoftDelete(staffId: string) {
    if (!confirm("Move this staff profile to trash?")) return;
    try {
      await supabase.from("staff_profiles").update({ deleted_at: new Date().toISOString(), deleted_by: user?.id }).eq("id", staffId);
      toast.success("Moved to trash.");
      if (selectedId === staffId) closePanel();
      loadStaffList();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleAddAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    try {
      const { error } = await supabase.from("staff_department_assignments").insert({
        staff_id: selectedId,
        department_id: newAssignment.department_id,
        designation_id: newAssignment.designation_id,
        is_primary: newAssignment.is_primary,
        status: "published",
      });
      if (error) throw error;
      toast.success("Assignment added!");
      setNewAssignment({ department_id: "", designation_id: "", is_primary: false });
      loadDetails(selectedId);
    } catch (err: any) { toast.error(err.message); }
  }

  async function handleDeleteAssignment(id: string) {
    try {
      await supabase.from("staff_department_assignments").delete().eq("id", id);
      toast.success("Removed.");
      loadDetails(selectedId!);
    } catch (err: any) { toast.error(err.message); }
  }

  async function handleAddAchievement(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !newAchievement.title.trim()) return;
    try {
      const { error } = await (supabase as any).from("staff_achievements").insert({
        staff_id: selectedId,
        type: newAchievement.type,
        title: newAchievement.title.trim(),
        year: newAchievement.year ? Number(newAchievement.year) : null,
        description: newAchievement.description.trim() || null,
      });
      if (error) throw error;
      toast.success("Achievement added!");
      setNewAchievement({ type: "award", title: "", year: "", description: "" });
      loadDetails(selectedId);
    } catch (err: any) { toast.error(err.message); }
  }

  async function handleDeleteAchievement(id: string) {
    try {
      await (supabase as any).from("staff_achievements").delete().eq("id", id);
      toast.success("Removed.");
      loadDetails(selectedId!);
    } catch (err: any) { toast.error(err.message); }
  }

  async function handleAddTag(e: React.FormEvent) {
    e.preventDefault();
    const tag = newTag.trim();
    if (!tag || !selectedId) return;
    if (expertise.includes(tag)) { setNewTag(""); return; }
    const updated = [...expertise, tag];
    try {
      const { error } = await supabase.from("staff_profiles").update({ expertise: updated }).eq("id", selectedId);
      if (error) throw error;
      setExpertise(updated);
      setNewTag("");
    } catch (err: any) { toast.error(err.message); }
  }

  async function handleRemoveTag(tag: string) {
    if (!selectedId) return;
    const updated = expertise.filter((t) => t !== tag);
    try {
      const { error } = await supabase.from("staff_profiles").update({ expertise: updated }).eq("id", selectedId);
      if (error) throw error;
      setExpertise(updated);
    } catch (err: any) { toast.error(err.message); }
  }

  const filteredStaff = useMemo(() => {
    if (!searchQuery) return staffList;
    const q = searchQuery.toLowerCase();
    return staffList.filter((s) => {
      const name = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
      return name.includes(q) || (s.email || "").toLowerCase().includes(q);
    });
  }, [staffList, searchQuery]);

  // Helper: get primary assignment for a staff member
  const getPrimary = (staff: any) => {
    const assignments = staff.staff_department_assignments;
    if (!assignments?.length) return null;
    return assignments.find((a: any) => a.is_primary) || assignments[0];
  };

  // Group achievements by type
  const achievementsByType = useMemo(() => {
    const groups: Record<string, any[]> = {};
    achievements.forEach((a) => {
      if (!groups[a.type]) groups[a.type] = [];
      groups[a.type].push(a);
    });
    return groups;
  }, [achievements]);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy flex items-center gap-2">
            <Users className="h-5 w-5 text-crimson" />
            Faculty & Staff
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{staffList.length} profiles total</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-lg bg-crimson px-3.5 py-2 text-sm font-semibold text-white hover:bg-crimson/90 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Faculty
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-crimson focus:outline-none"
        />
      </div>

      {/* Card grid */}
      {listLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-crimson" />
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center text-center rounded-xl border border-slate-200 bg-white">
          <Users className="h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-500">No faculty profiles found</p>
          <button onClick={openNew} className="mt-3 text-xs text-crimson hover:underline">
            Add the first profile →
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStaff.map((staff) => {
            const primary = getPrimary(staff);
            const initials = `${staff.first_name?.[0] || ""}${staff.last_name?.[0] || ""}`;
            const isSelected = staff.id === selectedId && panelOpen;

            return (
              <div
                key={staff.id}
                onClick={() => openCard(staff.id)}
                className={cn(
                  "group relative rounded-xl border bg-white p-4 cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md",
                  isSelected
                    ? "border-crimson/50 ring-1 ring-crimson/20"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="flex items-start gap-3">
                  {(staff.metadata as any)?.photoUrl ? (
                    <img
                      src={(staff.metadata as any).photoUrl}
                      alt=""
                      className="h-11 w-11 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-crimson/10 text-sm font-bold text-crimson border border-crimson/20">
                      {initials || "?"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm leading-snug truncate">
                      {staff.title} {staff.first_name} {staff.last_name}
                    </p>
                    {primary && (
                      <p className="text-xs text-slate-600 truncate mt-0.5">
                        {primary.designation?.title || "—"}
                      </p>
                    )}
                    {primary && (
                      <p className="text-[11px] text-slate-400 truncate">
                        {primary.department?.name || ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status + delete */}
                <div className="mt-3 flex items-center justify-between">
                  <span className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                    staff.status === "published"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  )}>
                    {staff.status || "draft"}
                  </span>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleSoftDelete(staff.id); }}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Slide-over panel ─────────────────────────────────────── */}
      {panelOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={closePanel}
          />

          {/* Panel */}
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-[#16181d] shadow-2xl border-l border-zinc-800 overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 shrink-0">
              <h2 className="font-semibold text-white text-sm">
                {isNewMode ? "New Faculty Profile" : (
                  selectedId
                    ? `${generalForm.title || ""} ${generalForm.first_name || ""} ${generalForm.last_name || ""}`.trim() || "Edit Profile"
                    : "Edit Profile"
                )}
              </h2>
              <button
                onClick={closePanel}
                className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isNewMode ? (
              /* Create form */
              <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-5 space-y-4 admin-scroll">
                <p className="text-xs text-zinc-500">Fill in the basics. You can add more details after creating.</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Title</label>
                    <select
                      value={newStaffForm.title}
                      onChange={(e) => setNewStaffForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-sm text-white focus:border-crimson focus:outline-none"
                    >
                      {["Dr.", "Prof.", "Mr.", "Ms.", "Mrs."].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">First Name</label>
                    <input required type="text" value={newStaffForm.first_name}
                      onChange={(e) => setNewStaffForm((p) => ({ ...p, first_name: e.target.value }))}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-crimson focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Last Name</label>
                  <input required type="text" value={newStaffForm.last_name}
                    onChange={(e) => setNewStaffForm((p) => ({ ...p, last_name: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-crimson focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Email</label>
                  <input required type="email" value={newStaffForm.email}
                    onChange={(e) => setNewStaffForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-crimson focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Phone</label>
                  <input type="text" value={newStaffForm.phone}
                    onChange={(e) => setNewStaffForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-crimson focus:outline-none" />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={closePanel}
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-white transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={createLoading}
                    className="flex items-center gap-2 rounded-lg bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson/90 disabled:opacity-50 transition">
                    {createLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Create Profile
                  </button>
                </div>
              </form>
            ) : detailsLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-crimson" />
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex border-b border-zinc-800 shrink-0">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-semibold transition flex-1 justify-center",
                          activeTab === tab.id
                            ? "border-crimson text-crimson"
                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto admin-scroll p-5">

                  {/* GENERAL */}
                  {activeTab === "general" && (
                    <form onSubmit={handleSaveGeneral} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="field-label">Title</label>
                          <select value={generalForm.title || "Dr."}
                            onChange={(e) => setGeneralForm((p) => ({ ...p, title: e.target.value }))}
                            className="field-input">
                            {["Dr.", "Prof.", "Mr.", "Ms.", "Mrs."].map((t) => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="field-label">Status</label>
                          <select value={generalForm.status || "published"}
                            onChange={(e) => setGeneralForm((p) => ({ ...p, status: e.target.value }))}
                            className="field-input">
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="field-label">First Name</label>
                          <input type="text" required value={generalForm.first_name || ""}
                            onChange={(e) => setGeneralForm((p) => ({ ...p, first_name: e.target.value }))}
                            className="field-input" />
                        </div>
                        <div className="space-y-1">
                          <label className="field-label">Last Name</label>
                          <input type="text" required value={generalForm.last_name || ""}
                            onChange={(e) => setGeneralForm((p) => ({ ...p, last_name: e.target.value }))}
                            className="field-input" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="field-label">Email</label>
                        <input type="email" value={generalForm.email || ""}
                          onChange={(e) => setGeneralForm((p) => ({ ...p, email: e.target.value }))}
                          className="field-input" />
                      </div>

                      <div className="space-y-1">
                        <label className="field-label">Phone</label>
                        <input type="text" value={generalForm.phone || ""}
                          onChange={(e) => setGeneralForm((p) => ({ ...p, phone: e.target.value }))}
                          className="field-input" />
                      </div>

                      <div className="space-y-1">
                        <label className="field-label">Profile Photo</label>
                        <MediaUploader
                          value={generalForm._photoUrl ?? (generalForm.metadata as any)?.photoUrl ?? ""}
                          onChange={(url) => setGeneralForm((p) => ({ ...p, _photoUrl: url }))}
                          type="image"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="field-label">Joining Year</label>
                          <input type="number" min="1980" max="2099"
                            value={generalForm.joining_year || ""}
                            onChange={(e) => setGeneralForm((p) => ({ ...p, joining_year: e.target.value }))}
                            placeholder="e.g. 2015"
                            className="field-input" />
                        </div>
                        <div className="space-y-1">
                          <label className="field-label">Past Experience (yrs)</label>
                          <input type="number" min="0" max="60"
                            value={generalForm.past_experience_years || ""}
                            onChange={(e) => setGeneralForm((p) => ({ ...p, past_experience_years: e.target.value }))}
                            placeholder="e.g. 3"
                            className="field-input" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="field-label">Bio</label>
                        <textarea rows={4} value={generalForm.bio || ""}
                          onChange={(e) => setGeneralForm((p) => ({ ...p, bio: e.target.value }))}
                          className="field-input resize-none" />
                      </div>

                      <div className="flex justify-end pt-2 border-t border-zinc-800">
                        <button type="submit" disabled={generalSaving}
                          className="flex items-center gap-2 rounded-lg bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson/90 disabled:opacity-50 transition">
                          {generalSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save Changes
                        </button>
                      </div>
                    </form>
                  )}

                  {/* DEPARTMENT */}
                  {activeTab === "department" && (
                    <div className="space-y-5">
                      <form onSubmit={handleAddAssignment} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Add Assignment</h3>
                        <div className="space-y-1">
                          <label className="field-label">Department</label>
                          <select required value={newAssignment.department_id}
                            onChange={(e) => setNewAssignment((p) => ({ ...p, department_id: e.target.value }))}
                            className="field-input">
                            <option value="">Select department…</option>
                            {departments.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="field-label">Designation</label>
                          <select required value={newAssignment.designation_id}
                            onChange={(e) => setNewAssignment((p) => ({ ...p, designation_id: e.target.value }))}
                            className="field-input">
                            <option value="">Select designation…</option>
                            {designations.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                            <input type="checkbox" checked={newAssignment.is_primary}
                              onChange={(e) => setNewAssignment((p) => ({ ...p, is_primary: e.target.checked }))}
                              className="h-3.5 w-3.5 rounded border-zinc-600 text-crimson" />
                            Primary assignment
                          </label>
                          <button type="submit"
                            className="rounded-lg bg-crimson px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-crimson/90 transition">
                            Add
                          </button>
                        </div>
                      </form>

                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Current Assignments</h3>
                        {assignments.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-600">
                            No assignments. This faculty won't appear in any department.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {assignments.map((a) => (
                              <div key={a.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                                <div>
                                  <p className="text-sm font-medium text-white">{a.department?.name || "—"}</p>
                                  <p className="text-xs text-zinc-500">{a.designation?.title || "—"}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {a.is_primary && (
                                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                                      Primary
                                    </span>
                                  )}
                                  <button onClick={() => handleDeleteAssignment(a.id)}
                                    className="rounded p-1 text-zinc-600 hover:bg-rose-500/10 hover:text-rose-400 transition">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ACHIEVEMENTS */}
                  {activeTab === "achievements" && (
                    <div className="space-y-5">
                      <form onSubmit={handleAddAchievement} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Add Achievement</h3>
                        <div className="space-y-1">
                          <label className="field-label">Type</label>
                          <select value={newAchievement.type}
                            onChange={(e) => setNewAchievement((p) => ({ ...p, type: e.target.value as AchievementType }))}
                            className="field-input">
                            {ACHIEVEMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="field-label">Title</label>
                          <input required type="text" value={newAchievement.title}
                            onChange={(e) => setNewAchievement((p) => ({ ...p, title: e.target.value }))}
                            placeholder="e.g. Best Paper Award, M.Tech CS, 5 years at GTU…"
                            className="field-input" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="field-label">Year (optional)</label>
                            <input type="number" value={newAchievement.year}
                              onChange={(e) => setNewAchievement((p) => ({ ...p, year: e.target.value }))}
                              placeholder="2023"
                              className="field-input" />
                          </div>
                          <div className="space-y-1">
                            <label className="field-label">Description (optional)</label>
                            <input type="text" value={newAchievement.description}
                              onChange={(e) => setNewAchievement((p) => ({ ...p, description: e.target.value }))}
                              className="field-input" />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button type="submit"
                            className="rounded-lg bg-crimson px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-crimson/90 transition">
                            Add
                          </button>
                        </div>
                      </form>

                      <div className="space-y-4">
                        {Object.keys(achievementsByType).length === 0 ? (
                          <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-600">
                            No achievements recorded yet.
                          </p>
                        ) : (
                          ACHIEVEMENT_TYPES.filter((t) => achievementsByType[t.value]?.length).map((t) => (
                            <div key={t.value}>
                              <p className="mb-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t.label}</p>
                              <div className="space-y-2">
                                {achievementsByType[t.value].map((a: any) => (
                                  <div key={a.id} className="flex items-start justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                                    <div>
                                      <p className="text-sm font-medium text-white">{a.title}</p>
                                      {(a.year || a.description) && (
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                          {a.year && <span>{a.year}</span>}
                                          {a.year && a.description && " · "}
                                          {a.description}
                                        </p>
                                      )}
                                    </div>
                                    <button onClick={() => handleDeleteAchievement(a.id)}
                                      className="rounded p-1 text-zinc-600 hover:bg-rose-500/10 hover:text-rose-400 transition shrink-0">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* EXPERTISE */}
                  {activeTab === "expertise" && (
                    <div className="space-y-5">
                      <form onSubmit={handleAddTag} className="flex gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="e.g. Machine Learning, VLSI, Data Structures…"
                          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-crimson focus:outline-none"
                        />
                        <button type="submit"
                          className="rounded-lg bg-crimson px-3.5 py-2 text-sm font-semibold text-white hover:bg-crimson/90 transition shrink-0">
                          Add
                        </button>
                      </form>

                      {expertise.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-600">
                          No expertise tags yet. Add areas of specialization above.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {expertise.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 pl-3 pr-2 py-1 text-xs font-medium text-zinc-300"
                            >
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="rounded-full p-0.5 text-zinc-500 hover:bg-zinc-700 hover:text-white transition"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
