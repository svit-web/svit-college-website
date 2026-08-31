import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Briefcase,
  Building2,
  GraduationCap,
  Lightbulb,
  Trees,
  Users,
} from "lucide-react";
import { heroOverlayStyles, DEFAULT_HERO_APPEARANCE, type HeroAppearance } from "@/lib/theme";
import { Reveal } from "@/components/site-next/Reveal";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { CollegeLogo } from "@/components/site-next/CollegeLogo";
import { DeptBranchCard } from "@/components/site-next/DeptBranchCard";
import { EnquiryForm } from "@/components/site-next/EnquiryForm";

export interface CollegeDept {
  id: string;
  name: string;
  slug: string;
  code: string;
  logo_url?: string | null;
  metadata: { degree_type?: string | null; [key: string]: any };
}

export interface College {
  id: string;
  name: string;
  shortCode: string;
  tagline: string;
  logo: string;
  route: string;
  hero: { kicker: string; subhead: string; imageUrl?: string | null };
  stats: { value: string; label: string }[] | null;
  whyChoose: { title: string; desc: string; icon: string }[] | null;
  trustBadges: { label: string; icon: string }[];
  recruiters: string[];
  departments: CollegeDept[];
}

const events: { title: string; tag: string; date: string }[] = [];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BadgeCheck,
  GraduationCap,
  Briefcase,
  Building2,
  Users,
  Lightbulb,
  Award,
  Trees,
};

/**
 * Shared landing page template for every college under the SVIT Group.
 * Reuses the exact section order, components, and design tokens from the
 * homepage — only text/logo/links change per college.
 */
export function CollegeLandingPage({
  college,
  appearance,
}: {
  college: College;
  appearance: HeroAppearance | null;
}) {
  const displayStats = college.stats ?? [];
  const displayWhy = college.whyChoose ?? [];
  const displayRecruiters = college.recruiters;

  return (
    <>
      <Hero college={college} appearance={appearance ?? DEFAULT_HERO_APPEARANCE} />
      <StatsStrip data={displayStats} />
      <ProgramsSection college={college} />
      <WhySection college={college} data={displayWhy} />
      <TrustBand items={college.trustBadges} />
      <EventsAndEnquiry college={college} />
      <RecruitersStrip data={displayRecruiters} />
    </>
  );
}

function Hero({ college, appearance }: { college: College; appearance: HeroAppearance }) {
  const { imageStyle, overlayStyle } = heroOverlayStyles(appearance);

  return (
    <section className="relative overflow-hidden bg-navy-deep text-white">
      {college.hero.imageUrl && (
        <Image
          src={college.hero.imageUrl}
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
          style={imageStyle}
        />
      )}
      <div className="absolute inset-0" style={overlayStyle} />
      <div className="container-page relative py-24 md:py-32">
        <div className="max-w-3xl">
          <div className="mb-6 flex items-center gap-4">
            <CollegeLogo
              shortCode={college.shortCode}
              src={college.logo}
              className="h-16 w-16 rounded-md bg-white/5 p-2"
            />
            <div className="inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              {college.hero.kicker}
            </div>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.02]">
            {college.name} <br />
            <span className="text-gold">({college.shortCode})</span>
          </h1>
          <p className="mt-5 font-display text-2xl text-gold/90 italic">{college.tagline}</p>
          <p className="mt-4 text-lg text-white/85 max-w-2xl">{college.hero.subhead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/admissions/inquiry"
              className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-navy-deep hover:bg-gold-soft transition-colors"
            >
              Apply Now <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#programmes"
              className="inline-flex items-center gap-2 rounded-md border border-white/25 px-6 py-3.5 text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Explore Programmes
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsStrip({ data }: { data: { value: string; label: string }[] }) {
  return (
    <section className="bg-navy text-white">
      <div className="container-page grid grid-cols-2 gap-6 py-10 sm:grid-cols-3 lg:grid-cols-6">
        {data.map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-display text-3xl md:text-4xl font-bold text-gold">{s.value}</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-white/70">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProgramsSection({ college }: { college: College }) {
  const allDepts = college.departments;
  return (
    <section id="programmes" className="container-page py-20">
      <SectionHeading
        center
        eyebrow="What We Offer"
        title={`Programmes at ${college.shortCode}`}
        subtitle={`Programmes offered under ${college.shortCode} — built with rigour, mentorship, and industry alignment.`}
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allDepts.map((dept, i) => (
          <Reveal key={dept.id} delay={i * 0.05}>
            <DeptBranchCard
              name={dept.name}
              iconUrl={dept.logo_url}
              fallbackLabel={initials(dept.name)}
              href={`/departments/${dept.code}`}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function WhySection({
  college,
  data,
}: {
  college: College;
  data: { title: string; desc: string; icon: string }[];
}) {
  return (
    <section className="bg-secondary/50 py-20">
      <div className="container-page">
        <SectionHeading
          center
          eyebrow={`Why ${college.shortCode}`}
          title="A Place to Grow, Not Just Study"
          subtitle={`What sets ${college.shortCode} apart — from faculty and infrastructure to research culture and industry linkages.`}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((w, i) => {
            const Icon = iconMap[w.icon] ?? BadgeCheck;
            return (
              <Reveal key={w.title} delay={i * 0.05}>
                <div className="card-lift h-full rounded-2xl border border-border bg-white p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-navy/5 text-navy">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-navy">{w.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TrustBand({ items }: { items: { label: string; icon: string }[] }) {
  if (items.length === 0) return null;
  return (
    <section className="container-page py-14">
      <div className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-white p-8 md:grid-cols-4">
        {items.map((item) => {
          const Icon = iconMap[item.icon] ?? BadgeCheck;
          return (
            <div key={item.label} className="flex items-center justify-center gap-2 text-navy">
              <Icon className="h-5 w-5 text-gold" />
              <span className="text-sm font-semibold uppercase tracking-wider">{item.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function EventsAndEnquiry({ college }: { college: College }) {
  return (
    <section className="container-page py-20">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SectionHeading eyebrow="Latest" title="Events & News" variant="eyebrow" />
          <ul className="mt-6 space-y-4">
            {events.map((e) => (
              <li key={e.title} className="card-lift rounded-2xl border border-border bg-white p-5">
                <div className="text-xs font-bold uppercase tracking-widest text-crimson">
                  {e.tag}
                </div>
                <div className="mt-1 font-display text-base font-bold text-navy">{e.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{e.date}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-1 rounded-2xl bg-gradient-to-br from-navy to-navy-light p-8 text-white">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">
            Admissions Open
          </div>
          <h3 className="font-display text-2xl font-bold">Join {college.shortCode}</h3>
          <p className="mt-3 text-sm text-white/80">
            Merit-based scholarships, hostel accommodation, and dedicated placement support — start
            your journey with {college.shortCode} today.
          </p>
          <Link
            href="/admissions"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-navy-deep hover:bg-gold-soft"
          >
            View Admissions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <EnquiryForm shortCode={college.shortCode} departments={college.departments} />
      </div>
    </section>
  );
}

function RecruitersStrip({ data }: { data: string[] }) {
  return (
    <section className="container-page pb-20">
      <Reveal>
        <div className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Our Recruiters
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {data.map((r) => (
            <span
              key={r}
              className="font-display text-lg font-bold text-navy/50 hover:text-navy transition-colors"
            >
              {r}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
