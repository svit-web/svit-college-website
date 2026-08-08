import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { getAllFacilities } from "@/lib/facilities.functions";
import type { Facility } from "@/lib/facilities.functions";
import { ImageIcon, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/campus-life/facilities/")({
  head: () => ({
    meta: [
      { title: "Facilities — Campus Life — SVIT Vasad" },
      { name: "description", content: "Academic and sports facilities across the SVIT Vasad campus." },
    ],
  }),
  loader: async () => {
    const facilities = await getAllFacilities();

    // Separate by category in metadata (academic vs sports)
    const academic = facilities.filter(f => f.category === 'academic');
    const sports = facilities.filter(f => f.category === 'sports');

    return { academic, sports };
  },
  component: FacilitiesIndex,
});

function pathFor(category: "academic" | "sports", slug: string) {
  if (category === "academic") return `/campus-life/facilities/academic/${slug}`;
  return `/campus-life/facilities/co-curriculum/${slug}`;
}

function Card({ item, href, i }: { item: Facility; href: string; i: number }) {
  return (
    <Reveal delay={i * 0.03}>
      <Link
        to={href}
        className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white overflow-hidden hover:border-gold transition-colors"
      >
        <div className="aspect-video bg-secondary/60 flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-crimson">
            {item.accent_color || "Facility"}
          </div>
          <h4 className="mt-1 font-display font-bold text-navy">{item.name}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{item.subtitle || ""}</p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-crimson">
            View <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

function FacilitiesIndex() {
  const { academic, sports } = Route.useLoaderData();

  return (
    <div className="space-y-12">
      <section>
        <SectionHeading eyebrow="Academic" title="Academic Facilities" />
        <div className="mt-6 grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {academic.map((f, i) => (
            <Card key={f.slug} item={f} href={pathFor("academic", f.slug)} i={i} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Sports" title="Sports Facilities" />
        <div className="mt-6 grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sports.map((f, i) => (
            <Card key={f.slug} item={f} href={pathFor("sports", f.slug)} i={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
