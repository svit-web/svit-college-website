import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Award, BadgeCheck, Briefcase, Building2, GraduationCap, Lightbulb, Trees, Users } from "lucide-react";
import { HomeCarousel } from "@/components/site/Carousel";
import { CTABanner } from "@/components/site/CTABanner";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { courses, events, recruiters, stats, whyChoose } from "@/data/site";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import campusHero from "@/assets/campus-hero.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BadgeCheck, GraduationCap, Briefcase, Building2, Users, Lightbulb, Award, Trees,
};

function Home() {
  return (
    <>
      <Hero />
      <HomeCarousel />
      <StatsStrip />
      <CollegesSection />
      <WhySection />
      <TrustBand />
      <EventsAndEnquiry />
      <CTABanner />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-deep text-white">
      <img src={campusHero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/70 via-navy-deep/85 to-navy" />
      <div className="container-page relative py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="mb-4 inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Est. 2005 · Vasad, Gujarat
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.02]">
            Build Your Future. <br />
            <span className="text-gold">Shape The World.</span>
          </h1>
          <p className="mt-6 text-lg text-white/85 max-w-2xl">
            SVIT Vasad is a premier institute offering AICTE-approved programmes in engineering, management and applied sciences with 95%+ placement across 200+ recruiting partners.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {courses.slice(0, 7).map((c) => (
              <Link
                key={c.slug}
                to="/courses/$course"
                params={{ course: c.slug }}
                className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-white/85 hover:border-gold hover:text-gold transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/admissions/inquiry"
              className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-navy-deep hover:bg-gold-soft transition-colors"
            >
              Apply Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-md border border-white/25 px-6 py-3.5 text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Explore Courses
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatsStrip() {
  return (
    <section className="bg-navy text-white">
      <div className="container-page grid grid-cols-2 gap-6 py-10 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-display text-3xl md:text-4xl font-bold text-gold">{s.value}</div>
            <div className="mt-1 text-[11px] uppercase tracking-widest text-white/70">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CoursesSection() {
  return (
    <section className="container-page py-20">
      <SectionHeading
        center
        eyebrow="What We Offer"
        title="Programmes Designed for Impact"
        subtitle="Seven undergraduate and postgraduate streams — each built with rigour, mentorship, and industry alignment."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.05}>
            <Link
              to="/courses/$course"
              params={{ course: c.slug }}
              className="card-lift group flex h-full flex-col rounded-2xl border border-border bg-white p-6"
            >
              <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-md text-white font-display font-bold", c.color)}>
                {c.short}
              </div>
              <h3 className="font-display text-xl font-bold text-navy">{c.name}</h3>
              <div className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-crimson">{c.tagline}</div>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{c.description}</p>
              <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-navy group-hover:text-gold">
                Learn more <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function WhySection() {
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
          {whyChoose.map((w, i) => {
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
  const items = ["AICTE Approved", "NAAC Accredited", "5000+ Students", "15+ Acre Campus"];
  return (
    <section className="container-page py-14">
      <div className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-white p-8 md:grid-cols-4">
        {items.map((i) => (
          <div key={i} className="flex items-center justify-center gap-2 text-navy">
            <BadgeCheck className="h-5 w-5 text-gold" />
            <span className="text-sm font-semibold uppercase tracking-wider">{i}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function EventsAndEnquiry() {
  return (
    <section className="container-page py-20">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SectionHeading eyebrow="Latest" title="Events & News" variant="eyebrow" />
          <ul className="mt-6 space-y-4">
            {events.map((e) => (
              <li key={e.title} className="card-lift rounded-2xl border border-border bg-white p-5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-crimson">{e.tag}</div>
                <div className="mt-1 font-display text-base font-bold text-navy">{e.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{e.date}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-1 rounded-2xl bg-gradient-to-br from-navy to-navy-light p-8 text-white">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">Admissions Open</div>
          <h3 className="font-display text-2xl font-bold">Your future starts here</h3>
          <p className="mt-3 text-sm text-white/80">Join 5000+ students building careers with SVIT. Merit-based scholarships, hostel accommodation, and dedicated placement support.</p>
          <Link to="/admissions" className="mt-6 inline-flex items-center gap-2 rounded-md bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-navy-deep hover:bg-gold-soft">
            View Admissions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <EnquiryForm />
      </div>
      <Reveal className="mt-14">
        <div className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">Our Recruiters</div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {recruiters.map((r) => (
            <span key={r} className="font-display text-lg font-bold text-navy/50 hover:text-navy transition-colors">{r}</span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function EnquiryForm() {
  const [sent, setSent] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
        toast.success("Enquiry submitted — we'll be in touch shortly.");
      }}
      className="rounded-2xl border border-border bg-white p-6"
    >
      <div className="text-xs font-semibold uppercase tracking-widest text-crimson">Quick Enquiry</div>
      <h3 className="mt-1 font-display text-xl font-bold text-navy">Talk to us</h3>
      {sent ? (
        <div className="mt-6 rounded-md bg-secondary p-5 text-sm">Thank you! We'll respond within 24 hours.</div>
      ) : (
        <div className="mt-4 space-y-3">
          <input required placeholder="Full Name" className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <input required type="email" placeholder="Email" className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <input required placeholder="Mobile" className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <select className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm">
            <option>Interested Programme</option>
            {courses.map((c) => <option key={c.slug}>{c.name}</option>)}
          </select>
          <button className="w-full rounded-md bg-navy px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-navy-light transition-colors">
            Submit Enquiry
          </button>
        </div>
      )}
    </form>
  );
}
