"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { eyebrow } from "./site-styles";

export interface SectionSideNavItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  active: boolean;
}

/**
 * Section navigation beside inner-page content (About, Campus Life,
 * Department). Desktop: a vertical list on paper, active item as an ink pill.
 * Phones/tablets: one horizontally scrolling row of pills, with the active
 * pill scrolled into view.
 */
export function SectionSideNav({
  title,
  ariaLabel,
  items,
}: {
  title: string;
  ariaLabel: string;
  items: SectionSideNavItem[];
}) {
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
      <div className={cn("mb-3 lg:mb-4 lg:px-4", eyebrow)}>{title}</div>
      <ul
        ref={listRef}
        className="-mx-5 flex min-w-0 gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:-mx-8 md:px-8 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href} className="shrink-0 lg:shrink">
              <Link
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-full border px-4 py-2 text-[0.84rem] font-semibold transition-colors lg:whitespace-normal",
                  item.active
                    ? "border-ink bg-ink text-cream"
                    : "border-line-strong text-ink hover:border-ink lg:border-transparent lg:text-ink-soft lg:hover:border-transparent lg:hover:bg-paper-deep lg:hover:text-ink",
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
