import type { Metadata } from "next";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import { getAllCommittees } from "@/lib/committees.functions";

export const metadata: Metadata = {
  title: "SVIT Committees — SVIT Vasad",
  description:
    "Governance committees at SVIT Vasad: Women Development Cell, Grievance Redressal, IQAC and more.",
};

export default async function CommitteesPage() {
  const committees = await getAllCommittees().catch(() => []);

  return (
    <section className="container-page py-16 md:py-20">
      <SectionHeading eyebrow="Governance" title="SVIT Committees" variant="eyebrow" />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {committees.map((cm, i) => (
          <Reveal key={cm.id} delay={i * 0.05}>
            <div className="h-full rounded-2xl border-2 border-navy/15 bg-white p-6 hover:border-gold transition-colors">
              <h3 className="font-display text-lg font-bold text-navy">{cm.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {cm.metadata?.description}
              </p>
              {cm.metadata?.vision && (
                <p className="mt-3 text-sm text-muted-foreground">
                  <span className="font-semibold text-navy">Vision: </span>
                  {cm.metadata.vision}
                </p>
              )}
              {cm.metadata?.mission && (
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-navy">Mission: </span>
                  {cm.metadata.mission}
                </p>
              )}
              {cm.metadata.keyActivities && cm.metadata.keyActivities.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-crimson">
                    Key Activities
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {cm.metadata.keyActivities.map((a, j) => (
                      <li key={j} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
