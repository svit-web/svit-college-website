// Server functions for site-wide appearance settings (stored in app_settings).
// Reads are public (matches app_settings' RLS policy); writes live in
// theme-next.ts, gated by the app_settings global-admin-only RLS policy.
import { publicSupabase } from '@/lib/supabase-public';
import { DEFAULT_HERO_APPEARANCE, type HeroAppearance } from '@/lib/theme';

export { HOMEPAGE_ROTATE_MS, DEFAULT_HERO_APPEARANCE, heroOverlayStyles, heroTextVars, type HeroAppearance } from '@/lib/theme';

const HERO_APPEARANCE_KEY = 'hero_appearance';

function parseHeroAppearance(value: unknown): HeroAppearance {
  const v = (value ?? {}) as Partial<HeroAppearance>;
  return {
    heroImageOpacity: v.heroImageOpacity ?? DEFAULT_HERO_APPEARANCE.heroImageOpacity,
    heroOverlayOpacity: v.heroOverlayOpacity ?? DEFAULT_HERO_APPEARANCE.heroOverlayOpacity,
    heroOverlayColor: typeof v.heroOverlayColor === 'string' && v.heroOverlayColor ? v.heroOverlayColor : null,
    heroTextColor: typeof v.heroTextColor === 'string' && v.heroTextColor ? v.heroTextColor : null,
    heroBlurPx: v.heroBlurPx ?? DEFAULT_HERO_APPEARANCE.heroBlurPx,
    homepagePhotos: Array.isArray(v.homepagePhotos)
      ? v.homepagePhotos.filter((p): p is string => typeof p === 'string' && p.length > 0)
      : [],
    heroSliderEnabled: typeof v.heroSliderEnabled === 'boolean' ? v.heroSliderEnabled : DEFAULT_HERO_APPEARANCE.heroSliderEnabled,
    homepageBlurPx: v.homepageBlurPx ?? DEFAULT_HERO_APPEARANCE.homepageBlurPx,
    homepageGradientOpacity: v.homepageGradientOpacity ?? DEFAULT_HERO_APPEARANCE.homepageGradientOpacity,
  };
}

/**
 * Fetch the hero appearance settings (image opacity / overlay strength / blur)
 * editable from Admin → Website CMS → Hero Appearance. Falls back to the
 * shipped defaults if no row exists yet or the read fails.
 */
export async function getHeroAppearance(): Promise<HeroAppearance> {
  const supabase = publicSupabase();
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

  return parseHeroAppearance(data.value);
}
