import type { Metadata } from "next";
import { PageHero } from "@/components/site-next/PageHero";
import { CampusLifeNav } from "@/components/site-next/CampusLifeNav";

export const metadata: Metadata = {
  title: "Campus Life — SVIT Vasad",
  description: "Facilities, clubs and events that make SVIT more than a college.",
};

export default function CampusLifeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PageHero
        flushBottom
        title="Campus Life"
        accent="Beyond the Classroom"
        subtitle="Facilities, clubs and events that make SVIT more than a college."
        crumbs={[{ label: "Home", to: "/" }, { label: "Campus Life" }]}
      />

      {/* Sticky until the content ends, so the tabs scroll off before the
          footer; mobile navbar is fixed (h-16), the desktop one scrolls away.
          container-nav-aligned(-inner) lines this up with the navbar, same
          as PageHero. */}
      <div className="sticky top-16 z-30 border-b border-line bg-paper lg:top-0">
        <div className="container-nav-aligned py-3">
          <div className="container-nav-aligned-inner">
            <CampusLifeNav />
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
