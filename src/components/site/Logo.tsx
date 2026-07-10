import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-navy text-white font-display font-bold text-lg tracking-tight shadow-sm">
          SV
        </div>
        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-white" />
      </div>
      <div className="leading-tight">
        <div className={cn("font-display font-bold text-base", light ? "text-white" : "text-navy")}>
          SVIT Vasad
        </div>
        <div className={cn("text-[10px] uppercase tracking-widest", light ? "text-white/70" : "text-muted-foreground")}>
          Institute of Technology
        </div>
      </div>
    </Link>
  );
}
