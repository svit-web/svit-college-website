import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { eyebrow, pillOutline, pillPrimary } from "./site-styles";

/**
 * Shared not-found panel for the public site. `embedded` renders just the
 * panel (inside a layout column such as Campus Life); otherwise it adds the
 * page container with header clearance, since these pages have no PageHero.
 */
export function NotFoundPanel({
  title,
  message = "It may have been moved, renamed or is no longer published.",
  section,
  embedded = false,
}: {
  title: string;
  message?: string;
  /** Where to send visitors besides home, e.g. { href: "/courses", label: "All courses" }. */
  section?: { href: string; label: string };
  embedded?: boolean;
}) {
  const Heading = embedded ? "h2" : "h1";
  const panel = (
    <div className="mx-auto max-w-2xl border border-line bg-paper-deep p-8 text-center md:p-12">
      <div className={eyebrow}>Not found</div>
      <Heading className="mt-3 font-display text-3xl font-medium text-navy md:text-4xl">
        {title}
      </Heading>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft md:text-base">
        {message}
      </p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        {section && (
          <Link href={section.href} className={pillPrimary}>
            <ArrowLeft className="h-4 w-4" />
            {section.label}
          </Link>
        )}
        <Link href="/" className={section ? pillOutline : pillPrimary}>
          Back to home
        </Link>
      </div>
    </div>
  );
  if (embedded) return panel;
  return <div className="container-page pb-24 pt-[clamp(112px,16vh,180px)]">{panel}</div>;
}
