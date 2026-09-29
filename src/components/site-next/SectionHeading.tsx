import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { eyebrow as eyebrowClass, sectionH2 } from "./site-styles";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
  variant = "eyebrow",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  variant?: "eyebrow" | "minimal" | "simple";
  className?: string;
}) {
  return (
    <Reveal className={cn(center && "text-center", className)}>
      <div className={cn("max-w-3xl", center && "mx-auto")}>
        {variant === "eyebrow" && eyebrow && (
          <div className={cn("mb-3", eyebrowClass)}>{eyebrow}</div>
        )}
        <h2 className={cn(sectionH2, variant === "simple" && center && "accent-underline pb-3")}>
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              "mt-4 text-base leading-relaxed text-ink-soft md:text-lg",
              center && "mx-auto",
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </Reveal>
  );
}
