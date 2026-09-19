"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { heroOverlayStyles, type HeroAppearance } from "@/lib/theme";

/** Marquee mode: time for one photo's worth of travel. Larger = slower. */
const MARQUEE_MS_PER_PHOTO = 20000;
/** Marquee mode: width over which neighbouring photos dissolve into each other. */
const MARQUEE_BLEND = "18vw";

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
  /**
   * How rotation moves between photos. "fade" (default) crossfades in place;
   * "marquee" pans all photos continuously right-to-left as an endless,
   * feathered-stitched loop (speed: MARQUEE_MS_PER_PHOTO; ignores `rotateMs`).
   */
  transition?: "fade" | "marquee";
}

/**
 * Photo background shared by every hero that supports an admin-uploaded
 * photo (homepage, college pages, about, campus life, contact). With
 * `overlay` (default true) it also applies the tint/blur meant to keep
 * overlaid text legible; pass `overlay={false}` when the photo is content
 * rather than a text backdrop. Renders nothing when there are no photos yet,
 * so callers can fall back to their existing plain background.
 */
export function HeroPhotoLayer({ photos, appearance, rotateMs, overlay = true, alt = "", onLoad, transition = "fade" }: Props) {
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
    if (!rotateMs || photos.length <= 1 || transition === "marquee") return;
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
  }, [photos, rotateMs, transition]);

  if (photos.length === 0) return null;

  const { imageStyle, overlayStyle } = heroOverlayStyles(appearance);
  const activeOpacity = overlay && typeof imageStyle.opacity === "number" ? imageStyle.opacity : 1;

  if (transition === "marquee") {
    // Continuous, stitched filmstrip. Cell m shows photo (m-1) mod n, so the
    // strip is [last, p0, p1, …, last-1, last, p0]. It pans from cell 1 (p0) to
    // cell n+1 (p0 again): identical frames at both ends, so the restart is
    // invisible. Each cell is wider than its slot by MARQUEE_BLEND and fades in
    // over the previous photo through a mask, so neighbours dissolve into each
    // other instead of meeting at a hard edge.
    const n = photos.length;
    const cells = n + 2;
    const slot = 100 / cells;
    return (
      <>
        <div
          className="absolute inset-y-0 left-0 will-change-transform motion-reduce:!animate-none"
          style={
            {
              width: `${cells * 100}%`,
              transform: `translateX(-${slot}%)`,
              "--mq-from": `-${slot}%`,
              "--mq-to": `-${slot * (n + 1)}%`,
              animation:
                n > 1
                  ? `hero-marquee ${n * MARQUEE_MS_PER_PHOTO}ms linear infinite`
                  : undefined,
            } as React.CSSProperties
          }
        >
          {Array.from({ length: cells }, (_, m) => {
            const i = (m - 1 + n) % n;
            const mask = `linear-gradient(to right, transparent 0, black ${MARQUEE_BLEND})`;
            return (
              <div
                key={m}
                className="absolute inset-y-0"
                style={{
                  left: `${m * slot}%`,
                  width: `calc(${slot}% + ${MARQUEE_BLEND})`,
                  WebkitMaskImage: mask,
                  maskImage: mask,
                }}
              >
                <Image
                  key={retryCount[i] ?? 0}
                  src={photos[i] as string}
                  alt={m === 1 ? alt : ""}
                  fill
                  sizes="100vw"
                  priority={m === 1}
                  loading={m <= 2 ? "eager" : "lazy"}
                  className="object-cover"
                  style={{ opacity: activeOpacity }}
                  onLoad={m === 1 ? onLoad : undefined}
                  onError={() => {
                    const attempt = retryCount[i] ?? 0;
                    if (attempt >= 3) return;
                    setTimeout(
                      () => setRetryCount((prev) => ({ ...prev, [i]: attempt + 1 })),
                      1000 * (attempt + 1),
                    );
                  }}
                />
              </div>
            );
          })}
        </div>
        {overlay && <div className="absolute inset-0" style={overlayStyle} />}
      </>
    );
  }

  return (
    <>
      {photos.map((src, i) => {
        const isActive = i === index;
        return mounted.has(i) ? (
          <Image
            key={src + i + ":" + (retryCount[i] ?? 0)}
            src={src}
            alt={alt}
            fill
            sizes="100vw"
            priority={i === 0}
            className="object-cover transition-[opacity,transform] duration-500 ease-in-out motion-reduce:transition-none motion-reduce:!scale-100"
            style={{
              opacity: isActive ? activeOpacity : 0,
              transform: isActive ? "scale(1)" : "scale(1.06)",
            }}
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
        ) : null;
      })}
      {overlay && <div className="absolute inset-0" style={overlayStyle} />}
    </>
  );
}
