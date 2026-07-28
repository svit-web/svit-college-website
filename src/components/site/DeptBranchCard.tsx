import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  iconUrl?: string | null;
  fallbackLabel: string;
  fallbackColor?: string | null;
  to: string;
  params: Record<string, string>;
}

/**
 * Card used for both department cards (college page grid) and branch cards
 * (course page "Specialised Branches" grid) — logo/icon left, name right,
 * full-width "View department" banner pinned to the bottom.
 */
export function DeptBranchCard({ name, iconUrl, fallbackLabel, fallbackColor, to, params }: Props) {
  return (
    <Link
      to={to}
      params={params}
      className="card-lift group flex h-full flex-col overflow-hidden rounded-2xl border-2 border-navy/15 bg-white hover:border-gold"
    >
      <div className="flex flex-1 items-center gap-4 p-5">
        {iconUrl ? (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary/40 p-2">
            <img src={iconUrl} alt="" className="h-full w-full object-contain" />
          </div>
        ) : (
          <div
            aria-hidden
            className={cn(
              "flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white",
              fallbackColor ?? "border-2 border-dashed border-navy/25 bg-secondary text-muted-foreground"
            )}
          >
            {fallbackLabel}
          </div>
        )}
        <h4 className="font-display text-lg font-bold leading-snug text-navy">{name}</h4>
      </div>
      <div className="flex items-center justify-between bg-navy px-5 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-navy-light">
        View department <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
