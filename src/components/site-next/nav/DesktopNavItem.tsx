"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuTopItem } from "@/lib/menus.functions";
import type { ReactNode } from "react";

// Deliberately not `position:relative` on the <li> — the mega panel below
// needs to size against the whole nav bar (its nearest positioned ancestor),
// not just this trigger's own width, so it can span edge-to-edge.
//
// The <li> stretches to the full row height (h-full) instead of shrinking to
// the link's text height, so its hover hit-box reaches all the way down to
// where the panel starts. Without that, there's a dead strip between the
// shrunk link and the panel that belongs to the <ul>, not the <li> — crossing
// it fires mouseleave and closes the panel before the cursor ever reaches it.
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
    <li className="flex h-full items-center" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <Link
        href={item.url ?? "#"}
        className={cn(
          "inline-block whitespace-nowrap px-[15px] py-3 text-sm font-medium tracking-[0.01em] text-ink transition-all",
          "bg-gradient-to-b from-crimson to-crimson bg-[length:0%_2px] bg-left-bottom bg-no-repeat hover:bg-[length:100%_2px] hover:text-crimson",
          isOpen && "bg-[length:100%_2px] text-crimson",
        )}
      >
        {item.title}
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
