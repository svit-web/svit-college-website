// Client-safe hero-appearance types and pure helpers — split out from
// theme.functions.ts so client components (HeroPhotoLayer) never pull in
// theme.functions.ts's server-only createServerFn/requireSupabaseAuth
// mutation, which drags Node-only TanStack Start internals into the browser
// bundle.
import type { CSSProperties } from 'react';

export const MAX_HOMEPAGE_PHOTOS = 5;
export const HOMEPAGE_ROTATE_MS = 5000;

export interface HeroAppearance {
  heroImageOpacity: number;
  heroOverlayOpacity: number;
  heroBlurPx: number;
  homepagePhotos: string[];
  aboutPhoto: string | null;
  campusLifePhoto: string | null;
  heroSliderEnabled: boolean;
}

export const DEFAULT_HERO_APPEARANCE: HeroAppearance = {
  heroImageOpacity: 80,
  heroOverlayOpacity: 55,
  heroBlurPx: 4,
  homepagePhotos: [],
  aboutPhoto: null,
  campusLifePhoto: null,
  heroSliderEnabled: true,
};

/**
 * Derives the actual photo-opacity + overlay CSS for a hero section from one
 * appearance record. The overlay keeps its original top/mid/bottom gradient
 * shape (30/40/55 at the shipped defaults) scaled proportionally off a single
 * "overlay intensity" number, so editors only reason about one slider instead
 * of three raw gradient stops.
 */
export function heroOverlayStyles(a: HeroAppearance): { imageStyle: CSSProperties; overlayStyle: CSSProperties } {
  const bottom = a.heroOverlayOpacity;
  const top = Math.round(bottom * (30 / 55));
  const mid = Math.round(bottom * (40 / 55));

  return {
    imageStyle: { opacity: a.heroImageOpacity / 100 },
    overlayStyle: {
      backgroundImage: `linear-gradient(to bottom, color-mix(in oklab, var(--navy-deep) ${top}%, transparent), color-mix(in oklab, var(--navy-deep) ${mid}%, transparent), color-mix(in oklab, var(--navy) ${bottom}%, transparent))`,
      backdropFilter: `blur(${a.heroBlurPx}px)`,
      WebkitBackdropFilter: `blur(${a.heroBlurPx}px)`,
    },
  };
}
