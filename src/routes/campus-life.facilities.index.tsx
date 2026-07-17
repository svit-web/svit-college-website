import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { academicFacilities, sportsFacilities, type CampusItem } from "@/data/campus-rfe";
import { ImageIcon, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/campus-life/facilities/")({
  head: () => ({
    meta: [
      { title: "Facilities — Campus Life — SVIT Vasad" },
      { name: "description", content: "Academic and sports facilities across the SVIT Vasad campus." },
    ],
  }),
  component: FacilitiesIndex,
});

function pathFor(top: "academic" | "sports", slug: string) {
  if (top === "academic") return `/campus-life/facilities/academic/${slug}`;
  // Sports items keep richer nested URLs in the mega menu; the leaf resolver
  // accepts both flat and nested paths, so the shorter form is fine here.
  return `/campus-life/facilities/co-curriculum/${slug}`;
}

function Card({ item, href, i }: { item: CampusItem; href: string; i: number }) {
  return (
    <Reveal delay={i * 0.03}>
      <Link
        to={href}
        className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white overflow-hidden hover:border-gold transition-colors"
      >
        <div className="aspect-video bg-secondary/60 flex items-center justify-center">
          {item.image ? (
            <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div className="p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-crimson">{item.accent}</div>
          <h4 className="mt-1 font-display font-bold text-navy">{item.title}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-crimson">
            View <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

function FacilitiesIndex() {
  return (
    <div className="space-y-12">
      <section>
        <SectionHeading eyebrow="Academic" title="Academic Facilities" />
        <div className="mt-6 grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {academicFacilities.map((f, i) => (
            <Card key={f.slug} item={f} href={pathFor("academic", f.slug)} i={i} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Sports" title="Sports Facilities" />
        <div className="mt-6 grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sportsFacilities.map((f, i) => (
            <Card key={f.slug} item={f} href={pathFor("sports", f.slug)} i={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
