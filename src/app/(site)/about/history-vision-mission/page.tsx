import type { Metadata } from "next";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { HistoryTimeline } from "@/components/site-next/HistoryTimeline";
import { getAboutPage } from "@/lib/pages.functions";

export const metadata: Metadata = {
  title: "History, Vision & Mission — SVIT Vasad",
  description: "SVIT Vasad's history and milestones since 1997, our vision and mission.",
  alternates: { canonical: "/about/history-vision-mission" },
};

export default async function HistoryVisionMissionPage() {
  const c = await getAboutPage().catch(() => null);

  return (
    <section className="bg-paper-deep py-16 md:py-20">
      <div className="container-page">
        <SectionHeading eyebrow="Our journey" title="History, Vision & Mission" variant="eyebrow" />
        <div className="mt-10 space-y-6">
          <div className="border border-line bg-surface p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-crimson">
              Vision
            </div>
            <p className="mt-4 text-justify text-sm text-ink-soft leading-relaxed">
              {c?.vision?.visionText}
            </p>
          </div>
          <div className="border border-line bg-surface p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-crimson">
              Mission
            </div>
            <ol className="mt-4 space-y-3">
              {(c?.mission?.missionPoints ?? []).map((p, i) => (
                <li key={i} className="flex gap-3 text-sm text-ink-soft leading-relaxed">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line-strong text-xs font-semibold text-navy">
                    {i + 1}
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <p className="mt-14 max-w-4xl text-justify text-ink-soft leading-relaxed">
          {c?.history?.introText}
        </p>
        <HistoryTimeline milestones={c?.history?.milestones ?? []} />
        {c?.history?.closingText && (
          <p className="mt-8 max-w-4xl text-justify text-ink-soft leading-relaxed italic">
            {c.history.closingText}
          </p>
        )}
      </div>
    </section>
  );
}
