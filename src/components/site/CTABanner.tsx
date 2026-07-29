import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Download, ImageIcon } from "lucide-react";
import { Reveal } from "./Reveal";

interface Promo {
  eyebrow?: string | null;
  title?: string | null;
  body?: string | null;
  link_label?: string | null;
  link_href?: string | null;
  secondary_link_label?: string | null;
  secondary_link_href?: string | null;
  image_url?: string | null;
  metadata?: unknown;
}

interface Props {
  promo?: Promo | null;
}

const defaultBullets = [
  "7 undergraduate & postgraduate streams",
  "Merit & need-based scholarships",
  "Hostel accommodation available",
  "95% placement track record",
];

export function CTABanner({ promo }: Props = {}) {
  const eyebrow = promo?.eyebrow ?? "Admissions Open 2026-27";
  const title = promo?.title ?? "Begin your journey at SVIT Vasad";
  const body =
    promo?.body ??
    "Join 5000+ students shaping careers in engineering, management and applied sciences. Applications now open across all programmes.";
  const primaryLabel = promo?.link_label ?? "Apply Now";
  const primaryHref = promo?.link_href ?? "/admissions/inquiry";
  const secondaryLabel = promo?.secondary_link_label ?? "Download Brochure";
  const secondaryHref = promo?.secondary_link_href ?? "/downloads";
  const imageUrl = promo?.image_url;
  const meta = promo?.metadata as Record<string, unknown> | null | undefined;
  const bullets: string[] = Array.isArray(meta?.bullets) ? meta.bullets : defaultBullets;

  return (
    <section className="container-page py-16 md:py-20">
      <Reveal>
        <motion.div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-deep via-navy to-navy-light p-8 md:p-14 text-white">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gold/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-crimson/25 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <div className="mb-3 inline-block rounded-full bg-gold/15 border border-gold/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
                {eyebrow}
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                {title}
              </h3>
              <p className="mt-3 text-white/80 max-w-lg">{body}</p>
              <ul className="mt-4 grid gap-2 text-sm text-white/85 sm:grid-cols-2">
                {bullets.map((b) => (
                  <li key={b}>&bull; {b}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={primaryHref}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-navy-deep hover:bg-gold-soft transition-colors"
                >
                  {primaryLabel} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to={secondaryHref}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/25 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  <Download className="h-4 w-4" /> {secondaryLabel}
                </Link>
              </div>
            </div>

            <div className="mx-auto w-full max-w-sm lg:mx-0 lg:ml-auto">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border-2 border-gold/40 bg-white/5 shadow-2xl">
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/40">
                    <ImageIcon className="h-14 w-14" />
                    <span className="text-xs font-semibold uppercase tracking-[0.25em]">
                      Hero Photo
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
              </div>
            </div>
          </div>
        </motion.div>
      </Reveal>
    </section>
  );
}
