import { NavigationHold } from "@/components/site-next/NavigationSpinner";
import { cn } from "@/lib/utils";

function Block({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded bg-ink/[0.07] motion-reduce:animate-none", className)}
    />
  );
}

function TextLines() {
  return (
    <div className="space-y-3">
      <Block className="h-4 w-full" />
      <Block className="h-4 w-full" />
      <Block className="h-4 w-3/4" />
    </div>
  );
}

function CardGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="border border-line bg-surface">
          <Block className="aspect-video w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Block className="h-3 w-1/3" />
            <Block className="h-5 w-5/6" />
            <Block className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Page-shaped placeholder for loading.tsx. Its minimum height keeps the footer
 * from jumping up while the real page loads, and NavigationHold keeps the
 * spinner showing on top of it.
 *
 * - "text": an article-like page.
 * - "cards": a listing of cards.
 * - "hero": a banner above text and cards, like a college page.
 * - inset={false}: for a segment whose layout already draws the page frame.
 */
export function PageSkeleton({
  variant = "text",
  inset = true,
}: {
  variant?: "text" | "cards" | "hero";
  inset?: boolean;
}) {
  return (
    <div aria-hidden className="min-h-[70vh]">
      <NavigationHold />
      {variant === "hero" && <Block className="h-72 w-full rounded-none md:h-96" />}
      <div className={cn(inset && "container-page py-16 md:py-20")}>
        <Block className="h-3 w-28" />
        <Block className="mt-4 h-9 w-2/3 max-w-xl" />
        <div className="mt-8">{variant === "cards" ? <CardGrid /> : <TextLines />}</div>
        {variant !== "cards" && (
          <div className="mt-10">{variant === "hero" ? <CardGrid /> : <TextLines />}</div>
        )}
      </div>
    </div>
  );
}
