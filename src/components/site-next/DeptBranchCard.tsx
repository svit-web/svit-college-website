import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  iconUrl?: string | null;
  fallbackLabel: string;
  fallbackColor?: string | null;
  href?: string;
}

/**
 * Square card for departments / branches.
 * Default: logo fills the card.
 * Hover: logo blurs + scales, dark overlay fades in with department name + CTA.
 */
export function DeptBranchCard({ name, iconUrl, fallbackLabel, fallbackColor, href }: Props) {
  const Wrapper = href ? Link : "div";
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={cn("group block aspect-square", href && "cursor-pointer")}
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-navy/15 bg-white transition-[border-color,box-shadow] duration-200 group-hover:border-gold group-hover:shadow-lg group-active:scale-[0.97] group-active:transition-[transform] group-active:duration-75">
        {/* Logo / initials — always visible, blurs + scales on hover */}
        <div className="absolute inset-0 flex items-center justify-center p-2 transition-[filter] duration-200 group-hover:blur-[3px]">
          {iconUrl ? (
            <Image
              src={iconUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-contain"
            />
          ) : (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center rounded-xl text-4xl font-bold",
                fallbackColor ??
                  "border-2 border-dashed border-navy/25 bg-secondary text-muted-foreground",
              )}
            >
              {fallbackLabel}
            </div>
          )}
        </div>

        {/* Hover overlay — text on dark backdrop */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy/75 p-6 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <h4 className="font-display text-xl font-bold leading-snug text-white">{name}</h4>
          {href ? (
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
