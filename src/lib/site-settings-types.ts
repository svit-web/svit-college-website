// Client-safe types + defaults — split out from site-settings.functions.ts so
// client components (AdminSettingsPage) never pull in that file's
// createServerFn/requireSupabaseAuth imports, which drag TanStack Start's
// server-only runtime into the browser bundle.
export interface MiscSettings {
  admission_year: string;
  year_established: number;
  antiragging_email: string;
  it_support_email: string;
  ugc_helpline: string;
  og_description: string;
  og_image_url: string | null;
  placement_percentage: number;
  recruiter_count: number;
  campus_size_acres: number;
  meta_description: string;
  colleges_label: string;
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

export const MISC_KEYS: (keyof MiscSettings)[] = [
  'admission_year',
  'year_established',
  'antiragging_email',
  'it_support_email',
  'ugc_helpline',
  'og_description',
  'og_image_url',
  'placement_percentage',
  'recruiter_count',
  'campus_size_acres',
  'meta_description',
  'colleges_label',
];

export const DEFAULT_MISC: MiscSettings = {
  admission_year: '2026-27',
  year_established: 1997,
  antiragging_email: 'antiragging@svitvasad.ac.in',
  it_support_email: 'itsupport@svitvasad.ac.in',
  ugc_helpline: '1800-111-656',
  og_description: 'Empowering minds, inspiring innovation. Admissions open for 2026-27.',
  og_image_url: null,
  placement_percentage: 95,
  recruiter_count: 200,
  campus_size_acres: 15,
  meta_description:
    'AICTE-approved engineering, management and applied sciences programmes on a 15-acre campus in Vasad, Gujarat. 95% placements, modern labs, vibrant campus life.',
  colleges_label: 'Colleges',
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
