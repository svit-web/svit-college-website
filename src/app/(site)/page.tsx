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
import { CTABanner } from "@/components/site-next/CTABanner";
import { Reveal } from "@/components/site-next/Reveal";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { CollegeLogo } from "@/components/site-next/CollegeLogo";
import { NewsEventsSection } from "@/components/site-next/NewsEventsSection";
import { RecruitersMarquee } from "@/components/site-next/RecruitersMarquee";
import { HeroPhotoLayer } from "@/components/site-next/HeroPhotoLayer";
import { HeroNew } from "@/components/site-next/HeroNew";
import {
  byType,
  promoBySlot,
  type HomepageItem,
  type CollegeRow,
  type RecruiterRow,
  type EventRow,
  type PostRow,
} from "@/lib/homepage";
import {
  getGlobalHomepageItems,
  getCollegesGrid,
  getRecruiterLogos,
  getLatestEvents,
} from "@/lib/homepage.functions";
import { getFeaturedPosts } from "@/lib/posts.functions";
import { getHeroAppearance, DEFAULT_HERO_APPEARANCE, HOMEPAGE_ROTATE_MS, heroTextVars, type HeroAppearance } from "@/lib/theme.functions";
import { getMiscSettings, type MiscSettings } from "@/lib/site-settings.functions";
import { getLiveStats, type LiveStats } from "@/lib/stats.functions";
import { getHomePopup } from "@/lib/home-popup.functions";
import { HomePopup } from "@/components/site-next/HomePopup";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BadgeCheck, GraduationCap, Briefcase, Building2, Users, Lightbulb, Award, Trees, ShieldCheck,
};

export default async function Home() {
  const [items, colleges, recruiters, events, posts, appearance, misc, liveStats, popup] = await Promise.all([
    getGlobalHomepageItems().catch(() => []),
    getCollegesGrid().catch(() => []),
    getRecruiterLogos().catch(() => []),
    getLatestEvents().catch(() => []),
    getFeaturedPosts().catch(() => []),
    getHeroAppearance().catch(() => DEFAULT_HERO_APPEARANCE),
    getMiscSettings().catch(() => null),
    getLiveStats().catch(() => null),
    getHomePopup().catch(() => null),
  ]);

  return (
    <>
      <HeroNew items={items} misc={misc} appearance={appearance} />
      <CollegesSection colleges={colleges} misc={misc} />
      <HomeCarouselSection items={items} />
      <StatsStrip items={items} liveStats={liveStats} />
      <CampusLifeSection items={items} />
      <WhySection items={items} />
      <TrustBand items={items} />
      <EventsAndEnquiry events={events} posts={posts} recruiters={recruiters} />
      <CTABannerSection items={items} misc={misc} />
      {popup && <HomePopup popup={popup} />}
    </>
  );
}

function StatsStrip({ items, liveStats }: { items: HomepageItem[]; liveStats: LiveStats | null }) {
  const curated = byType(items, "stat");
  const find = (subtitle: string) => curated.find((s) => s.subtitle === subtitle);

  const stats = [
    liveStats && { id: "live-years", title: `${liveStats.yearsOfExcellence}`, subtitle: "Years of Excellence" },
    find("Students"),
    find("Acre Green Campus"),
    find("Placement Record"),
    liveStats && { id: "live-recruiters", title: `${liveStats.recruitersCount}+`, subtitle: "Recruiting Partners" },
    liveStats && { id: "live-placed", title: `${liveStats.placedStudentsCount}+`, subtitle: "Students Placed" },
    find("Alumni"),
    liveStats && { id: "live-faculty", title: `${liveStats.facultyCount}+`, subtitle: "Faculty" },
    liveStats && { id: "live-programmes", title: `${liveStats.programmesCount}`, subtitle: "Programmes" },
  ].filter((s): s is { id: string; title: string; subtitle: string } => Boolean(s));

  return (
    <section className="bg-navy text-white">
      <div className="container-page grid grid-cols-2 gap-6 py-10 sm:grid-cols-3 lg:grid-cols-5">
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

// Column count follows the number of colleges so rows fill evenly (5 → 3+2,
// 6 → 3+3, 7+ → 4 per row); partial last rows are centered by the flex wrap.
// Full class strings, not interpolated, so Tailwind can see them.
function collegeCardWidth(count: number): string {
  const base = "w-full";
  if (count <= 1) return base;
  if (count === 2) return `${base} sm:w-[calc((100%-1.25rem)/2)]`;
  if (count === 3) return `${base} sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]`;
  if (count === 4) return `${base} sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]`;
  if (count <= 6) return `${base} sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]`;
  return `${base} sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]`;
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
      <div className="mt-12 flex flex-wrap justify-center gap-5">
        {rows.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.05} className={collegeCardWidth(rows.length)}>
            <Link
              href={`/colleges/${c.id}`}
              className="card-lift group flex h-full flex-col items-center gap-4 rounded-2xl border border-border bg-white p-6 text-center"
            >
              <CollegeLogo
                shortCode={c.shortCode}
                src={c.logo}
                className="h-24 w-24 shrink-0 rounded-md border border-border bg-secondary/50 p-2 text-navy"
              />
              <div className="flex w-full min-w-0 flex-1 flex-col items-center">
                <div className="text-xs font-bold uppercase tracking-widest text-crimson">{c.shortCode}</div>
                <h3 className="mt-1 font-display text-lg font-bold text-navy leading-tight">{c.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground italic">{c.tagline}</p>
                <div className="mt-auto flex items-center justify-center gap-1 pt-4 text-xs font-semibold text-navy group-hover:text-gold">
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

// Hand-placed span/pattern pairing ported verbatim from the reference mosaic
// (1.html #campus), position-indexed since the tile count is fixed at 11 with
// no add/delete in the admin panel.
const TILE_LAYOUT: { span: string; pattern: keyof typeof TILE_PATTERNS }[] = [
  { span: "lg:col-span-3", pattern: "lines" },
  { span: "lg:col-span-3", pattern: "dots" },
  { span: "lg:col-span-3", pattern: "grid" },
  { span: "lg:col-span-3", pattern: "arc" },
  { span: "lg:col-span-4", pattern: "diag" },
  { span: "lg:col-span-4", pattern: "dots" },
  { span: "lg:col-span-4", pattern: "lines" },
  { span: "lg:col-span-3", pattern: "arc" },
  { span: "lg:col-span-3", pattern: "grid" },
  { span: "lg:col-span-3", pattern: "diag" },
  { span: "lg:col-span-3", pattern: "dots" },
];

// rgba(43,47,94,*) = the site's --navy at the reference's exact color-mix opacities.
const TILE_PATTERNS: Record<string, React.CSSProperties> = {
  lines: {
    backgroundImage:
      "repeating-linear-gradient(45deg, rgba(43,47,94,0.13) 0px, rgba(43,47,94,0.13) 1px, transparent 1px, transparent 11px)",
  },
  dots: {
    backgroundImage: "radial-gradient(rgba(43,47,94,0.22) 1.1px, transparent 1.6px)",
    backgroundSize: "15px 15px",
  },
  grid: {
    backgroundImage:
      "linear-gradient(rgba(43,47,94,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(43,47,94,0.10) 1px, transparent 1px)",
    backgroundSize: "26px 26px",
  },
  arc: {
    backgroundImage:
      "radial-gradient(circle at 50% 120%, transparent 54%, rgba(43,47,94,0.16) 55%, transparent 56.5%)",
    backgroundSize: "120px 120px",
  },
  diag: {
    backgroundImage:
      "repeating-linear-gradient(-45deg, rgba(43,47,94,0.13) 0px, rgba(43,47,94,0.13) 1px, transparent 1px, transparent 11px)",
  },
};

function CampusLifeSection({ items }: { items: HomepageItem[] }) {
  const tiles = byType(items, "campus_life_tile");
  if (tiles.length === 0) return null;

  return (
    <section className="bg-white py-[clamp(84px,11vw,144px)]">
      <div className="container-page">
        <Reveal>
          <h2 className="mb-[clamp(40px,5vw,64px)] max-w-[16em] font-display text-[clamp(2rem,4.2vw,3.3rem)] font-medium leading-[1.12] tracking-[-0.01em] text-navy">
            Life beyond the classroom<span className="text-crimson">.</span>
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-12">
          {tiles.map((tile, i) => {
            const layout = TILE_LAYOUT[i % TILE_LAYOUT.length];
            const pattern = TILE_PATTERNS[layout.pattern];
            const card = (
              <div className="group relative flex min-h-[172px] flex-col overflow-hidden border border-border bg-white p-[20px_22px] transition-[background-color,border-color] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-navy hover:bg-navy">
                <div
                  className="pointer-events-none absolute inset-0 transition-opacity duration-300 group-hover:opacity-0"
                  style={pattern}
                />
                <span className="relative text-[9.5px] font-bold uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-300 group-hover:text-gold">
                  {tile.eyebrow}
                </span>
                <span className="relative mt-auto pt-5 font-display text-[clamp(1.15rem,1.6vw,1.45rem)] font-medium leading-[1.2] text-navy transition-colors duration-300 group-hover:text-[#fbf8f1]">
                  {tile.title}
                </span>
                <span className="pointer-events-none absolute bottom-[16px] right-[18px] -translate-x-2 translate-y-2 text-base text-gold opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100">
                  →
                </span>
              </div>
            );
            return (
              <Reveal key={tile.id} delay={i * 0.03} className={layout.span}>
                {tile.link_href ? (
                  <Link href={tile.link_href} className="block h-full">
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
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

function EventsAndEnquiry({ events, posts, recruiters }: { events: EventRow[]; posts: PostRow[]; recruiters: RecruiterRow[] }) {
  return (
    <>
      <NewsEventsSection events={events} posts={posts} />
      <section className="container-page pb-20">
        <Reveal>
          <div className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Our Recruiters
          </div>
          <RecruitersMarquee recruiters={recruiters} />
        </Reveal>
      </section>
    </>
  );
}
