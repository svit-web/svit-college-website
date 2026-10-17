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
  /** "cell": no border of its own — for joined hairline grids whose cells draw the lines. */
  variant?: "card" | "cell";
}

/**
 * Department / branch card: logo on a white panel with the name and the
 * "View department" affordance always visible below it (nothing depends on
 * hover, so it reads the same on touch screens). Hover/tap fills paper-deep.
 */
export function DeptBranchCard({
  name,
  iconUrl,
  fallbackLabel,
  fallbackColor,
  href,
  variant = "card",
}: Props) {
  const body = (
    <>
      <div className="relative h-20 w-20 shrink-0 border-r border-line bg-surface md:aspect-[4/3] md:h-auto md:w-full md:border-r-0 md:border-b">
        {iconUrl ? (
          <Image
            src={iconUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-2 md:p-6"
          />
        ) : (
          <div
            className={cn(
              "absolute inset-2 flex items-center justify-center font-display text-xl font-medium md:inset-4 md:text-4xl",
              fallbackColor ??
                "border border-dashed border-line-strong bg-paper-deep text-ink-mute",
            )}
          >
            {fallbackLabel}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4 md:p-5">
        <h4 className="font-display text-lg font-medium leading-tight text-navy">{name}</h4>
        {href ? (
          <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-semibold text-navy transition-colors group-hover:text-crimson">
            View department
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </span>
        ) : (
          <span className="mt-auto pt-4 text-xs text-ink-mute">Details coming soon</span>
        )}
      </div>
    </>
  );

  // Phones: logo beside the text to keep the list short; md+: logo on top.
  const shell = cn(
    "group flex h-full overflow-hidden md:flex-col",
    variant === "card" ? "border border-line bg-surface" : "bg-transparent",
  );
  return href ? (
    <Link
      href={href}
      className={cn(
        shell,
        "transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-paper-deep active:bg-paper-deep",
        variant === "card" && "hover:border-navy active:border-navy",
      )}
    >
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  );
}
