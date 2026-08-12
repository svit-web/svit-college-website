'use client';

import { cn } from "@/lib/utils";
import { useState } from "react";

interface Props {
  shortCode: string;
  src?: string;
  alt?: string;
  className?: string;
}

/**
 * Renders the college's real logo when the file is present in /public/assets/logos/,
 * otherwise falls back to a neutral gray placeholder with the college short code.
 *
 * No AI-generated / stock imagery is ever produced — the site owner drops the
 * real file into /public/assets/logos/ and it appears automatically.
 */
export function CollegeLogo({ shortCode, src, alt, className }: Props) {
  const [errored, setErrored] = useState(false);
  if (errored || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border-2 border-dashed border-white/40 bg-white/5 text-white/80 font-display font-bold uppercase tracking-widest",
          className,
        )}
        aria-label={alt ?? `${shortCode} logo placeholder`}
      >
        {shortCode}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? `${shortCode} logo`}
      onError={() => setErrored(true)}
      className={cn("object-contain", className)}
    />
  );
}
