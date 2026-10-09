import type { Metadata } from "next";
import { PageHero } from "@/components/site-next/PageHero";
import { getAboutPage } from "@/lib/pages.functions";
import { getMiscSettings } from "@/lib/site-settings.functions";
import { getMainNavigation } from "@/lib/menus.functions";
import { AboutNav } from "./AboutNav";

export const metadata: Metadata = {
  title: "About SVIT Vasad — Legacy, Vision, Leadership & Campus",
  description:
    "Established 1997 by NEST — SVIT Vasad's story, history, vision, leadership, accreditation, committees and campus facilities.",
};

export default async function AboutLayout({ children }: { children: React.ReactNode }) {
  const [aboutPage, misc, mainNav] = await Promise.all([
    getAboutPage().catch(() => null),
    getMiscSettings().catch(() => null),
    getMainNavigation().catch(() => []),
  ]);
  const c = aboutPage;
  const aboutLinks =
    mainNav.find((item) => item.menu_type === "links_mega" && item.title === "About SVIT")
      ?.children ?? [];

  return (
    <div>
      <PageHero
        flushBottom
        title={c?.hero?.title ?? "About SVIT"}
        accent={c?.hero?.accent}
        subtitle={c?.hero?.introText}
        crumbs={[{ label: "Home", to: "/" }, { label: "About" }]}
      >
        <span className="rounded-full border border-line-strong px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
          Est. {misc?.year_established}
        </span>
        <span className="rounded-full border border-line-strong px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
          AICTE Approved
        </span>
        <span className="rounded-full border border-line-strong px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
          NBA Accredited
        </span>
        <span className="rounded-full border border-line-strong px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
          GTU Affiliated
        </span>
      </PageHero>

      {/* Sticky until the content ends, so the tabs scroll off before the
          footer; mobile navbar is fixed (h-16), the desktop one scrolls away.
          container-nav-aligned(-inner) lines this up with the navbar, same
          as PageHero. */}
      <div className="sticky top-16 z-30 border-b border-line bg-paper lg:top-0">
        <div className="container-nav-aligned py-3">
          <div className="container-nav-aligned-inner">
            <AboutNav items={aboutLinks} />
          </div>
        </div>
      </div>

      <div className="bg-paper">
        <div className="container-nav-aligned py-10">
          <div className="container-nav-aligned-inner">
            <div className="mx-auto max-w-[1060px]">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

