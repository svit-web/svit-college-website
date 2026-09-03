"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type Fuse from "fuse.js";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  createSearchFuse,
  groupSearchResults,
  loadSearchIndex,
  RESULTS_PER_GROUP,
  type SearchEntry,
} from "@/lib/search-index";
import { cn } from "@/lib/utils";

export function SiteSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [fuse, setFuse] = useState<Fuse<SearchEntry> | null>(null);

  // Cmd/Ctrl+K opens search from anywhere on the public site.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Fetch the static index lazily, the first time search is actually opened,
  // rather than on every page load.
  useEffect(() => {
    if (!open || entries) return;
    let cancelled = false;
    loadSearchIndex().then((data) => {
      if (cancelled) return;
      setEntries(data);
      setFuse(createSearchFuse(data));
    });
    return () => {
      cancelled = true;
    };
  }, [open, entries]);

  const trimmedQuery = query.trim();
  const matches = useMemo(() => {
    if (!fuse || trimmedQuery.length < 2) return [];
    // No `limit` here deliberately: a cross-type cap computed before grouping
    // let a broad query's Staff matches (the largest group, ~250 rows) crowd
    // out legitimate matches from small groups entirely. Fuse still returns
    // matches ranked by relevance; RESULTS_PER_GROUP below is what actually
    // bounds what's rendered, applied per group after grouping.
    return fuse.search(trimmedQuery).map((r) => r.item);
  }, [fuse, trimmedQuery]);

  const grouped = useMemo(() => groupSearchResults(matches), [matches]);

  const goTo = useCallback(
    (url: string) => {
      setOpen(false);
      setQuery("");
      router.push(url);
    },
    [router],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search the site"
        className={cn(
          "flex items-center gap-2 rounded-md border border-border p-2 text-ink/70 hover:border-navy/30 hover:text-navy",
          className,
        )}
      >
        <Search className="h-5 w-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 top-[20%] translate-y-0 sm:max-w-xl">
          <DialogTitle className="sr-only">Search the site</DialogTitle>
          <DialogDescription className="sr-only">
            Search colleges, departments, courses, staff, news, downloads and more.
          </DialogDescription>
          <Command
            shouldFilter={false}
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2.5"
          >
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search colleges, departments, staff, news…"
            />
            <CommandList className="max-h-[70vh]">
              {trimmedQuery.length > 0 && trimmedQuery.length < 2 && (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Keep typing…
                </div>
              )}
              {trimmedQuery.length >= 2 && matches.length === 0 && (
                <CommandEmpty>No results for &ldquo;{trimmedQuery}&rdquo;.</CommandEmpty>
              )}
              {grouped.map(([type, items]) => (
                <CommandGroup key={type} heading={`${type} (${items.length})`}>
                  {items.slice(0, RESULTS_PER_GROUP).map((item) => (
                    <CommandItem
                      key={item.url}
                      value={item.url}
                      onSelect={() => goTo(item.url)}
                      className="flex-col items-start gap-0.5"
                    >
                      <span className="font-medium text-navy">{item.title}</span>
                      {item.college && (
                        <span className="text-xs text-muted-foreground">{item.college}</span>
                      )}
                      {item.headings && (
                        <span className="line-clamp-1 text-xs text-muted-foreground/80">
                          {item.headings}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
