"use client";

import { Waves } from "lucide-react";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { cn } from "@/lib/utils";

export function SmoothScrollToggle({ className }: { className?: string }) {
  const { enabled, toggle } = useSmoothScroll();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Disable smooth scrolling" : "Enable smooth scrolling"}
      title={enabled ? "Smooth scrolling: on" : "Smooth scrolling: off"}
      className={cn(
        "inline-flex items-center justify-center rounded-full p-1 leading-none opacity-70 transition hover:opacity-100",
        enabled && "text-gold opacity-100",
        className,
      )}
    >
      <Waves className="h-3.5 w-3.5" />
    </button>
  );
}
