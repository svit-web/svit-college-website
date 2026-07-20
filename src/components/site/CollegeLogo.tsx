import { cn } from "@/lib/utils";
import { useState } from "react";

interface Props {
  shortCode: string;
  src?: string | null;
  alt?: string;
  className?: string;
}

/**
 * Renders the college's logo when present,
 * otherwise falls back to a neutral styled placeholder badge with the college short code.
 */
export function CollegeLogo({ shortCode, src, alt, className }: Props) {
  const [errored, setErrored] = useState(false);

  if (errored || !src || src.startsWith("/__l5e")) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border border-navy/20 bg-secondary/80 text-navy font-display font-bold uppercase tracking-widest text-xs p-1 select-none",
          className
        )}
        aria-label={alt ?? `${shortCode} logo placeholder`}
      >
        {shortCode}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt ?? `${shortCode} logo`}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      className={cn("object-contain", className)}
    />
  );
}
