// Server functions for site-wide settings stored in app_settings.
// Covers contact info (migrated from contact_info table) and misc settings.
// Types/defaults live in site-settings-types.ts (writes are in
// site-settings-next.ts); re-exported here so existing read-side imports of
// this module keep working from one path.
import { publicSupabase } from '@/lib/supabase-public';
import { MISC_KEYS, DEFAULT_MISC, type MiscSettings } from '@/lib/site-settings-types';

export {
  MISC_KEYS,
  DEFAULT_MISC,
  DEFAULT_CONTACT,
  type MiscSettings,
  type ContactInfoSettings,
} from '@/lib/site-settings-types';

export async function getMiscSettings(): Promise<MiscSettings> {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', MISC_KEYS);

  if (error) {
    console.error('Error fetching misc settings:', error);
    return DEFAULT_MISC;
  }

  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  return {
    admission_year: (map.admission_year as string) ?? DEFAULT_MISC.admission_year,
    year_established: (map.year_established as number) ?? DEFAULT_MISC.year_established,
    antiragging_email: (map.antiragging_email as string) ?? DEFAULT_MISC.antiragging_email,
    it_support_email: (map.it_support_email as string) ?? DEFAULT_MISC.it_support_email,
    ugc_helpline: (map.ugc_helpline as string) ?? DEFAULT_MISC.ugc_helpline,
    og_description: (map.og_description as string) ?? DEFAULT_MISC.og_description,
    og_image_url: (map.og_image_url as string | null) ?? null,
    placement_percentage: (map.placement_percentage as number) ?? DEFAULT_MISC.placement_percentage,
    recruiter_count: (map.recruiter_count as number) ?? DEFAULT_MISC.recruiter_count,
    campus_size_acres: (map.campus_size_acres as number) ?? DEFAULT_MISC.campus_size_acres,
    meta_description: (map.meta_description as string) ?? DEFAULT_MISC.meta_description,
    colleges_label: (map.colleges_label as string) ?? DEFAULT_MISC.colleges_label,
  };
}
