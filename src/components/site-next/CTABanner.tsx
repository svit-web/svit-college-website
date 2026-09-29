import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { Reveal } from "./Reveal";
import { pillOutline, pillPrimary, sectionSpacing } from "./site-styles";
import type { MiscSettings } from "@/lib/site-settings.functions";
import { DEFAULT_MISC } from "@/lib/site-settings-types";

interface CTABannerProps {
  misc?: MiscSettings | null;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryActionLabel?: string;
  primaryActionTo?: string;
  secondaryActionLabel?: string;
  secondaryActionTo?: string;
}

export function CTABanner({
  misc,
  eyebrow,
  title = "Ready to Shape Your Engineering & Architectural Career?",
  subtitle,
  primaryActionLabel = DEFAULT_MISC.cta_button_label,
  primaryActionTo = "/admissions/inquiry",
  secondaryActionLabel = "Download Brochure",
  secondaryActionTo = "/downloads",
}: CTABannerProps) {
  const resolvedEyebrow = eyebrow ?? (misc?.admission_year ? `Admissions Open ${misc.admission_year}` : undefined);
  const resolvedSubtitle = subtitle ?? (misc?.recruiter_count ? `Join SVIT Vasad and gain access to top industry mentorship, hands-on training, and ${misc.recruiter_count}+ active recruiting partners.` : undefined);
  return (
    <section className={`border-t border-line bg-gold-soft ${sectionSpacing}`}>
      <div className="container-page text-center">
        <Reveal>
          {resolvedEyebrow && (
            <span className="mb-5 inline-block rounded-full border border-navy/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">
              {resolvedEyebrow}
            </span>
          )}
          <h2 className="mx-auto max-w-3xl font-display text-[clamp(2rem,4.2vw,3.3rem)] font-medium leading-[1.12] tracking-[-0.01em] text-navy">
            {title}
          </h2>
          {resolvedSubtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
              {resolvedSubtitle}
            </p>
          )}

          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link href={primaryActionTo} className={pillPrimary}>
              <span>{primaryActionLabel}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href={secondaryActionTo} className={pillOutline}>
              <Download className="h-4 w-4" />
              <span>{secondaryActionLabel}</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
