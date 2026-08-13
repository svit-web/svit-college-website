import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Briefcase,
  Building2,
  GraduationCap,
  Lightbulb,
  ShieldCheck,
  Trees,
  Users,
} from "lucide-react";
import { HomeCarousel, type CarouselSlide } from "@/components/site-next/Carousel";
import { HeroCardSlider } from "@/components/site-next/HeroCardSlider";
import { CTABanner } from "@/components/site-next/CTABanner";
import { Reveal } from "@/components/site-next/Reveal";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { CollegeLogo } from "@/components/site-next/CollegeLogo";
import { EventsNewsSlider, type EventSlide } from "@/components/site-next/EventsNewsSlider";
import { HeroPhotoLayer } from "@/components/site-next/HeroPhotoLayer";
import {
  byType,
  promoBySlot,
  type HomepageItem,
  type CollegeRow,
  type RecruiterRow,
  type EventRow,
} from "@/lib/homepage";
import {
  getGlobalHomepageItems,
  getCollegesGrid,
  getRecruiterLogos,
  getLatestEvents,
} from "@/lib/homepage.functions";
import { getHeroAppearance, DEFAULT_HERO_APPEARANCE, HOMEPAGE_ROTATE_MS, type HeroAppearance } from "@/lib/theme.functions";
import { getMiscSettings, type MiscSettings } from "@/lib/site-settings.functions";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BadgeCheck, GraduationCap, Briefcase, Building2, Users, Lightbulb, Award, Trees, ShieldCheck,
};

export default async function Home() {
  const [items, colleges, recruiters, events, appearance, misc] = await Promise.all([
    getGlobalHomepageItems().catch(() => []),
    getCollegesGrid().catch(() => []),
    getRecruiterLogos().catch(() => []),
    getLatestEvents().catch(() => []),
    getHeroAppearance().catch(() => DEFAULT_HERO_APPEARANCE),
    getMiscSettings().catch(() => null),
  ]);

  return (
    <>
      <Hero items={items} appearance={appearance} misc={misc} />
      <CollegesSection colleges={colleges} misc={misc} />
      <HomeCarouselSection items={items} />
      <StatsStrip items={items} />
      <WhySection items={items} />
      <TrustBand items={items} />
      <EventsAndEnquiry events={events} recruiters={recruiters} />
      <CTABannerSection items={items} misc={misc} />
    </>
  );
}

function Hero({
  items,
  appearance,
  misc,
}: {
  items: HomepageItem[];
  appearance: HeroAppearance;
  misc: MiscSettings | null;
}) {
  const hero = byType(items, "hero")[0];
  const highlightCards = byType(items, "highlight_card");
  const resolvedAppearance = appearance ?? DEFAULT_HERO_APPEARANCE;
  const photos =
    resolvedAppearance.homepagePhotos.length > 0
      ? resolvedAppearance.homepagePhotos
      : hero?.image_url ? [hero.image_url] : [];

  const textOrEmpty = (v: string | null | undefined) => (typeof v === "string" ? v.trim() : "");
  const pretitle = textOrEmpty(hero?.pretitle);
  const eyebrow = hero
    ? textOrEmpty(hero.eyebrow)
    : (misc?.year_established ? `Est. ${misc.year_established} · Vasad, Gujarat` : "Vasad, Gujarat");
  const title = hero ? textOrEmpty(hero.title) : "Build Your Future.";
  const titleAccent = hero ? textOrEmpty(hero.title_accent) : "Shape The World.";
  const subtitle = hero
    ? textOrEmpty(hero.subtitle)
    : "SVIT Vasad is a premier institute offering AICTE-approved programmes in engineering, management and applied sciences."
      + (misc?.placement_percentage ? ` ${misc.placement_percentage}%+ placement` : "")
      + (misc?.recruiter_count ? ` across ${misc.recruiter_count}+ recruiting partners.` : "");
  const primaryLabel = hero?.link_label ?? "Apply Now";
  const primaryHref = hero?.link_href ?? "/admissions/inquiry";
  const secondaryLabel = hero?.secondary_link_label ?? "Explore Courses";
  const secondaryHref = hero?.secondary_link_href ?? "/courses";

  const highlights =
    highlightCards.map((h) => ({
      id: h.id,
      image: h.image_url ?? "",
      eyebrow: h.eyebrow ?? undefined,
      title: h.title,
      subtitle: h.subtitle ?? undefined,
    }));

  return (
    <section className="relative overflow-hidden bg-navy-deep text-white">
      <HeroPhotoLayer photos={photos} appearance={resolvedAppearance} rotateMs={HOMEPAGE_ROTATE_MS} />
      <div className="container-page relative py-20 md:py-28">
        <div className={`grid items-center gap-12 ${resolvedAppearance.heroSliderEnabled ? "lg:grid-cols-[1.15fr_1fr]" : ""}`}>
          <div>
            {pretitle && (
              <p className="mb-3 font-display text-3xl md:text-5xl font-bold leading-[1.05] text-white">
                {pretitle.includes(" of Technology") ? (
                  <>
                    {pretitle.replace(" of Technology", "")}
                    <br />
                    of Technology
                  </>
                ) : (
                  pretitle
                )}
              </p>
            )}
            {eyebrow && (
              <div className="mb-4 inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                {eyebrow}
              </div>
            )}
            {(title || titleAccent) && (
              <h1 className="font-display text-2xl md:text-4xl font-bold leading-[1.05]">
                {title && (
                  <>
                    {title}
                    {titleAccent && <br />}
                  </>
                )}
                {titleAccent && <span className="text-gold">{titleAccent}</span>}
              </h1>
            )}
            {subtitle && (
              <p className="mt-6 text-lg text-white/85 max-w-2xl">{subtitle}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-navy-deep hover:bg-gold-soft transition-colors"
              >
                {primaryLabel} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex items-center gap-2 rounded-md border border-white/25 px-6 py-3.5 text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                {secondaryLabel}
              </Link>
            </div>
          </div>
          {resolvedAppearance.heroSliderEnabled && (
            <div className="w-full">
              <HeroCardSlider items={highlights} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatsStrip({ items }: { items: HomepageItem[] }) {
  const stats = byType(items, "stat");
  return (
    <section className="bg-navy text-white">
      <div className="container-page grid grid-cols-2 gap-6 py-10 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.id} className="text-center">
            <div className="font-display text-3xl md:text-4xl font-bold text-gold">{s.title}</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-white/70">{s.subtitle ?? ""}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CollegesSection({ colleges, misc }: { colleges: CollegeRow[]; misc: MiscSettings | null }) {
  const collegesLabel = misc?.colleges_label || "Colleges";
  const rows =
    colleges && colleges.length > 0
      ? colleges.map((c) => ({
          id: c.slug,
          shortCode: c.code,
          name: c.name,
          tagline: (c as any).tagline ?? "",
          logo: c.logo_url ?? undefined,
        }))
      : [];

  return (
    <section className="container-page py-20">
      <SectionHeading
        center
        eyebrow="SVIT Group"
        title={`Our ${collegesLabel}`}
        subtitle="Four constituent institutes under one campus — each with its own identity, faculty, and programmes."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {rows.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.05}>
            <Link
              href={`/colleges/${c.id}`}
              className="card-lift group flex h-full items-start gap-5 rounded-2xl border border-border bg-white p-6"
            >
              <CollegeLogo
                shortCode={c.shortCode}
                src={c.logo}
                className="h-16 w-16 shrink-0 rounded-md border border-border bg-secondary/50 p-2 text-navy"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-widest text-crimson">{c.shortCode}</div>
                <h3 className="mt-1 font-display text-lg font-bold text-navy leading-tight">{c.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground italic line-clamp-2">{c.tagline}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-navy group-hover:text-gold">
                  Explore {c.shortCode} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function HomeCarouselSection({ items }: { items: HomepageItem[] }) {
  const slides = byType(items, "carousel_slide");
  const mapped: CarouselSlide[] | undefined =
    slides.length > 0
      ? slides.map((s) => ({
          image: s.image_url ?? "",
          eyebrow: s.eyebrow ?? "",
          title: s.title,
          subtitle: s.subtitle ?? "",
          cta: { label: s.link_label ?? "Learn More", to: s.link_href ?? "#" },
        }))
      : undefined;
  return <HomeCarousel slides={mapped} />;
}

function WhySection({ items }: { items: HomepageItem[] }) {
  const cards = byType(items, "why_choose");
  const rows = cards.map((c) => ({ title: c.title, desc: c.body ?? "", icon: c.icon_name ?? "BadgeCheck" }));
  return (
    <section className="bg-secondary/50 py-20">
      <div className="container-page">
        <SectionHeading
          center
          eyebrow="Why SVIT"
          title="A Place to Grow, Not Just Study"
          subtitle="What sets SVIT Vasad apart — from faculty and infrastructure to research culture and industry linkages."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((w, i) => {
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

function TrustBand({ items }: { items: HomepageItem[] }) {
  const badges = byType(items, "trust_badge");
  const seen = new Set<string>();
  const uniqueBadges = badges.filter((b) => {
    if (seen.has(b.title)) return false;
    seen.add(b.title);
    return true;
  });
  return (
    <section className="container-page py-14">
      <div className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-white p-8 md:grid-cols-4">
        {uniqueBadges.map((b) => (
          <div key={b.id} className="flex items-center justify-center gap-2 text-navy">
            <BadgeCheck className="h-5 w-5 text-gold" />
            <span className="text-sm font-semibold uppercase tracking-wider">{b.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTABannerSection({ items, misc }: { items: HomepageItem[]; misc: MiscSettings | null }) {
  const promo = promoBySlot(items, "home_cta_banner") ?? null;
  return (
    <CTABanner
      misc={misc}
      eyebrow={promo?.eyebrow ?? undefined}
      title={promo?.title ?? undefined}
      subtitle={promo?.subtitle ?? promo?.body ?? undefined}
      primaryActionLabel={promo?.link_label ?? undefined}
      primaryActionTo={promo?.link_href ?? undefined}
      secondaryActionLabel={promo?.secondary_link_label ?? undefined}
      secondaryActionTo={promo?.secondary_link_href ?? undefined}
    />
  );
}

function EventsAndEnquiry({ events, recruiters }: { events: EventRow[]; recruiters: RecruiterRow[] }) {
  const slides: EventSlide[] = (events ?? []).map((e) => ({
    id: e.id,
    slug: e.slug ?? null,
    title: e.title,
    tag: e.tag ?? "News",
    date: e.start_date
      ? new Date(e.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "",
    imageUrl: e.featured_image_url ?? null,
  }));

  const recruiterNames = (recruiters ?? []).map((r) => r.company_name);

  return (
    <section className="container-page py-20">
      <SectionHeading center eyebrow="Latest" title="Events & News" variant="eyebrow" />
      <div className="mt-10">
        <EventsNewsSlider items={slides} />
      </div>
      <Reveal className="mt-14">
        <div className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">Our Recruiters</div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {recruiterNames.map((r) => (
            <span key={r} className="font-display text-lg font-bold text-navy/50 hover:text-navy transition-colors">{r}</span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
