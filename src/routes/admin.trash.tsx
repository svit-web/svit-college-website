import { useEffect, useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  Trash2,
  RefreshCw,
  Search,
  Loader2,
  Archive,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/trash")({
  component: AdminTrashPanelPage
});

// Tables with soft-delete support
const SOFT_DELETE_TABLES = [
  "colleges",
  "departments",
  "courses",
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

const PAGE_SIZE = 25;

function formatTableName(str: string): string {
  return str
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function AdminTrashPanelPage() {
  const { user, isAdmin } = useAdminAuth();

  const [selectedTable, setSelectedTable] = useState<string>(SOFT_DELETE_TABLES[0]);
  const [loadingData, setLoadingData] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [purgingId, setPurgingId] = useState<string | null>(null);
  // Two-step purge confirmation
  const [purgeConfirmId, setPurgeConfirmId] = useState<string | null>(null);

  const loadDeletedRecords = async (tbl = selectedTable, pg = page) => {
    setLoadingData(true);
    try {
      const from = pg * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count, error } = await (supabase as any)
        .from(tbl)
        .select("*", { count: "exact" })
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      setRecords(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      toast.error(`Failed to load trash: ${err.message}`);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    setPage(0);
    setRecords([]);
    loadDeletedRecords(selectedTable, 0);
  }, [selectedTable]);

  useEffect(() => {
    loadDeletedRecords(selectedTable, page);
  }, [page]);

  const handleRestore = async (recordId: string) => {
    setRestoringId(recordId);
    try {
      const { error } = await (supabase as any)
        .from(selectedTable)
        .update({ deleted_at: null, deleted_by: null, updated_by: user?.id })
        .eq("id", recordId);

      if (error) throw error;
      toast.success("Record restored successfully!");

      // Audit log
      try {
        await supabase.from("audit_logs").insert({
          user_id: user?.id || null,
          action: "UPDATE",
          table_name: selectedTable,
          record_id: recordId,
          old_values: { deleted_at: "IS NOT NULL" },
          new_values: { deleted_at: null, status: "restored" }
        } as any);
      } catch {}

      loadDeletedRecords();
    } catch (err: any) {
      toast.error(`Restore failed: ${err.message}`);
    } finally {
      setRestoringId(null);
    }
  };

  // Step 1: click Purge → set confirm state
  const handlePurgeRequest = (recordId: string) => {
    setPurgeConfirmId(recordId);
  };

  // Step 2: confirm typed → execute hard delete (global admin only)
  const handlePurgeConfirm = async (recordId: string) => {
    if (!isAdmin) {
      toast.error("Only Global Administrators can permanently purge records.");
      setPurgeConfirmId(null);
      return;
    }

    setPurgingId(recordId);
    setPurgeConfirmId(null);
    try {
      const { error } = await (supabase as any)
        .from(selectedTable)
        .delete()
        .eq("id", recordId);

      if (error) throw error;
      toast.success("Record permanently deleted from database!");

      try {
        await supabase.from("audit_logs").insert({
          user_id: user?.id || null,
          action: "DELETE",
          table_name: selectedTable,
          record_id: recordId,
          old_values: { deleted_at: "IS NOT NULL" },
          new_values: null
        } as any);
      } catch {}

      loadDeletedRecords();
    } catch (err: any) {
      toast.error(`Purge failed: ${err.message}`);
    } finally {
      setPurgingId(null);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    const term = searchQuery.toLowerCase();
    return records.filter((r) => {
      const label = (r.name || r.title || r.interest_name || r.degree || r.organization || r.id || "").toLowerCase();
      return label.includes(term);
    });
  }, [records, searchQuery]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy md:text-3xl flex items-center gap-3">
          <Archive className="h-8 w-8 text-rose-500" />
          Trash Panel & Recovery
        </h1>
        <p className="text-sm text-slate-500">
          Restore soft-deleted rows or permanently purge them from the database.
          {!isAdmin && (
            <span className="ml-2 rounded bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400 border border-amber-500/20">
              Purge requires Global Admin role
            </span>
          )}
        </p>
      </div>

      {/* Selector Toolbar */}
      <div className="flex flex-col gap-4 rounded-xl bg-white p-5 border border-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 flex-1">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Target Table Bin</span>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="rounded font-mono px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
            >
              {SOFT_DELETE_TABLES.map((tbl) => (
                <option key={tbl} value={tbl}>
                  {formatTableName(tbl)} ({tbl})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 flex-1 max-w-sm sm:mt-0">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Search Deleted Items</span>
            <div className="relative">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Filter by name / code / title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded font-mono py-1.5 pl-9 pr-4 text-sm text-slate-800 focus:border-crimson focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="text-right text-xs text-slate-500 font-medium">
          Deleted records: <span className="text-rose-400 font-bold">{totalCount}</span>
        </div>
      </div>

      {/* Two-step purge confirmation banner */}
      {purgeConfirmId && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-500/5 p-4">
          <div>
            <p className="text-sm font-bold text-rose-400">⚠️ Permanent Deletion Confirmation</p>
            <p className="text-xs text-slate-500 mt-0.5">
              This action <strong>cannot be undone</strong>. The record will be permanently removed from the database.
            </p>
          </div>
          <div className="flex gap-2 ml-4 shrink-0">
            <button
              onClick={() => setPurgeConfirmId(null)}
              className="rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:text-navy transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handlePurgeConfirm(purgeConfirmId)}
              className="rounded bg-rose-600 px-3 py-1.5 text-xs font-bold text-navy hover:bg-rose-500 transition"
            >
              Yes, Permanently Delete
            </button>
          </div>
        </div>
      )}

      {/* Grid Table display */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white font-mono shadow-xl">
        {loadingData ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-crimson" />
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-700">Record Info</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-700">Deleted At</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-700">UUID Ref</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecords.map((r) => {
                  const label = r.name || r.title || r.interest_name || r.degree || r.organization || "Unnamed Record";
                  return (
                    <tr key={r.id} className="hover:bg-slate-100 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-sm">{label}</div>
                        {r.code && <div className="text-xs text-slate-600 mt-0.5">Code: {r.code}</div>}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-700 font-semibold font-mono">
                        {r.deleted_at ? new Date(r.deleted_at).toLocaleString() : "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 font-mono">
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

                          {/* Purge — only visible to global admins */}
                          {isAdmin && (
                            <button
                              onClick={() => handlePurgeRequest(r.id)}
                              disabled={restoringId === r.id || purgingId === r.id || purgeConfirmId === r.id}
                              className="inline-flex items-center gap-1.5 rounded bg-rose-600/10 px-3 py-1.5 text-xs font-semibold text-rose-400 border border-rose-500/20 hover:bg-rose-600/25 transition disabled:opacity-50"
                            >
                              {purgingId === r.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                              <span>Purge</span>
                            </button>
                          )}
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
            <h3 className="mt-4 text-sm font-bold text-navy">Bin is Empty</h3>
            <p className="mt-2 max-w-xs text-xs text-slate-500">
              There are no deleted records found in the <code className="text-crimson font-mono">{selectedTable}</code> table.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-700">
          <span>Page {page + 1} of {totalPages} ({totalCount} total)</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loadingData}
              className="flex items-center gap-1 rounded border border-slate-200 px-3 py-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loadingData}
              className="flex items-center gap-1 rounded border border-slate-200 px-3 py-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
