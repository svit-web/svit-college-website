// Admin write for the homepage popup banner. Runs in the browser with the
// admin's session; app_settings' RLS only lets global admins write a row with
// no admin_section_id, which is what this upsert creates.
import { createClient } from '@/app/lib/supabase/client';
import { HOME_POPUP_KEY, homePopupProblems, type HomePopup } from '@/lib/home-popup';

export async function saveHomePopup(popup: HomePopup, userId: string): Promise<HomePopup> {
  const trim = (s: string) => s.trim();
  const payload: HomePopup = {
    ...popup,
    eyebrow: trim(popup.eyebrow),
    title: trim(popup.title),
    title_accent: trim(popup.title_accent),
    body: trim(popup.body),
    primary: { label: trim(popup.primary.label), href: trim(popup.primary.href) },
    secondary: { label: trim(popup.secondary.label), href: trim(popup.secondary.href) },
    image_alt: trim(popup.image_alt),
    poster_href: trim(popup.poster_href),
    minimized_label: trim(popup.minimized_label),
  };

  if (payload.enabled) {
    const problems = homePopupProblems(payload);
    if (problems.length) throw new Error(problems.join(' '));
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('app_settings')
    .upsert({
      key: HOME_POPUP_KEY,
      value: payload as any,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    })
    .select('key');
  if (error) throw new Error(error.message);
  // RLS rejects a non-global-admin upsert by returning no rows rather than an error.
  if (!data?.length) throw new Error('Only global admins can change the homepage popup.');
  return payload;
}
