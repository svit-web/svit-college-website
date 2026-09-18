"use client";

import { Menu, X } from "lucide-react";
import { Logo } from "../Logo";
import { SiteSearch } from "../SiteSearch";

export function MobileUtilityBar({
  open,
  onToggle,
  logoUrl,
  instituteName,
}: {
  open: boolean;
  onToggle: () => void;
  logoUrl: string | null;
  instituteName?: string | null;
}) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-line bg-cream px-4 lg:hidden">
      <Logo logoUrl={logoUrl} instituteName={instituteName} />
      <div className="flex items-center gap-1">
        <SiteSearch
          className="rounded-md p-2 text-ink transition-colors hover:text-crimson"
          iconClassName="h-5 w-5"
        />
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md p-2 text-ink transition-colors hover:text-crimson"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
}
