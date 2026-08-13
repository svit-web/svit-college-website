// Next.js-safe admin write for hero appearance settings. Runs in the
// browser with the admin's session so RLS enforces global-admin-only write
// access — matches the rest of the admin panel's write pattern.
import { createClient } from '@/app/lib/supabase/client';
import { DEFAULT_HERO_APPEARANCE, type HeroAppearance } from '@/lib/theme';

const HERO_APPEARANCE_KEY = 'hero_appearance';

export async function setHeroAppearance(appearance: HeroAppearance): Promise<HeroAppearance> {
  const supabase = createClient();
  const clamp = (n: unknown, min: number, max: number, fallback: number) =>
    typeof n === 'number' && Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;

  const payload: HeroAppearance = {
    ...appearance,
    heroImageOpacity: clamp(appearance.heroImageOpacity, 0, 100, DEFAULT_HERO_APPEARANCE.heroImageOpacity),
    heroOverlayOpacity: clamp(appearance.heroOverlayOpacity, 0, 100, DEFAULT_HERO_APPEARANCE.heroOverlayOpacity),
    heroBlurPx: clamp(appearance.heroBlurPx, 0, 20, DEFAULT_HERO_APPEARANCE.heroBlurPx),
  };

  const { error } = await supabase.from('app_settings').upsert({
    key: HERO_APPEARANCE_KEY,
    value: payload as any,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  return payload;
}
