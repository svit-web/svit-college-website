import type { Metadata } from "next";
import { HeroPhotoLayer } from "@/components/site-next/HeroPhotoLayer";
import { getAboutPage } from "@/lib/pages.functions";
import { getHeroAppearance } from "@/lib/theme.functions";
import { DEFAULT_HERO_APPEARANCE } from "@/lib/theme";
import { getMiscSettings } from "@/lib/site-settings.functions";
import { AboutNav } from "./AboutNav";

export const metadata: Metadata = {
  title: "About SVIT Vasad — Legacy, Vision, Leadership & Campus",
  description:
    "Established 1997 by NEST — SVIT Vasad's story, history, vision, leadership, accreditation, committees and campus facilities.",
  openGraph: {
    title: "About SVIT Vasad",
    description: "Legacy, vision, mission and campus of SVIT Vasad.",
  },
};

export default async function AboutLayout({ children }: { children: React.ReactNode }) {
  const [aboutPage, appearance, misc] = await Promise.all([
    getAboutPage().catch(() => null),
    getHeroAppearance().catch(() => DEFAULT_HERO_APPEARANCE),
    getMiscSettings().catch(() => null),
  ]);
  const resolvedAppearance = appearance ?? DEFAULT_HERO_APPEARANCE;
  const c = aboutPage;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-deep text-white">
        <HeroPhotoLayer
          photos={resolvedAppearance.aboutPhoto ? [resolvedAppearance.aboutPhoto] : []}
          appearance={resolvedAppearance}
        />
        <div className="container-page relative py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              {c?.hero?.accent}
            </div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {c?.hero?.title}
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/80 leading-relaxed">
              {c?.hero?.introText}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wider text-white/70">
              <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">
                Est. {misc?.year_established}
              </span>
              <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">
                AICTE Approved
              </span>
              <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">
                NBA Accredited
              </span>
              <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">
                GTU Affiliated
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Vertical sidebar + content */}
      <div className="bg-secondary/30">
        <div className="container-page py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <AboutNav />
            </aside>

            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}

