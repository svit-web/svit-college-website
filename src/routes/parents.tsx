import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { CalendarCheck, MessageCircle, Shield, TrendingUp } from "lucide-react";
import { miscSettingsQuery } from "@/lib/homepage";

export const Route = createFileRoute("/parents")({
  head: () => ({ meta: [{ title: "For Parents — SVIT Vasad" }] }),
  component: Parents,
});

function Parents() {
  const { data: misc } = useQuery(miscSettingsQuery);
  const feats = [
    { icon: Shield, t: "Safety & Wellbeing", d: "24×7 campus security, medical centre and dedicated wardens in hostels." },
    { icon: MessageCircle, t: "Regular Communication", d: "Term-wise progress updates, PTA meetings and open communication with faculty." },
    { icon: TrendingUp, t: "Career Growth", d: `Structured internships, industry mentors and ${misc?.placement_percentage ?? 95}% placement track record.` },
    { icon: CalendarCheck, t: "Parent Portal", d: "Access attendance, marks, fees and calendars via the student portal." },
  ];
  return (
    <>
      <PageHero title="For Parents" accent="Partners In Progress" subtitle="Your child's growth is a shared journey — here's how SVIT keeps you informed and involved." crumbs={[{ label: "Home", to: "/" }, { label: "Parents" }]} />

      <section className="container-page py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {feats.map((f, i) => (
            <Reveal key={f.t} delay={i * 0.05}>
              <div className="card-lift h-full rounded-2xl border border-border bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy/5 text-navy"><f.icon className="h-5 w-5" /></div>
                <h4 className="mt-4 font-display font-bold text-navy">{f.t}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page pb-10">
        <div className="rounded-2xl bg-secondary/50 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-navy">Parent Relations Cell</h3>
            <p className="mt-1 text-sm text-muted-foreground">Have a concern or feedback? Reach out to the Parent Relations team.</p>
          </div>
          <Link to="/admissions/inquiry" className="rounded-md bg-navy px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white hover:bg-navy-light">Get in Touch</Link>
        </div>
      </section>
    </>
  );
}
