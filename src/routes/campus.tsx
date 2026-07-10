import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CTABanner } from "@/components/site/CTABanner";
import { Reveal } from "@/components/site/Reveal";
import { Building2, Wifi, BookOpen, FlaskConical, Utensils, Bus, HeartPulse, Dumbbell } from "lucide-react";
import campusHero from "@/assets/campus-hero.jpg";
import campusAerial from "@/assets/campus-aerial.jpg";

export const Route = createFileRoute("/campus")({
  head: () => ({ meta: [{ title: "Explore The Campus — SVIT Vasad" }] }),
  component: Campus,
});

const facilities = [
  { icon: BookOpen, t: "Digital Library", d: "30,000+ books, journals and e-resources." },
  { icon: FlaskConical, t: "Modern Labs", d: "80+ discipline-specific and shared labs." },
  { icon: Wifi, t: "Wi-Fi Campus", d: "1 Gbps campus-wide Wi-Fi coverage." },
  { icon: Utensils, t: "Cafeteria", d: "Multi-cuisine cafeteria and food courts." },
  { icon: Bus, t: "Transport", d: "College buses across 20+ pickup points." },
  { icon: HeartPulse, t: "Medical Centre", d: "On-campus infirmary with tie-ups to hospitals." },
  { icon: Dumbbell, t: "Sports Complex", d: "Cricket, football, basketball, indoor games." },
  { icon: Building2, t: "Auditoriums", d: "500-seat main auditorium and 3 seminar halls." },
];

function Campus() {
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
              <Reveal key={f.t} delay={i * 0.04}>
                <div className="card-lift h-full rounded-2xl border border-border bg-white p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy/5 text-navy"><f.icon className="h-5 w-5" /></div>
                  <h4 className="mt-4 font-display font-bold text-navy">{f.t}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
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
            { t: "Boys' Hostel", d: "600-bed capacity, mess, Wi-Fi, common room, gymnasium and 24×7 security." },
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
