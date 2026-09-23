"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface SliderPhoto {
  id: string;
  url: string;
  focalX?: "left" | "center" | "right";
  focalY?: "top" | "center" | "bottom";
}

// Fixed at 4:3 for a consistent look — not admin-editable. Callers with a
// different layout (e.g. the Detail page slideshow) may pass `aspectRatio`.
const PHOTO_ASPECT_RATIO = "4/3";

interface Props {
  photos: SliderPhoto[];
  ariaLabel?: string;
  photoAlt?: string;
  aspectRatio?: string;
  /** When set, clicking the current slide calls this (e.g. to open a lightbox). */
  onPhotoClick?: (index: number) => void;
}

export function PhotoSlider({
  photos,
  ariaLabel = "Photos",
  photoAlt = "Photo",
  aspectRatio = PHOTO_ASPECT_RATIO,
  onPhotoClick,
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = photos.length;

  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 3000);
    return () => clearInterval(t);
  }, [paused, count]);

  if (!count) return null;

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      <div
        className="relative w-full overflow-hidden rounded-2xl border-2 border-navy/15 bg-secondary/60"
        style={{ aspectRatio }}
      >
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`Photo ${i + 1} of ${count}`}
            aria-hidden={i !== index}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded photos are served
                directly from Supabase storage; the Next.js image optimizer's SSRF guard rejects
                some networks' resolved hostnames for this bucket, so we bypass it like CollegeLogo does. */}
            <img
              src={photo.url}
              alt={photoAlt}
              loading={i === 0 ? "eager" : "lazy"}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                objectPosition: `${photo.focalX ?? "center"} ${photo.focalY ?? "center"}`,
              }}
            />
            {onPhotoClick && (
              <button
                type="button"
                onClick={() => onPhotoClick(i)}
                tabIndex={i === index ? 0 : -1}
                aria-label={`View photo ${i + 1} full screen`}
                className="absolute inset-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
              />
            )}
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-gold" : "w-3 bg-navy/20 hover:bg-navy/40"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIndex((i) => (i - 1 + count) % count)}
              aria-label="Previous photo"
              className="rounded-full border border-navy/15 bg-white p-2 text-navy transition-[background-color,transform] duration-100 hover:bg-secondary active:scale-90"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % count)}
              aria-label="Next photo"
              className="rounded-full border border-navy/15 bg-white p-2 text-navy transition-[background-color,transform] duration-100 hover:bg-secondary active:scale-90"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
