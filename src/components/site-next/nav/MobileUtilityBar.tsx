"use client";

import { Menu, X } from "lucide-react";
import { Logo } from "../Logo";

export function MobileUtilityBar({
  open,
  onToggle,
  logoUrl,
}: {
  open: boolean;
  onToggle: () => void;
  logoUrl: string | null;
}) {
  return (
    <div className="flex h-16 items-center justify-between bg-navy-deep px-4 lg:hidden">
      <Logo light logoUrl={logoUrl} />
      <button
        type="button"
        onClick={onToggle}
        className="rounded-md p-2 text-white"
        aria-label="Toggle menu"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
    </div>
  );
}
