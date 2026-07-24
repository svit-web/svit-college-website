// Server functions for CMS pages and contact info from Supabase
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export interface AboutPageData {
  hero: { accent: string; title: string; introText: string };
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

export interface ContactInfo {
  id: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  office_hours: {
    weekdays?: string;
    saturday?: string;
    sunday?: string;
  };
  map_iframe_url: string | null;
  social_links: Record<string, string>;
  status: 'draft' | 'published' | 'archived';
  metadata: {
    name?: string;
    fullName?: string;
    website?: string;
  };
}

/**
 * Fetch the about page content from the pages table
 */
export const getAboutPage = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('metadata')
      .eq('slug', 'about')
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw error;

    return data?.metadata as AboutPageData | null;
  });

/**
 * Fetch the primary contact info record
 */
export const getContactInfo = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw error;

    return data as ContactInfo | null;
  });
