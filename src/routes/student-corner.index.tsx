import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { PillTabs } from "@/components/site/PillTabs";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getAllCenters } from "@/lib/centers.functions";

export const Route = createFileRoute("/student-corner/")({
  head: () => ({
    meta: [
      { title: "Societies — SVIT Vasad" },
      { name: "description", content: "Student, faculty and innovation centres at SVIT Vasad." },
    ],
  }),
  loader: async () => {
    const centers = await getAllCenters();
    return { centers };
  },
  component: StudentCornerIndex,
});

function StudentCornerIndex() {
  const { centers } = Route.useLoaderData();

  return (
    <>
      <PageHero
        title="Societies"
        accent="Beyond the Classroom"
        subtitle="Centres, cells and chapters where students grow beyond the syllabus."
        crumbs={[{ label: "Home", to: "/" }, { label: "Societies" }]}
      />

      <section className="container-page py-20">
        <PillTabs
          ariaLabel="Centres"
          items={centers.map((c) => ({ label: c.name.split("(")[0].trim(), to: `/student-corner/${c.slug}` }))}
        />
        <SectionHeading eyebrow="Centres" title="Where students grow beyond the syllabus" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {centers.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.03}>
              <Link
                to="/student-corner/$slug"
                params={{ slug: c.slug }}
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
    </>
  );
}
