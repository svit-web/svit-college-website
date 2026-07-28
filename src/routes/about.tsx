import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { CTABanner } from "@/components/site/CTABanner";
import { getAllCommittees } from "@/lib/committees.functions";
import { getAllAccreditations } from "@/lib/accreditations.functions";
import { getAboutPage } from "@/lib/pages.functions";
import { getAllMOUs } from "@/lib/mous.functions";
import type { MOU } from "@/lib/mous.functions";
import { ImageIcon } from "lucide-react";

import {
  Quote,
  FileText,
  ShieldCheck,
  Users,
  BookOpen,
  Trophy,
  Bus,
  Wifi,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  MapPin,
  Phone,
  Mail,
  Globe,
  ExternalLink,
} from "lucide-react";
import type { ComponentType } from "react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SVIT Vasad — Legacy, Vision, Leadership & Campus" },
      {
        name: "description",
        content:
          "Established 1997 by NEST — SVIT Vasad's story, quick facts, leadership, accreditation, committees, campus facilities and contact.",
      },
      { property: "og:title", content: "About SVIT Vasad" },
      { property: "og:description", content: "Legacy, vision, mission and campus of SVIT Vasad." },
    ],
  }),
  loader: async () => {
    const [aboutPage, committees, accreditations, mous] = await Promise.all([
      getAboutPage(),
      getAllCommittees(),
      getAllAccreditations(),
      getAllMOUs(),
    ]);
    return { aboutPage, committees, accreditations, mous };
  },
  component: AboutPage,
});

const socialIcons: Record<string, ComponentType<{ className?: string }>> = {
  Facebook,
  Instagram,
  LinkedIn: Linkedin,
  Linkedin,
  Twitter,
  X: Twitter,
};

function SectionShell({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`container-page py-16 md:py-20 ${className}`}>
      {children}
    </section>
  );
}

const sectionLinks = [
  { id: "history", label: "History" },
  { id: "vision-mission", label: "Vision & Mission" },
  { id: "leadership", label: "Leadership" },
  { id: "accreditation", label: "Accreditation" },
  { id: "committees", label: "Committees" },
  { id: "mous", label: "MOUs" },
  { id: "facilities", label: "Facilities" },
  { id: "media", label: "Media" },
  { id: "contact", label: "Contact" },
];

function AboutPage() {
  const { aboutPage: c, committees, accreditations, mous } = Route.useLoaderData();

  return (
    <>
      {/* Hero: portrait left, brief on right */}
      <section className="bg-gradient-to-br from-navy via-navy to-navy-deep text-white">
        <div className="container-page py-14 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
            {/* Brief about (left) */}
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                {c?.hero?.accent}
              </div>
              <h1 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {c?.hero?.title}
              </h1>
              <p className="mt-6 text-base md:text-lg text-white/80 leading-relaxed">
                {c?.hero?.introText}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wider text-white/70">
                <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">
                  Est. 1997
                </span>
                <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">
                  AICTE Approved
                </span>
                <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">
                  NBA Accredited
                </span>
                <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">
                  GTU Affiliated
                </span>
              </div>
            </div>

            {/* Portrait (right) */}
            <div className="mx-auto w-full max-w-sm lg:mx-0 lg:ml-auto">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border-2 border-gold/40 bg-white/5 shadow-2xl">
                {c?.hero?.portraitUrl ? (
                  <img src={c.hero.portraitUrl} alt="SVIT Leadership" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/40">
                    <ImageIcon className="h-14 w-14" />
                    <span className="text-xs font-semibold uppercase tracking-[0.25em]">
                      Portrait Photo
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vertical sidebar + content */}
      <div className="bg-secondary/30">
        <div className="container-page py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <nav
                aria-label="About sections"
                className="rounded-2xl border-2 border-navy/15 bg-white p-3 shadow-sm"
              >
                <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-crimson">
                  On this page
                </div>
                <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                  {sectionLinks.map((s) => (
                    <li key={s.id} className="shrink-0 lg:shrink">
                      <a
                        href={`#${s.id}`}
                        className="flex items-center gap-2.5 rounded-xl border-2 border-transparent px-3 py-2.5 text-sm font-semibold text-navy transition-all hover:border-navy/15 hover:bg-secondary/60"
                      >
                        <span className="whitespace-nowrap lg:whitespace-normal">{s.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <div className="min-w-0 space-y-8 [&>section]:scroll-mt-24">




      {/* 3. History */}
      <section id="history" className="bg-secondary/50 py-16 md:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Our journey" title="History & Milestones" variant="eyebrow" />
          <p className="mt-6 max-w-4xl text-muted-foreground leading-relaxed">
            {c?.history?.introText}
          </p>
          <ol className="mt-10 space-y-4">
            {(c?.history?.milestones ?? []).map((m, i) => (
              <Reveal key={`${m.year}-${i}`} delay={i * 0.04}>
                <li className="grid grid-cols-[110px_1fr] gap-4 rounded-xl border-2 border-navy/15 bg-white p-5 hover:border-gold transition-colors">
                  <div className="font-display text-2xl font-bold text-gold">{m.year}</div>
                  <div className="text-sm text-navy leading-relaxed">{m.milestone}</div>
                </li>
              </Reveal>
            ))}
          </ol>
          {c?.history?.closingText && (
            <p className="mt-8 max-w-4xl text-muted-foreground leading-relaxed italic">
              {c.history.closingText}
            </p>
          )}
        </div>
      </section>

      {/* 4 + 5. Vision & Mission */}
      <SectionShell id="vision-mission">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border-2 border-navy/15 bg-white p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-crimson">
              Vision
            </div>
            <blockquote className="mt-4 font-display text-xl md:text-2xl text-navy leading-snug">
              "{c?.vision?.visionText}"
            </blockquote>
          </div>
          <div className="rounded-2xl border-2 border-navy/15 bg-white p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-crimson">
              Mission
            </div>
            <ol className="mt-4 space-y-3">
              {(c?.mission?.missionPoints ?? []).map((p, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-bold text-gold">
                    {i + 1}
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </SectionShell>

      {/* 6. Core Values */}
      <section className="bg-navy py-14 text-white">
        <div className="container-page text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Core Values
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {(c?.coreValues ?? []).map((v) => (
              <span
                key={v}
                className="rounded-full border border-white/25 bg-white/5 px-5 py-2 text-sm font-medium tracking-wide"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Leadership */}
      <SectionShell id="leadership">
        <SectionHeading eyebrow="Guiding SVIT" title="Leadership" variant="eyebrow" />
        <p className="mt-4 max-w-3xl text-muted-foreground">{c?.leadership?.intro}</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Chairman */}
          <div className="rounded-2xl border-2 border-navy/15 bg-white p-8">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-crimson">
              <Quote className="h-4 w-4" /> Chairman&rsquo;s Message
            </div>
            <blockquote className="text-navy leading-relaxed italic">
              "{c?.leadership?.chairman?.quote}"
            </blockquote>
            <div className="mt-4 text-sm font-semibold text-navy">
              {c?.leadership?.chairman?.name}
            </div>
            <div className="text-xs text-muted-foreground">{c?.leadership?.chairman?.title}</div>

            {c?.leadership?.chairman?.strategicPlanText && (
              <div className="mt-6 border-t border-border pt-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-navy">
                  Strategic Plan
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {c.leadership.chairman.strategicPlanText}
                </p>
              </div>
            )}

            {c?.leadership?.chairman?.corePrinciples &&
              c.leadership.chairman.corePrinciples.length > 0 && (
                <div className="mt-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-navy">
                    Core Principles
                  </div>
                  <ul className="mt-3 space-y-2">
                    {c.leadership.chairman.corePrinciples.map((p, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          {/* Principal */}
          <div className="rounded-2xl border-2 border-navy/15 bg-white p-8">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-crimson">
              <Quote className="h-4 w-4" /> Principal&rsquo;s Message
            </div>
            <blockquote className="text-navy leading-relaxed italic">
              "{c?.leadership?.principal?.quote}"
            </blockquote>
            <div className="mt-4 text-sm font-semibold text-navy">
              {c?.leadership?.principal?.name}
            </div>
            <div className="text-xs text-muted-foreground">{c?.leadership?.principal?.title}</div>
            {c?.leadership?.principal?.bodyText && (
              <p className="mt-6 border-t border-border pt-6 text-sm text-muted-foreground leading-relaxed">
                {c.leadership.principal.bodyText}
              </p>
            )}
          </div>
        </div>

        {/* Board of Management */}
        <div className="mt-10">
          <h3 className="font-display text-2xl font-bold text-navy flex items-center gap-2">
            <Users className="h-5 w-5 text-gold" /> Board of Management
          </h3>
          <div className="mt-4 overflow-hidden rounded-xl border-2 border-navy/15 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-4 py-3 text-left w-16">Sr.</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Designation</th>
                </tr>
              </thead>
              <tbody>
                {(c?.leadership?.boardOfManagement ?? []).map((b) => (
                  <tr key={b.srNo} className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">{b.srNo}</td>
                    <td className="px-4 py-3 font-medium text-navy">{b.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.designation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionShell>

      {/* 8. Accreditation - Dynamic from Supabase */}
      <section id="accreditation" className="bg-secondary/50 py-16 md:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Standards & Compliance"
            title="Accreditation & Compliance"
            variant="eyebrow"
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border-2 border-navy/15 bg-white overflow-hidden">
              <div className="px-5 py-3 bg-navy text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Recognitions
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {accreditations.map((acc) => (
                    <tr key={acc.id} className="border-t border-border first:border-t-0">
                      <td className="px-4 py-3 text-navy">
                        {acc.metadata.body || `${acc.organization} (${acc.value})`}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gold">
                        {acc.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              {accreditations
                .filter((acc) => acc.metadata.description)
                .slice(0, 3)
                .map((acc) => (
                  <div key={acc.id} className="rounded-xl border-2 border-navy/15 bg-white p-5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-crimson">
                      {acc.organization}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {acc.metadata.description}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border-2 border-navy/15 bg-white p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-crimson">
                Academic Regulations (GTU)
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {c?.accreditation?.academicRegulationsText}
              </p>
              <ul className="mt-4 space-y-2">
                {(c?.accreditation?.regulationPoints ?? []).map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-navy">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border-2 border-navy/15 bg-white p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-crimson">
                Mandatory Disclosure &amp; Code of Conduct
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {c?.accreditation?.mandatoryDisclosureText}
              </p>
              <ul className="mt-4 space-y-2">
                {(c?.accreditation?.codeOfConductPoints ?? []).map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-navy">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Related documents */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-navy">
              Related Documents
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(c?.accreditation?.relatedDocuments ?? []).map((d) => (
                <li key={d.label}>
                  <a
                    href={d.fileUrl}
                    className="group flex items-center justify-between gap-3 rounded-xl border-2 border-navy/15 bg-white p-4 hover:border-gold transition-colors"
                  >
                    <span className="flex items-center gap-3 text-sm font-medium text-navy">
                      <FileText className="h-4 w-4 text-gold" />
                      {d.label}
                    </span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-gold" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 9. Committees - Dynamic from Supabase */}
      <SectionShell id="committees">
        <SectionHeading eyebrow="Governance" title="SVIT Committees" variant="eyebrow" />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {committees.map((cm, i) => (
            <Reveal key={cm.id} delay={i * 0.05}>
              <div className="h-full rounded-2xl border-2 border-navy/15 bg-white p-6 hover:border-gold transition-colors">
                <h3 className="font-display text-lg font-bold text-navy">{cm.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {cm.metadata.description}
                </p>
                {cm.metadata.vision && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    <span className="font-semibold text-navy">Vision: </span>
                    {cm.metadata.vision}
                  </p>
                )}
                {cm.metadata.mission && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-navy">Mission: </span>
                    {cm.metadata.mission}
                  </p>
                )}
                {cm.metadata.keyActivities && cm.metadata.keyActivities.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-crimson">
                      Key Activities
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {cm.metadata.keyActivities.map((a, j) => (
                        <li key={j} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      {/* 10. MOUs - Dynamic from Supabase */}
      <section id="mous" className="bg-secondary/50 py-16 md:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Industry Partnerships" title="Memoranda of Understanding" variant="eyebrow" />
          <p className="mt-4 max-w-3xl text-muted-foreground">
            SVIT has signed MOUs with leading industries and organizations to provide students with internships, expert lectures, and hands-on training opportunities.
          </p>
          <div className="mt-8 overflow-hidden rounded-xl border-2 border-navy/15 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Organization</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Purpose</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Department</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Signed</th>
                </tr>
              </thead>
              <tbody>
                {mous.map((mou: MOU, i: number) => (
                  <tr key={mou.id} className={`border-t border-border ${i % 2 === 0 ? "" : "bg-secondary/30"}`}>
                    <td className="px-4 py-3 font-medium text-navy">{mou.partner_organization}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{mou.purpose}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {mou.metadata?.department ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {mou.signed_date ? new Date(mou.signed_date).toLocaleDateString("en-IN", { year: "numeric", month: "short" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right text-xs text-muted-foreground">
            {mous.length} active MOUs
          </div>
        </div>
      </section>

      {/* 11. Facilities */}
      <section id="facilities" className="bg-secondary/50 py-16 md:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Life on campus" title="Campus Facilities" variant="eyebrow" />
          <p className="mt-4 max-w-3xl text-muted-foreground">{c?.facilities?.intro}</p>

          {/* Library */}
          <div className="mt-10 rounded-2xl border-2 border-navy/15 bg-white p-6">
            <h3 className="flex items-center gap-2 font-display text-xl font-bold text-navy">
              <BookOpen className="h-5 w-5 text-gold" /> Library
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {c?.facilities?.library?.text}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(c?.facilities?.library?.stats ?? []).map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-secondary/40 p-4">
                  <div className="font-display text-xl font-bold text-navy">{s.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scholarships */}
          <div className="mt-6 rounded-2xl border-2 border-navy/15 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-display text-xl font-bold text-navy">Scholarships</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-navy/5 text-navy">
                <tr>
                  <th className="px-4 py-3 text-left">Scholarship</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Eligibility</th>
                </tr>
              </thead>
              <tbody>
                {(c?.facilities?.scholarships ?? []).map((s) => (
                  <tr key={s.name} className="border-t border-border align-top">
                    <td className="px-4 py-3 font-medium text-navy">{s.name}</td>
                    <td className="px-4 py-3 text-navy">{s.amount}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.eligibility}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sports */}
          <div className="mt-6 rounded-2xl border-2 border-navy/15 bg-white p-6">
            <h3 className="flex items-center gap-2 font-display text-xl font-bold text-navy">
              <Trophy className="h-5 w-5 text-gold" /> Sports &amp; Recreation
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {c?.facilities?.sports?.text}
            </p>
            <div className="mt-4 space-y-3">
              {(c?.facilities?.sports?.activities ?? []).map((a) => (
                <div key={a.label} className="rounded-lg border border-border p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-crimson">
                    {a.label}
                  </div>
                  <div className="mt-1 text-sm text-navy">{a.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* NSS / NCC */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {(c?.facilities?.nssNcc ?? []).map((n) => (
              <div key={n.name} className="rounded-2xl border-2 border-navy/15 bg-white p-6">
                <h3 className="font-display text-lg font-bold text-navy">{n.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {n.description}
                </p>
              </div>
            ))}
          </div>

          {/* Hostels & Transport */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-navy/15 bg-white p-6">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
                <Users className="h-5 w-5 text-gold" /> Hostels
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {c?.facilities?.hostelsTransport?.hostelText}
              </p>
            </div>
            <div className="rounded-2xl border-2 border-navy/15 bg-white p-6">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
                <Bus className="h-5 w-5 text-gold" /> Transport
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {c?.facilities?.hostelsTransport?.transportText}
              </p>
            </div>
          </div>

          {/* IT & Medical */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(c?.facilities?.itMedical ?? []).map((it) => (
              <div key={it.label} className="rounded-2xl border-2 border-navy/15 bg-white p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-crimson">
                  <Wifi className="h-4 w-4" /> {it.label}
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {it.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Media */}
      <SectionShell id="media">
        <SectionHeading eyebrow="Stay connected" title="SVIT Media" variant="eyebrow" />
        <p className="mt-4 max-w-3xl text-muted-foreground">{c?.media?.intro}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {(c?.media?.publications ?? []).map((p) => (
            <div key={p.name} className="rounded-2xl border-2 border-navy/15 bg-white p-6">
              <h3 className="font-display text-lg font-bold text-navy">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-crimson mb-3">
            Photo Gallery
          </div>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-navy/15 bg-white px-5 py-3 text-sm font-semibold text-navy hover:border-gold hover:text-gold transition-colors"
          >
            Browse Campus Gallery →
          </Link>
        </div>

        <div className="mt-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-crimson">
            Follow us
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {(c?.media?.socialMedia ?? []).map((s) => {
              const Icon = socialIcons[s.platform] ?? ExternalLink;
              return (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-navy/15 bg-white px-4 py-2 text-sm font-medium text-navy hover:border-gold hover:text-gold transition-colors"
                >
                  <Icon className="h-4 w-4" /> {s.platform}
                </a>
              );
            })}
          </div>
        </div>
      </SectionShell>

      {/* 12. Contact */}
      <section id="contact" className="bg-navy py-16 text-white">
        <div className="container-page">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Get in touch
          </div>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold">Contact Us</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MapPin, label: "Address", value: c?.contact?.address, href: undefined },
              { icon: Phone, label: "Phone", value: c?.contact?.phone, href: c?.contact?.phone ? `tel:${c.contact.phone.replace(/\s+/g, "")}` : undefined },
              { icon: Mail, label: "Email", value: c?.contact?.email, href: c?.contact?.email ? `mailto:${c.contact.email}` : undefined },
              { icon: Globe, label: "Website", value: c?.contact?.website ? c.contact.website.replace(/^https?:\/\//, "") : undefined, href: c?.contact?.website },
            ].map((cc) => (
              <div key={cc.label} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
                  <cc.icon className="h-4 w-4" /> {cc.label}
                </div>
                {cc.href ? (
                  <a href={cc.href} className="mt-2 block text-sm text-white/90 hover:text-gold break-words">
                    {cc.value}
                  </a>
                ) : (
                  <div className="mt-2 text-sm text-white/90">{cc.value}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

            </div>
          </div>
        </div>
      </div>

      <CTABanner />
    </>
  );
}
