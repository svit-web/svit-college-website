import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  iconUrl?: string | null;
  fallbackLabel: string;
  fallbackColor?: string | null;
  to?: string;
  params?: Record<string, string>;
}

/**
 * Square card for departments / branches.
 * Default: logo fills the card.
 * Hover: logo blurs + scales, dark overlay fades in with department name + CTA.
 */
export function DeptBranchCard({ name, iconUrl, fallbackLabel, fallbackColor, to, params }: Props) {
  const Wrapper = to ? Link : "div";
  const wrapperProps = to ? { to, params } : {};

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={cn("group block aspect-square", to && "cursor-pointer")}
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-navy/15 bg-white transition-all duration-500 ease-in-out group-hover:border-gold group-hover:shadow-lg">

        {/* Logo / initials — always visible, blurs + scales on hover */}
        <div className="absolute inset-0 flex items-center justify-center p-2 transition-all duration-500 ease-in-out group-hover:blur-[3px]">
          {iconUrl ? (
            <img src={iconUrl} alt={name} className="h-full w-full object-contain" />
          ) : (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center rounded-xl text-4xl font-bold",
                fallbackColor ?? "border-2 border-dashed border-navy/25 bg-secondary text-muted-foreground"
              )}
            >
              {fallbackLabel}
            </div>
          )}
        </div>

        {/* Hover overlay — text on dark backdrop */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy/75 p-6 text-center opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100">
          <h4 className="font-display text-xl font-bold leading-snug text-white">{name}</h4>
          {to ? (
            <div className="flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
              View department <ArrowRight className="h-3 w-3" />
            </div>
          ) : (
            <div className="text-xs text-white/55">Details coming soon</div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
