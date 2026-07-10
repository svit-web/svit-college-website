import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

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
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-crimson">
            {eyebrow}
          </div>
        )}
        <h2
          className={cn(
            "font-display text-3xl md:text-4xl font-bold text-navy",
            variant === "simple" && center && "accent-underline pb-3"
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p className={cn("mt-4 text-base md:text-lg text-muted-foreground leading-relaxed", center && "mx-auto")}>
            {subtitle}
          </p>
        )}
      </div>
    </Reveal>
  );
}
