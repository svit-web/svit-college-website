// Server functions for CMS pages and contact info from Supabase
import { publicSupabase } from '@/lib/supabase-public';

export interface AboutPageData {
  hero: { accent: string; title: string; introText: string; portraitUrl?: string };
  quickFacts: { label: string; value: string }[];
  coreValues: string[];
  history: {
    introText: string;
    milestones: { year: string; milestone: string }[];
    closingText?: string;
  };
  vision: { visionText: string };
  mission: { missionPoints: string[] };
  leadership: {
    intro: string;
    chairman: {
      quote: string;
      name: string;
      title: string;
      strategicPlanText?: string;
      corePrinciples?: string[];
    };
    principal: {
      quote: string;
      name: string;
      title: string;
      bodyText?: string;
    };
    boardOfManagement: { srNo: number; name: string; designation: string }[];
  };
  accreditation: {
    recognitions: { body: string; status: string }[];
    nbaText: string;
    nirfText: string;
    aicteText: string;
    academicRegulationsText: string;
    regulationPoints: string[];
    mandatoryDisclosureText: string;
    codeOfConductPoints: string[];
    relatedDocuments: { label: string; fileUrl: string }[];
  };
  facilities: {
    intro: string;
    library: { text: string; stats: { label: string; value: string }[] };
    scholarships: { name: string; amount: string; eligibility: string }[];
    sports: { text: string; activities: { label: string; value: string }[] };
    nssNcc: { name: string; description: string }[];
    hostelsTransport: { hostelText: string; transportText: string };
    itMedical: { label: string; description: string }[];
  };
  media: {
    intro: string;
    publications: { name: string; description: string }[];
    socialMedia: { platform: string; url: string }[];
  };
  contact: { address: string; phone: string; email: string; website: string };
}

/**
 * Fetch the about page content from the pages table
 */
export async function getAboutPage() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('pages')
    .select('metadata')
    .eq('slug', 'about')
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;

  return data?.metadata as AboutPageData | null;
}

export interface AlumniPageData {
  kpis: { v: string; l: string }[];
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_role: string;
  company_or_institution: string | null;
  quote: string;
  avatar_url: string | null;
}

/**
 * Fetch alumni page metadata (KPIs etc.) from the pages table
 */
export async function getAlumniPage() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('pages')
    .select('metadata')
    .eq('slug', 'alumni')
    .eq('status', 'published')
    .maybeSingle();
  if (error) throw error;
  return data?.metadata as AlumniPageData | null;
}

/**
 * Fetch all published testimonials
 */
export async function getAllTestimonials() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('testimonials')
    .select('id, author_name, author_role, company_or_institution, quote, avatar_url')
    .eq('status', 'published')
    .is('deleted_at', null);
  if (error) throw error;
  return (data ?? []) as Testimonial[];
}

