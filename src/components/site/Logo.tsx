import { Link } from "@tanstack/react-router";
import svitBrand from "@/assets/svit-brand.jpg.asset.json";
import { cn } from "@/lib/utils";
import { useSupabaseInstitutes } from "@/hooks/useSupabaseData";

export function Logo({ light = false }: { light?: boolean }) {
  const { data: institutes } = useSupabaseInstitutes();
  const institute = institutes?.[0];
  const mainTitle = institute?.name || "SVIT Vasad";

  return (
    <Link to="/" className="flex items-center gap-3 group">
      <img
        src={institute?.logo_url || svitBrand.url}
        alt={`${mainTitle} logo`}
        className="h-12 w-12 object-contain"
      />
      <div className="leading-tight">
        <div className={cn("font-display font-bold text-base", light ? "text-white" : "text-navy")}>
          {mainTitle}
        </div>
      </div>
    </Link>
  );
}

