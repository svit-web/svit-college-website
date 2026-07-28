import { useEffect, useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { MediaUploader } from "@/components/admin/MediaUploader";
import {
  Users,
  School,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Save,
  FileText,
  Award,
  Calendar,
  Search,
  Briefcase,
  Lightbulb,
  FolderKanban,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/staff-wizards")({
  component: StaffProfileWizardPage
});

function StaffProfileWizardPage() {
  const { user, roles } = useAdminAuth();
  
  // Sidebar states
  const [staffList, setStaffList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"general" | "academics" | "qualifications" | "experience" | "research">("general");

  // Selection Details Cache
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Cache of Master Options
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);

  // Detailed State variables for currently selected Staff Profile
  const [generalForm, setGeneralForm] = useState<Record<string, any>>({});
  const [assignments, setAssignments] = useState<any[]>([]);
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);
  const [patents, setPatents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);

  // Modals / Dialog sub-states for inline adds
  const [isNewStaffOpen, setIsNewStaffOpen] = useState(false);
  const [newStaffValues, setNewStaffValues] = useState({ title: "Dr.", first_name: "", last_name: "", email: "", phone: "" });

  // Inline forms additions
  const [newAssignment, setNewAssignment] = useState({ department_id: "", designation_id: "", is_primary: false });
  const [newQual, setNewQual] = useState({ degree: "", institution: "", year: new Date().getFullYear() });
  const [newExp, setNewExp] = useState({ organization: "", role: "", start_date: "", end_date: "", is_academic: true });
  const [newInterest, setNewInterest] = useState("");
  const [newAward, setNewAward] = useState({ title: "", awarding_body: "", received_year: new Date().getFullYear(), description: "" });
  const [newPatent, setNewPatent] = useState({ title: "", patent_number: "", patent_status: "published", publication_date: "" });
  const [newPub, setNewPub] = useState({ title: "", journal_conference: "", publish_date: "", doi_url: "", abstract: "" });
  const [newProject, setNewProject] = useState({ title: "", funding_agency: "", amount: "", duration_years: "", project_status: "ongoing" });

  // Action Pending loaders
  const [generalSaving, setGeneralSaving] = useState(false);

  // Scope Filtering rules
  const userScope = useMemo(() => {
    if (!roles || roles.length === 0) return { level: "none" };
    const isGlobalAdmin = roles.some(r => r.code === "admin");
    const userRoleMapping = roles[0];
    return {
      level: isGlobalAdmin ? "global" : userRoleMapping.scope_type || "none",
      trustId: userRoleMapping.trust_id,
      collegeId: userRoleMapping.college_id,
      departmentId: userRoleMapping.department_id
    };
  }, [roles]);

  // Load staff list & master datasets on mount
  useEffect(() => {
    loadStaffList();
    loadMasterOptions();
  }, []);

  // Fetch full wizard details whenever selectedStaffId changes
  useEffect(() => {
    if (selectedStaffId) {
      loadStaffDetails(selectedStaffId);
    } else {
      clearAllDetails();
    }
  }, [selectedStaffId]);

  // Master fetch query
  async function loadStaffList() {
    setListLoading(true);
    try {
      let query = supabase.from("staff_profiles").select("id, title, first_name, last_name, email, avatar_url, status");
      
      // Filter out deleted
      query = query.is("deleted_at", null);
      query = query.order("first_name", { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      setStaffList(data || []);
    } catch (err: any) {
      console.error("Error loading staff:", err);
      toast.error(`Failed to load staff list: ${err.message}`);
    } finally {
      setListLoading(false);
    }
  }

  async function loadMasterOptions() {
    try {
      const { data: deptData } = await supabase.from("departments").select("id, name, code").is("deleted_at", null);
      const { data: desigData } = await supabase.from("designations").select("id, title").is("deleted_at", null);
      setDepartments(deptData || []);
      setDesignations(desigData || []);
    } catch (err) {
      console.error("Error loading master datasets:", err);
    }
  }

  // Clear current detail states
  function clearAllDetails() {
    setGeneralForm({});
    setAssignments([]);
    setQualifications([]);
    setExperiences([]);
    setInterests([]);
    setPublications([]);
    setPatents([]);
    setProjects([]);
    setAwards([]);
  }

  // Multi-table query bundle
  async function loadStaffDetails(staffId: string) {
    setDetailsLoading(true);
    try {
      // 1. General Profile
      const { data: genData } = await supabase.from("staff_profiles").select("*").eq("id", staffId).maybeSingle();
      setGeneralForm(genData || {});

      // 2. Department Assignments
      const { data: assignData } = await supabase
        .from("staff_department_assignments")
        .select(`
          id,
          department_id,
          designation_id,
          is_primary,
          department:department_id (name, code),
          designation:designation_id (title)
        `)
        .eq("staff_id", staffId)
        .is("deleted_at", null);
      setAssignments(assignData || []);

      // 3. Qualifications
      const { data: qualData } = await supabase
        .from("qualifications")
        .select("*")
        .eq("staff_id", staffId)
        .is("deleted_at", null)
        .order("year", { ascending: false });
      setQualifications(qualData || []);

      // 4. Experiences
      const { data: expData } = await supabase
        .from("experiences")
        .select("*")
        .eq("staff_id", staffId)
        .is("deleted_at", null)
        .order("start_date", { ascending: false });
      setExperiences(expData || []);

      // 5. Research Interests
      const { data: interestData } = await supabase
        .from("research_interests")
        .select("*")
        .eq("staff_id", staffId)
        .is("deleted_at", null);
      setInterests(interestData || []);

      // 6. Patents
      const { data: patentData } = await supabase
        .from("patents")
        .select("*")
        .eq("staff_id", staffId)
        .is("deleted_at", null)
        .order("publication_date", { ascending: false });
      setPatents(patentData || []);

      // 7. Research Projects
      const { data: projectData } = await supabase
        .from("research_projects")
        .select("*")
        .eq("principal_investigator_id", staffId)
        .is("deleted_at", null);
      setProjects(projectData || []);

      // 8. Awards
      const { data: awardData } = await supabase
        .from("awards")
        .select("*")
        .eq("staff_id", staffId)
        .is("deleted_at", null)
        .order("received_year", { ascending: false });
      setAwards(awardData || []);

      // 9. Publications (Via Join Table staff_publications)
      const { data: pubData } = await supabase
        .from("staff_publications")
        .select(`
          publication_id,
          publication:publication_id (*)
        `)
        .eq("staff_id", staffId);
      
      const parsedPubs = (pubData || [])
        .map((p: any) => p.publication)
        .filter((p: any) => p && p.deleted_at === null);
      setPublications(parsedPubs);

    } catch (err: any) {
      console.error("Error loading staff details:", err);
      toast.error(`Failed to load staff details: ${err.message}`);
    } finally {
      setDetailsLoading(false);
    }
  }

  // Filtered staff list by search query
  const filteredStaffList = useMemo(() => {
    return staffList.filter((s) => {
      const fullName = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
      const email = (s.email || "").toLowerCase();
      return fullName.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
    });
  }, [staffList, searchQuery]);

  // Create Root Staff Profile Action
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("staff_profiles")
        .insert({
          title: newStaffValues.title,
          first_name: newStaffValues.first_name,
          last_name: newStaffValues.last_name,
          email: newStaffValues.email,
          phone: newStaffValues.phone,
          status: "published"
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Profile created successfully!");
      setIsNewStaffOpen(false);
      setNewStaffValues({ title: "Dr.", first_name: "", last_name: "", email: "", phone: "" });
      
      // Reload and auto-select
      await loadStaffList();
      setSelectedStaffId(data.id);
    } catch (err: any) {
      console.error("Failed to create staff:", err);
      toast.error(`Create failed: ${err.message}`);
    }
  };

  // Delete Root Staff Profile Action
  const handleDeleteStaff = async (staffId: string) => {
    const confirmed = window.confirm("Are you sure you want to permanently delete this staff member profile?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("staff_profiles")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id
        })
        .eq("id", staffId);

      if (error) throw error;
      toast.success("Staff profile soft-deleted.");
      setSelectedStaffId(null);
      loadStaffList();
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  // General Tab Save Action
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    setGeneralSaving(true);

    try {
      const { error } = await supabase
        .from("staff_profiles")
        .update({
          title: generalForm.title,
          first_name: generalForm.first_name,
          last_name: generalForm.last_name,
          email: generalForm.email,
          phone: generalForm.phone,
          avatar_url: generalForm.avatar_url,
          bio: generalForm.bio,
          office_hours: generalForm.office_hours || {},
          social_links: generalForm.social_links || {},
          status: generalForm.status || "published",
          updated_by: user?.id
        })
        .eq("id", selectedStaffId);

      if (error) throw error;
      toast.success("General profile details updated!");
      loadStaffList(); // Refresh list to update names
    } catch (err: any) {
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setGeneralSaving(false);
    }
  };

  // --- Sub-panel Add/Delete mutations ---

  // Academics Tab
  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    try {
      const { error } = await supabase.from("staff_department_assignments").insert({
        staff_id: selectedStaffId,
        department_id: newAssignment.department_id,
        designation_id: newAssignment.designation_id,
        is_primary: newAssignment.is_primary,
        status: "published"
      });
      if (error) throw error;
      toast.success("Department assignment added!");
      setNewAssignment({ department_id: "", designation_id: "", is_primary: false });
      loadStaffDetails(selectedStaffId!);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      const { error } = await supabase.from("staff_department_assignments").delete().eq("id", id);
      if (error) throw error;
      toast.success("Assignment removed.");
      loadStaffDetails(selectedStaffId!);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Qualifications Tab
  const handleAddQual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    try {
      const { error } = await supabase.from("qualifications").insert({
        staff_id: selectedStaffId,
        degree: newQual.degree,
        institution: newQual.institution,
        year: Number(newQual.year),
        status: "published"
      });
      if (error) throw error;
      toast.success("Qualification degree added!");
      setNewQual({ degree: "", institution: "", year: new Date().getFullYear() });
      loadStaffDetails(selectedStaffId!);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteQual = async (id: string) => {
    try {
      const { error } = await supabase.from("qualifications").delete().eq("id", id);
      if (error) throw error;
      toast.success("Qualification deleted.");
      loadStaffDetails(selectedStaffId!);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Experience Tab
  const handleAddExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    try {
      const { error } = await supabase.from("experiences").insert({
        staff_id: selectedStaffId,
        organization: newExp.organization,
        role: newExp.role,
        start_date: newExp.start_date || null,
        end_date: newExp.end_date || null,
        is_academic: newExp.is_academic,
        status: "published"
      } as any);
      if (error) throw error;
      toast.success("Professional experience added!");
      setNewExp({ organization: "", role: "", start_date: "", end_date: "", is_academic: true });
      loadStaffDetails(selectedStaffId!);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteExp = async (id: string) => {
    try {
      const { error } = await supabase.from("experiences").delete().eq("id", id);
      if (error) throw error;
      toast.success("Experience removed.");
      loadStaffDetails(selectedStaffId!);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Research Interests Tag list Add/Remove
  const handleAddInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId || !newInterest.trim()) return;
    try {
      const { error } = await supabase.from("research_interests").insert({
        staff_id: selectedStaffId,
        interest_name: newInterest.trim(),
        status: "published"
      });
      if (error) throw error;
      toast.success("Research interest tag registered!");
      setNewInterest("");
      loadStaffDetails(selectedStaffId!);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteInterest = async (id: string) => {
    try {
      const { error } = await supabase.from("research_interests").delete().eq("id", id);
      if (error) throw error;
      loadStaffDetails(selectedStaffId!);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Patents CRUD
  const handleAddPatent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    try {
      const { error } = await supabase.from("patents").insert({
        staff_id: selectedStaffId,
        title: newPatent.title,
        patent_number: newPatent.patent_number || null,
        patent_status: newPatent.patent_status,
        publication_date: newPatent.publication_date || null,
        inventors: [],
        status: "published"
      });
      if (error) throw error;
      toast.success("Patent entry created!");
      setNewPatent({ title: "", patent_number: "", patent_status: "published", publication_date: "" });
      loadStaffDetails(selectedStaffId!);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeletePatent = async (id: string) => {
    try {
      const { error } = await supabase.from("patents").delete().eq("id", id);
      if (error) throw error;
      toast.success("Patent entry removed.");
      loadStaffDetails(selectedStaffId!);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Projects CRUD
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    try {
      const { error } = await supabase.from("research_projects").insert({
        principal_investigator_id: selectedStaffId,
        title: newProject.title,
        funding_agency: newProject.funding_agency,
        amount: newProject.amount ? Number(newProject.amount) : null,
        duration_years: newProject.duration_years ? Number(newProject.duration_years) : null,
        project_status: newProject.project_status,
        status: "published"
      });
      if (error) throw error;
      toast.success("Research project details added!");
      setNewProject({ title: "", funding_agency: "", amount: "", duration_years: "", project_status: "ongoing" });
      loadStaffDetails(selectedStaffId!);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from("research_projects").delete().eq("id", id);
      if (error) throw error;
      toast.success("Project removed.");
      loadStaffDetails(selectedStaffId!);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Publications CRUD
  const handleAddPub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    try {
      // 1. Create entry in publications table
      const { data: pub, error: pubErr } = await supabase
        .from("publications")
        .insert({
          title: newPub.title,
          journal_conference: newPub.journal_conference,
          publish_date: newPub.publish_date || null,
          doi_url: newPub.doi_url || null,
          abstract: newPub.abstract || null,
          status: "published"
        } as any)
        .select()
        .single();
      
      if (pubErr) throw pubErr;

      // 2. Link in join table staff_publications
      const { error: linkErr } = await supabase.from("staff_publications").insert({
        staff_id: selectedStaffId,
        publication_id: pub.id
      });
      if (linkErr) throw linkErr;

      toast.success("Research publication added and linked!");
      setNewPub({ title: "", journal_conference: "", publish_date: "", doi_url: "", abstract: "" });
      loadStaffDetails(selectedStaffId!);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeletePub = async (pubId: string) => {
    try {
      // We unlink it from staff
      const { error } = await supabase
        .from("staff_publications")
        .delete()
        .eq("staff_id", selectedStaffId!)
        .eq("publication_id", pubId);
      
      if (error) throw error;
      toast.success("Publication unlinked from profile.");
      loadStaffDetails(selectedStaffId!);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="grid h-[calc(100vh-8.5rem)] grid-cols-1 overflow-hidden rounded-xl font-mono md:grid-cols-3">
      
      {/* 📁 LEFT PANEL: Staff List Drawer */}
      <div className="flex flex-col border-r border-slate-200 bg-slate-50">
        
        {/* Toolbar Header */}
        <div className="p-4 border-b border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-navy flex items-center gap-2">
              <Users className="h-5 w-5 text-crimson" />
              Faculty Members
            </h2>
            <button
              onClick={() => setIsNewStaffOpen(true)}
              className="flex items-center gap-1 rounded bg-crimson px-2 py-1 text-xs font-semibold text-white hover:bg-crimson/90 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Add New
            </button>
          </div>

          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search faculty by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded font-mono py-1.5 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-500 focus:border-crimson focus:outline-none"
            />
          </div>
        </div>

        {/* Scrollable List container */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200 max-h-full">
          {listLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-crimson" />
            </div>
          ) : filteredStaffList.length > 0 ? (
            filteredStaffList.map((staff) => {
              const active = staff.id === selectedStaffId;
              return (
                <div
                  key={staff.id}
                  onClick={() => setSelectedStaffId(staff.id)}
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition ${
                    active ? "bg-crimson/10 border-l-4 border-crimson pl-2.5" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {staff.avatar_url ? (
                      <img src={staff.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-crimson border border-slate-200">
                        {staff.first_name?.[0] || ""}{staff.last_name?.[0] || ""}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 truncate">
                        {staff.title} {staff.first_name} {staff.last_name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">{staff.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStaff(staff.id);
                    }}
                    className="rounded p-1 text-slate-600 hover:bg-rose-500/10 hover:text-rose-400 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No faculty profiles matching search queries.
            </div>
          )}
        </div>
      </div>

      {/* 🔮 RIGHT VIEW: Multi-tab Wizards Panel */}
      <div className="flex flex-col md:col-span-2 bg-white overflow-hidden">
        {selectedStaffId ? (
          detailsLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-crimson" />
                <p className="text-sm text-slate-500 font-medium">Fetching detailed profile datasets...</p>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col overflow-hidden">
              
              {/* Tab Navigation header */}
              <div className="flex border-b border-slate-200 bg-slate-100 overflow-x-auto">
                {[
                  { id: "general", label: "General details", icon: Users },
                  { id: "academics", label: "Department", icon: School },
                  { id: "qualifications", label: "Qualifications", icon: BookOpen },
                  { id: "experience", label: "Experience", icon: Briefcase },
                  { id: "research", label: "Research & Pubs", icon: Lightbulb }
                ].map((t) => {
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex items-center gap-2 border-b-2 px-5 py-4 text-xs font-bold uppercase tracking-wider transition ${
                        active
                          ? "border-crimson text-crimson bg-crimson/5"
                          : "border-transparent text-slate-500 hover:text-navy"
                      }`}
                    >
                      <t.icon className="h-3.5 w-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic scrollable Tab content */}
              <div className="flex-1 overflow-y-auto p-6 max-h-full">
                
                {/* 📌 TAB 1: General Info */}
                {activeTab === "general" && (
                  <form onSubmit={handleSaveGeneral} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Title</label>
                        <select
                          value={generalForm.title || "Dr."}
                          onChange={(e) => setGeneralForm(p => ({ ...p, title: e.target.value }))}
                          className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                        >
                          <option value="Prof.">Prof.</option>
                          <option value="Dr.">Dr.</option>
                          <option value="Mr.">Mr.</option>
                          <option value="Ms.">Ms.</option>
                          <option value="Mrs.">Mrs.</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status</label>
                        <select
                          value={generalForm.status || "published"}
                          onChange={(e) => setGeneralForm(p => ({ ...p, status: e.target.value }))}
                          className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">First Name</label>
                        <input
                          type="text"
                          value={generalForm.first_name || ""}
                          onChange={(e) => setGeneralForm(p => ({ ...p, first_name: e.target.value }))}
                          required
                          className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Last Name</label>
                        <input
                          type="text"
                          value={generalForm.last_name || ""}
                          onChange={(e) => setGeneralForm(p => ({ ...p, last_name: e.target.value }))}
                          required
                          className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email Address</label>
                        <input
                          type="email"
                          value={generalForm.email || ""}
                          onChange={(e) => setGeneralForm(p => ({ ...p, email: e.target.value }))}
                          required
                          className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                        <input
                          type="text"
                          value={generalForm.phone || ""}
                          onChange={(e) => setGeneralForm(p => ({ ...p, phone: e.target.value }))}
                          className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Profile Photo</label>
                      <MediaUploader
                        value={generalForm.avatar_url || ""}
                        onChange={(url) => setGeneralForm(p => ({ ...p, avatar_url: url }))}
                        type="image"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Bio / Introduction</label>
                      <textarea
                        value={generalForm.bio || ""}
                        onChange={(e) => setGeneralForm(p => ({ ...p, bio: e.target.value }))}
                        rows={4}
                        className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                      />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-200">
                      <button
                        type="submit"
                        disabled={generalSaving}
                        className="flex items-center gap-2 rounded bg-crimson px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-crimson/90 disabled:opacity-50 transition"
                      >
                        {generalSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        <span>Save Profile Changes</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* 📌 TAB 2: Academics Tab (Assignments) */}
                {activeTab === "academics" && (
                  <div className="space-y-8">
                    
                    {/* Add assignment subform */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                      <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                        <Plus className="h-4 w-4 text-crimson" /> Add Academic Department Assignment
                      </h3>
                      
                      <form onSubmit={handleAddAssignment} className="grid gap-4 sm:grid-cols-3 sm:items-end">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Department</label>
                          <select
                            value={newAssignment.department_id}
                            onChange={(e) => setNewAssignment(p => ({ ...p, department_id: e.target.value }))}
                            required
                            className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                          >
                            <option value="">-- Select --</option>
                            {departments.map((d) => (
                              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Designation</label>
                          <select
                            value={newAssignment.designation_id}
                            onChange={(e) => setNewAssignment(p => ({ ...p, designation_id: e.target.value }))}
                            required
                            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none"
                          >
                            <option value="">-- Select --</option>
                            {designations.map((d) => (
                              <option key={d.id} value={d.id}>{d.title}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:mb-2.5">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="is_primary"
                              checked={newAssignment.is_primary}
                              onChange={(e) => setNewAssignment(p => ({ ...p, is_primary: e.target.checked }))}
                              className="h-4 w-4 rounded border-slate-200 bg-white text-crimson"
                            />
                            <label
                              htmlFor="is_primary"
                              className="ml-2 text-xs font-semibold text-slate-500 cursor-help"
                              title="Mark this as the staff member's main department. Only the primary assignment appears on their profile page and determines HOD status."
                            >Primary Assignment</label>
                          </div>

                          <button
                            type="submit"
                            className="rounded bg-crimson px-3 py-2 text-xs font-bold text-white hover:bg-crimson/90 transition"
                          >
                            Add Role
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Assignments list */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Assignments</h3>
                      
                      {assignments.length > 0 ? (
                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-100">
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500">Department</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500">Designation</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500">Type</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {assignments.map((asg) => (
                                <tr key={asg.id} className="hover:bg-slate-50">
                                  <td className="px-4 py-3 text-sm text-slate-800">
                                    {asg.department?.name || <span className="text-slate-600">-</span>}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-500 font-medium">
                                    {asg.designation?.title || <span className="text-slate-600">-</span>}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    {asg.is_primary ? (
                                      <span className="inline-flex items-center rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                                        Primary
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                                        Additional
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={() => handleDeleteAssignment(asg.id)}
                                      className="rounded p-1 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                          No department assignments registered. Faculty profile will not show up under department staff lists.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 📌 TAB 3: Qualifications */}
                {activeTab === "qualifications" && (
                  <div className="space-y-8">
                    
                    {/* Add qualifications */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                      <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                        <Plus className="h-4 w-4 text-crimson" /> Add Degree / Academic Qualification
                      </h3>
                      
                      <form onSubmit={handleAddQual} className="grid gap-4 sm:grid-cols-3 sm:items-end">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Degree (e.g. Ph.D, M.Tech)</label>
                          <input
                            type="text"
                            placeholder="e.g. M.Tech in Computer Science"
                            value={newQual.degree}
                            onChange={(e) => setNewQual(p => ({ ...p, degree: e.target.value }))}
                            required
                            className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Institution / University</label>
                          <input
                            type="text"
                            placeholder="e.g. GTU, Ahmedabad"
                            value={newQual.institution}
                            onChange={(e) => setNewQual(p => ({ ...p, institution: e.target.value }))}
                            required
                            className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                          />
                        </div>

                        <div className="flex gap-4 items-end">
                          <div className="space-y-1 flex-1">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Graduation Year</label>
                            <input
                              type="number"
                              value={newQual.year}
                              onChange={(e) => setNewQual(p => ({ ...p, year: Number(e.target.value) }))}
                              required
                              className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                            />
                          </div>

                          <button
                            type="submit"
                            className="rounded bg-crimson px-4 py-2 text-xs font-bold text-white hover:bg-crimson/90 transition h-10"
                          >
                            Add
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Qualifications list */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Degree History</h3>
                      
                      {qualifications.length > 0 ? (
                        <div className="space-y-3">
                          {qualifications.map((q) => (
                            <div key={q.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <div className="flex gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-crimson/10 text-crimson border border-crimson/25">
                                  <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-800">{q.degree}</h4>
                                  <p className="text-xs text-slate-500">{q.institution} · Class of {q.year}</p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleDeleteQual(q.id)}
                                className="rounded p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-red-400 transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                          No qualifications listed.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 📌 TAB 4: Experience */}
                {activeTab === "experience" && (
                  <div className="space-y-8">
                    
                    {/* Add Experience form */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                      <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                        <Plus className="h-4 w-4 text-crimson" /> Add Professional Experience
                      </h3>
                      
                      <form onSubmit={handleAddExp} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Organization / College</label>
                            <input
                              type="text"
                              placeholder="e.g. SVIT Engineering College"
                              value={newExp.organization}
                              onChange={(e) => setNewExp(p => ({ ...p, organization: e.target.value }))}
                              required
                              className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Role / Title</label>
                            <input
                              type="text"
                              placeholder="e.g. Associate Professor"
                              value={newExp.role}
                              onChange={(e) => setNewExp(p => ({ ...p, role: e.target.value }))}
                              required
                              className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Start Date</label>
                            <input
                              type="date"
                              value={newExp.start_date}
                              onChange={(e) => setNewExp(p => ({ ...p, start_date: e.target.value }))}
                              className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">End Date (Leave blank if present)</label>
                            <input
                              type="date"
                              value={newExp.end_date}
                              onChange={(e) => setNewExp(p => ({ ...p, end_date: e.target.value }))}
                              className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                            />
                          </div>

                          <div className="flex gap-4 items-center justify-between sm:justify-end sm:mb-2.5">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="is_academic"
                                checked={newExp.is_academic}
                                onChange={(e) => setNewExp(p => ({ ...p, is_academic: e.target.checked }))}
                                className="h-4 w-4 rounded border-slate-200 bg-white text-crimson"
                              />
                              <label htmlFor="is_academic" className="ml-2 text-xs font-semibold text-slate-500">Teaching / Academic</label>
                            </div>

                            <button
                              type="submit"
                              className="rounded bg-crimson px-4 py-2 text-xs font-bold text-white hover:bg-crimson/90 transition"
                            >
                              Add Exp
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Timeline List */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Employment Timeline</h3>
                      
                      {experiences.length > 0 ? (
                        <div className="relative border-l-2 border-slate-200 pl-4 ml-3 space-y-6">
                          {experiences.map((exp) => (
                            <div key={exp.id} className="relative">
                              {/* Icon dot */}
                              <div className="absolute -left-[25px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white border border-slate-200">
                                <div className="h-2 w-2 rounded-full bg-crimson" />
                              </div>

                              <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-800">{exp.role}</h4>
                                  <p className="text-xs text-slate-500">{exp.organization}</p>
                                  <p className="mt-1 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                                    {exp.start_date ? exp.start_date : "?"} — {exp.end_date ? exp.end_date : "Present"}
                                    {exp.is_academic && <span className="ml-2 text-crimson">(Academic)</span>}
                                  </p>
                                </div>

                                <button
                                  onClick={() => handleDeleteExp(exp.id)}
                                  className="rounded p-1 text-slate-500 hover:bg-rose-500/10 hover:text-red-400 transition"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                          No work experience listed.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 📌 TAB 5: Research & Publications */}
                {activeTab === "research" && (
                  <div className="space-y-10">
                    
                    {/* Part A: Research Interests Tag Manager */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Research Interests Tags</h3>
                      
                      <form onSubmit={handleAddInterest} className="flex gap-2 max-w-md">
                        <input
                          type="text"
                          placeholder="e.g. Artificial Intelligence, Cryptography"
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          className="flex-1 rounded-md border border-slate-200 bg-white font-mono px-3 py-1.5 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                        />
                        <button
                          type="submit"
                          className="rounded bg-crimson px-3 py-1.5 text-xs font-semibold text-white hover:bg-crimson/90 transition"
                        >
                          Add Tag
                        </button>
                      </form>

                      {interests.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {interests.map((int) => (
                            <span
                              key={int.id}
                              className="inline-flex items-center gap-1 rounded bg-slate-100 pl-2.5 pr-1.5 py-1 text-xs font-semibold text-slate-600 border border-slate-200"
                            >
                              <span>{int.interest_name}</span>
                              <button
                                onClick={() => handleDeleteInterest(int.id)}
                                className="rounded-full p-0.5 text-slate-500 hover:bg-slate-200 hover:text-red-500 transition"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600">No research interest tags added yet.</p>
                      )}
                    </div>

                    {/* Part B: Publications CRUD */}
                    <div className="space-y-4 pt-6 border-t border-slate-200">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Journal & Conference Publications</h3>
                      
                      {/* Add publication panel */}
                      <form onSubmit={handleAddPub} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                        <h4 className="text-xs font-bold text-navy">Add New Publication & Link</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            type="text"
                            placeholder="Paper Title"
                            value={newPub.title}
                            onChange={(e) => setNewPub(p => ({ ...p, title: e.target.value }))}
                            required
                            className="w-full rounded-md border border-slate-200 bg-white font-mono px-2.5 py-1.5 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                          />
                          <input
                            type="text"
                            placeholder="Journal or Conference name"
                            value={newPub.journal_conference}
                            onChange={(e) => setNewPub(p => ({ ...p, journal_conference: e.target.value }))}
                            required
                            className="w-full rounded-md border border-slate-200 bg-white font-mono px-2.5 py-1.5 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                          />
                          <input
                            type="date"
                            value={newPub.publish_date}
                            onChange={(e) => setNewPub(p => ({ ...p, publish_date: e.target.value }))}
                            className="w-full rounded-md border border-slate-200 bg-white font-mono px-2.5 py-1.5 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                          />
                          <input
                            type="text"
                            placeholder="DOI or Website link URL"
                            value={newPub.doi_url}
                            onChange={(e) => setNewPub(p => ({ ...p, doi_url: e.target.value }))}
                            className="w-full rounded-md border border-slate-200 bg-white font-mono px-2.5 py-1.5 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                          />
                        </div>
                        <textarea
                          placeholder="Abstract / Brief Summary"
                          value={newPub.abstract}
                          onChange={(e) => setNewPub(p => ({ ...p, abstract: e.target.value }))}
                          rows={2}
                          className="w-full rounded-md border border-slate-200 bg-white font-mono px-2.5 py-1.5 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="rounded bg-crimson px-3.5 py-1.5 text-xs font-bold text-white hover:bg-crimson/90 transition"
                          >
                            Add Publication
                          </button>
                        </div>
                      </form>

                      {publications.length > 0 ? (
                        <div className="space-y-3.5">
                          {publications.map((pub) => (
                            <div key={pub.id} className="flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-slate-800">{pub.title}</h4>
                                <p className="text-xs text-slate-500">{pub.journal_conference}</p>
                                {pub.publish_date && <p className="text-[10px] text-slate-500 font-medium">Published on: {pub.publish_date}</p>}
                                {pub.doi_url && (
                                  <a href={pub.doi_url} target="_blank" rel="noreferrer" className="text-xs text-crimson hover:underline inline-block mt-1">
                                    View DOI Source
                                  </a>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeletePub(pub.id)}
                                className="rounded p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-red-400 transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600">No linked publications.</p>
                      )}
                    </div>

                    {/* Part C: Patents CRUD */}
                    <div className="space-y-4 pt-6 border-t border-slate-200">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Patents Published or Filed</h3>
                      
                      <form onSubmit={handleAddPatent} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                        <h4 className="text-xs font-bold text-navy">Add New Patent</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            type="text"
                            placeholder="Patent Title"
                            value={newPatent.title}
                            onChange={(e) => setNewPatent(p => ({ ...p, title: e.target.value }))}
                            required
                            className="w-full rounded-md border border-slate-200 bg-white font-mono px-2.5 py-1.5 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                          />
                          <input
                            type="text"
                            placeholder="Patent Number"
                            value={newPatent.patent_number}
                            onChange={(e) => setNewPatent(p => ({ ...p, patent_number: e.target.value }))}
                            className="w-full rounded-md border border-slate-200 bg-white font-mono px-2.5 py-1.5 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                          />
                          <select
                            value={newPatent.patent_status}
                            onChange={(e) => setNewPatent(p => ({ ...p, patent_status: e.target.value }))}
                            className="w-full rounded-md border border-slate-200 bg-white font-mono px-2.5 py-1.5 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                          >
                            <option value="filed">Filed</option>
                            <option value="published">Published</option>
                            <option value="granted">Granted</option>
                          </select>
                          <input
                            type="date"
                            value={newPatent.publication_date}
                            onChange={(e) => setNewPatent(p => ({ ...p, publication_date: e.target.value }))}
                            className="w-full rounded-md border border-slate-200 bg-white font-mono px-2.5 py-1.5 text-xs text-slate-700 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="rounded bg-crimson px-3.5 py-1.5 text-xs font-bold text-white hover:bg-crimson/90 transition"
                          >
                            Add Patent
                          </button>
                        </div>
                      </form>

                      {patents.length > 0 ? (
                        <div className="space-y-3">
                          {patents.map((pat) => (
                            <div key={pat.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <div>
                                <h4 className="text-sm font-semibold text-slate-800">{pat.title}</h4>
                                <p className="text-xs text-slate-500">
                                  {pat.patent_number ? `No: ${pat.patent_number}` : "No number"} · Status: 
                                  <span className="ml-1 text-crimson font-semibold uppercase">{pat.patent_status}</span>
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeletePatent(pat.id)}
                                className="rounded p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-red-400 transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600">No patent records.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center border-l border-slate-200">
            <Users className="h-16 w-16 text-slate-800" />
            <h3 className="mt-4 text-base font-bold text-navy">No Profile Selected</h3>
            <p className="mt-2 max-w-sm text-xs text-slate-500">
              Select an existing staff member from the left side panel to edit their profile tabs, qualifications, experience, and publications.
            </p>
          </div>
        )}
      </div>

      {/* ➕ MODAL: Add New Staff Member Dialog */}
      {isNewStaffOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 p-4 z-50">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white font-mono p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-navy mb-4">Create Staff Profile</h3>
            
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">Title</label>
                  <select
                    value={newStaffValues.title}
                    onChange={(e) => setNewStaffValues(p => ({ ...p, title: e.target.value }))}
                    className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-800 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                  >
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">First Name</label>
                  <input
                    type="text"
                    required
                    value={newStaffValues.first_name}
                    onChange={(e) => setNewStaffValues(p => ({ ...p, first_name: e.target.value }))}
                    className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-800 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Last Name</label>
                <input
                  type="text"
                  required
                  value={newStaffValues.last_name}
                  onChange={(e) => setNewStaffValues(p => ({ ...p, last_name: e.target.value }))}
                  className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-800 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={newStaffValues.email}
                  onChange={(e) => setNewStaffValues(p => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-800 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Phone Number</label>
                <input
                  type="text"
                  value={newStaffValues.phone}
                  onChange={(e) => setNewStaffValues(p => ({ ...p, phone: e.target.value }))}
                  className="w-full rounded-md border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-800 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/30"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewStaffOpen(false)}
                  className="rounded border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:text-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-crimson px-4 py-2 text-xs font-semibold text-white hover:bg-crimson/90"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
