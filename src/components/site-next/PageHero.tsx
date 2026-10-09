import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { heroTextVars, type HeroAppearance } from "@/lib/theme";

// Faint navy grid (the campus-life mosaic's "grid" texture), masked so it fades
// out toward the text on the left.
const PATTERN_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(43,47,94,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(43,47,94,0.08) 1px, transparent 1px)",
  backgroundSize: "34px 34px",
  WebkitMaskImage: "linear-gradient(to left, black 0%, black 35%, transparent 100%)",
  maskImage: "linear-gradient(to left, black 0%, black 35%, transparent 100%)",
};

/**
 * Beige page banner for inner pages: breadcrumbs, a small crimson eyebrow,
 * the title, one restrained subtitle line and optional pills — sized to a
 * slim strip so the page's content starts near the top of the first screen.
 * Text colour follows the admin "Text Color" setting through --hero-text,
 * which the public site layout sets for every page; pass `appearance` only
 * to override it locally.
 */
export function PageHero({
  title,
  accent,
  subtitle,
  crumbs,
  children,
  appearance,
  flushBottom = false,
}: {
  title: string;
  accent?: string;
  subtitle?: string;
  crumbs?: { label: string; to?: string }[];
  /** Actions under the subtitle — use pillPrimary / pillOutline links. */
  children?: ReactNode;
  appearance?: HeroAppearance | null;
  /** Omit the bottom border when a section tab strip follows directly — the
      strip carries its own border, and both together read as double rules. */
  flushBottom?: boolean;
}) {
  return (
    <section
      className={flushBottom ? "relative overflow-hidden bg-paper" : "relative overflow-hidden border-b border-line bg-paper"}
      style={appearance ? heroTextVars(appearance) : undefined}
    >
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block"
        style={PATTERN_STYLE}
      />
      {/* Fixed navbar overlays the top — the clamp is clearance for it, not
          air. container-nav-aligned(-inner) replaces container-page here so
          the title lines up with the navbar logo, not a separately-tuned
          max-width. */}
      <div className="container-nav-aligned relative pb-9 pt-[clamp(96px,11vh,120px)]">
        <div className="container-nav-aligned-inner flex flex-col">
          {crumbs && crumbs.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-mute"
            >
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {c.to ? (
                    <Link href={c.to} className="-my-1.5 inline-block py-1.5 transition-colors hover:text-crimson">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-ink-soft">
                      {c.label}
                    </span>
                  )}
                  {i < crumbs.length - 1 && <ChevronRight className="h-3 w-3" />}
                </span>
              ))}
            </nav>
          )}
          <div className="mt-6 max-w-4xl">
            {accent && (
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-crimson">
                {accent}
              </p>
            )}
            <h1 className="mt-2 text-[clamp(1.9rem,3.4vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--hero-text,var(--navy))]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 max-w-2xl text-[0.95rem] font-medium leading-[1.55] text-[color-mix(in_oklab,var(--hero-text,var(--navy))_78%,var(--paper))]">
                {subtitle}
              </p>
            )}
            {children && (
              <div className="mt-4 flex flex-wrap items-center gap-[0.7rem]">{children}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
