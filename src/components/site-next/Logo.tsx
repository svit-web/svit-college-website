import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ light = false, logoUrl }: { light?: boolean; logoUrl?: string | null }) {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      {logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
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
