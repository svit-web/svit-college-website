"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface PillTabItem {
  label: string;
  to: string;
}

/**
 * Horizontal pill tabs for sub-sections (clubs, student groups, student
 * corner). Same pill vocabulary as SectionSideNav: active = ink pill. One
 * row that scrolls sideways on narrow screens instead of wrapping.
 */
export function PillTabs({ items, ariaLabel }: { items: PillTabItem[]; ariaLabel: string }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label={ariaLabel}
      className="-mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:-mx-8 md:px-8 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {items.map((it) => {
        const active = pathname === it.to || pathname?.startsWith(it.to + "/");
        return (
          <Link
            key={it.to}
            href={it.to}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[0.84rem] font-semibold transition-colors active:scale-[0.98]",
              active
                ? "border-ink bg-ink text-cream"
                : "border-line-strong text-ink hover:border-ink",
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
