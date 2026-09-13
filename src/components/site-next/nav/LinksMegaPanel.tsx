import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { groupMenuChildren, type MenuTopItem } from "@/lib/menus.functions";

/** Generic column-of-links mega panel for menu_type "links_mega" items (About SVIT, Admissions). */
export function LinksMegaPanel({ item }: { item: MenuTopItem }) {
  const groups = groupMenuChildren(item.children);
  const quote = typeof item.metadata?.quote === "string" ? item.metadata.quote : null;
  // Without an aside quote, columns have the full width to themselves, so
  // let 3 groups sit side-by-side instead of always wrapping at 2.
  const columnsClass =
    !quote && groups.length >= 3 ? "sm:grid-cols-3" : groups.length > 1 ? "sm:grid-cols-2" : "";

  return (
    <div className={cn("grid gap-x-10 gap-y-8 py-10", quote && "md:grid-cols-[1.2fr_.8fr]")}>
      <div className={cn("grid gap-x-8 gap-y-8", columnsClass)}>
        {groups.map((g) => (
          <div key={g.group ?? "default"}>
            {g.group && (
              <div className="mb-3 border-b border-border pb-3 text-xs font-bold uppercase tracking-[0.14em] text-navy">
                {g.group}
              </div>
            )}
            <ul>
              {g.items.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.url ?? "#"}
                    className="block py-1.5 text-[14.5px] text-ink/80 transition-colors hover:text-crimson"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {quote && (
        <div className="flex flex-col justify-between gap-6 border-l border-border pl-8">
          <p className="font-display text-xl italic leading-snug text-navy">
            &ldquo;{quote}&rdquo;
          </p>
          <Link
            href={item.url ?? "#"}
            className="inline-flex items-center gap-2 text-sm font-semibold text-crimson"
          >
            {item.title} overview <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
