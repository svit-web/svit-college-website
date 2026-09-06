'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  School,
  Users,
  Globe,
  Trophy,
  Settings,
  ChevronDown,
  LogOut,
  BookOpen,
  PanelLeft,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isRouteAllowedForScope } from '@/lib/admin-sections';
import type { AdminUser } from '@/app/lib/auth/admin';

interface SidebarProps {
  admin: AdminUser;
  scopeLevel: 'global' | 'trust' | 'college' | 'department' | 'none';
  logout: () => void | Promise<void>;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  label: string;
  to: string;
}

interface NavGroup {
  label: string;
  icon: any;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Academics',
    icon: School,
    items: [
      { label: 'Colleges', to: '/admin/colleges' },
      { label: 'Departments', to: '/admin/tables/departments' },
      { label: 'Courses', to: '/admin/tables/courses' },
      { label: 'Facilities', to: '/admin/tables/facilities' },
      { label: 'Labs', to: '/admin/labs' },
      { label: 'Library', to: '/admin/library' },
      { label: 'Dept Activities', to: '/admin/tables/department_activities' },
      { label: 'Societies', to: '/admin/tables/centers' },
      { label: 'Scholarships', to: '/admin/scholarships' },
    ],
  },
  {
    label: 'Staff & Faculty',
    icon: Users,
    items: [{ label: 'Staff Profiles', to: '/admin/staff-wizards' }],
  },
  {
    label: 'Website CMS',
    icon: Globe,
    items: [
      { label: 'Homepage Layout', to: '/admin/homepage' },
      { label: 'Pages & Content', to: '/admin/tables/pages' },
      { label: 'Menus / Nav', to: '/admin/menus' },
      { label: 'Menu Items', to: '/admin/tables/menu_items' },
      { label: 'Blog Posts', to: '/admin/posts' },
      { label: 'Post Categories', to: '/admin/tables/content_categories' },
      { label: 'T&P Master Hub', to: '/admin/tnp-hub' },
      { label: 'Recruiters', to: '/admin/recruiters' },
      { label: 'Testimonials', to: '/admin/tables/testimonials' },
      { label: 'Board of Management', to: '/admin/tables/board_members' },
      { label: 'Committees', to: '/admin/tables/committees' },
      { label: 'Accreditations', to: '/admin/tables/accreditations' },
      { label: 'Downloads / Forms', to: '/admin/tables/downloads' },
      { label: 'Media Library', to: '/admin/media' },
    ],
  },
  {
    label: 'Campus Life',
    icon: Trophy,
    items: [
      { label: 'Events', to: '/admin/events' },
      { label: 'Sports & Athletics', to: '/admin/sports' },
      { label: 'Achievements', to: '/admin/tables/achievements' },
      { label: 'Gallery Albums', to: '/admin/tables/gallery_albums' },
      { label: 'Gallery Media', to: '/admin/tables/gallery_media' },
      { label: 'Student Clubs', to: '/admin/tables/student_clubs' },
      { label: 'Club Events', to: '/admin/tables/club_events' },
      { label: 'MOUs', to: '/admin/tables/mous' },
    ],
  },
  {
    label: 'System',
    icon: Settings,
    items: [
      { label: 'Inquiries Inbox', to: '/admin/inquiries' },
      { label: 'User Management', to: '/admin/user-management' },
      { label: 'Users & Profiles', to: '/admin/tables/user_profiles' },
      { label: 'User Roles', to: '/admin/tables/user_roles' },
      { label: 'Audit Logs', to: '/admin/tables/audit_logs' },
      { label: 'Trash & Recovery', to: '/admin/trash' },
      { label: 'Settings', to: '/admin/settings' },
    ],
  },
];

export function AdminSidebar({
  admin,
  scopeLevel,
  logout,
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Academics: true,
    'Staff & Faculty': true,
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups((p) => ({ ...p, [label]: !p[label] }));
  };

  const isActive = (to: string) => pathname === to;
  const groupHasActive = (group: NavGroup) => group.items.some((i) => isActive(i.to));

  const scopeLabel =
    scopeLevel === 'global'
      ? 'Global Admin'
      : scopeLevel === 'trust'
      ? 'Trust Admin'
      : scopeLevel === 'college'
      ? 'College Admin'
      : scopeLevel === 'department'
      ? 'Department Admin'
      : 'Editor';
  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => isRouteAllowedForScope(item.to, scopeLevel)),
  })).filter((group) => group.items.length > 0);
  const userInitial = (admin.first_name?.[0] || admin.last_name?.[0] || 'A').toUpperCase();
  const userFullName = `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || 'Admin';

  const sidebarContent = (isMobile = false) => (
    <div
      className={cn(
        'flex h-full flex-col bg-zinc-950 text-white transition-all duration-300 overflow-hidden',
        !isMobile && (collapsed ? 'w-[60px]' : 'w-64')
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-zinc-800',
          collapsed && !isMobile ? 'justify-center px-0' : 'justify-between px-4'
        )}
      >
        {(!collapsed || isMobile) && (
          <Link
            href="/admin"
            onClick={isMobile ? onMobileClose : undefined}
            className="flex items-center gap-2 font-semibold text-white text-sm hover:text-zinc-300 transition"
          >
            <BookOpen className="h-5 w-5 text-crimson shrink-0" />
            <span>SVIT Admin</span>
          </Link>
        )}
        {isMobile ? (
          <button onClick={onMobileClose} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition">
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onToggle}
            className={cn('rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition', collapsed && 'mx-auto')}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* User chip */}
      {(!collapsed || isMobile) && (
        <div className="px-3 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5 rounded-lg bg-zinc-900 px-2.5 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-crimson/20 text-xs font-bold text-crimson border border-crimson/30">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white leading-none">{userFullName}</p>
              <p className="mt-0.5 text-[10px] text-zinc-500 font-medium">{scopeLabel}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed: show avatar only */}
      {collapsed && !isMobile && (
        <div className="flex justify-center py-3 border-b border-zinc-800">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-crimson/20 text-xs font-bold text-crimson border border-crimson/30">
            {userInitial}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 admin-scroll">
        {/* Dashboard */}
        <Link
          href="/admin"
          onClick={isMobile ? onMobileClose : undefined}
          className={cn(
            'flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition',
            collapsed && !isMobile && 'justify-center px-2',
            isActive('/admin') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
          )}
          title={collapsed && !isMobile ? 'Dashboard' : undefined}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          {(!collapsed || isMobile) && <span>Dashboard</span>}
        </Link>

        {/* Groups */}
        {visibleGroups.map((group) => {
          const hasActive = groupHasActive(group);
          const expanded = expandedGroups[group.label] || hasActive;
          const visibleItems = group.items;

          if (collapsed && !isMobile) {
            return (
              <div key={group.label} className="pt-3 pb-1">
                <div className={cn('flex justify-center rounded-lg p-2 text-zinc-500', hasActive && 'text-crimson')} title={group.label}>
                  <group.icon className="h-4 w-4" />
                </div>
                {visibleItems.map((item) => (
                  <Link
                    key={item.to}
                    href={item.to}
                    aria-label={item.label}
                    className={cn(
                      'flex justify-center rounded-lg py-1.5 transition my-0.5',
                      isActive(item.to) ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                    )}
                  >
                    <span className={cn('text-[9px] font-bold uppercase leading-none tracking-wide', isActive(item.to) ? 'text-crimson' : 'text-zinc-500')}>
                      {item.label.slice(0, 2)}
                    </span>
                  </Link>
                ))}
              </div>
            );
          }

          return (
            <div key={group.label} className="pt-3">
              <button
                onClick={() => toggleGroup(group.label)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition',
                  hasActive ? 'text-crimson' : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <group.icon className="h-3.5 w-3.5" />
                  <span>{group.label}</span>
                </div>
                <ChevronDown className={cn('h-3 w-3 transition-transform duration-200', expanded && 'rotate-180')} />
              </button>

              {expanded && (
                <div className="mt-0.5 space-y-0.5 pl-2">
                  {visibleItems.map((item) => (
                    <Link
                      key={item.to}
                      href={item.to}
                      onClick={isMobile ? onMobileClose : undefined}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition',
                        isActive(item.to) ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                      )}
                    >
                      <div className={cn('h-1 w-1 rounded-full shrink-0', isActive(item.to) ? 'bg-crimson' : 'bg-zinc-700')} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer logout */}
      <div className={cn('border-t border-zinc-800 p-2', collapsed && !isMobile && 'flex justify-center')}>
        <button
          onClick={() => logout()}
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition w-full',
            collapsed && !isMobile && 'w-auto justify-center px-2'
          )}
          title={collapsed && !isMobile ? 'Log out' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!collapsed || isMobile) && <span>Log out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full shrink-0">{sidebarContent(false)}</div>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="relative z-10 flex h-full w-64 flex-col shadow-2xl">{sidebarContent(true)}</div>
        </div>
      )}
    </>
  );
}
