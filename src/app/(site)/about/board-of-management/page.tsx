import type { Metadata } from "next";
import Image from "next/image";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import { getAboutPage } from "@/lib/pages.functions";
import { getAllBoardMembers } from "@/lib/board-members.functions";
import type { BoardMember } from "@/lib/board-members.functions";

export const metadata: Metadata = {
  title: "Board of Management — SVIT Vasad",
  description: "The trustees guiding SVIT Vasad's Board of Management.",
};

function trusteeInitials(name: string): string {
  const clean = name.replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?|shree|shri)\s+/i, "").trim();
  const parts = clean.split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export default async function BoardOfManagementPage() {
  const [aboutPage, boardMembers] = await Promise.all([
    getAboutPage().catch(() => null),
    getAllBoardMembers().catch(() => []),
  ]);
  const c = aboutPage;

  return (
    <section className="container-page py-16 md:py-20">
      <SectionHeading eyebrow="Guiding SVIT" title="Board of Management" variant="eyebrow" />
      <p className="mt-4 max-w-3xl text-ink-soft">{c?.leadership?.intro}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {boardMembers.map((b: BoardMember, i: number) => (
          <Reveal key={b.id} delay={i * 0.05}>
            <div className="flex h-full flex-col items-center border border-line bg-surface p-6 text-center">
              {b.photo_url ? (
                <div className="relative h-24 w-24 rounded-full ring-2 ring-gold/40 overflow-hidden">
                  <Image
                    src={b.photo_url}
                    alt={b.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-line bg-paper-deep font-display text-2xl font-medium text-navy"
                  aria-hidden
                >
                  {trusteeInitials(b.name)}
                </div>
              )}
              <h3 className="mt-4 text-sm font-semibold text-navy">{b.name}</h3>
              <div className="mt-1 text-xs text-ink-soft">{b.designation}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
