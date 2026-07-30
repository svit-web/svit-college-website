// Server functions for site-wide appearance settings (stored in app_settings)
import type { CSSProperties } from 'react';
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

const HERO_APPEARANCE_KEY = 'hero_appearance';

export interface HeroAppearance {
  heroImageOpacity: number; // 0-100 — how visible the raw campus photo is
  heroOverlayOpacity: number; // 0-100 — strength of the navy tint at its darkest point
  heroBlurPx: number; // 0-20 — backdrop blur applied to the photo so hero text stays legible
}

export const DEFAULT_HERO_APPEARANCE: HeroAppearance = {
  heroImageOpacity: 80,
  heroOverlayOpacity: 55,
  heroBlurPx: 4,
};

/**
 * Fetch the hero appearance settings (image opacity / overlay strength / blur)
 * editable from Admin → Website CMS → Hero Appearance. Falls back to the
 * shipped defaults if no row exists yet or the read fails.
 */
export const getHeroAppearance = createServerFn({ method: 'GET' })
  .handler(async (): Promise<HeroAppearance> => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', HERO_APPEARANCE_KEY)
      .maybeSingle();

    if (error) {
      console.error('Error fetching hero appearance:', error);
      return DEFAULT_HERO_APPEARANCE;
    }
    if (!data) return DEFAULT_HERO_APPEARANCE;

    const v = data.value as Partial<HeroAppearance> | null;
    return {
      heroImageOpacity: v?.heroImageOpacity ?? DEFAULT_HERO_APPEARANCE.heroImageOpacity,
      heroOverlayOpacity: v?.heroOverlayOpacity ?? DEFAULT_HERO_APPEARANCE.heroOverlayOpacity,
      heroBlurPx: v?.heroBlurPx ?? DEFAULT_HERO_APPEARANCE.heroBlurPx,
    };
  });

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
