'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ABOUT_SECTIONS } from "@/lib/about-sections";
import { cn } from "@/lib/utils";

export function AboutNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="About sections"
      className="rounded-2xl border-2 border-navy/15 bg-white p-3 shadow-sm"
    >
      <div className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-widest text-crimson">
        About SVIT
      </div>
      <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {ABOUT_SECTIONS.map((s) => {
          const isActive = pathname === s.to || pathname?.startsWith(s.to + "/");
          return (
            <li key={s.to} className="shrink-0 lg:shrink">
              <Link
                href={s.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all",
                  isActive
                    ? "border-gold bg-navy text-white shadow-sm"
                    : "border-transparent text-navy hover:border-navy/15 hover:bg-secondary/60"
                )}
              >
                <span className="whitespace-nowrap lg:whitespace-normal">{s.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
