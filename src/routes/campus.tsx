import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CTABanner } from "@/components/site/CTABanner";
import { Reveal } from "@/components/site/Reveal";
import { getAllFacilities } from "@/lib/facilities.functions";
import campusHero from "@/assets/campus-hero.jpg";
import campusAerial from "@/assets/campus-aerial.jpg";

export const Route = createFileRoute("/campus")({
  head: () => ({ meta: [{ title: "Explore The Campus — SVIT Vasad" }] }),
  loader: async () => {
    const facilities = await getAllFacilities();
    return { facilities };
  },
  component: Campus,
});

function Campus() {
  const { facilities } = Route.useLoaderData();
  return (
    <>
      <PageHero title="Explore The Campus" accent="15+ Acres · Green Campus" subtitle="A living, learning environment with modern labs, hostels, sports and green open spaces." crumbs={[{ label: "Home", to: "/" }, { label: "Campus" }]} />

      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <img src={campusHero} alt="Campus" className="rounded-2xl object-cover w-full h-72 md:h-96" loading="lazy" />
          <img src={campusAerial} alt="Aerial" className="rounded-2xl object-cover w-full h-72 md:h-96" loading="lazy" />
        </div>
      </section>

      <section className="bg-secondary/50 py-20">
        <div className="container-page">
          <SectionHeading center eyebrow="Facilities" title="Everything you need, on campus" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {facilities.map((f, i) => (
              <Reveal key={f.id} delay={i * 0.04}>
                <div className="card-lift h-full rounded-2xl border border-border bg-white p-6">
                  <h4 className="font-display font-bold text-navy">{f.name}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">{f.metadata?.description ?? f.metadata?.subtitle ?? ""}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading center eyebrow="Hostel & Living" title="A home away from home" />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {[
            { t: "Boys' Hostel", d: "600-bed capacity, mess, Wi-Fi, common room, gymnasium and 24\u00d77 security." },
            { t: "Girls' Hostel", d: "400-bed capacity, dedicated warden, mess, indoor games and safe environment." },
          ].map((h) => (
            <Reveal key={h.t}>
              <div className="card-lift rounded-2xl border border-border bg-white p-8">
                <h3 className="font-display text-2xl font-bold text-navy">{h.t}</h3>
                <p className="mt-3 text-muted-foreground">{h.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CTABanner />
    </>
  );
}
