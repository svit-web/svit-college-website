"use client";

import { Minus, Plus, RotateCcw, Type } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFontScale } from "@/hooks/useFontScale";
import type { FontScaleScope } from "@/lib/font-scale";
import { cn } from "@/lib/utils";

interface FontSizeControlProps {
  scope: FontScaleScope;
  variant?: "floating" | "inline";
}

export function FontSizeControl({ scope, variant = "inline" }: FontSizeControlProps) {
  const { percent, canIncrease, canDecrease, increase, decrease, reset } = useFontScale(scope);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Adjust text size"
          className={cn(
            variant === "floating"
              ? "fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white shadow-lg shadow-navy/30 transition hover:bg-navy-light"
              : "relative flex items-center justify-center rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy transition",
          )}
        >
          <Type className={variant === "floating" ? "h-5 w-5" : "h-4 w-4"} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-4">
        <p className="mb-3 text-xs font-semibold text-muted-foreground">Text size</p>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={decrease}
            disabled={!canDecrease}
            aria-label="Decrease text size"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-sm font-medium tabular-nums">{percent}%</span>
          <button
            type="button"
            onClick={increase}
            disabled={!canIncrease}
            aria-label="Increase text size"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={reset}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-muted-foreground transition hover:text-navy"
        >
          <RotateCcw className="h-3 w-3" />
          Reset to default
        </button>
      </PopoverContent>
    </Popover>
  );
}
