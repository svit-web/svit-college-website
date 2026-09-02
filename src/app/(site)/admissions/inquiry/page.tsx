import type { Metadata } from "next";
import { PageHero } from "@/components/site-next/PageHero";
import { InquiryForm } from "@/components/site-next/InquiryForm";
import { getAllProgrammes } from "@/lib/programmes.functions";
import { getContactInfo, getMiscSettings } from "@/lib/site-settings.functions";

export async function generateMetadata(): Promise<Metadata> {
  const misc = await getMiscSettings().catch(() => null);
  const yr = misc?.admission_year;
  return {
    title: "Admission Inquiry — SVIT Vasad",
    description: yr ? `Submit an admission enquiry for ${yr} at SVIT Vasad.` : "Submit an admission enquiry at SVIT Vasad.",
  };
}

export default async function Inquiry() {
  const [programmes, contact, misc] = await Promise.all([
    getAllProgrammes().catch(() => []),
    getContactInfo().catch(() => null),
    getMiscSettings().catch(() => null),
  ]);

  return (
    <>
      <PageHero
        title="Admission Inquiry"
        accent={misc?.admission_year}
        subtitle="Share your details — our admissions team will guide you within 24 hours."
        crumbs={[{ label: "Home", to: "/" }, { label: "Admissions", to: "/admissions" }, { label: "Inquiry" }]}
      />
      <InquiryForm
        programmes={programmes}
        phone={contact?.phone}
        admissionYear={misc?.admission_year}
        placementPct={misc?.placement_percentage}
      />
    </>
  );
}
