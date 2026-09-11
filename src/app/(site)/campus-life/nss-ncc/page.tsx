import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImageIcon } from "lucide-react";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import { PhotoSlider } from "@/components/site-next/PhotoSlider";
import { getCenterBySlug } from "@/lib/centers.functions";

async function loadNssNcc() {
  const center = await getCenterBySlug("nss-ncc");
  if (!center) return null;

  return {
    title: center.name,
    subtitle: center.subtitle,
    accent: center.accent_color || "Centre",
    description: center.description,
    highlights: center.metadata?.highlights ?? [],
    photos: center.metadata?.gallery?.images ?? [],
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const item = await loadNssNcc();
  if (!item) return { title: "NSS / NCC — SVIT Vasad", robots: { index: false } };
  return {
    title: `${item.title} — Campus Life — SVIT Vasad`,
    description: (item.description || "").slice(0, 155),
  };
}

export default async function NssNccPage() {
  const item = await loadNssNcc();
  if (!item) notFound();

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-crimson">{item.accent}</div>
        <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold text-navy">{item.title}</h2>
        {item.subtitle && (
          <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {item.subtitle}
          </p>
        )}
      </div>

      {item.description && <p className="text-muted-foreground leading-relaxed">{item.description}</p>}

      <Reveal>
        {item.photos.length > 0 ? (
          <PhotoSlider photos={item.photos} ariaLabel="NSS/NCC photos" photoAlt="NSS/NCC activity photo" />
        ) : (
          <div className="relative aspect-video max-h-72 w-full overflow-hidden rounded-2xl border-2 border-navy/15 bg-secondary/60 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-10 w-10" />
              <span className="text-xs font-semibold uppercase tracking-widest">Photos coming soon</span>
            </div>
          </div>
        )}
      </Reveal>

      {item.highlights.length > 0 && (
        <div>
          <SectionHeading eyebrow="Highlights" title="What makes it special" variant="eyebrow" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {item.highlights.map((h, i) => (
              <Reveal key={h.title} delay={i * 0.04}>
                <div className="card-lift h-full rounded-2xl border-2 border-navy/15 bg-white p-5 hover:border-gold transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/10 text-xs font-bold text-navy">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-display font-bold text-navy">{h.title}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{h.description}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
