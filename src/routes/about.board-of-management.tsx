import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { getAllBoardMembers } from "@/lib/board-members.functions";
import type { BoardMember } from "@/lib/board-members.functions";

const parent = getRouteApi("/about");

function trusteeInitials(name: string): string {
  const clean = name.replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?|shree|shri)\s+/i, "").trim();
  const parts = clean.split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export const Route = createFileRoute("/about/board-of-management")({
  head: () => ({
    meta: [
      { title: "Board of Management — SVIT Vasad" },
      { name: "description", content: "The trustees guiding SVIT Vasad's Board of Management." },
    ],
  }),
  loader: async () => {
    const boardMembers = await getAllBoardMembers();
    return { boardMembers };
  },
  component: BoardOfManagementPage,
});

function BoardOfManagementPage() {
  const { aboutPage: c } = parent.useLoaderData();
  const { boardMembers } = Route.useLoaderData();

  return (
    <section className="container-page py-16 md:py-20">
      <SectionHeading eyebrow="Guiding SVIT" title="Board of Management" variant="eyebrow" />
      <p className="mt-4 max-w-3xl text-muted-foreground">{c?.leadership?.intro}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {boardMembers.map((b: BoardMember, i: number) => (
          <Reveal key={b.id} delay={i * 0.05}>
            <div className="flex h-full flex-col items-center rounded-2xl border-2 border-navy/15 bg-white p-6 text-center hover:border-gold transition-colors">
              {b.photo_url ? (
                <img
                  src={b.photo_url}
                  alt={b.name}
                  className="h-24 w-24 rounded-full object-cover ring-2 ring-gold/40"
                />
              ) : (
                <div
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy via-navy-light to-crimson font-display text-2xl font-bold text-white ring-2 ring-white shadow-sm"
                  aria-hidden
                >
                  {trusteeInitials(b.name)}
                </div>
              )}
              <div className="mt-4 text-sm font-semibold text-navy">{b.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{b.designation}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
