// Next.js-safe admin writes for site settings (app_settings table). Runs in
// the browser with the admin's session so RLS enforces global-admin-only
// write access — matches the rest of the admin panel's write pattern.
import { createClient } from '@/app/lib/supabase/client';
import { MISC_KEYS, type ContactInfoSettings, type MiscSettings } from '@/lib/site-settings-types';

export async function saveContactInfo(data: ContactInfoSettings): Promise<ContactInfoSettings> {
  const supabase = createClient();
  const { error } = await supabase.from('app_settings').upsert({
    key: 'contact_info',
    value: data as any,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function saveMiscSettings(data: MiscSettings): Promise<MiscSettings> {
  const supabase = createClient();
  const rows = MISC_KEYS.map((key) => ({
    key,
    value: data[key] as any,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from('app_settings').upsert(rows);
  if (error) throw new Error(error.message);
  return data;
}
