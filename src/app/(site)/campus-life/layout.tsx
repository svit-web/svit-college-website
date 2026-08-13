import type { Metadata } from "next";
import { PageHero } from "@/components/site-next/PageHero";
import { CampusLifeNav } from "@/components/site-next/CampusLifeNav";
import { getHeroAppearance } from "@/lib/theme.functions";
import { DEFAULT_HERO_APPEARANCE } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Campus Life — SVIT Vasad",
  description: "Facilities, clubs and events that make SVIT more than a college.",
};

export default async function CampusLifeLayout({ children }: { children: React.ReactNode }) {
  const appearance = await getHeroAppearance().catch(() => DEFAULT_HERO_APPEARANCE);

  return (
    <>
      <PageHero
        title="Campus Life"
        accent="Beyond the Classroom"
        subtitle="Facilities, clubs and events that make SVIT more than a college."
        crumbs={[{ label: "Home", to: "/" }, { label: "Campus Life" }]}
        backgroundImage={appearance.campusLifePhoto}
        appearance={appearance}
      />

      <div className="bg-secondary/30">
        <div className="container-page py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <CampusLifeNav />
            </aside>

            <div className="min-w-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
