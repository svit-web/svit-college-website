// Shared public-site class strings for the beige reference style.
// See docs/design/BEIGE_DESIGN_SYSTEM.md for when to use each.

// The hero's pill buttons (HeroNew), shared so every section uses one button style.
export const pillPrimary =
  "group inline-flex items-center justify-center gap-[0.55rem] whitespace-nowrap rounded-full border border-ink bg-ink px-[1.25rem] py-[0.62rem] text-[0.84rem] font-semibold text-cream transition-colors hover:border-crimson hover:bg-crimson active:scale-[0.98]";

export const pillOutline =
  "group inline-flex items-center justify-center gap-[0.55rem] whitespace-nowrap rounded-full border border-line-strong px-[1.25rem] py-[0.62rem] text-[0.84rem] font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream active:scale-[0.98]";

// Small inline pill ("Read more", "All news & events"); render via <PillLink>.
export const pillLink =
  "group inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white";

// Round outline icon button (carousel arrows, close buttons, socials).
export const circleIconButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream";

// Vertical rhythm of the reference sections (campus-life mosaic): shrinks on phones.
export const sectionSpacing = "py-[clamp(84px,11vw,144px)]";

export const eyebrow = "text-[11px] font-bold uppercase tracking-[0.2em] text-crimson";

// Large editorial section title (campus mosaic, carousel, CTA band).
export const editorialH2 =
  "font-display text-[clamp(2rem,4.2vw,3.3rem)] font-medium leading-[1.12] tracking-[-0.01em] text-navy";

// Standard section title (SectionHeading) — a step smaller for dense inner pages.
export const sectionH2 =
  "font-display text-[clamp(1.85rem,3.2vw,2.6rem)] font-medium leading-[1.15] tracking-[-0.01em] text-navy";

// Form fields: square, hairline, navy focus.
export const fieldInput =
  "w-full border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-mute transition-colors focus:border-navy focus:outline-none focus:ring-0 disabled:opacity-60";

export const fieldLabel =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft";
