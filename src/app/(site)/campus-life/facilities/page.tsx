import type { Metadata } from "next";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { EntryEventsGrid } from "@/components/site-next/EntryEventsGrid";
import { getAllFacilities } from "@/lib/facilities.functions";
import type { Facility } from "@/lib/facilities.functions";
import { getEntryAlbums } from "@/lib/gallery.functions";
import type { EntryCardData } from "@/lib/entry";

export const metadata: Metadata = {
  title: "Facilities — Campus Life — SVIT Vasad",
  description: "Academic and sports facilities across the SVIT Vasad campus.",
};

function pathFor(category: "academic" | "sports" | "transport" | "amenities", slug: string) {
  if (category === "academic") return `/campus-life/facilities/academic/${slug}`;
  if (category === "transport") return `/campus-life/facilities/transport/${slug}`;
  if (category === "amenities") return `/campus-life/facilities/amenities/${slug}`;
  return `/campus-life/facilities/co-curriculum/${slug}`;
}

function toCard(
  facility: Facility,
  category: "academic" | "sports" | "transport" | "amenities",
  albums: Map<string, EntryCardData["album"]>,
): EntryCardData {
  return {
    id: facility.id,
    slug: facility.slug,
    title: facility.name,
    subtitle: facility.accent_color,
    description: facility.subtitle,
    cardPhotoUrl: facility.card_photo_url,
    hasDetailPage: facility.has_detail_page,
    detailHref: facility.has_detail_page ? pathFor(category, facility.slug) : null,
    album: facility.album_id ? (albums.get(facility.album_id) ?? null) : null,
  };
}

function FacilitySection({
  eyebrow,
  title,
  entries,
}: {
  eyebrow: string;
  title: string;
  entries: EntryCardData[];
}) {
  if (entries.length === 0) return null;
  return (
    <section>
      <SectionHeading eyebrow={eyebrow} title={title} />
      <EntryEventsGrid entries={entries} />
    </section>
  );
}

export default async function FacilitiesIndex() {
  const facilities = await getAllFacilities().catch(() => []);
  const albums = await getEntryAlbums(facilities.map((f) => f.album_id));

  const transport = facilities
    .filter((f) => f.category === "transport")
    .map((f) => toCard(f, "transport", albums));
  const academic = facilities
    .filter((f) => f.category === "academic")
    .map((f) => toCard(f, "academic", albums));
  const sports = facilities
    .filter((f) => f.category === "sports")
    .map((f) => toCard(f, "sports", albums));
  const amenities = facilities
    .filter((f) => f.category === "amenities")
    .map((f) => toCard(f, "amenities", albums));

  return (
    <div className="space-y-12">
      <FacilitySection eyebrow="Transport" title="Transport Facilities" entries={transport} />
      <FacilitySection eyebrow="Academic" title="Academic Facilities" entries={academic} />
      <FacilitySection eyebrow="Sports" title="Sports Facilities" entries={sports} />
      <FacilitySection eyebrow="Amenities" title="Campus Amenities" entries={amenities} />
    </div>
  );
}
