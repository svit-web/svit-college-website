import type { Metadata } from "next";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import { getAboutPage } from "@/lib/pages.functions";

export const metadata: Metadata = {
  title: "History, Vision & Mission — SVIT Vasad",
  description: "SVIT Vasad's history and milestones since 1997, our vision, mission and core values.",
};

export default async function HistoryVisionMissionPage() {
  const c = await getAboutPage().catch(() => null);

  return (
    <section className="bg-secondary/50 py-16 md:py-20">
      <div className="container-page">
        <SectionHeading eyebrow="Our journey" title="History, Vision & Mission" variant="eyebrow" />
        <p className="mt-6 max-w-4xl text-muted-foreground leading-relaxed">
          {c?.history?.introText}
        </p>
        <ol className="mt-10 space-y-4">
          {(c?.history?.milestones ?? []).map((m, i) => (
            <Reveal key={`${m.year}-${i}`} delay={i * 0.04}>
              <li className="grid grid-cols-[110px_1fr] gap-4 rounded-xl border-2 border-navy/15 bg-white p-5 hover:border-gold transition-colors">
                <div className="font-display text-2xl font-bold text-gold">{m.year}</div>
                <div className="text-sm text-navy leading-relaxed">{m.milestone}</div>
              </li>
            </Reveal>
          ))}
        </ol>
        {c?.history?.closingText && (
          <p className="mt-8 max-w-4xl text-muted-foreground leading-relaxed italic">
            {c.history.closingText}
          </p>
        )}

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border-2 border-navy/15 bg-white p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-crimson">
              Vision
            </div>
            <blockquote className="mt-4 font-display text-xl md:text-2xl text-navy leading-snug">
              &quot;{c?.vision?.visionText}&quot;
            </blockquote>
          </div>
          <div className="rounded-2xl border-2 border-navy/15 bg-white p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-crimson">
              Mission
            </div>
            <ol className="mt-4 space-y-3">
              {(c?.mission?.missionPoints ?? []).map((p, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-bold text-gold">
                    {i + 1}
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-14 rounded-2xl bg-navy p-8 text-center text-white md:p-10">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Core Values
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {(c?.coreValues ?? []).map((v) => (
              <span
                key={v}
                className="rounded-full border border-white/25 bg-white/5 px-5 py-2 text-sm font-medium tracking-wide"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
