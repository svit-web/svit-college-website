// Server functions for site-wide appearance settings (stored in app_settings).
// Reads are public (matches app_settings' RLS policy); writes are gated to
// global admins, re-checked server-side — never trust a client-supplied
// isAdmin flag for a privileged write. Mirrors setImageCompressionMode in
// app-settings.functions.ts, the established pattern for this table.
import type { CSSProperties } from 'react';
import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabase } from '@/integrations/supabase/client';

const HERO_APPEARANCE_KEY = 'hero_appearance';

export const MAX_HOMEPAGE_PHOTOS = 5;
export const HOMEPAGE_ROTATE_MS = 5000;

export interface HeroAppearance {
  heroImageOpacity: number; // 0-100 — how visible the raw campus photo is
  heroOverlayOpacity: number; // 0-100 — strength of the navy tint at its darkest point
  heroBlurPx: number; // 0-20 — backdrop blur applied to the photo so hero text stays legible
  homepagePhotos: string[]; // up to MAX_HOMEPAGE_PHOTOS — rotates every HOMEPAGE_ROTATE_MS on "/"
  aboutPhoto: string | null; // background photo for /about's hero — empty until an admin sets one
  campusLifePhoto: string | null; // background photo for /campus-life's hero
  contactPhoto: string | null; // background photo for /contact's hero
}

export const DEFAULT_HERO_APPEARANCE: HeroAppearance = {
  heroImageOpacity: 80,
  heroOverlayOpacity: 55,
  heroBlurPx: 4,
  homepagePhotos: [],
  aboutPhoto: null,
  campusLifePhoto: null,
  contactPhoto: null,
};

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
    contactPhoto: typeof v.contactPhoto === 'string' && v.contactPhoto ? v.contactPhoto : null,
  };
}

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

    return parseHeroAppearance(data.value);
  });

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
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    // requireSupabaseAuth only proves who the caller is (context.userId) —
    // role authorization for this privileged write still has to happen here.
    const { data: roleRows, error: roleErr } = await supabaseAdmin
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

    const { error: upsertErr } = await supabaseAdmin.from('app_settings').upsert({
      key: HERO_APPEARANCE_KEY,
      value: appearance as any,
      updated_at: new Date().toISOString(),
      updated_by: context.userId,
    });
    if (upsertErr) throw new Error(upsertErr.message);

    return appearance;
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
