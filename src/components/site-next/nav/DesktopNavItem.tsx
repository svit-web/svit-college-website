"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuTopItem } from "@/lib/menus.functions";
import type { ReactNode } from "react";

// Deliberately not `position:relative` on the <li> — the mega panel below
// needs to size against the whole nav bar (its nearest positioned ancestor),
// not just this trigger's own width, so it can span edge-to-edge.
export function DesktopNavItem({
  item,
  isOpen,
  onOpen,
  onClose,
  children,
}: {
  item: MenuTopItem;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  children?: ReactNode;
}) {
  const hasMega = Boolean(children);

  return (
    <li onMouseEnter={onOpen} onMouseLeave={onClose}>
      <Link
        href={item.url ?? "#"}
        className={cn(
          "link-underline inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-ink",
          isOpen && "text-crimson",
        )}
      >
        {item.title}
        {hasMega && (
          <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
        )}
      </Link>
      {hasMega && (
        <div
          className={cn(
            "absolute inset-x-0 top-full z-40 border-t border-border bg-cream shadow-2xl transition-all duration-200",
            isOpen
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-2 opacity-0",
          )}
        >
          <div className="container-page">{children}</div>
        </div>
      )}
    </li>
  );
}
