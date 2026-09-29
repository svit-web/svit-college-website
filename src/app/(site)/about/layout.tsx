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
  openGraph: {
    title: "About SVIT Vasad",
    description: "Legacy, vision, mission and campus of SVIT Vasad.",
  },
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
    <>
      <PageHero
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

      {/* Vertical sidebar + content */}
      <div className="bg-paper">
        <div className="container-page py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <AboutNav items={aboutLinks} />
            </aside>

            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}

