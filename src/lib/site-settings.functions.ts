// Public reads for site-wide settings stored in app_settings (contact info
// and misc settings). Types/defaults live in site-settings-types.ts; writes
// are in site-settings-next.ts, RLS-gated to global admins — this file is
// the public-read half of that seam.
import { publicSupabase } from '@/lib/supabase-public';
import {
  MISC_KEYS,
  DEFAULT_MISC,
  DEFAULT_CONTACT,
  type MiscSettings,
} from '@/lib/site-settings-types';

export {
  MISC_KEYS,
  DEFAULT_MISC,
  DEFAULT_CONTACT,
  type MiscSettings,
  type ContactInfoSettings,
} from '@/lib/site-settings-types';

// Kept distinct from ContactInfoSettings (the admin write form's shape,
// which requires every field): this is what a public page actually gets
// back from app_settings, where any field can be missing.
export interface ContactInfo {
  phone: string | null;
  email: string | null;
  address: string | null;
  office_hours: {
    weekdays?: string;
    saturday?: string;
    sunday?: string;
  };
  map_iframe_url: string | null;
  social_links: Record<string, string>;
  institute_name: string;
  full_name: string;
  website_url: string | null;
}

const DEFAULT_CONTACT_INFO: ContactInfo = DEFAULT_CONTACT;

export async function getContactInfo(): Promise<ContactInfo> {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'contact_info')
    .maybeSingle();

  if (error) {
    console.error('Error fetching contact info:', error);
    return DEFAULT_CONTACT_INFO;
  }

  return (data?.value ?? DEFAULT_CONTACT_INFO) as ContactInfo;
}

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
    cta_button_label:
      (map.cta_button_label as string | undefined)?.trim() || DEFAULT_MISC.cta_button_label,
  };
}

export interface ContactNumber {
  id: string;
  label: string;
  phone: string;
  kind: 'phone' | 'mobile' | 'whatsapp' | 'fax';
}

/** Footer contact block: institute-wide numbers first (collegeName null), then one group per college. */
export interface ContactNumberGroup {
  collegeId: string | null;
  collegeName: string | null;
  numbers: ContactNumber[];
}

/**
 * Fetch published footer contact numbers (contact_numbers), grouped by college.
 * An empty result means the footer falls back to contact_info.phone.
 */
export async function getFooterContactNumbers(): Promise<ContactNumberGroup[]> {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('contact_numbers')
    .select('id, college_id, label, phone, kind, sort_order, colleges(name, sort_order)')
    .eq('status', 'published')
    .eq('show_in_footer', true)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching contact numbers:', error);
    throw error;
  }

  const groups = new Map<string, ContactNumberGroup & { order: number }>();
  for (const row of (data ?? []) as any[]) {
    const college = Array.isArray(row.colleges) ? row.colleges[0] : row.colleges;
    // A number for an unpublished/hidden college comes back without its college — skip it.
    if (row.college_id && !college) continue;
    const key = row.college_id ?? '';
    const group = groups.get(key) ?? {
      collegeId: row.college_id,
      collegeName: college?.name ?? null,
      numbers: [] as ContactNumber[],
      order: row.college_id ? (college?.sort_order ?? 0) : -1,
    };
    group.numbers.push({ id: row.id, label: row.label, phone: row.phone, kind: row.kind });
    groups.set(key, group);
  }

  return [...groups.values()].sort((a, b) => a.order - b.order).map(({ order: _order, ...g }) => g);
}
