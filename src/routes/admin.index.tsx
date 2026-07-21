import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  School,
  BookOpen,
  Calendar,
  ShieldCheck,
  Activity,
  Archive,
  ArrowRight,
  Shield,
  Loader2,
  FileSpreadsheet,
  Users,
  Building,
  Home,
  FileText,
  TrendingUp,
  Plus,
  ExternalLink,
  ChevronRight,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardHome
});

function AdminDashboardHome() {
  const { user, profile, roles } = useAdminAuth();
  const [selectedDictTable, setSelectedDictTable] = useState<string>("colleges");
  const [schemaDetails, setSchemaDetails] = useState<any>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);

  const supabaseAdmin = supabase as any;

  // User Scoping Metadata
  const userScope = useMemo(() => {
    if (!roles || roles.length === 0) return { level: "none", label: "No Active Scope" };
    const primaryRole = roles[0];
    const isGlobal = roles.some(r => r.code === "admin");

    if (isGlobal) {
      return { level: "global", label: "Global Administrator (Unrestricted)" };
    }
    
    const scopeStyles: Record<string, string> = {
      trust: "Trust Editor",
      college: "College Editor",
      department: "Department Editor"
    };

    return {
      level: primaryRole.scope_type || "none",
      label: scopeStyles[primaryRole.scope_type] || "Scoped Editor",
      collegeId: primaryRole.college_id,
      departmentId: primaryRole.department_id,
      trustId: primaryRole.trust_id
    };
  }, [roles]);

  // Fetch metrics dynamically for the core entities
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ["admin", "dashboard-metrics"],
    queryFn: async () => {
      const [
        { count: colleges },
        { count: departments },
        { count: courses },
        { count: events },
        { count: recruiters },
        { count: faculty },
        { count: trusts },
        { count: homepageItems },
        { count: posts },
        { count: placementStats }
      ] = await Promise.all([
        supabaseAdmin.from("colleges").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("departments").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("courses").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("events").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("recruiters").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("staff_profiles").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("trusts").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("homepage_items").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("posts").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("placement_statistics").select("*", { count: "exact", head: true })
      ]);

      return {
        colleges: colleges || 0,
        departments: departments || 0,
        courses: courses || 0,
        events: events || 0,
        recruiters: recruiters || 0,
        faculty: faculty || 0,
        trusts: trusts || 0,
        homepageItems: homepageItems || 0,
        posts: posts || 0,
        placementStats: placementStats || 0
      };
    },
    refetchInterval: 60000 // Refetch metrics once a minute
  });

  // Fetch recent audit logs
  const { data: auditLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ["admin", "dashboard-logs"],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from("audit_logs")
        .select(`
          id,
          action,
          table_name,
          record_id,
          created_at,
          user:user_id (
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch database schema details dynamically for data dictionary viewer
  const loadSchemaDetails = async (tableId: string) => {
    setSchemaLoading(true);
    try {
      const { data, error } = await supabaseAdmin.rpc("get_table_schema_info", {
        target_table: tableId
      });
      if (error) throw error;
      setSchemaDetails(data);
    } catch (err: any) {
      console.error("Failed to load schema details:", err);
      toast.error(`Schema error: ${err.message}`);
    } finally {
      setSchemaLoading(false);
    }
  };

  // Load initial dictionary details
  useEffect(() => {
    loadSchemaDetails(selectedDictTable);
  }, [selectedDictTable]);

  // Quick Stats Config
  const statCards = [
    {
      title: "Trusts",
      value: metrics?.trusts,
      icon: Building,
      link: "/admin/tables/trusts",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      description: "Managing foundation boards"
    },
    {
      title: "Colleges",
      value: metrics?.colleges,
      icon: School,
      link: "/admin/colleges",
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      description: "Campuses & Institutes"
    },
    {
      title: "Departments",
      value: metrics?.departments,
      icon: BookOpen,
      link: "/admin/tables/departments",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      description: "Academic divisions"
    },
    {
      title: "Faculty & Staff",
      value: metrics?.faculty,
      icon: Users,
      link: "/admin/staff-wizards",
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      description: "Profiles & designations"
    },
    {
      title: "Active Courses",
      value: metrics?.courses,
      icon: FileSpreadsheet,
      link: "/admin/tables/courses",
      color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
      description: "Degree programs & branches"
    },
    {
      title: "Events",
      value: metrics?.events,
      icon: Calendar,
      link: "/admin/events",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      description: "Activities & celebrations"
    },
    {
      title: "Recruiters",
      value: metrics?.recruiters,
      icon: ShieldCheck,
      link: "/admin/recruiters",
      color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
      description: "Corporate placement partners"
    },
    {
      title: "Placement Data",
      value: metrics?.placementStats,
      icon: TrendingUp,
      link: "/admin/tables/placement_statistics",
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
      description: "Hiring percentages & charts"
    },
    {
      title: "Homepage Hero",
      value: metrics?.homepageItems,
      icon: Home,
      link: "/admin/homepage",
      color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
      description: "Carousels & widgets"
    },
    {
      title: "Blog & News",
      value: metrics?.posts,
      icon: FileText,
      link: "/admin/posts",
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      description: "Press releases & notices"
    }
  ];

  // List of tables for schema inspector
  const dataDictionaryTables = [
    "trusts",
    "institutes",
    "colleges",
    "departments",
    "staff_profiles",
    "courses",
    "events",
    "recruiters",
    "placement_statistics",
    "homepage_items",
    "posts"
  ];

  const userFullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Portal Admin"
    : "Portal Admin";

  return (
    <div className="space-y-8 font-sans antialiased text-slate-200">
      
      {/* Scope banner & welcome */}
      <div className="flex flex-col gap-4 rounded-xl border border-indigo-500/25 bg-slate-950/40 p-6 md:flex-row md:items-center md:justify-between shadow-2xl backdrop-blur-md">
        <div className="space-y-1">
          <span className="inline-flex items-center rounded bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/25">
            🔑 {userScope.label}
          </span>
          <h2 className="text-xl font-bold text-white md:text-2xl mt-1">
            Welcome back, {userFullName}!
          </h2>
          <p className="text-sm text-slate-400">
            Administrative scope controls are automatically active for your session.
          </p>
        </div>
        
        <div className="flex items-center gap-2 rounded-lg bg-slate-900/60 p-3 border border-slate-800">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-xs text-slate-400 font-semibold tracking-wide uppercase">
            Database Status: Connected
          </span>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-500" />
          Core Administrative Portals
        </h3>
        
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <a
                key={idx}
                href={card.link}
                className="group relative overflow-hidden rounded-xl border border-slate-805 bg-slate-950/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-700/80 hover:bg-slate-900/30 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300">
                    {card.title}
                  </span>
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border", card.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  {loadingMetrics ? (
                    <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                  ) : (
                    <span className="text-2xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition">
                      {card.value ?? 0}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition">
                    <span>Manage</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-1">
                  {card.description}
                </p>
              </a>
            );
          })}
        </div>
      </div>

      {/* Main Sections (Left: Audit Log & Quick Actions | Right: Data Dictionary Inspector) */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Shortcuts */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-500" />
              Quick Actions Shortcuts
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href="/admin/events"
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 hover:bg-slate-900/30 transition group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/25">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Publish Department Event</h4>
                    <p className="text-xs text-slate-500">Post news, seminar, or tech-fest details</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
              </a>

              <a
                href="/admin/recruiters"
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 hover:bg-slate-900/30 transition group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/25">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Add New Placement Recruiter</h4>
                    <p className="text-xs text-slate-500">Insert hiring partner metadata</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
              </a>

              <a
                href="/admin/trash"
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 hover:bg-slate-900/30 transition group sm:col-span-2 md:col-span-1"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/25">
                    <Archive className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Trash & Recovery Bin</h4>
                    <p className="text-xs text-slate-500">Restore or purge soft-deleted data</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
              </a>
            </div>
          </div>

          {/* Activity feed */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              <h3 className="font-display text-lg font-bold text-white">Recent System Audit Log</h3>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
              {loadingLogs ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
              ) : auditLogs && auditLogs.length > 0 ? (
                <div className="divide-y divide-slate-850">
                  {auditLogs.map((log: any) => {
                    const userFullName = log.user
                      ? `${log.user.first_name || ""} ${log.user.last_name || ""}`.trim() || "System Manager"
                      : "System Manager";
                    const dateStr = new Date(log.created_at).toLocaleString();

                    return (
                      <div
                        key={log.id}
                        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-900/10 transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-indigo-400 border border-slate-700">
                            {userFullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-200">
                              {userFullName}{" "}
                              <span className="font-normal text-slate-400">
                                performed <strong className="text-indigo-400 font-semibold">{log.action}</strong> on{" "}
                                <code className="rounded bg-slate-900 px-1.5 py-0.5 text-xs text-indigo-300 border border-slate-800">
                                  {log.table_name}
                                </code>
                              </span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Record ID: {log.record_id}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{dateStr}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-48 flex-col items-center justify-center text-center p-6">
                  <Shield className="h-10 w-10 text-slate-700 mb-2" />
                  <p className="text-sm text-slate-400 font-medium">No actions logged yet.</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Modifications to tables will be tracked here once audit log triggers execute.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Schema Inspector (Data Dictionary Viewer) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
            <Database className="h-5 w-5 text-indigo-400" />
            <h3 className="font-display text-lg font-bold text-white">Database Dictionary Inspector</h3>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-4 shadow-xl">
            <p className="text-xs text-slate-400 leading-relaxed">
              Select any table from the dropdown to query its exact schema columns, data types, and foreign key relations directly from the database catalog.
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Target Table:
              </label>
              <select
                value={selectedDictTable}
                onChange={(e) => setSelectedDictTable(e.target.value)}
                className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                {dataDictionaryTables.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {schemaLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : schemaDetails ? (
              <div className="space-y-4 pt-2">
                
                {/* Primary Key & Details */}
                <div className="flex items-center justify-between text-xs border-b border-slate-850 pb-2">
                  <span className="text-slate-400">Primary Key Column:</span>
                  <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-mono text-indigo-300 font-bold border border-indigo-500/20">
                    {schemaDetails.primary_key}
                  </span>
                </div>

                {/* Columns List */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    Columns Definition ({schemaDetails.columns.length}):
                  </span>
                  
                  <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5 divide-y divide-slate-900">
                    {schemaDetails.columns.map((col: any) => {
                      const isPK = col.name === schemaDetails.primary_key;
                      const fk = schemaDetails.foreign_keys?.find((f: any) => f.column === col.name);
                      
                      return (
                        <div key={col.name} className="flex items-center justify-between text-xs pt-1.5 first:pt-0">
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "font-mono font-medium",
                              isPK ? "text-indigo-400 font-bold" : "text-slate-300"
                            )}>
                              {col.name}
                            </span>
                            {fk && (
                              <span
                                className="cursor-help rounded bg-slate-900 border border-slate-800 px-1 py-0.2 text-[9px] text-slate-400"
                                title={`FK References ${fk.foreign_table}.${fk.foreign_column}`}
                              >
                                FK 🔗
                              </span>
                            )}
                          </div>
                          
                          <span className="font-mono text-slate-500 text-[10px]">
                            {col.type}
                            {col.is_nullable ? "?" : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Link to CRUD management */}
                <a
                  href={`/admin/tables/${selectedDictTable}`}
                  className="flex w-full items-center justify-center gap-2 rounded bg-indigo-600/15 py-2 text-xs font-bold text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600/25 hover:text-indigo-300 transition"
                >
                  <span>Open CRUD Manager</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

              </div>
            ) : null}

          </div>
        </div>

      </div>
    </div>
  );
}
