'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface PillTabItem {
  label: string;
  to: string;
}

/**
 * Reusable vertical pill-tab navigation for Campus Life sub-sections.
 * On desktop the pills scroll horizontally; on mobile they wrap.
 */
export function PillTabs({ items, ariaLabel }: { items: PillTabItem[]; ariaLabel: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={ariaLabel} className="mb-6 flex flex-wrap gap-2">
      {items.map((it) => {
        const active = pathname === it.to || pathname?.startsWith(it.to + "/");
        return (
          <Link
            key={it.to}
            href={it.to}
            className={cn(
              "rounded-full border-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-[border-color,background-color,color,box-shadow] duration-150 active:scale-95 active:transition-transform active:duration-75",
              active
                ? "border-gold bg-navy text-white shadow-sm"
                : "border-navy/15 bg-white text-navy hover:border-navy/40"
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
