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
  type LucideIcon,
} from "lucide-react";
import {
  heroFadeStyles,
  heroOverlayStyles,
  heroTextVars,
  DEFAULT_HERO_APPEARANCE,
  type HeroAppearance,
} from "@/lib/theme";
import { pillOutline, pillPrimary, sectionSpacing } from "@/components/site-next/site-styles";
import { Reveal } from "@/components/site-next/Reveal";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { DeptBranchCard } from "@/components/site-next/DeptBranchCard";
import { RecruitersMarquee } from "@/components/site-next/RecruitersMarquee";
import type { RecruiterRow } from "@/lib/homepage";

export interface CollegeDept {
  id: string;
  name: string;
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
  recruiters: RecruiterRow[];
  departments: CollegeDept[];
}

const events: { title: string; tag: string; date: string }[] = [];

const iconMap: Record<string, LucideIcon> = {
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
  ctaLabel,
}: {
  college: College;
  appearance: HeroAppearance | null;
  ctaLabel: string;
}) {
  const displayStats = college.stats ?? [];
  const displayWhy = college.whyChoose ?? [];
  const displayRecruiters = college.recruiters;

  return (
    <>
      <Hero
        college={college}
        appearance={appearance ?? DEFAULT_HERO_APPEARANCE}
        ctaLabel={ctaLabel}
      />
      <StatsStrip data={displayStats} />
      <ProgramsSection college={college} />
      <WhySection college={college} data={displayWhy} />
      <TrustBand items={college.trustBadges} />
      <Events />
      <RecruitersStrip data={displayRecruiters} />
    </>
  );
}

// Photo hero in the homepage style: full-bleed college photo (Photo Visibility,
// overlay tint and whole-photo Background Blur apply) with the shared paper
// fade down the left for the text. No photo → a plain paper banner.
function Hero({
  college,
  appearance,
  ctaLabel,
}: {
  college: College;
  appearance: HeroAppearance;
  ctaLabel: string;
}) {
  const photo = college.hero.imageUrl;
  const { imageStyle, overlayStyle } = heroOverlayStyles(appearance);
  const fade = heroFadeStyles(appearance);

  return (
    <section
      className="relative overflow-hidden border-b border-line bg-paper"
      style={heroTextVars(appearance)}
    >
      {photo && (
        <div className="absolute inset-0">
          <Image
            src={photo}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover"
            style={imageStyle}
          />
          <div className="absolute inset-0" style={overlayStyle} />
          <div className="absolute inset-0" style={fade.sideBlur} />
          <div className="absolute inset-0" style={fade.sideGradient} />
          <div className="absolute inset-x-0 top-0 h-32 lg:h-40" style={fade.topBlur} />
          <div className="absolute inset-x-0 top-0 h-32 lg:h-40" style={fade.topGradient} />
          {/* Phones: text spans the full width, so wash the whole photo. */}
          <div className="absolute inset-0 bg-paper/75 md:hidden" />
        </div>
      )}
      <div className="container-page relative flex min-h-[560px] flex-col justify-end pb-[clamp(2.5rem,6vw,4.5rem)] pt-[clamp(112px,16vh,180px)] lg:min-h-[86vh]">
        <div className="max-w-[34rem]">
          {college.hero.kicker && (
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-crimson">
              {college.hero.kicker}
            </p>
          )}
          <h1 className="mt-[1.1rem] text-[clamp(2rem,3.9vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.035em] text-[var(--hero-text)]">
            {college.name}{" "}
            <span className="font-serif font-medium italic tracking-[-0.01em] text-crimson">
              ({college.shortCode})
            </span>
          </h1>
          {college.tagline && (
            <p className="mt-5 font-display text-xl italic text-[var(--hero-text)] md:text-2xl">
              {college.tagline}
            </p>
          )}
          {college.hero.subhead && (
            <p className="mt-4 max-w-2xl text-[clamp(1rem,1.35vw,1.18rem)] font-medium leading-[1.55] text-[color-mix(in_oklab,var(--hero-text)_78%,var(--paper))]">
              {college.hero.subhead}
            </p>
          )}
          <div className="mt-8 flex flex-col gap-[0.7rem] sm:flex-row">
            <Link href="/admissions/inquiry" className={pillPrimary}>
              {ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#programmes" className={pillOutline}>
              Explore Programmes
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsStrip({ data }: { data: { value: string; label: string }[] }) {
  if (data.length === 0) return null;
  return (
    <section className="border-b border-line bg-paper py-10 md:py-14">
      {/* Homepage numbers strip: hairlines via gap-px over bg-line; odd last figure
          spans the row on phones; one divided row from lg. */}
      <div className="container-page">
        <div className="grid grid-cols-2 gap-px bg-line lg:flex lg:gap-0 lg:divide-x lg:divide-line lg:bg-transparent">
          {data.map((s) => (
            <div
              key={s.label}
              className="bg-paper px-3 py-6 text-center last:odd:col-span-2 lg:flex-1 lg:px-2 lg:py-2"
            >
              <div className="font-display text-3xl font-medium text-navy md:text-4xl lg:text-3xl 2xl:text-4xl">
                {s.value}
              </div>
              <div className="mt-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgramsSection({ college }: { college: College }) {
  const allDepts = college.departments;
  return (
    <section id="programmes" className={`container-page scroll-mt-24 ${sectionSpacing}`}>
      <SectionHeading
        center
        eyebrow="What We Offer"
        title={`Programmes at ${college.shortCode}`}
        subtitle={`Programmes offered under ${college.shortCode} — built with rigour, mentorship, and industry alignment.`}
      />
      {/* Joined hairline grid like the homepage's Our Institutes. */}
      <div className="mt-12 grid border-t border-l border-line md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allDepts.map((dept, i) => (
          <Reveal key={dept.id} delay={i * 0.05} className="border-r border-b border-line">
            <DeptBranchCard
              variant="cell"
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

// First letter of the first two words, skipping punctuation ("B.Sc. (IT)" → "BI").
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function WhySection({
  college,
  data,
}: {
  college: College;
  data: { title: string; desc: string; icon: string }[];
}) {
  if (data.length === 0) return null;
  return (
    <section className={`border-y border-line bg-paper-deep ${sectionSpacing}`}>
      <div className="container-page">
        <SectionHeading
          center
          eyebrow={`Why ${college.shortCode}`}
          title="A Place to Grow, Not Just Study"
          subtitle={`What sets ${college.shortCode} apart — from faculty and infrastructure to research culture and industry linkages.`}
        />
        <div className="mt-12 grid border-t border-l border-line md:grid-cols-2 lg:grid-cols-3">
          {data.map((w, i) => {
            const Icon = iconMap[w.icon] ?? BadgeCheck;
            return (
              <Reveal key={w.title} delay={i * 0.05} className="border-r border-b border-line">
                <div className="h-full p-6 md:p-8">
                  <Icon className="h-6 w-6 text-navy" strokeWidth={1.5} />
                  <h3 className="mt-5 font-display text-xl font-medium text-navy">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{w.desc}</p>
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
  // Admin data can repeat a badge; dedupe by label (also keeps React keys unique).
  const unique = items.filter((item, i) => items.findIndex((x) => x.label === item.label) === i);
  if (unique.length === 0) return null;
  return (
    <section className="container-page py-14">
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-y border-line py-7 md:grid-cols-4 md:gap-y-6">
        {unique.map((item) => {
          const Icon = iconMap[item.icon] ?? BadgeCheck;
          return (
            <div
              key={item.label}
              className="flex items-center justify-center gap-2 text-center text-navy"
            >
              <Icon className="h-5 w-5 shrink-0 text-gold" />
              <span className="text-xs font-semibold uppercase tracking-wider md:text-sm">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// `events` is a static placeholder (always empty today) — render nothing rather
// than an "Events & News" heading over a blank list.
function Events() {
  if (events.length === 0) return null;
  return (
    <section className={`container-page ${sectionSpacing}`}>
      <SectionHeading eyebrow="Latest" title="Events & News" variant="eyebrow" />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <li key={e.title} className="border border-line bg-surface p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">
              {e.tag}
            </div>
            <div className="mt-1.5 font-display text-base font-medium text-navy">{e.title}</div>
            <div className="mt-1 text-xs text-ink-mute">{e.date}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RecruitersStrip({ data }: { data: RecruiterRow[] }) {
  if (data.length === 0) return null;
  return (
    <section className="container-page pb-20">
      <Reveal>
        <div className="text-center text-xs font-semibold uppercase tracking-widest text-ink-mute">
          Our Recruiters
        </div>
        <RecruitersMarquee recruiters={data} />
      </Reveal>
    </section>
  );
}
