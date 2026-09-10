import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site-next/PageHero";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import { getAllFacilities } from "@/lib/facilities.functions";
import { getSports, getSportsAchievements } from "@/lib/sports.functions";
import { SportsSection } from "@/components/site-next/SportsSection";
import campusHero from "@/assets/campus-hero.jpg";
import campusAerial from "@/assets/campus-aerial.jpg";

export const metadata: Metadata = {
  title: "Explore The Campus — SVIT Vasad",
};

export default async function Campus() {
  const [facilities, sports, achievements] = await Promise.all([
    getAllFacilities().catch(() => []),
    getSports().catch(() => []),
    getSportsAchievements().catch(() => []),
  ]);

  const academicFacilities = facilities.filter((f) => f.category === "academic");
  const wellnessFacilities = facilities.filter((f) => f.category === "wellness");
  const amenityFacilities = facilities.filter((f) => f.category === "amenity");
  const hostelFacilities = facilities.filter((f) => f.category === "hostel");
  const sportsFacilities = facilities.filter((f) => f.category === "sports");

  return (
    <>
      <PageHero
        title="Explore The Campus"
        accent="15+ Acres · Green Campus"
        subtitle="A living, learning environment with modern labs, hostels, sports and green open spaces."
        crumbs={[{ label: "Home", to: "/" }, { label: "Campus" }]}
      />

      {/* Hero images */}
      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <Image
            src={campusHero}
            alt="Campus"
            sizes="(max-width: 768px) 100vw, 50vw"
            className="rounded-2xl object-cover w-full h-72 md:h-96"
            priority
          />
          <Image
            src={campusAerial}
            alt="Aerial"
            sizes="(max-width: 768px) 100vw, 50vw"
            className="rounded-2xl object-cover w-full h-72 md:h-96"
          />
        </div>
      </section>

      {/* Academic Facilities */}
      {academicFacilities.length > 0 && (
        <section className="bg-secondary/50 py-20">
          <div className="container-page">
            <SectionHeading center eyebrow="Academic" title="World-Class Learning Infrastructure" />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {academicFacilities.map((f, i) => (
                <Reveal key={f.id} delay={i * 0.04}>
                  <div className="card-lift h-full rounded-2xl border border-border bg-white p-6">
                    <h4 className="font-display font-bold text-navy">{f.name}</h4>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {f.description ?? f.subtitle ?? ""}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Wellness & Student Support */}
      {wellnessFacilities.length > 0 && (
        <section className="container-page py-20">
          <SectionHeading center eyebrow="Wellness" title="Your Health & Well-Being Matter" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {wellnessFacilities.map((f, i) => (
              <Reveal key={f.id} delay={i * 0.04}>
                <div className="card-lift h-full rounded-2xl border-2 border-emerald-100 bg-white p-6">
                  {f.accent_color && (
                    <div className="mb-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      {f.accent_color}
                    </div>
                  )}
                  <h4 className="font-display text-lg font-bold text-navy">{f.name}</h4>
                  {f.subtitle && (
                    <p className="mt-1 text-xs font-semibold text-crimson">{f.subtitle}</p>
                  )}
                  <p className="mt-3 text-sm text-muted-foreground">{f.description ?? ""}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Campus Amenities */}
      {amenityFacilities.length > 0 && (
        <section className="bg-secondary/50 py-20">
          <div className="container-page">
            <SectionHeading center eyebrow="Amenities" title="Everyday Conveniences On Campus" />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {amenityFacilities.map((f, i) => (
                <Reveal key={f.id} delay={i * 0.04}>
                  <div className="card-lift h-full rounded-2xl border border-border bg-white p-5">
                    <h4 className="font-display text-base font-bold text-navy">{f.name}</h4>
                    {f.subtitle && (
                      <p className="mt-1 text-xs font-semibold text-slate-500">{f.subtitle}</p>
                    )}
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                      {f.description ?? ""}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hostel & Living */}
      <section className="container-page py-20">
        <SectionHeading center eyebrow="Hostel & Living" title="A home away from home" />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {hostelFacilities.length > 0
            ? hostelFacilities.map((h, i) => (
                <Reveal key={h.id} delay={i * 0.05}>
                  <div className="card-lift rounded-2xl border-2 border-navy/10 bg-white p-8">
                    <h3 className="font-display text-2xl font-bold text-navy">{h.name}</h3>
                    {h.subtitle && (
                      <p className="mt-1 text-sm font-semibold text-crimson">{h.subtitle}</p>
                    )}
                    <p className="mt-3 text-muted-foreground">{h.description ?? ""}</p>
                  </div>
                </Reveal>
              ))
            : [
                {
                  t: "Boys' Hostel",
                  d: "600-bed capacity, mess, Wi-Fi, common room, gymnasium and 24×7 security.",
                },
                {
                  t: "Girls' Hostel",
                  d: "400-bed capacity, dedicated warden, mess, indoor games and safe environment.",
                },
              ].map((h) => (
                <Reveal key={h.t}>
                  <div className="card-lift rounded-2xl border-2 border-navy/10 bg-white p-8">
                    <h3 className="font-display text-2xl font-bold text-navy">{h.t}</h3>
                    <p className="mt-3 text-muted-foreground">{h.d}</p>
                  </div>
                </Reveal>
              ))}
        </div>
      </section>

      {/* Sports Section */}
      <SportsSection
        sports={sports}
        achievements={achievements}
        sportsFacilities={sportsFacilities}
      />
    </>
  );
}
