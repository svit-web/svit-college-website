import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ light = false, logoUrl }: { light?: boolean; logoUrl?: string | null }) {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      {logoUrl && (
        <div className="relative h-12 w-12">
          <Image src={logoUrl} alt="SVIT Vasad logo" fill sizes="48px" className="object-contain" />
        </div>
      )}
      <div className="leading-tight">
        <div className={cn("font-display font-bold text-base", light ? "text-white" : "text-navy")}>
          SVIT Vasad
        </div>
        <div
          className={cn(
            "text-xs uppercase tracking-widest",
            light ? "text-white/70" : "text-muted-foreground",
          )}
        >
          Institute of Technology
        </div>
      </div>
    </Link>
  );
}
