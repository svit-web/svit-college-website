import { notFound, redirect } from "next/navigation";
import { requireAdmin, getScopeLevel } from "@/app/lib/auth/admin";
import { isRouteAllowedForUser } from "@/lib/admin-sections";
import { AdminPageEditor } from "@/components/admin-next/pages/AdminPageEditor";
import type { MetadataEditorGroup } from "@/components/admin-next/MetadataEditor";
import type { PageMetadataValidator } from "@/lib/page-metadata-validation";

interface PageEditorConfig {
  heading: string;
  description: string;
  groups: MetadataEditorGroup[];
  // A key, not the function: functions can't cross the server → client
  // component boundary.
  validator?: PageMetadataValidator;
}

// The `pages` singletons whose metadata IS the public page (ADR 0003). Each
// gets a dedicated, sectioned editor instead of the generic tables screen.
const EDITORS: Record<string, PageEditorConfig> = {
  about: {
    heading: "About Page",
    description:
      "Everything on the public About SVIT page — hero text, history, leadership messages, accreditation wording and contact details.",
    validator: "about",
    groups: [
      {
        title: "Hero",
        description: "Opening banner: accent word, title and intro paragraph.",
        keys: ["hero"],
      },
      {
        title: "Quick Facts",
        description: "The small label + value chips under the hero.",
        keys: ["quickFacts"],
      },
      { title: "Core Values", description: "The listed institute values.", keys: ["coreValues"] },
      {
        title: "History",
        description: "Story intro, milestone timeline and closing text.",
        keys: ["history"],
      },
      { title: "Vision", description: "The vision statement.", keys: ["vision"] },
      { title: "Mission", description: "The mission points list.", keys: ["mission"] },
      {
        title: "Leadership Messages",
        description: "Chairman and Principal messages, plus the Board of Management list.",
        keys: ["leadership"],
      },
      {
        title: "Accreditation & Disclosures",
        description: "Recognition list, NBA/NIRF/AICTE text and disclosure documents.",
        keys: ["accreditation"],
      },
      {
        title: "Facilities Section",
        description: "Library, scholarships, sports, NSS/NCC, hostels, IT & medical.",
        keys: ["facilities"],
      },
      {
        title: "Media & Publications",
        description: "Publications list and social media links.",
        keys: ["media"],
      },
      {
        title: "Contact Details",
        description: "Address, phone, email and website shown on the page.",
        keys: ["contact"],
      },
    ],
  },
  admissions: {
    heading: "Admissions Page",
    description: "The how-to-apply steps and FAQs shown on the public Admissions page.",
    validator: "admissions",
    groups: [
      {
        title: "Process Steps",
        description: "The numbered how-to-apply steps (n, title, desc).",
        keys: ["steps"],
      },
      { title: "FAQs", description: "Question & answer pairs (q, a).", keys: ["faqs"] },
    ],
  },
};

export default async function PageEditorRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = EDITORS[slug];
  if (!config) notFound();

  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (
    !isRouteAllowedForUser(
      "/admin/page-editors",
      level,
      admin.sections.map((s) => s.code),
    )
  ) {
    redirect("/admin");
  }

  return (
    <AdminPageEditor
      slug={slug}
      heading={config.heading}
      description={config.description}
      groups={config.groups}
      validator={config.validator}
      admin={admin}
    />
  );
}
