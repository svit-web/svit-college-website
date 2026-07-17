import { Link, useRouterState } from "@tanstack/react-router";
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label={ariaLabel} className="mb-6 flex flex-wrap gap-2">
      {items.map((it) => {
        const active = pathname === it.to || pathname.startsWith(it.to + "/");
        return (
          <Link
            key={it.to}
            to={it.to}
            className={cn(
              "rounded-full border-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all",
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
