"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface SplitHeadingPart {
  text: string;
  className?: string;
}

/**
 * Word-mask reveal heading: each word sits in an overflow-hidden span and
 * slides up into view once the heading scrolls into the viewport. The full
 * plain-text label is exposed via aria-label; the animated words are
 * aria-hidden to avoid double announcement.
 */
export function SplitHeading({
  parts,
  as: Tag = "h2",
  className,
}: {
  parts: SplitHeadingPart[];
  as?: "h2" | "h3";
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = parts.flatMap((part) =>
    part.text.split(" ").map((word) => ({ word, className: part.className })),
  );
  const label = parts.map((p) => p.text).join(" ");

  return (
    <Tag ref={ref} className={className} aria-label={label}>
      {words.map((w, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden pb-[0.12em] mb-[-0.12em] align-baseline"
          aria-hidden="true"
        >
          <span
            className={cn(
              "inline-block transition-transform duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              w.className,
            )}
            style={{
              transform: visible ? "translateY(0)" : "translateY(115%)",
              transitionDelay: `${i * 25}ms`,
            }}
          >
            {w.word}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
