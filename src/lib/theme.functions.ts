// Server functions for site-wide appearance settings (stored in app_settings).
// Reads are public (matches app_settings' RLS policy); writes are gated to
// global admins, re-checked server-side — never trust a client-supplied
// isAdmin flag for a privileged write. Mirrors setImageCompressionMode in
// app-settings.functions.ts, the established pattern for this table.
import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { publicSupabase } from '@/lib/supabase-public';
import { DEFAULT_HERO_APPEARANCE, MAX_HOMEPAGE_PHOTOS, type HeroAppearance } from '@/lib/theme';

export { MAX_HOMEPAGE_PHOTOS, HOMEPAGE_ROTATE_MS, DEFAULT_HERO_APPEARANCE, heroOverlayStyles, type HeroAppearance } from '@/lib/theme';

const HERO_APPEARANCE_KEY = 'hero_appearance';

function parseHeroAppearance(value: unknown): HeroAppearance {
  const v = (value ?? {}) as Partial<HeroAppearance>;
  return {
    heroImageOpacity: v.heroImageOpacity ?? DEFAULT_HERO_APPEARANCE.heroImageOpacity,
    heroOverlayOpacity: v.heroOverlayOpacity ?? DEFAULT_HERO_APPEARANCE.heroOverlayOpacity,
    heroBlurPx: v.heroBlurPx ?? DEFAULT_HERO_APPEARANCE.heroBlurPx,
    homepagePhotos: Array.isArray(v.homepagePhotos)
      ? v.homepagePhotos.filter((p): p is string => typeof p === 'string' && p.length > 0).slice(0, MAX_HOMEPAGE_PHOTOS)
      : [],
    aboutPhoto: typeof v.aboutPhoto === 'string' && v.aboutPhoto ? v.aboutPhoto : null,
    campusLifePhoto: typeof v.campusLifePhoto === 'string' && v.campusLifePhoto ? v.campusLifePhoto : null,
    heroSliderEnabled: typeof v.heroSliderEnabled === 'boolean' ? v.heroSliderEnabled : DEFAULT_HERO_APPEARANCE.heroSliderEnabled,
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

export const setHeroAppearance = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((appearance: unknown): HeroAppearance => {
    const a = appearance as Partial<HeroAppearance> | null;
    const clamp = (n: unknown, min: number, max: number, fallback: number) =>
      typeof n === 'number' && Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
    return {
      ...parseHeroAppearance(a),
      heroImageOpacity: clamp(a?.heroImageOpacity, 0, 100, DEFAULT_HERO_APPEARANCE.heroImageOpacity),
      heroOverlayOpacity: clamp(a?.heroOverlayOpacity, 0, 100, DEFAULT_HERO_APPEARANCE.heroOverlayOpacity),
      heroBlurPx: clamp(a?.heroBlurPx, 0, 20, DEFAULT_HERO_APPEARANCE.heroBlurPx),
    };
  })
  .handler(async ({ data: appearance, context }) => {
    // requireSupabaseAuth only proves who the caller is (context.userId) —
    // role authorization for this privileged write still has to happen here.
    const { data: roleRows, error: roleErr } = await context.supabase
      .from('user_roles')
      .select('scope_type, role:role_id(code)')
      .eq('user_id', context.userId)
      .eq('status', 'published');
    if (roleErr) throw new Error(roleErr.message);

    const isGlobalAdmin = (roleRows ?? []).some(
      (r: any) => r.role?.code === 'admin' && r.scope_type === 'global'
    );
    if (!isGlobalAdmin) {
      throw new Error('Forbidden: only a global admin can change this setting.');
    }

    const { error: upsertErr } = await context.supabase.from('app_settings').upsert({
      key: HERO_APPEARANCE_KEY,
      value: appearance as any,
      updated_at: new Date().toISOString(),
      updated_by: context.userId,
    });
    if (upsertErr) throw new Error(upsertErr.message);

    return appearance;
  });
