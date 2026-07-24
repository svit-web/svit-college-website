import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { CollegeLogo } from "@/components/site/CollegeLogo";
import { Reveal } from "@/components/site/Reveal";
import { getAllColleges } from "@/lib/colleges.functions";

export const Route = createFileRoute("/colleges/")({
  head: () => ({
    meta: [
      { title: "Our Colleges — SVIT Group" },
      { name: "description", content: "Explore the four constituent colleges of the SVIT Group — SVIT, SVICA, SVION, and SVIT COA." },
      { property: "og:title", content: "Our Colleges — SVIT Group" },
      { property: "og:description", content: "Explore the four constituent colleges of the SVIT Group." },
    ],
  }),
  loader: async () => {
    const colleges = await getAllColleges();
    return { colleges };
  },
  component: CollegesIndex,
});

function CollegesIndex() {
  const { colleges } = Route.useLoaderData();
  return (
    <>
      <PageHero
        accent="SVIT Group"
        title="Our Colleges"
        subtitle="Four constituent institutes under one campus — engineering, computer applications, nursing, and architecture."
        crumbs={[{ label: "Home", to: "/" }, { label: "Colleges" }]}
      />
      <section className="container-page py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {colleges.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.05}>
              <Link
                to="/colleges/$college"
                params={{ college: c.slug }}
                className="card-lift group flex h-full flex-col rounded-2xl border border-border bg-white p-8"
              >
                <div className="flex items-start gap-5">
                  <CollegeLogo
                    shortCode={c.metadata?.shortCode ?? c.code}
                    src={c.logo_url ?? undefined}
                    className="h-20 w-20 shrink-0 rounded-md border border-border bg-secondary/50 p-2 text-navy"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-widest text-crimson">{c.metadata?.shortCode ?? c.code}</div>
                    <h3 className="mt-1 font-display text-xl font-bold text-navy leading-tight">{c.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground italic">{c.metadata?.tagline}</p>
                  </div>
                </div>
                <div className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-navy group-hover:text-gold">
                  Explore {c.metadata?.shortCode ?? c.code} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
