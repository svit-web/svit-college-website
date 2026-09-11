import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { PillTabs } from "@/components/site-next/PillTabs";
import { Reveal } from "@/components/site-next/Reveal";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { getAllStudentClubs } from "@/lib/clubs.functions";
import { getVisibleCenters } from "@/lib/centers.functions";

export const metadata: Metadata = {
  title: "Student Groups — Campus Life — SVIT Vasad",
  description: "Student clubs, societies and centres at SVIT Vasad.",
};

export default async function StudentGroupsIndex() {
  const [clubs, centers] = await Promise.all([
    getAllStudentClubs().catch(() => []),
    getVisibleCenters().catch(() => []),
  ]);

  return (
    <div className="space-y-12">
      <section>
        <PillTabs
          ariaLabel="Clubs"
          items={clubs.map((c) => ({ label: c.name, to: `/campus-life/clubs/${c.slug}` }))}
        />
        <SectionHeading eyebrow="Clubs" title="Find your tribe" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.03}>
              <Link
                href={`/campus-life/clubs/${c.slug}`}
                className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white p-5 hover:border-gold"
              >
                <div className="text-xs font-bold uppercase tracking-widest text-crimson">
                  {c.accent_color || "Club"}
                </div>
                <h4 className="mt-1 font-display font-bold text-navy">{c.name}</h4>
                {c.departmentName && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-navy/60">
                    <Building2 className="h-3 w-3 shrink-0" />
                    <span className="truncate">{c.departmentName}</span>
                  </div>
                )}
                <p className="mt-2 text-sm text-muted-foreground">
                  {c.subtitle || c.description}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section>
        <PillTabs
          ariaLabel="Centres"
          items={centers.map((c) => ({ label: c.name.split("(")[0].trim(), to: `/student-corner/${c.slug}` }))}
        />
        <SectionHeading eyebrow="Societies" title="Where students grow beyond the syllabus" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {centers.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.03}>
              <Link
                href={`/student-corner/${c.slug}`}
                className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white p-5 hover:border-gold"
              >
                <div className="text-xs font-bold uppercase tracking-widest text-crimson">
                  {c.accent_color || "Centre"}
                </div>
                <h4 className="mt-1 font-display font-bold text-navy">{c.name}</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  {c.subtitle || ""}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
