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
 * Beige page banner for inner pages: homepage-hero typography on paper, no
 * photo. Text colour follows the admin "Text Color" setting through
 * --hero-text, which the public site layout sets for every page; pass
 * `appearance` only to override it locally.
 */
export function PageHero({
  title,
  accent,
  subtitle,
  crumbs,
  children,
  rightSlot,
  appearance,
}: {
  title: string;
  accent?: string;
  subtitle?: string;
  crumbs?: { label: string; to?: string }[];
  /** Actions under the subtitle — use pillPrimary / pillOutline links. */
  children?: ReactNode;
  rightSlot?: ReactNode;
  appearance?: HeroAppearance | null;
}) {
  return (
    <section
      className="relative overflow-hidden border-b border-line bg-paper"
      style={appearance ? heroTextVars(appearance) : undefined}
    >
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block"
        style={PATTERN_STYLE}
      />
      <div className="container-page relative flex flex-col pb-[clamp(2.5rem,6vw,4.5rem)] pt-[clamp(112px,16vh,180px)] lg:min-h-[60vh]">
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
        <div className="mt-auto flex items-end justify-between gap-10 pt-10 md:pt-14">
          <div className="max-w-4xl flex-1">
            {accent && (
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-crimson">
                {accent}
              </p>
            )}
            <h1 className="mt-[1.1rem] text-[clamp(2.2rem,4.6vw,3.8rem)] font-bold leading-[1.02] tracking-[-0.035em] text-[var(--hero-text,var(--navy))]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-5 max-w-2xl text-[clamp(1rem,1.35vw,1.18rem)] font-medium leading-[1.55] text-[color-mix(in_oklab,var(--hero-text,var(--navy))_78%,var(--paper))]">
                {subtitle}
              </p>
            )}
            {children && (
              <div className="mt-7 flex flex-wrap items-center gap-[0.7rem]">{children}</div>
            )}
          </div>
          {rightSlot && <div className="hidden shrink-0 lg:block">{rightSlot}</div>}
        </div>
      </div>
    </section>
  );
}
