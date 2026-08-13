'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, User, LogOut, ChevronRight, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AdminUser } from '@/app/lib/auth/admin';

interface HeaderProps {
  admin: AdminUser;
  logout: () => void | Promise<void>;
  onMobileMenuToggle: () => void;
}

export function AdminHeader({ admin, logout, onMobileMenuToggle }: HeaderProps) {
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    const paths = (pathname ?? '').split('/').filter(Boolean);
    return paths.map((path, index) => {
      const to = '/' + paths.slice(0, index + 1).join('/');
      const label = path
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/^\w/, (c) => c.toUpperCase());
      const isLast = index === paths.length - 1;

      return (
        <div key={path} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-slate-300 mx-1" />
          {isLast ? (
            <span className="text-slate-700 font-medium text-xs">{label}</span>
          ) : (
            <Link href={to} className="text-slate-500 hover:text-navy transition font-medium text-xs">
              {label}
            </Link>
          )}
        </div>
      );
    });
  };

  const userFullName = `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || 'Admin User';
  const adminRoleNames = admin.roles.map((r) => r.name).join(', ') || 'Editor';

  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-2">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuToggle}
          className="flex lg:hidden items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy transition"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs */}
        <div className="flex items-center">
          <Link href="/admin" className="text-slate-500 hover:text-navy transition font-medium text-xs hidden sm:block">
            Admin
          </Link>
          <div className="hidden sm:flex">{getBreadcrumbs()}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy transition">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-crimson" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1 pr-3 text-navy hover:bg-slate-100 hover:border-slate-300 transition">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 font-bold text-gold border border-gold/30 text-xs">
                {userFullName.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[90px] truncate text-xs font-semibold text-navy hidden sm:block">{userFullName}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52 border border-slate-200 bg-white text-navy" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-semibold text-navy">{userFullName}</p>
                <p className="text-xs text-slate-500 truncate">{adminRoleNames}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-200" />
            <DropdownMenuItem className="focus:bg-slate-100 focus:text-navy cursor-pointer text-sm">
              <User className="mr-2 h-3.5 w-3.5 text-slate-500" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-200" />
            <DropdownMenuItem
              onClick={() => logout()}
              className="focus:bg-crimson/10 focus:text-crimson text-crimson cursor-pointer text-sm"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
