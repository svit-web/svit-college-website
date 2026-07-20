import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  isFetching?: boolean;
  label?: string;
  className?: string;
}

export function LoadingIndicator({ isFetching, label = "Syncing live data...", className }: Props) {
  if (!isFetching) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold animate-pulse shadow-sm backdrop-blur",
        className
      )}
    >
      <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
      <span>{label}</span>
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl border border-border bg-secondary/60 p-6 space-y-4",
        className
      )}
    >
      <div className="h-10 w-10 rounded-md bg-muted/60" />
      <div className="h-4 w-3/4 rounded bg-muted/60" />
      <div className="h-3 w-1/2 rounded bg-muted/40" />
    </div>
  );
}
