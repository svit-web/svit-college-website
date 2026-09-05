import type { Metadata } from "next";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Quote } from "lucide-react";
import { getAboutPage } from "@/lib/pages.functions";

export const metadata: Metadata = {
  title: "Chairman's Message — SVIT Vasad",
  description: "Message from the Chairman of SVIT Vasad.",
};

export default async function ChairmanMessagePage() {
  const c = await getAboutPage().catch(() => null);

  return (
    <section className="container-page py-16 md:py-20">
      <SectionHeading eyebrow="Guiding SVIT" title="Chairman's Message" variant="eyebrow" />

      <div className="mt-10 max-w-3xl">
        <div className="rounded-2xl border-2 border-navy/15 bg-white p-8">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-crimson">
            <Quote className="h-4 w-4" /> Chairman&rsquo;s Message
          </div>
          <blockquote className="text-navy leading-relaxed italic">
            "{c?.leadership?.chairman?.quote}"
          </blockquote>
          <div className="mt-4 text-sm font-semibold text-navy">
            {c?.leadership?.chairman?.name}
          </div>
          <div className="text-xs text-muted-foreground">{c?.leadership?.chairman?.title}</div>

          {c?.leadership?.chairman?.strategicPlanText && (
            <div className="mt-6 border-t border-border pt-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-navy">
                Strategic Plan
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {c.leadership.chairman.strategicPlanText}
              </p>
            </div>
          )}

          {c?.leadership?.chairman?.corePrinciples &&
            c.leadership.chairman.corePrinciples.length > 0 && (
              <div className="mt-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-navy">
                  Core Principles
                </div>
                <ul className="mt-3 space-y-2">
                  {c.leadership.chairman.corePrinciples.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      </div>
    </section>
  );
}
