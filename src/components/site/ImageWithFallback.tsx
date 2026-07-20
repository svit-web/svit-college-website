import { useState, type ImgHTMLAttributes } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  placeholderLabel?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackSrc,
  placeholderLabel,
  ...props
}: Props) {
  const [errored, setErrored] = useState(false);
  const [loading, setLoading] = useState(true);

  if (errored || !src) {
    if (fallbackSrc && !errored) {
      return (
        <img
          src={fallbackSrc}
          alt={alt || ""}
          className={className}
          loading="lazy"
          decoding="async"
          {...props}
        />
      );
    }

    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-secondary/80 text-muted-foreground p-4 text-center select-none",
          className
        )}
      >
        <div className="flex flex-col items-center gap-1.5">
          <ImageIcon className="h-6 w-6 opacity-40" />
          {placeholderLabel && (
            <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
              {placeholderLabel}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ""}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoading(false)}
      onError={() => setErrored(true)}
      className={cn(
        "transition-opacity duration-300",
        loading ? "opacity-0" : "opacity-100",
        className
      )}
      {...props}
    />
  );
}
