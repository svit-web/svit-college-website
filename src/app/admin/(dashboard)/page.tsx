import Link from 'next/link';
import {
  Calendar,
  FileText,
  Users,
  School,
  BookOpen,
  Activity,
  ArrowRight,
  Building,
  ShieldCheck,
  Home,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isRouteAllowedForScope } from '@/lib/admin-sections';
import { getAdminUser, getScopeLevel } from '@/app/lib/auth/admin';
import { createClient } from '@/app/lib/supabase/server';

const PRIMARY_CARDS = [
  { key: 'placedStudents', label: 'T&P Master Hub', icon: GraduationCap, link: '/admin/tnp-hub', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { key: 'events', label: 'Events', icon: Calendar, link: '/admin/events', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  { key: 'posts', label: 'Blog & News', icon: FileText, link: '/admin/posts', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  { key: 'faculty', label: 'Faculty & Staff', icon: Users, link: '/admin/staff-wizards', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { key: 'recruiters', label: 'Recruiters', icon: ShieldCheck, link: '/admin/recruiters', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  { key: 'homepageItems', label: 'Homepage Layout', icon: Home, link: '/admin/homepage', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
] as const;

const SECONDARY_CARDS = [
  { key: 'colleges', label: 'Colleges', icon: School, link: '/admin/colleges', color: 'text-crimson', bg: 'bg-crimson/10 border-crimson/20' },
  { key: 'departments', label: 'Departments', icon: BookOpen, link: '/admin/tables/departments', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { key: 'courses', label: 'Courses', icon: BookOpen, link: '/admin/tables/courses', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
  { key: 'trusts', label: 'Trusts', icon: Building, link: '/admin/tables/trusts', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
] as const;

const ACTION_MAP: Record<string, string> = {
  INSERT: 'bg-emerald-500/10 text-emerald-400',
  UPDATE: 'bg-blue-500/10 text-blue-400',
  DELETE: 'bg-rose-500/10 text-rose-400',
};

const SCOPE_LABEL: Record<string, string> = {
  global: 'Global Administrator',
  trust: 'Trust Admin',
  college: 'College Admin',
  department: 'Department Admin',
  none: 'No Role',
};

export default async function AdminDashboardHome() {
  const admin = await getAdminUser();
  if (!admin) return null; // layout already redirects; guards TS narrowing
  const level = getScopeLevel(admin);
  const scopeLabel = SCOPE_LABEL[level] ?? 'Scoped Editor';
  const userName = `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || 'Admin';

  const supabase = await createClient();
  const sb = supabase as any;

  const [
    colleges,
    departments,
    courses,
    events,
    recruiters,
    faculty,
    trusts,
    homepageItems,
    posts,
    placedStudents,
  ] = await Promise.all([
    sb.from('colleges').select('*', { count: 'exact', head: true }),
    sb.from('departments').select('*', { count: 'exact', head: true }),
    sb.from('courses').select('*', { count: 'exact', head: true }),
    sb.from('events').select('*', { count: 'exact', head: true }),
    sb.from('recruiters').select('*', { count: 'exact', head: true }),
    sb.from('staff_profiles').select('*', { count: 'exact', head: true }),
    sb.from('trusts').select('*', { count: 'exact', head: true }),
    sb.from('homepage_items').select('*', { count: 'exact', head: true }),
    sb.from('posts').select('*', { count: 'exact', head: true }),
    sb.from('placed_students').select('*', { count: 'exact', head: true }),
  ]);

  const metrics: Record<string, number> = {
    colleges: colleges.count || 0,
    departments: departments.count || 0,
    courses: courses.count || 0,
    events: events.count || 0,
    recruiters: recruiters.count || 0,
    faculty: faculty.count || 0,
    trusts: trusts.count || 0,
    homepageItems: homepageItems.count || 0,
    posts: posts.count || 0,
    placedStudents: placedStudents.count || 0,
  };

  // audit_logs RLS is global-admin-only (`is_global_admin()`) — scoped
  // admins get zero rows regardless, so skip the query for them.
  let auditLogs: any[] = [];
  if (level === 'global') {
    const { data } = await sb
      .from('audit_logs')
      .select('id, action, table_name, record_id, created_at, user:user_id(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(8);
    auditLogs = data || [];
  }

  const visiblePrimaryCards = PRIMARY_CARDS.filter((c) => isRouteAllowedForScope(c.link, level));
  const visibleSecondaryCards = SECONDARY_CARDS.filter((c) => isRouteAllowedForScope(c.link, level));
  const visibleQuickLinks = [
    { label: 'T&P Master Hub (All Placements)', link: '/admin/tnp-hub' },
    { label: 'Add New Event', link: '/admin/events' },
    { label: 'Staff Profiles', link: '/admin/staff-wizards' },
    { label: 'Homepage Layout', link: '/admin/homepage' },
    { label: 'Trash & Recovery', link: '/admin/trash' },
    { label: 'Media Library', link: '/admin/media' },
  ].filter((l) => isRouteAllowedForScope(l.link, level));

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome row */}
      <div>
        <h1 className="text-xl font-bold text-navy">Welcome back, {userName}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{scopeLabel}</p>
      </div>

      {/* Primary stat cards */}
      <div>
        <p className="mb-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Frequently Updated</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {visiblePrimaryCards.map((card) => {
            const Icon = card.icon;
            const value = metrics[card.key];
            return (
              <Link
                key={card.key}
                href={card.link}
                className="group rounded-xl border border-slate-200 bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
              >
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg border', card.bg)}>
                  <Icon className={cn('h-4 w-4', card.color)} />
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-2xl font-bold text-navy">{value ?? 0}</span>
                  <ArrowRight className={cn('h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition', card.color)} />
                </div>
                <p className="mt-1 text-xs font-medium text-slate-500">{card.label}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Two column section */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Activity feed — 3 cols */}
        <div className="lg:col-span-3 space-y-3">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" /> Recent Activity
          </p>
          <div className="rounded-xl border admin-border admin-card overflow-hidden">
            {auditLogs.length > 0 ? (
              <div className="divide-y admin-border">
                {auditLogs.map((log: any) => {
                  const name = log.user
                    ? `${log.user.first_name || ''} ${log.user.last_name || ''}`.trim() || 'System'
                    : 'System';
                  return (
                    <div key={log.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-700 truncate">
                            <span className="font-semibold">{name}</span>
                            {' · '}
                            <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold', ACTION_MAP[log.action] || 'bg-slate-100 text-slate-500')}>
                              {log.action}
                            </span>
                            {' on '}
                            <code className="text-[10px] text-slate-500">{log.table_name}</code>
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] text-slate-400 ml-3">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center text-center p-6">
                <Activity className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-500">No activity logged yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Secondary stats — 2 cols */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Structure</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
            {visibleSecondaryCards.map((card) => {
              const Icon = card.icon;
              const value = metrics[card.key];
              return (
                <Link
                  key={card.key}
                  href={card.link}
                  className="group rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={cn('h-3.5 w-3.5', card.color)} />
                    <span className="text-base font-bold text-slate-800">{value ?? 0}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">{card.label}</p>
                </Link>
              );
            })}
          </div>

          {/* Quick links */}
          {visibleQuickLinks.length > 0 && (
            <div className="rounded-xl border admin-border admin-card p-4 space-y-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Links</p>
              {visibleQuickLinks.map((item) => (
                <Link
                  key={item.link}
                  href={item.link}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-navy transition group"
                >
                  {item.label}
                  <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-crimson transition" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
