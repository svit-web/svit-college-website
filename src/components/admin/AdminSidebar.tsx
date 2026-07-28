import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  School,
  Users,
  Globe,
  Trophy,
  Settings,
  ChevronDown,
  LogOut,
  Search,
  BookOpen,
  FolderLock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: any;
  profile: any;
  roles: any[];
  logout: () => void;
}

interface NavItem {
  label: string;
  to: string;
  tableId?: string;
}

interface NavGroup {
  label: string;
  icon: any;
  items: NavItem[];
}

export function AdminSidebar({ profile, roles, logout }: SidebarProps) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Academics: true,
    CMS: false,
    Staff: false,
    Life: false,
    System: false
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const navGroups: NavGroup[] = [
    {
      label: "Academics",
      icon: School,
      items: [
        { label: "Colleges", to: "/admin/colleges" },
        { label: "Departments", to: "/admin/tables/departments" },
        { label: "Courses", to: "/admin/tables/courses" },
        { label: "Facilities", to: "/admin/tables/facilities" },
        { label: "Department Activities", to: "/admin/tables/department_activities" }
      ]
    },
    {
      label: "Staff & Faculty",
      icon: Users,
      items: [
        { label: "Staff Profiles", to: "/admin/staff-wizards" },
        { label: "Qualifications", to: "/admin/tables/qualifications" },
        { label: "Experiences", to: "/admin/tables/experiences" },
        { label: "Awards & Honors", to: "/admin/tables/awards" },
        { label: "Publications", to: "/admin/tables/publications" },
        { label: "Patents", to: "/admin/tables/patents" },
        { label: "Research Projects", to: "/admin/tables/research_projects" }
      ]
    },
    {
      label: "Website CMS",
      icon: Globe,
      items: [
        { label: "Homepage Layout", to: "/admin/homepage" },
        { label: "Pages & Content", to: "/admin/tables/pages" },
        { label: "Menus / Nav", to: "/admin/menus" },
        { label: "Menu Items", to: "/admin/tables/menu_items" },
        { label: "Blog Posts", to: "/admin/posts" },
        { label: "Post Categories", to: "/admin/tables/content_categories" },
        { label: "Testimonials", to: "/admin/tables/testimonials" },
        { label: "Recruiters", to: "/admin/recruiters" },
        { label: "Accreditations", to: "/admin/tables/accreditations" },
        { label: "Placement Stats", to: "/admin/tables/placement_statistics" },
        { label: "Downloads / Forms", to: "/admin/tables/downloads" },
        { label: "Media Library", to: "/admin/media" }
      ]
    },
    {
      label: "Campus Life",
      icon: Trophy,
      items: [
        { label: "Events", to: "/admin/events" },
        { label: "Achievements", to: "/admin/tables/achievements" },
        { label: "Gallery Albums", to: "/admin/tables/gallery_albums" },
        { label: "Gallery Media", to: "/admin/tables/gallery_media" },
        { label: "Cells & Units", to: "/admin/tables/cells" },
        { label: "Committees", to: "/admin/tables/committees" },
        { label: "Student Clubs", to: "/admin/tables/student_clubs" },
        { label: "MOUs", to: "/admin/tables/mous" }
      ]
    },
    {
      label: "System Settings",
      icon: Settings,
      items: [
        { label: "Inquiries Inbox", to: "/admin/inquiries" },
        { label: "Contact Info", to: "/admin/tables/contact_info" },
        { label: "Users & Profiles", to: "/admin/tables/user_profiles" },
        { label: "User Roles Mapping", to: "/admin/tables/user_roles" },
        { label: "Roles List", to: "/admin/tables/roles" },
        { label: "Redirects", to: "/admin/tables/redirects" },
        { label: "Audit Logs", to: "/admin/tables/audit_logs" },
        { label: "Trash & Recovery", to: "/admin/trash" }
      ]
    }
  ];

  // Filter groups and items based on search query
  const filteredGroups = navGroups
    .map((group) => {
      const filteredItems = group.items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...group, items: filteredItems };
    })
    .filter((group) => group.items.length > 0);

  const isAdmin = roles.some((r) => r.code === "admin");
  const userFullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Admin User"
    : "Admin User";

  return (
    <div className="flex h-full w-64 flex-col border-r border-navy-light admin-sidebar-bg text-white shadow-lg">
      {/* Header Brand */}
      <div className="flex h-16 items-center justify-between border-b border-navy-light/30 px-6">
        <Link to="/admin" className="flex items-center gap-2 font-display text-lg font-bold text-white hover:text-gold transition">
          <BookOpen className="h-6 w-6 text-gold" />
          <span>SVIT <span className="text-gold">Admin</span></span>
        </Link>
      </div>

      {/* Profile summary */}
      <div className="border-b border-navy-light/30 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-navy-light/20 p-2 border border-gold/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 font-bold text-gold border border-gold/30">
            {userFullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-semibold text-white">{userFullName}</span>
            <span className="truncate text-xs text-gold/80 font-medium">
              {isAdmin ? "Global Admin" : "Editor Portal"}
            </span>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-white/50" />
          <input
            type="text"
            placeholder="Search tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-navy-light/30 bg-navy-light/20 py-1.5 pl-9 pr-4 text-sm text-white placeholder-white/50 transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/50"
          />
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="admin-scroll flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {/* Dashboard Home Link */}
        <Link
          to="/admin"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
            location.pathname === "/admin"
              ? "bg-gold/20 text-gold border border-gold/30"
              : "text-white/80 hover:bg-navy-light/30 hover:text-white border border-transparent"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard Overview</span>
        </Link>

        {filteredGroups.map((group) => {
          const isExpanded = expandedGroups[group.label] || searchQuery !== "";
          const groupHasActiveChild = group.items.some(
            (item) => location.pathname === item.to
          );

          return (
            <div key={group.label} className="space-y-1 pt-2">
              <button
                onClick={() => toggleGroup(group.label)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition hover:bg-navy-light/30 hover:text-white",
                  groupHasActiveChild ? "text-gold" : "text-white/90"
                )}
              >
                <div className="flex items-center gap-3">
                  <group.icon className="h-4 w-4" />
                  <span>{group.label}</span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-white/50 transition-transform duration-200",
                    isExpanded && "rotate-180 text-white/70"
                  )}
                />
              </button>

              {isExpanded && (
                <div className="pl-7 space-y-1 border-l border-navy-light/30 ml-5 mt-1 py-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.to;
                    return (
                      <Link
                        key={item.label}
                        to={item.to}
                        className={cn(
                          "block rounded-md px-3 py-1.5 text-xs font-medium transition",
                          isActive
                            ? "bg-gold/15 text-gold font-semibold"
                            : "text-white/85 hover:text-white hover:bg-navy-light/20"
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Log Out */}
      <div className="border-t border-navy-light/30 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-crimson/20 hover:text-crimson border border-transparent hover:border-crimson/30"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
