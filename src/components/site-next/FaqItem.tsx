"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/** One row of a hairline FAQ list; wrap rows in a `border-t border-line` container. */
export function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="group flex min-h-11 w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-display text-lg font-medium text-navy transition-colors group-hover:text-crimson">
          {q}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-navy transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="pb-5 text-sm leading-relaxed text-ink-soft md:text-base">{a}</div>}
    </div>
  );
}
