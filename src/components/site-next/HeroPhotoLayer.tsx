"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { heroOverlayStyles, type HeroAppearance } from "@/lib/theme";

interface Props {
  photos: string[];
  appearance: HeroAppearance;
  /** Rotate between photos every N ms (e.g. homepage). Omit for a static single photo. */
  rotateMs?: number;
  /**
   * Whether to apply the tint/blur overlay meant to keep text legible when
   * it's rendered on top of the photo. Set false for a "split hero" layout
   * where the photo sits in its own region and no text overlaps it.
   */
  overlay?: boolean;
  /** Alt text for the photo(s). Defaults to "" (decorative), appropriate when overlay is true. */
  alt?: string;
  /** Fires once the first photo has actually loaded, so callers can hold off on photo-dependent chrome (tints, blur) until there's something under it. */
  onLoad?: () => void;
}

/**
 * Photo background shared by every hero that supports an admin-uploaded
 * photo (homepage, college pages, about, campus life, contact). With
 * `overlay` (default true) it also applies the tint/blur meant to keep
 * overlaid text legible; pass `overlay={false}` when the photo is content
 * rather than a text backdrop. Renders nothing when there are no photos yet,
 * so callers can fall back to their existing plain background.
 */
export function HeroPhotoLayer({ photos, appearance, rotateMs, overlay = true, alt = "", onLoad }: Props) {
  const [index, setIndex] = useState(0);
  // Only the current slide plus a one-ahead preload get an <Image> mounted.
  // Mounting every slide up front makes the browser fetch/optimize every
  // photo simultaneously on first paint — with several multi-MB hero photos
  // that floods the image optimizer and some requests time out. Preloading
  // just the next slide gives it a full rotation interval to load before
  // it's shown, without fetching the whole set at once.
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0, 1 % photos.length]));
  // A freshly-uploaded photo can 500 on its very first request: the CDN in
  // front of storage hasn't cached the object yet, and that cold fetch
  // sometimes outlasts the image optimizer's timeout. Retrying (the object
  // is cached by then) clears it up without the slide staying blank.
  const [retryCount, setRetryCount] = useState<Record<number, number>>({});

  useEffect(() => {
    setIndex(0);
    setMounted(new Set([0, 1 % photos.length]));
    setRetryCount({});
    if (!rotateMs || photos.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % photos.length;
        const preload = (next + 1) % photos.length;
        setMounted((prev) =>
          prev.has(next) && prev.has(preload) ? prev : new Set(prev).add(next).add(preload),
        );
        return next;
      });
    }, rotateMs);
    return () => clearInterval(id);
  }, [photos, rotateMs]);

  if (photos.length === 0) return null;

  const { imageStyle, overlayStyle } = heroOverlayStyles(appearance);
  const activeOpacity = overlay && typeof imageStyle.opacity === "number" ? imageStyle.opacity : 1;

  return (
    <>
      {photos.map((src, i) =>
        mounted.has(i) ? (
          <Image
            key={src + i + ":" + (retryCount[i] ?? 0)}
            src={src}
            alt={alt}
            fill
            sizes="100vw"
            priority={i === 0}
            className="object-cover transition-opacity duration-500 ease-in-out"
            style={{ opacity: i === index ? activeOpacity : 0 }}
            onLoad={onLoad}
            onError={() => {
              const attempt = retryCount[i] ?? 0;
              if (attempt >= 3) return;
              setTimeout(
                () => setRetryCount((prev) => ({ ...prev, [i]: attempt + 1 })),
                1000 * (attempt + 1),
              );
            }}
          />
        ) : null,
      )}
      {overlay && <div className="absolute inset-0" style={overlayStyle} />}
    </>
  );
}
