import { BookOpen } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { CollegeLogo } from "./CollegeLogo";
import { LibraryPhotoSlider, type LibraryPhoto } from "./LibraryPhotoSlider";

interface InstituteLibrary {
  id: string;
  name: string;
  code: string;
  slug: string;
  logoUrl: string | null;
  tagline: string | null;
  bookCount: number;
}

interface LibraryPageProps {
  title: string;
  subtitle: string;
  accent: string;
  description: string;
  highlights: { title: string; description: string }[];
  institutes: InstituteLibrary[];
  photos: LibraryPhoto[];
}

function formatCount(n: number) {
  return n.toLocaleString("en-IN");
}

export function LibraryPage({
  title,
  subtitle,
  accent,
  description,
  highlights,
  institutes,
  photos,
}: LibraryPageProps) {
  const totalBooks = institutes.reduce((sum, inst) => sum + inst.bookCount, 0);

  return (
    <div className="space-y-10">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-crimson">{accent}</div>
        <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold text-navy">{title}</h2>
        <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">{subtitle}</p>
      </div>

      <p className="text-muted-foreground leading-relaxed">{description}</p>

      {photos.length > 0 && (
        <Reveal>
          <LibraryPhotoSlider photos={photos} />
        </Reveal>
      )}

      {/* Collective total counter */}
      <Reveal>
        <dl className="card-lift flex flex-col items-center gap-2 rounded-2xl border-2 border-navy/15 bg-navy p-8 text-center text-white sm:flex-row sm:justify-center sm:gap-5">
          <div
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold"
          >
            <BookOpen className="h-7 w-7" />
          </div>
          <div className="flex flex-col">
            <dt className="order-2 mt-1 text-sm font-semibold uppercase tracking-widest text-white/70">
              Total books across all 4 institute libraries
            </dt>
            <dd className="order-1 font-display text-4xl font-bold text-gold">
              {formatCount(totalBooks)}
              <span aria-hidden="true">+</span>
              <span className="sr-only"> or more</span>
            </dd>
          </div>
        </dl>
      </Reveal>

      {/* Per-institute subsections */}
      <div>
        <SectionHeading eyebrow="Institute Libraries" title="Library at each institute" variant="eyebrow" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {institutes.map((inst, i) => (
            <Reveal key={inst.id} delay={i * 0.05}>
              <div className="card-lift h-full rounded-2xl border-2 border-navy/15 bg-white p-6 hover:border-gold transition-colors">
                <div className="flex items-start gap-4">
                  <CollegeLogo
                    shortCode={inst.code}
                    src={inst.logoUrl ?? undefined}
                    className="h-14 w-14 shrink-0 rounded-md border border-navy/15 bg-secondary/50 p-1.5 text-navy"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-widest text-crimson">{inst.code}</div>
                    <h3 className="mt-1 font-display font-bold text-navy leading-tight">{inst.name}</h3>
                    {inst.tagline && <p className="mt-1 text-xs italic text-muted-foreground">{inst.tagline}</p>}
                  </div>
                </div>
                <dl className="mt-4 flex items-baseline gap-1.5 border-t border-navy/10 pt-4">
                  <dt className="order-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    books available
                  </dt>
                  <dd className="order-1 font-display text-2xl font-bold text-navy">
                    {formatCount(inst.bookCount)}
                    <span aria-hidden="true">+</span>
                  </dd>
                </dl>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {highlights.length > 0 && (
        <div>
          <SectionHeading eyebrow="Highlights" title="What makes it special" variant="eyebrow" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {highlights.map((h, i) => (
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
