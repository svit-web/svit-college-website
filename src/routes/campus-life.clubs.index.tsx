import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { PillTabs } from "@/components/site/PillTabs";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getAllStudentClubs } from "@/lib/clubs.functions";

export const Route = createFileRoute("/campus-life/clubs/")({
  head: () => ({
    meta: [
      { title: "Student Clubs — SVIT Vasad" },
      { name: "description", content: "Student clubs and communities at SVIT Vasad." },
    ],
  }),
  loader: async () => {
    const clubs = await getAllStudentClubs();
    return { clubs };
  },
  component: ClubsIndex,
});

function ClubsIndex() {
  const { clubs } = Route.useLoaderData();

  return (
    <div>
      <PillTabs
        ariaLabel="Clubs"
        items={clubs.map((c) => ({ label: c.name, to: `/campus-life/clubs/${c.slug}` }))}
      />
      <SectionHeading eyebrow="Clubs" title="Find your tribe" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {clubs.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.03}>
            <Link
              to="/campus-life/clubs/$slug"
              params={{ slug: c.slug }}
              className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white p-5 hover:border-gold"
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-crimson">
                {c.metadata.accent || "Club"}
              </div>
              <h4 className="mt-1 font-display font-bold text-navy">{c.name}</h4>
              {c.departmentName && (
                <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-navy/60">
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{c.departmentName}</span>
                </div>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                {c.metadata.subtitle || c.description}
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
