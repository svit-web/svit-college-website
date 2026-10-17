import type { Metadata } from "next";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Quote } from "lucide-react";
import { getAllPrincipalMessages } from "@/lib/principal-messages.functions";

export const metadata: Metadata = {
  title: "Principal's Message — SVIT Vasad",
  description: "Messages from the Principals of SVIT Vasad.",
  alternates: { canonical: "/about/principal-message" },
};

export default async function PrincipalMessagePage() {
  const principals = await getAllPrincipalMessages().catch(() => []);

  return (
    <section className="container-page py-16 md:py-20">
      <SectionHeading eyebrow="Guiding SVIT" title="Principal's Message" variant="eyebrow" />

      <div className="mt-10 max-w-3xl space-y-8">
        {principals.map((p) => (
          <div key={p.id} className="border border-line bg-surface p-8">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-crimson">
              <Quote className="h-4 w-4" /> Principal&rsquo;s Message
            </div>
            <div className="flex items-center gap-4">
              {p.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.photo_url}
                  alt={p.name}
                  className="h-20 w-20 shrink-0 rounded-full border border-line object-cover"
                />
              )}
              <div>
                <div className="text-sm font-semibold text-navy">{p.name}</div>
                {p.title && <div className="text-xs text-ink-soft">{p.title}</div>}
              </div>
            </div>
            {p.content && (
              <p className="mt-6 whitespace-pre-line border-t border-line pt-6 text-justify leading-relaxed text-navy">
                {p.content}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
