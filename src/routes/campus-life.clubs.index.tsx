import { createFileRoute, Link } from "@tanstack/react-router";
import { PillTabs } from "@/components/site/PillTabs";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { clubDetails as staticClubDetails } from "@/data/campus-rfe";
import { useSupabaseStudentClubs } from "@/hooks/useSupabaseData";

export const Route = createFileRoute("/campus-life/clubs/")({
  head: () => ({
    meta: [
      { title: "Student Clubs — SVIT Vasad" },
      { name: "description", content: "Student clubs and communities at SVIT Vasad." },
    ],
  }),
  component: ClubsIndex,
});

function ClubsIndex() {
  const { data: clubs } = useSupabaseStudentClubs();
  const list = clubs && clubs.length > 0 ? clubs : staticClubDetails;

  return (
    <div>
      <PillTabs
        ariaLabel="Clubs"
        items={list.map((c) => ({ label: c.title, to: `/campus-life/clubs/${c.slug}` }))}
      />
      <SectionHeading eyebrow="Clubs" title="Find your tribe" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.03}>
            <Link
              to="/campus-life/clubs/$slug"
              params={{ slug: c.slug }}
              className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white p-5 hover:border-gold"
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-crimson">{c.accent}</div>
              <h4 className="mt-1 font-display font-bold text-navy">{c.title}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{c.subtitle}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
