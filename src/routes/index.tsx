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
import { courses, events as staticEvents, recruiters as staticRecruiters, stats as staticStats, whyChoose as staticWhy } from "@/data/site";
import { colleges as staticColleges } from "@/data/colleges";
import { heroHighlights, type HeroHighlight } from "@/data/heroHighlights";
import { CollegeLogo } from "@/components/site/CollegeLogo";
import {
  byType,
  collegesQuery,
  eventsQuery,
  homepageItemsQuery,
  promoBySlot,
  recruitersQuery,
  type HomepageItem,
} from "@/lib/homepage";
import { useState } from "react";
import { toast } from "sonner";
import { useSupabaseColleges, useSupabaseEvents, useSupabaseRecruiters, useSupabaseHomepageItems, useSubmitInquiry } from "@/hooks/useSupabaseData";
import campusHero from "@/assets/campus-hero.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BadgeCheck, GraduationCap, Briefcase, Building2, Users, Lightbulb, Award, Trees, ShieldCheck,
};

function useHomepageItems(): HomepageItem[] {
  const { data } = useSupabaseHomepageItems();
  return (data as any) ?? [];
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

  const chips =
    quickLinks.length > 0
      ? quickLinks.map((q) => ({ label: q.title, href: q.link_href ?? "#" }))
      : courses.slice(0, 7).map((c) => ({ label: c.name, href: `/courses/${c.slug}` }));

  const highlights: HeroHighlight[] =
    highlightCards.length > 0
      ? highlightCards.map((h) => ({
          id: h.id,
          image: h.image_url ?? "",
          eyebrow: h.eyebrow ?? undefined,
          title: h.title,
          subtitle: h.subtitle ?? undefined,
        }))
      : heroHighlights;

  return (
    <section className="relative overflow-hidden bg-navy-deep text-white">
      <img src={hero?.image_url || campusHero} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/70 via-navy-deep/85 to-navy" />
      <div className="container-page relative py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <motion.div suppressHydrationWarning initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
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
            suppressHydrationWarning
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
  const rows =
    stats.length > 0
      ? stats.map((s) => ({ value: s.title, label: s.subtitle ?? "" }))
      : staticStats;
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
  const { data } = useSupabaseColleges();
  const rows =
    data && data.length > 0
      ? data.map((c) => ({
          id: c.id,
          shortCode: c.shortCode,
          name: c.name,
          tagline: c.tagline,
          logo: c.logo,
        }))
      : staticColleges;

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
  const rows =
    cards.length > 0
      ? cards.map((c) => ({ title: c.title, desc: c.body ?? "", icon: c.icon_name ?? "BadgeCheck" }))
      : staticWhy;
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
  const labels =
    badges.length > 0
      ? badges.map((b) => b.title)
      : ["AICTE Approved", "NAAC Accredited", "5000+ Students", "15+ Acre Campus"];
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
  const items = useHomepageItems();
  const { data: eventsData } = useSupabaseEvents();
  const { data: recruitersData } = useSupabaseRecruiters();

  const eventRows =
    eventsData && eventsData.length > 0
      ? eventsData.map((e: any) => ({
          title: e.title,
          tag: e.tag ?? "News",
          date: e.start_date
            ? new Date(e.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            : "",
        }))
      : staticEvents.map((e) => ({ title: e.title, tag: e.tag, date: e.date }));

  const recruiterNames =
    recruitersData && recruitersData.length > 0
      ? recruitersData.map((r: any) => r.company_name || r.name || String(r))
      : staticRecruiters;

  const admissions = promoBySlot(items, "home_admissions");

  return (
    <section className="container-page py-20">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SectionHeading eyebrow="Latest" title="Events & News" variant="eyebrow" />
          <ul className="mt-6 space-y-4">
            {eventRows.map((e) => (
              <li key={e.title} className="card-lift rounded-2xl border border-border bg-white p-5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-crimson">{e.tag}</div>
                <div className="mt-1 font-display text-base font-bold text-navy">{e.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{e.date}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-1 rounded-2xl bg-gradient-to-br from-navy to-navy-light p-8 text-white">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">
            {admissions?.eyebrow ?? "Admissions Open"}
          </div>
          <h3 className="font-display text-2xl font-bold">{admissions?.title ?? "Your future starts here"}</h3>
          <p className="mt-3 text-sm text-white/80">
            {admissions?.body ??
              "Join 5000+ students building careers with SVIT. Merit-based scholarships, hostel accommodation, and dedicated placement support."}
          </p>
          <Link
            to={admissions?.link_href ?? "/admissions"}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-navy-deep hover:bg-gold-soft"
          >
            {admissions?.link_label ?? "View Admissions"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <EnquiryForm />
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

function EnquiryForm() {
  const [sent, setSent] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [programme, setProgramme] = useState("Interested Programme");
  const submitInquiry = useSubmitInquiry();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitInquiry.mutate({
      form_name: "Homepage Quick Enquiry",
      submitted_data: { fullName, email, mobile, programme },
    });
    setSent(true);
    toast.success("Enquiry submitted — we'll be in touch shortly.");
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-white p-6">
      <div className="text-xs font-semibold uppercase tracking-widest text-crimson">Quick Enquiry</div>
      <h3 className="mt-1 font-display text-xl font-bold text-navy">Talk to us</h3>
      {sent ? (
        <div className="mt-6 rounded-md bg-secondary p-5 text-sm">Thank you! We'll respond within 24 hours.</div>
      ) : (
        <div className="mt-4 space-y-3">
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            required
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Mobile"
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <select
            value={programme}
            onChange={(e) => setProgramme(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
          >
            <option>Interested Programme</option>
            {courses.map((c) => (
              <option key={c.slug}>{c.name}</option>
            ))}
          </select>
          <button className="w-full rounded-md bg-navy px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-navy-light transition-colors">
            Submit Enquiry
          </button>
        </div>
      )}
    </form>
  );
}
