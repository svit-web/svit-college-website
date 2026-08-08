import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { collegesQuery } from "@/lib/homepage";

export function Logo({ light = false }: { light?: boolean }) {
  const { data: colleges } = useQuery(collegesQuery);
  const logoUrl = colleges?.find((c) => c.slug === "svit-degree")?.logo_url ?? null;

  return (
    <Link to="/" className="flex items-center gap-3 group">
      {logoUrl && (
        <img
          src={logoUrl}
          alt="SVIT Vasad logo"
          className="h-12 w-12 object-contain"
        />
      )}
      <div className="leading-tight">
        <div className={cn("font-display font-bold text-base", light ? "text-white" : "text-navy")}>
          SVIT Vasad
        </div>
        <div className={cn("text-xs uppercase tracking-widest", light ? "text-white/70" : "text-muted-foreground")}>
          Institute of Technology
        </div>
      </div>
    </Link>
  );
}

