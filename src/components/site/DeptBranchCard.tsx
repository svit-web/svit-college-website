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
 * Card used for both department cards (college page grid) and branch cards
 * (course page "Specialised Branches" grid). Front face shows just the name
 * + CTA banner; on hover it 3D-flips to the back face, where the logo/icon
 * fills the entire card (enlarged, not a small badge).
 *
 * When no `to` is given (branches with no detail page yet), renders as a
 * static, non-clickable card with a neutral footer instead of a dead link.
 */
export function DeptBranchCard({ name, iconUrl, fallbackLabel, fallbackColor, to, params }: Props) {
  const Wrapper = to ? Link : "div";
  const wrapperProps = to ? { to, params } : {};

  return (
    <Wrapper {...(wrapperProps as any)} className="group block h-56 [perspective:1200px]">
      <div className="relative h-full w-full transition-transform duration-500 ease-in-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front — name + CTA */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col overflow-hidden rounded-2xl border-2 border-navy/15 bg-white [backface-visibility:hidden]",
            to && "group-hover:border-gold"
          )}
        >
          <div className="flex flex-1 items-center justify-center p-6 text-center">
            <h4 className="font-display text-xl font-bold leading-snug text-navy">{name}</h4>
          </div>
          {to ? (
            <div className="flex items-center justify-between bg-navy px-5 py-3 text-sm font-semibold text-white">
              View department <ArrowRight className="h-4 w-4" />
            </div>
          ) : (
            <div className="bg-secondary/60 px-5 py-3 text-sm font-semibold text-muted-foreground">
              Details coming soon
            </div>
          )}
        </div>

        {/* Back — enlarged logo/icon */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl border-2 border-gold bg-white p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {iconUrl ? (
            <img src={iconUrl} alt={name} className="h-full w-full object-contain" />
          ) : (
            <div
              aria-hidden
              className={cn(
                "flex h-full w-full items-center justify-center rounded-xl text-4xl font-bold text-white",
                fallbackColor ?? "border-2 border-dashed border-navy/25 bg-secondary text-muted-foreground"
              )}
            >
              {fallbackLabel}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
