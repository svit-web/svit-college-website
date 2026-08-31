import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/site-next/Reveal";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { getStudentClubBySlug, getAllClubEvents } from "@/lib/clubs.functions";

async function loadClubEvents(slug: string) {
  const club = await getStudentClubBySlug(slug);
  if (!club) return null;
  const events = await getAllClubEvents(club.id);
  return { club, events };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadClubEvents(slug);
  if (!result) return { title: "Club Events — SVIT Vasad", robots: { index: false } };
  return { title: `${result.club.name} — Events — SVIT Vasad` };
}

export default async function ClubEventsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await loadClubEvents(slug);
  if (!result) notFound();

  const { club, events } = result;

  return (
    <div>
      <Link
        href={`/campus-life/clubs/${club.slug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-crimson hover:text-navy"
      >
        ← Back to {club.name}
      </Link>
      <SectionHeading eyebrow={club.name} title="All Events" />

      {events.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No events yet — check back soon.</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e, i) => (
            <Reveal key={e.id} delay={i * 0.03}>
              <div className="card-lift h-full overflow-hidden rounded-2xl border-2 border-navy/15 bg-white hover:border-gold">
                {e.imageUrl && (
                  <div className="relative h-40 w-full">
                    <Image
                      src={e.imageUrl}
                      alt={e.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="text-xs font-bold uppercase tracking-widest text-crimson">
                    {new Date(e.eventDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <h4 className="mt-1 font-display font-bold text-navy">{e.title}</h4>
                  {e.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                      {e.description}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
