import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site-next/PageHero";
import { pillPrimary } from "@/components/site-next/site-styles";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import { FaqItem } from "@/components/site-next/FaqItem";
import { getAllProgrammes } from "@/lib/programmes.functions";
import { getMiscSettings } from "@/lib/site-settings.functions";
import { getAdmissionsPage, type AdmissionsPageData } from "@/lib/pages.functions";

export async function generateMetadata(): Promise<Metadata> {
  const misc = await getMiscSettings().catch(() => null);
  const yr = misc?.admission_year;
  return {
    title: yr ? `Admissions ${yr} — SVIT Vasad` : "Admissions — SVIT Vasad",
    description: "How to apply, eligibility, fees, scholarships and FAQs for admissions at SVIT Vasad.",
    alternates: { canonical: "/admissions" },
  };
}

// Fallback used only if the `pages` row (slug: "admissions") is missing or the query fails —
// content otherwise comes from Supabase so it stays editable without a code change.
const fallbackContent: AdmissionsPageData = {
  steps: [
    { n: "01", title: "Fill Inquiry Form", desc: "Submit online enquiry with your programme preference." },
    { n: "02", title: "Eligibility Check", desc: "Our team verifies eligibility as per AICTE norms." },
    { n: "03", title: "Document Submission", desc: "Upload marksheets, ID and category certificates." },
    { n: "04", title: "Admission Confirmation", desc: "Fee payment and seat confirmation." },
  ],
  faqs: [
    { q: "When do admissions for {year} open?", a: "Applications open in January. Merit lists are declared as per GTU / ACPC schedule." },
    { q: "Are scholarships available?", a: "Yes — merit-based, need-based, and government scholarships (SC/ST/OBC/EBC) are offered." },
    { q: "Is hostel accommodation available?", a: "Separate boys' and girls' hostels with mess, Wi-Fi and 24×7 security." },
    { q: "How do I get a fee breakdown?", a: "Contact the admissions office or download the fee structure from Downloads." },
  ],
};

export default async function Admissions() {
  const [programmes, misc, page] = await Promise.all([
    getAllProgrammes().catch(() => []),
    getMiscSettings().catch(() => null),
    getAdmissionsPage().catch(() => null),
  ]);
  const yr = misc?.admission_year;
  const steps = page?.steps ?? fallbackContent.steps;
  const faqs = (page?.faqs ?? fallbackContent.faqs).map((f) => ({
    ...f,
    q: f.q.replace("{year}", yr ? `${yr}` : "the upcoming"),
  }));

  return (
    <>
      <PageHero title="Admissions" accent={`${yr} Batch`} subtitle="Everything you need to know about applying to SVIT Vasad." crumbs={[{ label: "Home", to: "/" }, { label: "Admissions" }]}>
        <Link href="/admissions/inquiry" className={pillPrimary}>
          Start Application
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </PageHero>

      <section className="container-page py-20">
        <SectionHeading center eyebrow="Process" title="How to Apply" />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.05}>
              <div className="h-full border border-line bg-surface p-6">
                <div className="font-display text-4xl font-medium text-crimson">{s.n}</div>
                <h3 className="mt-3 font-display font-medium text-navy">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-paper-deep py-20">
        <div className="container-page">
          <SectionHeading center eyebrow="Eligibility" title="Programme Requirements" />
          <div className="mt-10 overflow-hidden border border-line bg-surface">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-paper-deep text-[11px] uppercase tracking-[0.12em] text-navy">
                <tr>
                  <th className="p-4 text-left">Programme</th>
                  <th className="p-4 text-left">Duration</th>
                  <th className="p-4 text-left">Eligibility</th>
                  <th className="p-4 text-left">Intake</th>
                </tr>
              </thead>
              <tbody>
                {programmes.map((c) => (
                  <tr key={c.code} className="border-t border-line">
                    <td className="p-4 font-semibold text-navy">{c.name}</td>
                    <td className="p-4 text-ink-soft">{c.duration}</td>
                    <td className="p-4 text-ink-soft">{c.eligibility}</td>
                    <td className="p-4 text-ink-soft">{String(c.intake ?? "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="border border-line bg-surface p-8">
            <h3 className="font-display text-2xl font-medium text-navy">Fees</h3>
            <p className="mt-2 text-sm text-ink-soft">Programme-wise fee structure is available in the Downloads section. Fees are payable annually or per semester.</p>
            <Link href="/downloads" className="mt-3 inline-block py-1.5 text-sm font-semibold text-navy hover:text-crimson link-underline">Download fee structure →</Link>
          </div>
          <div className="border border-line bg-paper-deep p-8">
            <h3 className="font-display text-2xl font-medium text-navy">Scholarships</h3>
            <p className="mt-2 text-sm text-ink-soft">Merit, need-based, government (SC/ST/OBC/EBC), and sports scholarships are available. Up to 100% tuition waiver for top rankers.</p>
          </div>
        </div>
      </section>

      <section className="bg-paper-deep py-20">
        <div className="container-page max-w-3xl">
          <SectionHeading center eyebrow="FAQ" title="Frequently Asked Questions" />
          <div className="mt-10 border-t border-line">
            {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>
    </>
  );
}
