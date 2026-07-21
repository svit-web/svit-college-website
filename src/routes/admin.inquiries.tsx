import { useEffect, useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  FileText,
  Download,
  Search,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Inbox,
  Settings,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/inquiries")({
  component: AdminInquiriesPage
});

interface InquiryFormNode {
  id: string;
  form_name: string;
  fields_config: any;
  recipient_emails: string[];
  status: string;
}

interface SubmissionNode {
  id: string;
  form_id: string;
  submitted_data: any;
  notes: string | null;
  created_at: string;
}

function AdminInquiriesPage() {
  const { user } = useAdminAuth();
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"submissions" | "forms">("submissions");

  // Forms state
  const [formsList, setFormsList] = useState<InquiryFormNode[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [loadingForms, setLoadingForms] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<InquiryFormNode | null>(null);
  const [formConfigFields, setFormConfigFields] = useState({
    form_name: "",
    fields_config: "[]",
    recipient_emails: ""
  });

  // Submissions state
  const [submissions, setSubmissions] = useState<SubmissionNode[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load Inquiry Forms
  useEffect(() => {
    loadForms();
  }, []);

  // Load Submissions when selected form changes
  useEffect(() => {
    if (selectedFormId) {
      loadSubmissions(selectedFormId);
    } else {
      setSubmissions([]);
    }
  }, [selectedFormId]);

  async function loadForms() {
    setLoadingForms(true);
    try {
      const { data, error } = await supabase
        .from("inquiry_forms")
        .select("*")
        .is("deleted_at", null)
        .order("form_name", { ascending: true });

      if (error) throw error;
      setFormsList((data as any) || []);
      if (data && data.length > 0 && !selectedFormId) {
        setSelectedFormId(data[0].id);
      }
    } catch (err: any) {
      toast.error(`Error loading forms list: ${err.message}`);
    } finally {
      setLoadingForms(false);
    }
  }

  async function loadSubmissions(formId: string) {
    setLoadingSubmissions(true);
    try {
      const { data, error } = await supabase
        .from("inquiry_submissions")
        .select("*")
        .eq("form_id", formId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err: any) {
      toast.error(`Error loading submissions: ${err.message}`);
    } finally {
      setLoadingSubmissions(false);
    }
  }

  // Save / Edit Inquiry Form schema definitions
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedFields = [];
      try {
        parsedFields = JSON.parse(formConfigFields.fields_config);
      } catch {
        throw new Error("Invalid Configuration JSON content");
      }

      const emailsArray = formConfigFields.recipient_emails
        ? formConfigFields.recipient_emails.split(",").map((em) => em.trim()).filter(Boolean)
        : [];

      const payload = {
        form_name: formConfigFields.form_name,
        fields_config: parsedFields,
        recipient_emails: emailsArray,
        status: "published"
      };

      if (editingForm) {
        const { error } = await supabase
          .from("inquiry_forms")
          .update(payload as any)
          .eq("id", editingForm.id);

        if (error) throw error;
        toast.success("Form definition modified successfully!");
      } else {
        const { error } = await supabase
          .from("inquiry_forms")
          .insert(payload as any);

        if (error) throw error;
        toast.success("New Form configuration created!");
      }

      setIsFormModalOpen(false);
      setEditingForm(null);
      loadForms();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Open Form Creator/Editor
  const handleOpenEditForm = (form: InquiryFormNode) => {
    setEditingForm(form);
    setFormConfigFields({
      form_name: form.form_name || "",
      fields_config: JSON.stringify(form.fields_config || [], null, 2),
      recipient_emails: Array.isArray(form.recipient_emails) ? form.recipient_emails.join(", ") : ""
    });
    setIsFormModalOpen(true);
  };

  // Delete Form Schema (soft delete)
  const handleDeleteForm = async (form: InquiryFormNode) => {
    const confirmed = window.confirm("Are you sure you want to delete this form template? Submissions will remain archived.");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("inquiry_forms")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id
        } as any)
        .eq("id", form.id);

      if (error) throw error;
      toast.success("Form template deleted.");
      loadForms();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Delete Inquiry Submission (soft delete)
  const handleDeleteSubmission = async (id: string) => {
    const confirmed = window.confirm("Delete this submission record?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("inquiry_submissions")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id
        } as any)
        .eq("id", id);

      if (error) throw error;
      toast.success("Submission record removed.");
      loadSubmissions(selectedFormId);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Dynamic columns extractor (collecting unique keys from submitted_data across all loaded records)
  const dataKeys = useMemo(() => {
    const keys = new Set<string>();
    submissions.forEach((sub) => {
      if (sub.submitted_data && typeof sub.submitted_data === "object") {
        Object.keys(sub.submitted_data).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [submissions]);

  // Export submissions to CSV File download helper
  const handleExportCSV = () => {
    if (submissions.length === 0) {
      toast.error("No submissions found to export!");
      return;
    }

    const headers = ["Submission ID", "Submitted Date", ...dataKeys, "Notes"];
    const rows = submissions.map((sub) => [
      sub.id,
      new Date(sub.created_at).toLocaleString(),
      ...dataKeys.map((key) => sub.submitted_data?.[key] || ""),
      sub.notes || ""
    ]);

    const csvContent = [
      headers,
      ...rows
    ]
      .map((row) =>
        row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const activeForm = formsList.find((f) => f.id === selectedFormId);
    const filename = `submissions_${activeForm?.form_name?.toLowerCase().replace(/\s+/g, "_") || "form"}_${new Date().toISOString().slice(0, 10)}.csv`;
    
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV export download started!");
  };

  // Filtered submissions based on search bar query
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      
      // Check notes
      if (sub.notes?.toLowerCase().includes(term)) return true;
      
      // Check properties in submitted_data
      if (sub.submitted_data && typeof sub.submitted_data === "object") {
        return Object.values(sub.submitted_data).some((val) =>
          String(val).toLowerCase().includes(term)
        );
      }
      return false;
    });
  }, [submissions, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl flex items-center gap-3">
            <FileText className="h-8 w-8 text-rose-500" />
            Inquiry Submission Suite
          </h1>
          <p className="text-sm text-slate-400">
            Export submissions to spreadsheet CSV logs and configure template dynamic fields.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingForm(null);
            setFormConfigFields({ form_name: "", fields_config: "[]", recipient_emails: "" });
            setIsFormModalOpen(true);
          }}
          className="flex items-center gap-2 rounded bg-indigo-650 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-550 shadow transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Inquiry Form</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("submissions")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "submissions"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-450 hover:text-slate-200"
          }`}
        >
          <Inbox className="h-4 w-4" />
          <span>Submissions Inbox</span>
        </button>

        <button
          onClick={() => setActiveTab("forms")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "forms"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-450 hover:text-slate-200"
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Configure Template Fields</span>
        </button>
      </div>

      {/* Renders Tab Panels */}
      <div className="space-y-6">
        
        {/* TAB 1: Submissions Inbox viewer */}
        {activeTab === "submissions" && (
          <div className="space-y-4">
            
            {/* Toolbar */}
            <div className="flex flex-col gap-4 rounded-xl bg-slate-950 p-4 border border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 flex-1">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-450 uppercase block">Active Template</span>
                  {loadingForms ? (
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                  ) : (
                    <select
                      value={selectedFormId}
                      onChange={(e) => setSelectedFormId(e.target.value)}
                      className="rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none"
                    >
                      {formsList.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.form_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1 flex-1 max-w-sm">
                  <span className="text-xs font-semibold text-slate-450 uppercase block">Inbox Search</span>
                  <div className="relative">
                    <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search messages, names, departments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded border border-slate-800 bg-slate-900 py-1.5 pl-9 pr-4 text-sm text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleExportCSV}
                disabled={filteredSubmissions.length === 0}
                className="flex items-center gap-2 rounded bg-rose-600/10 px-4 py-2.5 text-sm font-semibold text-rose-400 border border-rose-500/25 hover:bg-rose-650/20 disabled:opacity-40 transition"
              >
                <Download className="h-4 w-4" />
                <span>Export Submissions to CSV</span>
              </button>
            </div>

            {/* Grid Table Display */}
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-xl">
              {loadingSubmissions ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
              ) : filteredSubmissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/50">
                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Date Info</th>
                        {dataKeys.map((key) => (
                          <th key={key} className="px-6 py-4 text-xs font-bold uppercase text-slate-400">
                            {key.replace(/_/g, " ")}
                          </th>
                        ))}
                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Staff Notes</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase text-slate-400">Action Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {filteredSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-900/20 transition">
                          <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(sub.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          {dataKeys.map((key) => (
                            <td key={key} className="px-6 py-4 text-xs text-slate-200">
                              {sub.submitted_data?.[key] ? String(sub.submitted_data[key]) : <span className="text-slate-600">-</span>}
                            </td>
                          ))}
                          <td className="px-6 py-4 text-xs text-slate-450 italic">
                            {sub.notes || "(No notes added)"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteSubmission(sub.id)}
                              className="rounded p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-450 transition"
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
                <div className="flex flex-col items-center justify-center p-16 text-center">
                  <Inbox className="h-14 w-14 text-slate-800" />
                  <h3 className="mt-4 text-base font-bold text-white">No submissions found</h3>
                  <p className="mt-2 max-w-sm text-xs text-slate-500">
                    Submissions will display here once visitors submit forms on the college portal.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Forms Schema Configurator */}
        {activeTab === "forms" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
              <div className="divide-y divide-slate-850">
                {formsList.map((form) => (
                  <div
                    key={form.id}
                    className="flex items-center justify-between p-5 hover:bg-slate-900/10 transition"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">{form.form_name}</h4>
                      <p className="text-[10px] text-indigo-400 font-mono mt-0.5">
                        FieldsCount: {Array.isArray(form.fields_config) ? form.fields_config.length : 0}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditForm(form)}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteForm(form)}
                        className="rounded p-1.5 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ➕ MODAL: Add / Edit Form Schema Template */}
      {isFormModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 p-4 z-50">
          <div className="w-full max-w-lg rounded-lg border border-slate-850 bg-slate-950 p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              {editingForm ? "Edit Form Template Details" : "Create Inquiry Form Template"}
            </h3>
            
            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-450 uppercase">Form Template Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Admission Inquiries Form"
                  value={formConfigFields.form_name}
                  onChange={(e) => setFormConfigFields(p => ({ ...p, form_name: e.target.value }))}
                  className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-450 uppercase">Recipient Email Addresses (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. registrar@svit.ac.in, admissions@svit.ac.in"
                  value={formConfigFields.recipient_emails}
                  onChange={(e) => setFormConfigFields(p => ({ ...p, recipient_emails: e.target.value }))}
                  className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-450 uppercase flex items-center justify-between">
                  <span>Configuration structure JSON (fields collection)</span>
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder='e.g. [\n  { "name": "email", "type": "email", "label": "Email Address", "required": true }\n]'
                  value={formConfigFields.fields_config}
                  onChange={(e) => setFormConfigFields(p => ({ ...p, fields_config: e.target.value }))}
                  className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="rounded border border-slate-850 px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  {editingForm ? "Save Changes" : "Create Form"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
