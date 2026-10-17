"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface SectionTabItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  active: boolean;
}

/**
 * Section navigation below inner-page banners (About, Campus Life,
 * Department): one horizontally scrolling row of icon pills, active item as
 * an ink pill, with the active pill scrolled into view. Layouts mount it in
 * a sticky strip so section switching stays reachable while the page
 * scrolls. Same pill vocabulary as PillTabs (which links peer entries, not
 * page sections).
 */
export function SectionTabs({ ariaLabel, items }: { ariaLabel: string; items: SectionTabItem[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const activeHref = items.find((i) => i.active)?.href;

  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>("[aria-current='page']");
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    // Scroll only the row (not the page) so the active pill is centred.
    list.scrollLeft = active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2;
  }, [activeHref]);

  return (
    <nav aria-label={ariaLabel} className="min-w-0">
      <ul
        ref={listRef}
        className="flex min-w-0 gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "flex min-h-9 items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[0.84rem] font-semibold transition-colors",
                  item.active
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:bg-paper-deep hover:text-ink",
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
