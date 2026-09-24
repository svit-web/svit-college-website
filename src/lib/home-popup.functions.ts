// Public/admin reads for the homepage popup banner (app_settings key
// `home_popup`). Writes live in home-popup-next.ts, gated by app_settings' RLS:
// the row has no admin_section_id, so only global admins can write it.
import { publicSupabase } from '@/lib/supabase-public';
import { DEFAULT_MISC } from '@/lib/site-settings-types';
import { HOME_POPUP_KEY, parseHomePopup, type HomePopup } from '@/lib/home-popup';

// admission_year is read alongside so defaults for never-set fields say the
// right year without a second round trip.
async function readHomePopup(): Promise<HomePopup> {
  const { data, error } = await publicSupabase()
    .from('app_settings')
    .select('key, value')
    .in('key', [HOME_POPUP_KEY, 'admission_year']);
  if (error) throw new Error(error.message);
  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  const year = typeof map.admission_year === 'string' ? map.admission_year : DEFAULT_MISC.admission_year;
  return parseHomePopup(map[HOME_POPUP_KEY], year);
}

/**
 * The popup for the public homepage, or null when it is switched off. The date
 * window is deliberately *not* checked here: the homepage is cached, so the
 * browser checks it (isHomePopupLive) to start and stop on time.
 */
export async function getHomePopup(): Promise<HomePopup | null> {
  const popup = await readHomePopup();
  return popup.enabled ? popup : null;
}

/** Admin read: always returns an editable popup (defaults if never saved). */
export async function getHomePopupForAdmin(): Promise<HomePopup> {
  return readHomePopup();
}
