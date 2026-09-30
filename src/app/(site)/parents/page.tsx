import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site-next/PageHero";
import { Reveal } from "@/components/site-next/Reveal";
import { CalendarCheck, MessageCircle, Shield, TrendingUp } from "lucide-react";
import { pillOutline, pillPrimary } from "@/components/site-next/site-styles";
import { getMiscSettings } from "@/lib/site-settings.functions";

export const metadata: Metadata = {
  title: "For Parents — SVIT Vasad",
};

export default async function Parents() {
  const misc = await getMiscSettings().catch(() => null);
  const feats = [
    { icon: Shield, t: "Safety & Wellbeing", d: "24×7 campus security, medical centre and dedicated wardens in hostels." },
    { icon: MessageCircle, t: "Regular Communication", d: "Term-wise progress updates, PTA meetings and open communication with faculty." },
    { icon: TrendingUp, t: "Career Growth", d: misc?.placement_percentage ? `Structured internships, industry mentors and ${misc.placement_percentage}% placement track record.` : "Structured internships, industry mentors and strong placement track record." },
    { icon: CalendarCheck, t: "Parent Portal", d: "Access attendance, marks, fees and calendars via the student portal." },
  ];
  return (
    <>
      <PageHero title="For Parents" accent="Partners In Progress" subtitle="Your child's growth is a shared journey — here's how SVIT keeps you informed and involved." crumbs={[{ label: "Home", to: "/" }, { label: "Parents" }]} />

      <section className="container-page py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {feats.map((f, i) => (
            <Reveal key={f.t} delay={i * 0.05}>
              <div className="h-full border border-line bg-surface p-6">
                <div className="flex h-10 w-10 items-center justify-center bg-paper-deep text-navy"><f.icon className="h-5 w-5" /></div>
                <h4 className="mt-4 font-display font-medium text-navy">{f.t}</h4>
                <p className="mt-2 text-sm text-ink-soft">{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page pb-10">
        <div className="border border-line bg-paper-deep p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-medium text-navy">Parent Relations Cell</h3>
            <p className="mt-1 text-sm text-ink-soft">Have a concern or feedback? Reach out to the Parent Relations team.</p>
          </div>
          <Link href="/admissions/inquiry" className={`shrink-0 ${pillPrimary}`}>Get in Touch</Link>
        </div>
      </section>
    </>
  );
}
