import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { CTABanner } from "@/components/site/CTABanner";
import { getAllProgrammes } from "@/lib/programmes.functions";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admissions/")({
  head: () => ({ meta: [{ title: "Admissions 2026-27 — SVIT Vasad" }, { name: "description", content: "How to apply, eligibility, fees, scholarships and FAQs for admissions at SVIT Vasad." }] }),
  loader: async () => {
    const programmes = await getAllProgrammes();
    return { programmes };
  },
  component: Admissions,
});

const steps = [
  { n: "01", title: "Fill Inquiry Form", desc: "Submit online enquiry with your programme preference." },
  { n: "02", title: "Eligibility Check", desc: "Our team verifies eligibility as per AICTE norms." },
  { n: "03", title: "Document Submission", desc: "Upload marksheets, ID and category certificates." },
  { n: "04", title: "Admission Confirmation", desc: "Fee payment and seat confirmation." },
];

const faqs = [
  { q: "When do admissions for 2026-27 open?", a: "Applications open in January 2026. Merit lists are declared as per GTU / ACPC schedule." },
  { q: "Are scholarships available?", a: "Yes — merit-based, need-based, and government scholarships (SC/ST/OBC/EBC) are offered." },
  { q: "Is hostel accommodation available?", a: "Separate boys' and girls' hostels with mess, Wi-Fi and 24×7 security." },
  { q: "How do I get a fee breakdown?", a: "Contact the admissions office or download the fee structure from Downloads." },
];

function Admissions() {
  const { programmes } = Route.useLoaderData();
  return (
    <>
      <PageHero title="Admissions" accent="2026-27 Batch" subtitle="Everything you need to know about applying to SVIT Vasad." crumbs={[{ label: "Home", to: "/" }, { label: "Admissions" }]}>
        <Link to="/admissions/inquiry" className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-bold uppercase tracking-[0.08em] text-navy-deep hover:bg-gold-soft">
          Start Application
        </Link>
      </PageHero>

      <section className="container-page py-20">
        <SectionHeading center eyebrow="Process" title="How to Apply" />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.05}>
              <div className="card-lift h-full rounded-2xl border border-border bg-white p-6">
                <div className="font-display text-4xl font-bold text-gold">{s.n}</div>
                <h3 className="mt-3 font-display font-bold text-navy">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-secondary/50 py-20">
        <div className="container-page">
          <SectionHeading center eyebrow="Eligibility" title="Programme Requirements" />
          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-navy text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 text-left">Programme</th>
                  <th className="p-4 text-left">Duration</th>
                  <th className="p-4 text-left">Eligibility</th>
                  <th className="p-4 text-left">Intake</th>
                </tr>
              </thead>
              <tbody>
                {programmes.map((c) => (
                  <tr key={c.code} className="border-t border-border">
                    <td className="p-4 font-semibold text-navy">{c.name}</td>
                    <td className="p-4 text-muted-foreground">{c.metadata.duration}</td>
                    <td className="p-4 text-muted-foreground">{c.metadata.eligibility}</td>
                    <td className="p-4 text-muted-foreground">{c.metadata.intake}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-8">
            <h3 className="font-display text-2xl font-bold text-navy">Fees</h3>
            <p className="mt-2 text-sm text-muted-foreground">Programme-wise fee structure is available in the Downloads section. Fees are payable annually or per semester.</p>
            <Link to="/downloads" className="mt-4 inline-block text-sm font-semibold text-navy hover:text-gold link-underline">Download fee structure →</Link>
          </div>
          <div className="rounded-2xl border border-border bg-gradient-to-br from-gold-soft to-white p-8">
            <h3 className="font-display text-2xl font-bold text-navy">Scholarships</h3>
            <p className="mt-2 text-sm text-muted-foreground">Merit, need-based, government (SC/ST/OBC/EBC), and sports scholarships are available. Up to 100% tuition waiver for top rankers.</p>
          </div>
        </div>
      </section>

      <section className="bg-secondary/50 py-20">
        <div className="container-page max-w-3xl">
          <SectionHeading center eyebrow="FAQ" title="Frequently Asked Questions" />
          <div className="mt-10 space-y-3">
            {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-border bg-white">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
        <span className="font-semibold text-navy">{q}</span>
        <ChevronDown className={`h-4 w-4 text-navy transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-border p-5 text-sm text-muted-foreground">{a}</div>}
    </div>
  );
}
