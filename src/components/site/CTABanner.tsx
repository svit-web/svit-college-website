import { Link } from "@tanstack/react-router";
import { ArrowRight, Download } from "lucide-react";
import { Reveal } from "./Reveal";

interface CTABannerProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryActionLabel?: string;
  primaryActionTo?: string;
  secondaryActionLabel?: string;
  secondaryActionTo?: string;
}

export function CTABanner({
  eyebrow = "Admissions Open 2026-27",
  title = "Ready to Shape Your Engineering & Architectural Career?",
  subtitle = "Join SVIT Vasad and gain access to top industry mentorship, hands-on training, and 200+ active recruiting partners.",
  primaryActionLabel = "Apply Now",
  primaryActionTo = "/admissions/inquiry",
  secondaryActionLabel = "Download Brochure",
  secondaryActionTo = "/downloads",
}: CTABannerProps) {
  return (
    <section className="relative overflow-hidden bg-navy py-16 md:py-24 text-white">
      {/* Radial and blur orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklab,var(--gold)_15%,transparent),transparent_50%),radial-gradient(circle_at_80%_80%,color-mix(in_oklab,var(--crimson)_20%,transparent),transparent_55%)]" />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-crimson/20 blur-3xl" />

      <div className="container-page relative z-10 text-center">
        <Reveal center>
          {eyebrow && (
            <span className="inline-block rounded-full bg-gold/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-gold border border-gold/30 mb-4">
              {eyebrow}
            </span>
          )}
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white max-w-3xl mx-auto leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
              {subtitle}
            </p>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to={primaryActionTo}
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-extrabold text-navy hover:bg-gold/90 transition-all shadow-lg hover:shadow-gold/20"
            >
              <span>{primaryActionLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to={secondaryActionTo}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/5 px-6 py-3.5 text-sm font-extrabold text-white hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-xs"
            >
              <Download className="h-4 w-4 text-gold" />
              <span>{secondaryActionLabel}</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
