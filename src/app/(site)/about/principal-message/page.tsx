import type { Metadata } from "next";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Quote } from "lucide-react";
import { getAboutPage } from "@/lib/pages.functions";

export const metadata: Metadata = {
  title: "Principal's Message — SVIT Vasad",
  description: "Message from the Principal of SVIT Vasad.",
};

export default async function PrincipalMessagePage() {
  const c = await getAboutPage().catch(() => null);

  return (
    <section className="container-page py-16 md:py-20">
      <SectionHeading eyebrow="Guiding SVIT" title="Principal's Message" variant="eyebrow" />

      <div className="mt-10 max-w-3xl">
        <div className="rounded-2xl border-2 border-navy/15 bg-white p-8">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-crimson">
            <Quote className="h-4 w-4" /> Principal&rsquo;s Message
          </div>
          <blockquote className="text-navy leading-relaxed italic">
            "{c?.leadership?.principal?.quote}"
          </blockquote>
          <div className="mt-4 text-sm font-semibold text-navy">
            {c?.leadership?.principal?.name}
          </div>
          <div className="text-xs text-muted-foreground">{c?.leadership?.principal?.title}</div>
          {c?.leadership?.principal?.bodyText && (
            <p className="mt-6 border-t border-border pt-6 text-sm text-muted-foreground leading-relaxed">
              {c.leadership.principal.bodyText}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
