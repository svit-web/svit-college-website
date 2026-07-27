import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
import { HomeCarousel, type CarouselSlide } from "@/components/site/Carousel";
import { HeroCardSlider } from "@/components/site/HeroCardSlider";
import { CTABanner } from "@/components/site/CTABanner";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CollegeLogo } from "@/components/site/CollegeLogo";
import { EventsNewsSlider, type EventSlide } from "@/components/site/EventsNewsSlider";
import {
  byType,
  collegesQuery,
  eventsQuery,
  homepageItemsQuery,
  promoBySlot,
  recruitersQuery,
  type HomepageItem,
} from "@/lib/homepage";
import campusHero from "@/assets/campus-hero.jpg";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    // Prime caches in parallel; ignore failures so the page still renders with static fallback.
    void context.queryClient.prefetchQuery(homepageItemsQuery);
    void context.queryClient.prefetchQuery(collegesQuery);
    void context.queryClient.prefetchQuery(recruitersQuery);
    // Awaited (unlike the above): the events/news slider is the section's
    // main content, not a progressive-enhancement extra, so first paint
    // shouldn't race the fetch and show an empty state.
    await context.queryClient.ensureQueryData(eventsQuery).catch(() => null);
  },
  component: Home,
});

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BadgeCheck, GraduationCap, Briefcase, Building2, Users, Lightbulb, Award, Trees, ShieldCheck,
};

function useHomepageItems(): HomepageItem[] {
  const { data } = useQuery(homepageItemsQuery);
  return data ?? [];
}

function Home() {
  return (
    <>
      <Hero />
      <CollegesSection />
      <HomeCarouselSection />
      <StatsStrip />
      <WhySection />
      <TrustBand />
      <EventsAndEnquiry />
      <CTABannerSection />
    </>
  );
}

function Hero() {
  const items = useHomepageItems();
  const hero = byType(items, "hero")[0];
  const quickLinks = byType(items, "quick_link");
  const highlightCards = byType(items, "highlight_card");

  const eyebrow = hero?.eyebrow ?? "Est. 2005 · Vasad, Gujarat";
  const title = hero?.title ?? "Build Your Future.";
  const titleAccent = hero?.title_accent ?? "Shape The World.";
  const subtitle =
    hero?.subtitle ??
    "SVIT Vasad is a premier institute offering AICTE-approved programmes in engineering, management and applied sciences with 95%+ placement across 200+ recruiting partners.";
  const primaryLabel = hero?.link_label ?? "Apply Now";
  const primaryHref = hero?.link_href ?? "/admissions/inquiry";
  const secondaryLabel = hero?.secondary_link_label ?? "Explore Courses";
  const secondaryHref = hero?.secondary_link_href ?? "/courses";

  const chips = quickLinks.map((q) => ({ label: q.title, href: q.link_href ?? "#" }));

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
      <img src={hero?.image_url || campusHero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/70 via-navy-deep/85 to-navy" />
      <div className="container-page relative py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="mb-4 inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              {eyebrow}
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.02]">
              {title} <br />
              <span className="text-gold">{titleAccent}</span>
            </h1>
            <p className="mt-6 text-lg text-white/85 max-w-2xl">{subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              {chips.map((c) => (
                <a
                  key={c.label + c.href}
                  href={c.href}
                  className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-white/85 hover:border-gold hover:text-gold transition-colors"
                >
                  {c.label}
                </a>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={primaryHref}
                className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-navy-deep hover:bg-gold-soft transition-colors"
              >
                {primaryLabel} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={secondaryHref}
                className="inline-flex items-center gap-2 rounded-md border border-white/25 px-6 py-3.5 text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                {secondaryLabel}
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="w-full"
          >
            <HeroCardSlider items={highlights} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  const items = useHomepageItems();
  const stats = byType(items, "stat");
  const rows = stats.map((s) => ({ value: s.title, label: s.subtitle ?? "" }));
  return (
    <section className="bg-navy text-white">
      <div className="container-page grid grid-cols-2 gap-6 py-10 sm:grid-cols-3 lg:grid-cols-6">
        {rows.map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-display text-3xl md:text-4xl font-bold text-gold">{s.value}</div>
            <div className="mt-1 text-[11px] uppercase tracking-widest text-white/70">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CollegesSection() {
  const { data } = useQuery(collegesQuery);
  const rows =
    data && data.length > 0
      ? data.map((c) => ({
          id: c.slug,
          shortCode: (c as any).metadata?.shortCode ?? c.code,
          name: c.name,
          tagline: (c as any).metadata?.tagline ?? "",
          logo: c.logo_url ?? "",
        }))
      : [];

  return (
    <section className="container-page py-20">
      <SectionHeading
        center
        eyebrow="SVIT Group"
        title="Our Colleges"
        subtitle="Four constituent institutes under one campus — each with its own identity, faculty, and programmes."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {rows.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.05}>
            <Link
              to="/colleges/$college"
              params={{ college: c.id }}
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

function HomeCarouselSection() {
  const items = useHomepageItems();
  const slides = byType(items, "carousel_slide");
  const mapped: CarouselSlide[] | undefined =
    slides.length > 0
      ? slides.map((s) => ({
          image: s.image_url ?? campusHero,
          eyebrow: s.eyebrow ?? "",
          title: s.title,
          subtitle: s.subtitle ?? "",
          cta: { label: s.link_label ?? "Learn More", to: s.link_href ?? "#" },
        }))
      : undefined;
  return <HomeCarousel slides={mapped} />;
}

function WhySection() {
  const items = useHomepageItems();
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

function TrustBand() {
  const items = useHomepageItems();
  const badges = byType(items, "trust_badge");
  const labels = badges.map((b) => b.title);
  return (
    <section className="container-page py-14">
      <div className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-white p-8 md:grid-cols-4">
        {labels.map((i) => (
          <div key={i} className="flex items-center justify-center gap-2 text-navy">
            <BadgeCheck className="h-5 w-5 text-gold" />
            <span className="text-sm font-semibold uppercase tracking-wider">{i}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTABannerSection() {
  const items = useHomepageItems();
  const promo = promoBySlot(items, "home_cta_banner") ?? null;
  return <CTABanner promo={promo} />;
}

function EventsAndEnquiry() {
  const { data: eventsData } = useQuery(eventsQuery);
  const { data: recruitersData } = useQuery(recruitersQuery);

  const slides: EventSlide[] = (eventsData ?? []).map((e) => ({
    id: e.id,
    slug: e.slug ?? null,
    title: e.title,
    tag: e.tag ?? "News",
    date: e.start_date
      ? new Date(e.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "",
    imageUrl: e.featured_image_url ?? null,
  }));

  const recruiterNames = (recruitersData ?? []).map((r) => r.company_name);

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
