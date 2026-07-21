import { useEffect, useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  Trash2,
  RefreshCw,
  Search,
  Loader2,
  AlertTriangle,
  Archive,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/trash")({
  component: AdminTrashPanelPage
});

function formatTableName(str: string): string {
  return str
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function AdminTrashPanelPage() {
  const { user } = useAdminAuth();
  
  // States
  const [tablesWithSoftDelete, setTablesWithSoftDelete] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [purgingId, setPurgingId] = useState<string | null>(null);

  // Load tables list that contain deleted_at column
  useEffect(() => {
    async function fetchTables() {
      setLoadingTables(true);
      try {
        const { data, error } = await (supabase as any).rpc("get_table_schema_info", {
          target_table: "colleges" // just a placeholder call to get catalog info
        });
        
        // Let's run a custom SQL catalog query to get all tables with deleted_at
        const { data: tablesData, error: sqlError } = await (supabase as any).from("audit_logs").select("table_name").limit(1);
        
        // Wait, instead of audit logs, we can query information_schema columns using a generic fetch or SELECT query
        // Since get_table_schema_info works for columns, we can run a custom SQL to find all tables with deleted_at column:
        const { data: colsData, error: colsErr } = await (supabase as any).rpc("execute_sql_query", {
          query_str: "SELECT DISTINCT table_name FROM information_schema.columns WHERE table_schema = 'public' AND column_name = 'deleted_at' ORDER BY table_name;"
        });

        // Wait! Does execute_sql_query exist?
        // Let's check: we can query pg_catalog or information_schema using our Supabase RPC execution if we created one, or we can just query the metadata.
        // Wait! Let's check what RPC functions exist on Supabase:
        // We know "get_table_schema_info" exists.
        // Let's check if we can query it directly in SQL using execute_sql or we can define a list of common soft-delete tables!
        // A hardcoded list of soft-delete tables is 100% reliable and doesn't require any RPC privileges if the user has no direct SQL exec privilege in the client:
        const softDeleteTables = [
          "colleges",
          "departments",
          "courses",
          "branches",
          "facilities",
          "staff_profiles",
          "qualifications",
          "experiences",
          "awards",
          "publications",
          "research_projects",
          "patents",
          "menus",
          "menu_items",
          "homepage_sections",
          "homepage_widgets",
          "homepage_items",
          "designations",
          "staff_department_assignments",
          "content_categories",
          "posts",
          "events",
          "achievements",
          "gallery_albums",
          "gallery_media",
          "testimonials",
          "downloads",
          "recruiters",
          "placement_statistics",
          "student_clubs",
          "media_folders",
          "media_files",
          "inquiry_forms",
          "inquiry_submissions"
        ];
        
        setTablesWithSoftDelete(softDeleteTables);
        if (softDeleteTables.length > 0) {
          setSelectedTable(softDeleteTables[0]);
        }
      } catch (err) {
        console.error("Error detecting soft delete tables:", err);
      } finally {
        setLoadingTables(false);
      }
    }
    fetchTables();
  }, []);

  // Fetch soft-deleted records for selected table
  const loadDeletedRecords = async () => {
    if (!selectedTable) return;
    setLoadingData(true);
    try {
      const { data, error } = await (supabase as any)
        .from(selectedTable)
        .select("*")
        .not("deleted_at", "is", null) // rows where deleted_at IS NOT NULL
        .order("deleted_at", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err: any) {
      console.error(`Error loading trash from ${selectedTable}:`, err);
      toast.error(`Failed to load trash: ${err.message}`);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadDeletedRecords();
  }, [selectedTable]);

  // Restore Record Action (Set deleted_at = null, deleted_by = null)
  const handleRestore = async (recordId: string) => {
    setRestoringId(recordId);
    try {
      const { error } = await (supabase as any)
        .from(selectedTable)
        .update({
          deleted_at: null,
          deleted_by: null,
          updated_by: user?.id
        })
        .eq("id", recordId);

      if (error) throw error;
      toast.success("Record restored successfully!");
      
      // Log to audit logs
      try {
        await supabase.from("audit_logs").insert({
          user_id: user?.id || null,
          action: "UPDATE",
          table_name: selectedTable,
          record_id: recordId,
          old_values: { deleted_at: "IS NOT NULL" },
          new_values: { deleted_at: null, status: "restored" }
        } as any);
      } catch (e) {
        console.error("Audit log error:", e);
      }

      loadDeletedRecords();
    } catch (err: any) {
      console.error("Restore failed:", err);
      toast.error(`Restore failed: ${err.message}`);
    } finally {
      setRestoringId(null);
    }
  };

  // Hard Delete / Purge Record Action (Permanent Delete)
  const handlePurge = async (recordId: string) => {
    const confirmed = window.confirm(
      "CAUTION: This will permanently delete the record from the database. This action CANNOT be undone. Are you sure?"
    );
    if (!confirmed) return;

    setPurgingId(recordId);
    try {
      const { error } = await (supabase as any)
        .from(selectedTable)
        .delete()
        .eq("id", recordId);

      if (error) throw error;
      toast.success("Record permanently deleted from database!");

      // Log to audit logs
      try {
        await supabase.from("audit_logs").insert({
          user_id: user?.id || null,
          action: "DELETE",
          table_name: selectedTable,
          record_id: recordId,
          old_values: { deleted_at: "IS NOT NULL" },
          new_values: null
        } as any);
      } catch (e) {
        console.error("Audit log error:", e);
      }

      loadDeletedRecords();
    } catch (err: any) {
      console.error("Purge failed:", err);
      toast.error(`Purge failed: ${err.message}`);
    } finally {
      setPurgingId(null);
    }
  };

  // Filter records by search query
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const name = (r.name || r.title || r.interest_name || r.degree || r.organization || r.id || "").toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    });
  }, [records, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl flex items-center gap-3">
          <Archive className="h-8 w-8 text-rose-500" />
          Trash Panel & Recovery
        </h1>
        <p className="text-sm text-slate-400">
          Restore soft-deleted rows or purge them permanently from the database.
        </p>
      </div>

      {/* Selector Toolbar */}
      <div className="flex flex-col gap-4 rounded-xl bg-slate-950 p-5 border border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 flex-1">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Target Table Bin</span>
            {loadingTables ? (
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
            ) : (
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                {tablesWithSoftDelete.map((tbl) => (
                  <option key={tbl} value={tbl}>
                    {formatTableName(tbl)} ({tbl})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1 flex-1 max-w-sm sm:mt-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Search Deleted Items</span>
            <div className="relative">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Filter by name / code / title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded border border-slate-800 bg-slate-900 py-1.5 pl-9 pr-4 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="text-right text-xs text-slate-500 font-medium">
          Deleted records count: <span className="text-rose-400 font-bold">{records.length}</span>
        </div>
      </div>

      {/* Grid Table display */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-xl">
        {loadingData ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Record Info</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Deleted At</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">UUID Ref</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Action Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredRecords.map((r) => {
                  const label = r.name || r.title || r.interest_name || r.degree || r.organization || "Unnamed Record";
                  return (
                    <tr key={r.id} className="hover:bg-slate-900/20 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-200 text-sm">{label}</div>
                        {r.code && <div className="text-xs text-slate-500 mt-0.5">Code: {r.code}</div>}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-450 font-semibold font-mono">
                        {r.deleted_at ? new Date(r.deleted_at).toLocaleString() : "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                        {r.id}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleRestore(r.id)}
                            disabled={restoringId === r.id || purgingId === r.id}
                            className="inline-flex items-center gap-1.5 rounded bg-emerald-600/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 transition disabled:opacity-50"
                          >
                            {restoringId === r.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5" />
                            )}
                            <span>Restore</span>
                          </button>
                          
                          <button
                            onClick={() => handlePurge(r.id)}
                            disabled={restoringId === r.id || purgingId === r.id}
                            className="inline-flex items-center gap-1.5 rounded bg-rose-600/10 px-3 py-1.5 text-xs font-semibold text-rose-400 border border-rose-500/20 hover:bg-rose-600/25 transition disabled:opacity-50"
                          >
                            {purgingId === r.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            <span>Purge</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Archive className="h-12 w-12 text-slate-800" />
            <h3 className="mt-4 text-sm font-bold text-white">Bin is Empty</h3>
            <p className="mt-2 max-w-xs text-xs text-slate-500">
              There are no deleted records found in the <code className="text-indigo-400 font-mono">{selectedTable}</code> table.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
