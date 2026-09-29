// Types + pure helpers, shared by both halves of the hero-appearance seam:
// the public read in theme.functions.ts and the RLS-gated admin write in
// theme-next.ts.
import type { CSSProperties } from 'react';

export const HOMEPAGE_ROTATE_MS = 5000;

export interface HeroAppearance {
  heroImageOpacity: number;
  heroOverlayOpacity: number;
  heroOverlayColor: string | null;
  heroTextColor: string | null;
  heroBlurPx: number;
  homepagePhotos: string[];
  heroSliderEnabled: boolean;
  homepageBlurPx: number;
  homepageGradientOpacity: number;
}

export const DEFAULT_HERO_APPEARANCE: HeroAppearance = {
  heroImageOpacity: 80,
  heroOverlayOpacity: 55,
  heroOverlayColor: null,
  heroTextColor: null,
  heroBlurPx: 4,
  homepagePhotos: [],
  heroSliderEnabled: true,
  homepageBlurPx: 2,
  homepageGradientOpacity: 55,
};

/**
 * Derives the photo-opacity + tint CSS for a photo hero (homepage, college
 * pages) from one appearance record. The tint keeps its top/mid/bottom
 * gradient shape (30/40/55 at the shipped defaults) scaled off a single
 * "overlay intensity" number. An unset overlay colour tints toward the paper
 * background so the photo blends into the beige theme.
 *
 * `blur` adds the whole-photo "Background Blur" (heroBlurPx) to the tint
 * layer — college heroes only; the homepage keeps its photo sharp and uses
 * its own masked blur from heroFadeStyles().
 */
export function heroOverlayStyles(
  a: HeroAppearance,
  { blur = true }: { blur?: boolean } = {},
): { imageStyle: CSSProperties; overlayStyle: CSSProperties } {
  const bottom = a.heroOverlayOpacity;
  const top = Math.round(bottom * (30 / 55));
  const mid = Math.round(bottom * (40 / 55));
  const color = a.heroOverlayColor || 'var(--paper)';

  return {
    imageStyle: { opacity: a.heroImageOpacity / 100 },
    overlayStyle: {
      backgroundImage: `linear-gradient(to bottom, color-mix(in oklab, ${color} ${top}%, transparent), color-mix(in oklab, ${color} ${mid}%, transparent), color-mix(in oklab, ${color} ${bottom}%, transparent))`,
      ...(blur && {
        backdropFilter: `blur(${a.heroBlurPx}px)`,
        WebkitBackdropFilter: `blur(${a.heroBlurPx}px)`,
      }),
    },
  };
}

/**
 * The homepage-style paper fade for photo heroes whose text sits on the left
 * of the photo: a left-to-right paper gradient that clears by the horizontal
 * midpoint, a matching masked backdrop blur, and a short top fade so the photo
 * blends into the floating navbar. Driven by the "Homepage Blur" and
 * "Homepage Gradient Opacity" controls; shared by the homepage and college heroes.
 */
export function heroFadeStyles(a: HeroAppearance): {
  sideBlur: CSSProperties;
  sideGradient: CSSProperties;
  topBlur: CSSProperties;
  topGradient: CSSProperties;
} {
  const o = a.homepageGradientOpacity / 100;
  const blur = {
    backdropFilter: `blur(${a.homepageBlurPx}px)`,
    WebkitBackdropFilter: `blur(${a.homepageBlurPx}px)`,
  };
  const sideMask = 'linear-gradient(to right, black 0%, black 32%, transparent 50%)';
  const topMask = 'linear-gradient(to bottom, black 0%, transparent 100%)';
  return {
    sideBlur: { ...blur, WebkitMaskImage: sideMask, maskImage: sideMask },
    sideGradient: {
      background: `linear-gradient(to right, rgba(251, 248, 241, ${o}) 0%, rgba(251, 248, 241, ${o * 0.87}) 16%, rgba(251, 248, 241, ${o * 0.51}) 32%, transparent 50%)`,
    },
    topBlur: { ...blur, WebkitMaskImage: topMask, maskImage: topMask },
    topGradient: {
      background: `linear-gradient(to bottom, rgba(251, 248, 241, ${o * 0.82}) 0%, transparent 100%)`,
    },
  };
}

/**
 * CSS custom property carrying the hero text color. Set once on the public
 * site layout (and on heroes that receive an appearance record), read by hero
 * text via `text-[var(--hero-text)]`, so one admin setting recolors every
 * hero's title/subtitle/breadcrumbs. Defaults to navy for the beige theme.
 */
export function heroTextVars(a: HeroAppearance): CSSProperties {
  return { ['--hero-text' as never]: a.heroTextColor || 'var(--navy)' };
}
