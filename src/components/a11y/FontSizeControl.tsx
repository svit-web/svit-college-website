"use client";

import { useFontScale } from "@/hooks/useFontScale";
import type { FontScaleScope } from "@/lib/font-scale";
import { cn } from "@/lib/utils";

interface FontSizeControlProps {
  scope: FontScaleScope;
  className?: string;
}

const buttonBase =
  "inline-flex items-center justify-center px-1 leading-none transition hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:no-underline";

export function FontSizeControl({ scope, className }: FontSizeControlProps) {
  const { percent, canIncrease, canDecrease, increase, decrease, reset } = useFontScale(scope);

  return (
    <div className={cn("flex items-center gap-1 text-xs opacity-70", className)}>
      <button
        type="button"
        onClick={decrease}
        disabled={!canDecrease}
        aria-label="Decrease text size"
        className={buttonBase}
      >
        −
      </button>
      <button
        type="button"
        onClick={reset}
        aria-label="Reset text size to 100%"
        className={cn(buttonBase, "w-12 tabular-nums")}
      >
        {percent}%
      </button>
      <button
        type="button"
        onClick={increase}
        disabled={!canIncrease}
        aria-label="Increase text size"
        className={buttonBase}
      >
        +
      </button>
    </div>
  );
}
