import { Link, useLocation } from "@tanstack/react-router";
import { Bell, User, LogOut, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  profile: any;
  roles: any[];
  logout: () => void;
}

export function AdminHeader({ profile, roles, logout }: HeaderProps) {
  const location = useLocation();

  // Generate breadcrumbs from route path
  const getBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    return paths.map((path, index) => {
      const to = "/" + paths.slice(0, index + 1).join("/");
      const label = path
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase());

      // If it is the last item, don't link it
      const isLast = index === paths.length - 1;

      return (
        <div key={path} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-slate-400 mx-1.5" />
          {isLast ? (
            <span className="text-slate-700 font-medium text-xs md:text-sm">{label}</span>
          ) : (
            <Link
              to={to}
              className="text-slate-600 hover:text-gold transition font-medium text-xs md:text-sm"
            >
              {label}
            </Link>
          )}
        </div>
      );
    });
  };

  const userFullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Admin User"
    : "Admin User";

  const adminRoleNames = roles.map((r) => r.name).join(", ") || "Editor";

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      {/* Breadcrumbs */}
      <div className="flex items-center">
        <Link
          to="/admin"
          className="text-navy hover:text-gold transition font-semibold text-xs md:text-sm"
        >
          Admin Portal
        </Link>
        {getBreadcrumbs()}
      </div>

      {/* Action area */}
      <div className="flex items-center gap-4">
        {/* Notifications Mock */}
        <button className="relative rounded-full p-1.5 text-slate-600 hover:bg-slate-100 hover:text-navy transition border border-transparent hover:border-slate-200">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-crimson animate-pulse" />
        </button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/50 p-1 pr-3 text-navy hover:bg-slate-100 hover:border-slate-300 transition">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/20 font-bold text-gold border border-gold/30 text-xs">
                {userFullName.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate text-xs font-semibold text-navy hidden md:block">
                {userFullName}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 border border-slate-200 bg-white text-navy" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-navy">{userFullName}</p>
                <p className="text-xs text-slate-600 font-medium truncate">{adminRoleNames}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-200" />
            <DropdownMenuItem className="focus:bg-slate-100 focus:text-navy cursor-pointer">
              <User className="mr-2 h-4 w-4 text-slate-600" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-200" />
            <DropdownMenuItem
              onClick={logout}
              className="focus:bg-crimson/10 focus:text-crimson text-crimson cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
