import { Link } from "@tanstack/react-router";
import svitBrand from "@/assets/svit-brand.jpg.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <img
        src={svitBrand.url}
        alt="SVIT Vasad logo"
        className="h-12 w-12 object-contain"
      />
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

