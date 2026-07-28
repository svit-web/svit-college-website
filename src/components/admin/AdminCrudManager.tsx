import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { SeoEditor } from "@/components/admin/SeoEditor";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateTableCache } from "@/lib/cache-utils";
import { sendPasswordResetForUser } from "@/lib/admin-users.functions";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  SortingState
} from "@tanstack/react-table";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
  X,
  Loader2,
  AlertTriangle,
  KeyRound
} from "lucide-react";
import { toast } from "sonner";

const supabaseAdmin = supabase as any;

// Structured editor for the departments.metadata JSONB field
function DepartmentMetaEditor({ value, onChange }: { value: any; onChange: (val: any) => void }) {
  const meta: Record<string, any> = (() => {
    if (!value) return {};
    if (typeof value === "object") return value;
    try { return JSON.parse(value); } catch { return {}; }
  })();
  const set = (key: string, val: any) => onChange({ ...meta, [key]: val === "" ? undefined : val });
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Department Profile Fields</p>
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-600 uppercase">About</label>
        <textarea
          rows={4}
          value={meta.about || ""}
          onChange={(e) => set("about", e.target.value)}
          placeholder="Brief description of the department..."
          className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-600 uppercase">Vision</label>
          <textarea
            rows={3}
            value={meta.vision || ""}
            onChange={(e) => set("vision", e.target.value)}
            placeholder="Department vision..."
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-600 uppercase">Mission</label>
          <textarea
            rows={3}
            value={meta.mission || ""}
            onChange={(e) => set("mission", e.target.value)}
            placeholder="Department mission..."
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-600 uppercase">Intake (seats per year)</label>
        <input
          type="number"
          value={meta.intake ?? ""}
          onChange={(e) => set("intake", e.target.value ? Number(e.target.value) : "")}
          placeholder="e.g. 60"
          className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
        />
      </div>
    </div>
  );
}

// Helper to format table names into beautiful headers
function formatLabel(str: string): string {
  return str
    .replace(/_id$/, "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Columns we typically want to hide from the main table grid list to avoid clutter
const HIDDEN_GRID_COLUMNS = [
  "id",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by",
  "deleted_at",
  "deleted_by",
  "metadata",
  "bio",
  "description",
  "content"
];

// Status badge styles — module-level constant to avoid recreation per render
const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700 border-emerald-300",
  draft: "bg-amber-100 text-amber-700 border-amber-300",
  archived: "bg-rose-100 text-rose-700 border-rose-300"
};

interface AdminCrudManagerProps {
  tableId: string;
}

export function AdminCrudManager({ tableId }: AdminCrudManagerProps) {
  const { user, roles } = useAdminAuth();

  // ✅ Get Query Client for cache invalidation
  const queryClient = useQueryClient();

  // Loading States
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [mutating, setMutating] = useState(false);

  // Schema & Data states
  const [schema, setSchema] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [recordCount, setRecordCount] = useState(0);

  // Pagination & Sorting & Filters
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modals & Forms State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [rowSelection, setRowSelection] = useState({});

  // Foreign Key caches (references display mappings)
  const [fkCache, setFkCache] = useState<Record<string, Record<string, string>>>({});
  const [fkOptions, setFkOptions] = useState<Record<string, { value: string; label: string }[]>>({});

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0); // Reset page on search
    }, 450);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Determine user scoping parameters
  const userScope = useMemo(() => {
    if (!roles || roles.length === 0) return { level: "none" };
    
    // Find active role configuration
    const isGlobalAdmin = roles.some(r => r.code === "admin");
    const userRoleMapping = roles[0]; // Take primary role
    return {
      level: isGlobalAdmin ? "global" : userRoleMapping.scope_type || "none",
      trustId: userRoleMapping.trust_id,
      collegeId: userRoleMapping.college_id,
      departmentId: userRoleMapping.department_id
    };
  }, [roles]);

  // Load Schema Configuration for table
  useEffect(() => {
    async function loadSchema() {
      setSchemaLoading(true);
      try {
        const { data, error } = await supabaseAdmin.rpc("get_table_schema_info", {
          target_table: tableId
        });

        if (error) throw error;
        setSchema(data);
        
        // Clear old records & state
        setRecords([]);
        setPage(0);
        setSorting([]);
        setSearchQuery("");
        setRowSelection({});
      } catch (err: any) {
        console.error("Failed to load schema:", err);
        toast.error(`Error loading table schema: ${err.message}`);
      } finally {
        setSchemaLoading(false);
      }
    }
    loadSchema();
  }, [tableId]);

  // Fetch foreign key options for selects
  useEffect(() => {
    if (!schema?.foreign_keys || schema.foreign_keys.length === 0) return;

    async function loadFKOptions() {
      const cache: Record<string, Record<string, string>> = {};
      const options: Record<string, { value: string; label: string }[]> = {};

      await Promise.all(
        schema.foreign_keys.map(async (fk: any) => {
          try {
            // Find columns to select: we want the PK and a label column (name, title, code, etc.)
            let labelCol = "name";
            if (fk.foreign_table === "user_profiles") {
              labelCol = "first_name"; // will combine with last_name in mapping
            } else if (fk.foreign_table === "roles") {
              labelCol = "code";
            }

            // We do a select from the target foreign table
            let query = supabaseAdmin.from(fk.foreign_table).select(`id, ${labelCol}`);
            
            // Apply sorting if relevant
            query = query.order(labelCol, { ascending: true });

            const { data, error } = await query;
            if (error) throw error;

            if (data) {
              cache[fk.foreign_table] = {};
              options[fk.foreign_table] = data.map((row: any) => {
                let display = row[labelCol] || row.id;
                if (fk.foreign_table === "user_profiles") {
                  display = `${row.first_name || ""} ${row.last_name || ""}`.trim() || row.id;
                }
                cache[fk.foreign_table][row.id] = display;
                return { value: row.id, label: display };
              });
            }
          } catch (err) {
            console.error(`Failed to load references for ${fk.foreign_table}:`, err);
          }
        })
      );

      setFkCache(cache);
      setFkOptions(options);
    }

    loadFKOptions();
  }, [schema]);

  // Fetch Table Data based on filters, paging, sorting
  const loadData = async () => {
    if (!schema) return;
    setDataLoading(true);

    try {
      let query = supabaseAdmin.from(tableId).select("*", { count: "exact" });

      // Apply scoping criteria based on User Scopes
      const cols = schema.columns.map((c: any) => c.name);

      if (userScope.level !== "global") {
        if (userScope.level === "trust" && userScope.trustId && cols.includes("trust_id")) {
          query = query.eq("trust_id", userScope.trustId);
        } else if (userScope.level === "college" && userScope.collegeId) {
          if (tableId === "colleges") {
            query = query.eq("id", userScope.collegeId);
          } else if (cols.includes("college_id")) {
            query = query.eq("college_id", userScope.collegeId);
          }
        } else if (userScope.level === "department" && userScope.departmentId) {
          if (tableId === "departments") {
            query = query.eq("id", userScope.departmentId);
          } else if (cols.includes("department_id")) {
            query = query.eq("department_id", userScope.departmentId);
          }
        }
      }

      // Apply soft delete filter if column exists
      if (cols.includes("deleted_at")) {
        query = query.is("deleted_at", null);
      }

      // Apply search queries (ILIKE on primary display columns like name, code, slug)
      if (debouncedSearch) {
        const searchFilters: string[] = [];
        if (cols.includes("name")) searchFilters.push(`name.ilike.%${debouncedSearch}%`);
        if (cols.includes("code")) searchFilters.push(`code.ilike.%${debouncedSearch}%`);
        if (cols.includes("slug")) searchFilters.push(`slug.ilike.%${debouncedSearch}%`);
        if (cols.includes("title")) searchFilters.push(`title.ilike.%${debouncedSearch}%`);

        if (searchFilters.length > 0) {
          query = query.or(searchFilters.join(","));
        }
      }

      // Apply Sorting
      if (sorting.length > 0) {
        const sort = sorting[0];
        query = query.order(sort.id, { ascending: !sort.desc });
      } else {
        // Default sorting
        if (cols.includes("sort_order")) {
          query = query.order("sort_order", { ascending: true });
        } else if (cols.includes("created_at")) {
          query = query.order("created_at", { ascending: false });
        } else {
          query = query.order(schema.primary_key, { ascending: true });
        }
      }

      // Apply Pagination
      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      setRecords(data || []);
      setRecordCount(count || 0);
    } catch (err: any) {
      console.error("Error loading data:", err);
      toast.error(`Failed to load records: ${err.message}`);
    } finally {
      setDataLoading(false);
    }
  };

  // Load data on paging/sort changes
  useEffect(() => {
    loadData();
  }, [schema, page, pageSize, sorting, debouncedSearch]);

  // Open creation/edit modal
  const handleOpenModal = (record: any = null) => {
    setEditingRecord(record);
    const initialValues: Record<string, any> = {};

    schema.columns.forEach((col: any) => {
      // Don't modify system columns
      if (col.name === "created_at" || col.name === "updated_at" || col.name === "deleted_at") return;

      if (record) {
        // Pre-fill value for editing
        const rawVal = record[col.name];
        if (col.type === "ARRAY") {
          initialValues[col.name] = Array.isArray(rawVal) ? rawVal.join(", ") : (rawVal ?? "");
        } else {
          initialValues[col.name] = rawVal ?? (col.type === "boolean" ? false : "");
        }
      } else {
        // Pre-fill defaults for creation
        if (col.name === "college_id" && userScope.level === "college") {
          initialValues[col.name] = userScope.collegeId;
        } else if (col.name === "department_id" && userScope.level === "department") {
          initialValues[col.name] = userScope.departmentId;
        } else if (col.name === "trust_id" && userScope.level === "trust") {
          initialValues[col.name] = userScope.trustId;
        } else if (col.name === "status") {
          initialValues[col.name] = "published";
        } else {
          initialValues[col.name] = col.type === "boolean" ? false : "";
        }
      }
    });

    setFormValues(initialValues);
    setIsModalOpen(true);
  };

  // Handle Form field change
  const handleFieldChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Log admin actions to audit logs dynamically
  const logAuditAction = async (action: "INSERT" | "UPDATE" | "DELETE", recordId: string, oldValues: any, newValues: any) => {
    try {
      await supabase.from("audit_logs").insert({
        user_id: user?.id || null,
        action,
        table_name: tableId,
        record_id: recordId,
        old_values: oldValues || {},
        new_values: newValues || {}
      } as any);
    } catch (err) {
      console.error("Failed to write to audit_logs:", err);
    }
  };

  // Save changes (insert or update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schema) return;
    setMutating(true);

    try {
      const payload: Record<string, any> = {};

      schema.columns.forEach((col: any) => {
        // Skip system/read-only columns
        if (
          col.name === schema.primary_key ||
          col.name === "created_at" ||
          col.name === "updated_at" ||
          col.name === "deleted_at" ||
          col.name === "created_by" ||
          col.name === "updated_by"
        ) {
          return;
        }

        let val = formValues[col.name];

        // Format values based on data types
        if (col.type === "boolean") {
          payload[col.name] = !!val;
        } else if (col.type.startsWith("integer") || col.type === "numeric") {
          payload[col.name] = val === "" ? null : Number(val);
        } else if (col.name === "metadata" || col.type === "jsonb") {
          payload[col.name] = val ? (typeof val === "string" ? JSON.parse(val) : val) : {};
        } else if (col.type === "ARRAY") {
          payload[col.name] = typeof val === "string"
            ? val.split(",").map((t) => t.trim()).filter(Boolean)
            : (Array.isArray(val) ? val : []);
        } else {
          payload[col.name] = val === "" ? null : val;
        }
      });

      if (editingRecord) {
        // Update Action
        const pkVal = editingRecord[schema.primary_key];
        
        // Add auditing
        if (schema.columns.some((c: any) => c.name === "updated_by")) {
          payload.updated_by = user?.id;
        }

        const { error } = await supabaseAdmin
          .from(tableId)
          .update(payload)
          .eq(schema.primary_key, pkVal);

        if (error) throw error;
        toast.success("Record updated successfully!");
        
        // Audit log trigger
        await logAuditAction("UPDATE", pkVal, editingRecord, payload);
      } else {
        // Insert Action
        if (schema.columns.some((c: any) => c.name === "created_by")) {
          payload.created_by = user?.id;
        }

        const { data: insertedData, error } = await supabaseAdmin
          .from(tableId)
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        toast.success("Record created successfully!");

        // Audit log trigger
        if (insertedData) {
          await logAuditAction("INSERT", insertedData[schema.primary_key], null, payload);
        }
      }

      setIsModalOpen(false);
      loadData();

      // ✅ INVALIDATE CACHE - Force main website to refetch this table's data
      invalidateTableCache(queryClient, tableId);
      toast.success("✨ Changes will appear on website within seconds!", {
        duration: 3000,
      });
    } catch (err: any) {
      console.error("Mutation failed:", err);
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setMutating(false);
    }
  };

  // Delete Record (Soft delete if supported, otherwise hard delete)
  const handleDelete = async (record: any) => {
    if (!schema) return;
    const pkVal = record[schema.primary_key];
    const isSoftDelete = schema.columns.some((c: any) => c.name === "deleted_at");

    const confirmed = window.confirm(
      `Are you sure you want to delete this record?${
        isSoftDelete ? " (This will move it to the bin/soft delete)." : " (This action is permanent)."
      }`
    );
    if (!confirmed) return;

    setDataLoading(true);
    try {
      if (isSoftDelete) {
        const { error } = await supabaseAdmin
          .from(tableId)
          .update({
            deleted_at: new Date().toISOString(),
            deleted_by: user?.id
          })
          .eq(schema.primary_key, pkVal);

        if (error) throw error;
        toast.success("Record soft-deleted!");

        // Audit log trigger
        await logAuditAction("DELETE", pkVal, record, { deleted_at: new Date().toISOString() });
      } else {
        const { error } = await supabaseAdmin
          .from(tableId)
          .delete()
          .eq(schema.primary_key, pkVal);

        if (error) throw error;
        toast.success("Record permanently deleted!");

        // Audit log trigger
        await logAuditAction("DELETE", pkVal, record, null);
      }
      loadData();

      // ✅ INVALIDATE CACHE - Force main website to refetch this table's data
      invalidateTableCache(queryClient, tableId);
      toast.success("✨ Record deleted! Changes will appear on website within seconds!", {
        duration: 3000,
      });
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setDataLoading(false);
    }
  };

  // Send a password-reset email for a user_profiles row. Auth-only action —
  // never touches any table (besides the standard audit log entry).
  const handleResetPassword = async (record: any) => {
    if (!schema) return;
    const pkVal = record[schema.primary_key];

    const confirmed = window.confirm("Send a password reset email to this user?");
    if (!confirmed) return;

    setDataLoading(true);
    try {
      const result = await sendPasswordResetForUser({ data: pkVal });
      toast.success(`Password reset email sent to ${result.email}`);
      await logAuditAction("UPDATE", pkVal, null, { action: "password_reset_requested" });
    } catch (err: any) {
      console.error("Password reset failed:", err);
      toast.error(`Failed to send reset email: ${err.message}`);
    } finally {
      setDataLoading(false);
    }
  };

  // Generate Table Columns dynamically from Schema
  const tableColumns = useMemo(() => {
    if (!schema?.columns) return [];

    // Filter columns to display in grid
    const colsToDisplay = schema.columns.filter(
      (col: any) => !HIDDEN_GRID_COLUMNS.includes(col.name)
    );

    const selectionColumn = {
      id: "select",
      header: ({ table }: any) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="h-4 w-4 rounded border-slate-300 bg-white text-crimson focus:ring-crimson focus:ring-offset-white cursor-pointer"
        />
      ),
      cell: ({ row }: any) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="h-4 w-4 rounded border-slate-300 bg-white text-crimson focus:ring-crimson focus:ring-offset-white cursor-pointer"
        />
      )
    };

    const mappedColumns = colsToDisplay.map((col: any) => {
      // Check if this column is a foreign key
      const fk = schema.foreign_keys?.find((f: any) => f.column === col.name);

      return {
        accessorKey: col.name,
        header: ({ column }: any) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center gap-1.5 font-semibold text-navy hover:text-gold"
            >
              <span>{formatLabel(col.name)}</span>
              <ArrowUpDown className="h-3.5 w-3.5" />
            </button>
          );
        },
        cell: ({ getValue }: any) => {
          const val = getValue();
          if (val === null || val === undefined) return <span className="text-slate-400">-</span>;

          // If foreign key reference mapping exists, display the label instead of UUID
          if (fk && fkCache[fk.foreign_table]?.[val]) {
            return (
              <span className="inline-flex items-center rounded bg-slate-50 px-2 py-1 text-xs font-semibold text-crimson border border-slate-200">
                {fkCache[fk.foreign_table][val]}
              </span>
            );
          }

          // Format boolean
          if (col.type === "boolean") {
            return val ? (
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                True
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
                False
              </span>
            );
          }

          // Format status enums
          if (col.name === "status") {
            return (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${
                  STATUS_STYLES[val] || "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {val}
              </span>
            );
          }

          // Default truncate strings
          if (typeof val === "string") {
            return <span className="truncate max-w-xs block">{val}</span>;
          }

          return <span>{String(val)}</span>;
        }
      };
    });

    return [selectionColumn, ...mappedColumns];
  }, [schema, fkCache]);

  // Set up React Table Instance
  const table = useReactTable({
    data: records,
    columns: tableColumns,
    pageCount: Math.ceil(recordCount / pageSize),
    state: {
      sorting,
      pagination: { pageIndex: page, pageSize },
      rowSelection
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true
  });

  // Check if current user has permission to write in this table
  const hasWritePermission = useMemo(() => {
    if (userScope.level === "global") return true;

    // Check if table contains scoped field that restricts editors
    const cols = schema?.columns?.map((c: any) => c.name) || [];
    if (userScope.level === "trust" && cols.includes("trust_id")) return true;
    if (userScope.level === "college" && (cols.includes("college_id") || tableId === "colleges")) return true;
    if (userScope.level === "department" && (cols.includes("department_id") || tableId === "departments")) return true;

    return false; // Otherwise block edit for settings/global configs
  }, [userScope, schema, tableId]);

  if (schemaLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-crimson" />
          <p className="text-sm text-slate-600">Analyzing schema & references...</p>
        </div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="rounded-lg bg-white p-8 text-center border border-slate-200">
        <AlertTriangle className="mx-auto h-12 w-12 text-rose-500" />
        <h3 className="mt-4 text-lg font-bold text-navy">Schema Analysis Error</h3>
        <p className="mt-2 text-sm text-slate-600">
          The requested table <code className="text-rose-600 font-mono">"{tableId}"</code> was not found in the public database schema.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Actions Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy md:text-3xl">
            {formatLabel(tableId)} Manager
          </h1>
          <p className="text-sm text-slate-600">
            {recordCount} total rows found in database
          </p>
        </div>

        {hasWritePermission ? (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-md bg-crimson px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-crimson/20 transition hover:bg-crimson/90 focus:outline-none focus:ring-2 focus:ring-crimson"
          >
            <Plus className="h-4 w-4" />
            <span>Add {formatLabel(tableId).slice(0, -1) || "Record"}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-md bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 border border-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Read-Only (Global Config)</span>
          </div>
        )}
      </div>

      {/* Grid Filter Toolbar */}
      <div className="flex flex-col gap-4 rounded-lg bg-slate-50 p-4 border border-slate-200 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search matching fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-text-slate-600 transition focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute top-2.5 right-3 text-slate-500 hover:text-navy"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="text-right text-xs text-slate-500 font-medium">
          Active Schema: <code className="text-crimson font-mono">{tableId}</code>
        </div>
      </div>

      {/* Grid Table Container */}
      <div className="relative overflow-hidden rounded-lg bg-white border border-slate-200 shadow-xl">
        {dataLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader2 className="h-10 w-10 animate-spin text-crimson" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-200 bg-slate-50">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-4 text-sm font-semibold text-slate-700">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                  {hasWritePermission && (
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  )}
                </tr>
              ))}
            </thead>
            <tbody>
              {records.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-sm text-slate-700 font-medium">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                    {hasWritePermission && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {tableId === "user_profiles" && (
                            <button
                              onClick={() => handleResetPassword(row.original)}
                              className="rounded p-1 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"
                              title="Send password reset email"
                            >
                              <KeyRound className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal(row.original)}
                            className="rounded p-1 text-slate-600 hover:bg-slate-100 hover:text-navy transition"
                            title="Edit record"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(row.original)}
                            className="rounded p-1 text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
                            title="Delete record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={tableColumns.length + (hasWritePermission ? 1 : 0)}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {recordCount > 0 && (
          <div className="flex flex-col gap-4 items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row">
            <span className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">{page * pageSize + 1}</span> to{" "}
              <span className="font-semibold text-slate-700">
                {Math.min((page + 1) * pageSize, recordCount)}
              </span>{" "}
              of <span className="font-semibold text-slate-700">{recordCount}</span> results
            </span>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(0);
                  }}
                  className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-crimson/50"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center justify-center rounded border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-navy disabled:pointer-events-none disabled:opacity-40 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * pageSize >= recordCount}
                  className="flex items-center justify-center rounded border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-navy disabled:pointer-events-none disabled:opacity-40 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/80 p-4 z-50 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-black/30 transition">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-navy"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-display text-xl font-bold text-navy mb-4">
              {editingRecord ? "Edit Record Details" : `Add New ${formatLabel(tableId).slice(0, -1) || "Record"}`}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {schema.columns.map((col: any) => {
                // Ignore system columns completely in editing
                if (
                  col.name === "created_at" ||
                  col.name === "updated_at" ||
                  col.name === "deleted_at" ||
                  col.name === "created_by" ||
                  col.name === "updated_by" ||
                  col.name === "deleted_by"
                ) {
                  return null;
                }

                // If editing and this is primary key, render as read-only label
                if (col.name === schema.primary_key) {
                  if (!editingRecord) return null;
                  return (
                    <div key={col.name} className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        {formatLabel(col.name)}
                      </label>
                      <input
                        type="text"
                        value={formValues[col.name] || ""}
                        readOnly
                        className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none"
                      />
                    </div>
                  );
                }

                // Check if column is a foreign key
                const fk = schema.foreign_keys?.find((f: any) => f.column === col.name);

                return (
                  <div key={col.name} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>{formatLabel(col.name)}</span>
                      {!col.is_nullable && (
                        <span className="text-[10px] text-crimson font-medium font-mono">Required</span>
                      )}
                    </label>

                    {/* Boolean Select Checkbox or SEO Editor */}
                    {col.name === "seo_id" ? (
                      <SeoEditor
                        seoId={formValues.seo_id}
                        onChange={(newSeoId) => handleFieldChange("seo_id", newSeoId)}
                      />
                    ) : col.type === "boolean" ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={col.name}
                          checked={!!formValues[col.name]}
                          onChange={(e) => handleFieldChange(col.name, e.target.checked)}
                          className="h-4 w-4 rounded border-slate-200 bg-white text-crimson focus:ring-crimson focus:ring-offset-white"
                        />
                        <label htmlFor={col.name} className="ml-2 text-sm text-slate-600">
                          Toggle Active State
                        </label>
                      </div>
                    ) : /* Media/Asset Storage Uploader */
                    (col.name.endsWith("_url") || col.name.includes("image") || col.name.includes("file")) && col.type === "text" ? (
                      <MediaUploader
                        value={formValues[col.name] || ""}
                        onChange={(url) => handleFieldChange(col.name, url)}
                        type={col.name.includes("file") ? "file" : "image"}
                      />
                    ) : /* Foreign Key Dropdown */
                    fk ? (
                      <select
                        value={formValues[col.name] || ""}
                        onChange={(e) => handleFieldChange(col.name, e.target.value)}
                        required={!col.is_nullable}
                        className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/50"
                      >
                        <option value="">-- Choose {formatLabel(fk.foreign_table)} --</option>
                        {fkOptions[fk.foreign_table]?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : /* Status Field Select Dropdown */
                    col.name === "status" ? (
                      <select
                        value={formValues[col.name] || ""}
                        onChange={(e) => handleFieldChange(col.name, e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                      >
                        {/* Different tables use different status enums (e.g. events has
                            draft/published/cancelled, not draft/published/archived) —
                            use the real enum values from the DB, not a fixed guess. */}
                        {(col.enum_values ?? ["published", "draft", "archived"]).map((v: string) => (
                          <option key={v} value={v}>{formatLabel(v)}</option>
                        ))}
                      </select>
                    ) : /* Any other enum (USER-DEFINED type) column with known values */
                    col.type === "USER-DEFINED" && col.enum_values ? (
                      <select
                        value={formValues[col.name] || ""}
                        onChange={(e) => handleFieldChange(col.name, e.target.value)}
                        required={!col.is_nullable}
                        className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                      >
                        <option value="">-- Select --</option>
                        {col.enum_values.map((v: string) => (
                          <option key={v} value={v}>{formatLabel(v)}</option>
                        ))}
                      </select>
                    ) : /* Text Area for larger string inputs */
                    col.name === "description" || col.name === "bio" || col.name === "content" ? (
                      <textarea
                        value={formValues[col.name] || ""}
                        onChange={(e) => handleFieldChange(col.name, e.target.value)}
                        required={!col.is_nullable}
                        rows={3}
                        className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/50"
                      />
                    ) : /* Date Picker inputs */
                    col.type.startsWith("timestamp") || col.type === "date" ? (
                      <input
                        type="date"
                        value={formValues[col.name] ? formValues[col.name].split("T")[0] : ""}
                        onChange={(e) => handleFieldChange(col.name, e.target.value)}
                        required={!col.is_nullable}
                        className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                      />
                    ) : /* JSON / metadata textarea editor */
                    col.name === "metadata" && tableId === "departments" ? (
                      <DepartmentMetaEditor
                        value={formValues[col.name]}
                        onChange={(val) => handleFieldChange(col.name, val)}
                      />
                    ) : col.name === "metadata" || col.type === "jsonb" ? (
                      <textarea
                        value={
                          typeof formValues[col.name] === "object"
                            ? JSON.stringify(formValues[col.name], null, 2)
                            : formValues[col.name] || "{}"
                        }
                        onChange={(e) => handleFieldChange(col.name, e.target.value)}
                        required={!col.is_nullable}
                        rows={4}
                        placeholder="{}"
                        className="w-full rounded border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-800 focus:border-crimson focus:outline-none"
                      />
                    ) : /* Default Numbers or Standard text inputs */
                    (
                      <div className="space-y-1 w-full">
                        <input
                          type={col.type.startsWith("integer") || col.type === "numeric" ? "number" : "text"}
                          placeholder={col.type === "ARRAY" ? "e.g. news, engineering, academic" : ""}
                          value={formValues[col.name] ?? ""}
                          onChange={(e) => handleFieldChange(col.name, e.target.value)}
                          required={!col.is_nullable}
                          className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/50"
                        />
                        {col.type === "ARRAY" && (
                          <p className="text-[10px] text-slate-500 font-medium">
                            Enter multiple tags separated by commas.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-navy hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutating}
                  className="flex items-center gap-2 rounded bg-crimson px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-crimson/20 hover:bg-crimson/90 disabled:opacity-50 transition"
                >
                  {mutating && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{editingRecord ? "Save Changes" : "Create Record"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-xl border border-crimson/35 bg-white p-4 shadow-2xl shadow-black/30 animate-in slide-in-from-bottom duration-300">
          <div className="text-xs font-semibold text-slate-600">
            Selected <span className="text-crimson font-bold">{Object.keys(rowSelection).length}</span> rows
          </div>

          <div className="h-4 w-px border-slate-200" />
          
          <div className="flex gap-2">
            {schema.columns.some((c: any) => c.name === "status") && (
              <>
                <button
                  onClick={async () => {
                    if (!schema) return;
                    const selectedRows = table.getSelectedRowModel().flatRows.map((r: any) => r.original);
                    const selectedIds = selectedRows.map((r: any) => r[schema.primary_key]);
                    if (selectedIds.length === 0) return;
                    setDataLoading(true);
                    try {
                      const { error } = await supabaseAdmin
                        .from(tableId)
                        .update({ status: "published", updated_by: user?.id })
                        .in(schema.primary_key, selectedIds);
                      if (error) throw error;
                      toast.success(`Successfully published ${selectedIds.length} records!`);
                      // Batch audit log as a single INSERT with multiple rows
                      const auditRows = selectedRows.map((row: any) => ({
                        user_id: user?.id || null,
                        action: "UPDATE" as const,
                        table_name: tableId,
                        record_id: row[schema.primary_key],
                        old_values: row,
                        new_values: { status: "published", updated_by: user?.id }
                      }));
                      try { await supabase.from("audit_logs").insert(auditRows as any); } catch {}
                      setRowSelection({});
                      loadData();
                    } catch (err: any) {
                      toast.error(`Bulk status update failed: ${err.message}`);
                    } finally {
                      setDataLoading(false);
                    }
                  }}
                  className="rounded bg-emerald-100 px-2.5 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-300 hover:bg-emerald-200 transition"
                >
                  Publish
                </button>
                <button
                  onClick={async () => {
                    if (!schema) return;
                    const selectedRows = table.getSelectedRowModel().flatRows.map((r: any) => r.original);
                    const selectedIds = selectedRows.map((r: any) => r[schema.primary_key]);
                    if (selectedIds.length === 0) return;
                    setDataLoading(true);
                    try {
                      const { error } = await supabaseAdmin
                        .from(tableId)
                        .update({ status: "draft", updated_by: user?.id })
                        .in(schema.primary_key, selectedIds);
                      if (error) throw error;
                      toast.success(`Successfully set ${selectedIds.length} records to Draft!`);
                      // Batch audit log
                      const auditRows = selectedRows.map((row: any) => ({
                        user_id: user?.id || null,
                        action: "UPDATE" as const,
                        table_name: tableId,
                        record_id: row[schema.primary_key],
                        old_values: row,
                        new_values: { status: "draft", updated_by: user?.id }
                      }));
                      try { await supabase.from("audit_logs").insert(auditRows as any); } catch {}
                      setRowSelection({});
                      loadData();
                    } catch (err: any) {
                      toast.error(`Bulk status update failed: ${err.message}`);
                    } finally {
                      setDataLoading(false);
                    }
                  }}
                  className="rounded bg-amber-100 px-2.5 py-1.5 text-xs font-bold text-amber-700 border border-amber-300 hover:bg-amber-200 transition"
                >
                  Draft
                </button>
              </>
            )}

            <button
              onClick={async () => {
                if (!schema) return;
                const selectedRows = table.getSelectedRowModel().flatRows.map((r: any) => r.original);
                const selectedIds = selectedRows.map((r: any) => r[schema.primary_key]);
                if (selectedIds.length === 0) return;
                const isSoftDelete = schema.columns.some((c: any) => c.name === "deleted_at");
                const confirmed = window.confirm(
                  `Are you sure you want to delete these ${selectedIds.length} records?${
                    isSoftDelete ? " (They will move to the trash bin)." : " (This action is permanent)."
                  }`
                );
                if (!confirmed) return;
                setDataLoading(true);
                try {
                  if (isSoftDelete) {
                    const { error } = await supabaseAdmin
                      .from(tableId)
                      .update({
                        deleted_at: new Date().toISOString(),
                        deleted_by: user?.id
                      })
                      .in(schema.primary_key, selectedIds);
                    if (error) throw error;
                    toast.success(`Successfully soft-deleted ${selectedIds.length} records!`);
                    const deletedAt = new Date().toISOString();
                    const auditRows = selectedRows.map((row: any) => ({
                      user_id: user?.id || null,
                      action: "DELETE" as const,
                      table_name: tableId,
                      record_id: row[schema.primary_key],
                      old_values: row,
                      new_values: { deleted_at: deletedAt }
                    }));
                    try { await supabase.from("audit_logs").insert(auditRows as any); } catch {}
                  } else {
                    const { error } = await supabaseAdmin
                      .from(tableId)
                      .delete()
                      .in(schema.primary_key, selectedIds);
                    if (error) throw error;
                    toast.success(`Successfully permanently deleted ${selectedIds.length} records!`);
                    const auditRows = selectedRows.map((row: any) => ({
                      user_id: user?.id || null,
                      action: "DELETE" as const,
                      table_name: tableId,
                      record_id: row[schema.primary_key],
                      old_values: row,
                      new_values: null
                    }));
                    try { await supabase.from("audit_logs").insert(auditRows as any); } catch {}
                  }
                  setRowSelection({});
                  loadData();
                } catch (err: any) {
                  toast.error(`Bulk delete failed: ${err.message}`);
                } finally {
                  setDataLoading(false);
                }
              }}
              className="rounded bg-rose-100 px-2.5 py-1.5 text-xs font-bold text-rose-700 border border-rose-300 hover:bg-rose-200 transition"
            >
              Bulk Delete
            </button>

            <button
              onClick={() => setRowSelection({})}
              className="rounded border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-navy transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
