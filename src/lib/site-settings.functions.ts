// Server functions for site-wide settings stored in app_settings.
// Covers contact info (migrated from contact_info table) and misc settings.
import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabase } from '@/integrations/supabase/client';

export interface MiscSettings {
  admission_year: string;
  year_established: number;
  antiragging_email: string;
  it_support_email: string;
  ugc_helpline: string;
  og_description: string;
  og_image_url: string | null;
}

export interface ContactInfoSettings {
  phone: string;
  email: string;
  address: string;
  full_name: string;
  institute_name: string;
  website_url: string;
  map_iframe_url: string | null;
  office_hours: { weekdays?: string; saturday?: string; sunday?: string };
  social_links: Record<string, string>;
}

const MISC_KEYS: (keyof MiscSettings)[] = [
  'admission_year', 'year_established', 'antiragging_email',
  'it_support_email', 'ugc_helpline', 'og_description', 'og_image_url',
];

export const DEFAULT_MISC: MiscSettings = {
  admission_year: '2026-27',
  year_established: 1997,
  antiragging_email: 'antiragging@svitvasad.ac.in',
  it_support_email: 'itsupport@svitvasad.ac.in',
  ugc_helpline: '1800-111-656',
  og_description: 'Empowering minds, inspiring innovation. Admissions open for 2026-27.',
  og_image_url: null,
};

export const DEFAULT_CONTACT: ContactInfoSettings = {
  phone: '+91 2692 274766',
  email: 'info@svitvasad.ac.in',
  address: 'Beside GIDC Vasad, Vasad – 388306, Anand, Gujarat, India',
  full_name: 'Sardar Vallabhbhai Institute of Technology',
  institute_name: 'SVIT',
  website_url: 'https://svitvasad.ac.in',
  map_iframe_url: null,
  office_hours: { weekdays: '9:00 – 17:00', saturday: '9:00 – 13:00', sunday: 'Closed' },
  social_links: {},
};

export const getMiscSettings = createServerFn({ method: 'GET' })
  .handler(async (): Promise<MiscSettings> => {
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
    };
  });

async function requireGlobalAdmin(userId: string) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data: roleRows, error } = await supabaseAdmin
    .from('user_roles')
    .select('scope_type, role:role_id(code)')
    .eq('user_id', userId)
    .eq('status', 'published');
  if (error) throw new Error(error.message);
  const ok = (roleRows ?? []).some((r: any) => r.role?.code === 'admin' && r.scope_type === 'global');
  if (!ok) throw new Error('Forbidden: only a global admin can change this setting.');
  return supabaseAdmin;
}

export const saveContactInfo = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => d as ContactInfoSettings)
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await requireGlobalAdmin(context.userId);
    const { error } = await supabaseAdmin.from('app_settings').upsert({
      key: 'contact_info',
      value: data as any,
      updated_at: new Date().toISOString(),
      updated_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return data;
  });

export const saveMiscSettings = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => d as MiscSettings)
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await requireGlobalAdmin(context.userId);
    const rows = MISC_KEYS.map((key) => ({
      key,
      value: data[key] as any,
      updated_at: new Date().toISOString(),
      updated_by: context.userId,
    }));
    const { error } = await supabaseAdmin.from('app_settings').upsert(rows);
    if (error) throw new Error(error.message);
    return data;
  });
