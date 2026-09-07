// Types + pure helpers, shared by both halves of the hero-appearance seam:
// the public read in theme.functions.ts and the RLS-gated admin write in
// theme-next.ts.
import type { CSSProperties } from 'react';

export const MAX_HOMEPAGE_PHOTOS = 5;
export const HOMEPAGE_ROTATE_MS = 5000;

export interface HeroAppearance {
  heroImageOpacity: number;
  heroOverlayOpacity: number;
  heroOverlayColor: string | null;
  heroTextColor: string | null;
  heroBlurPx: number;
  homepagePhotos: string[];
  aboutPhoto: string | null;
  campusLifePhoto: string | null;
  heroSliderEnabled: boolean;
}

export const DEFAULT_HERO_APPEARANCE: HeroAppearance = {
  heroImageOpacity: 80,
  heroOverlayOpacity: 55,
  heroOverlayColor: null,
  heroTextColor: null,
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
  const topColor = a.heroOverlayColor || 'var(--navy-deep)';
  const bottomColor = a.heroOverlayColor || 'var(--navy)';

  return {
    imageStyle: { opacity: a.heroImageOpacity / 100 },
    overlayStyle: {
      backgroundImage: `linear-gradient(to bottom, color-mix(in oklab, ${topColor} ${top}%, transparent), color-mix(in oklab, ${topColor} ${mid}%, transparent), color-mix(in oklab, ${bottomColor} ${bottom}%, transparent))`,
      backdropFilter: `blur(${a.heroBlurPx}px)`,
      WebkitBackdropFilter: `blur(${a.heroBlurPx}px)`,
    },
  };
}

/**
 * CSS custom property carrying the hero text color, scoped onto the hero
 * section's root element. Hero text classes reference it via
 * `text-[var(--hero-text)]` so a single admin setting recolors every hero's
 * title/subtitle/breadcrumbs at once. Defaults to white, matching the
 * pre-existing hardcoded `text-white` look.
 */
export function heroTextVars(a: HeroAppearance): CSSProperties {
  return { ['--hero-text' as never]: a.heroTextColor || '#ffffff' };
}
