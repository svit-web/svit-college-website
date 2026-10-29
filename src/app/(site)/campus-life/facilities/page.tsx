import type { Metadata } from "next";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { EntryEventsGrid } from "@/components/site-next/EntryEventsGrid";
import { getAllFacilities } from "@/lib/facilities.functions";
import type { Facility } from "@/lib/facilities.functions";
import { getEntryAlbums } from "@/lib/gallery.functions";
import type { EntryCardData } from "@/lib/entry";
import { LIBRARY_FACILITY_SLUG, LIBRARY_PATH } from "@/lib/library-paths";

export const metadata: Metadata = {
  title: "Facilities — Campus Life — SVIT Vasad",
  description: "Academic and sports facilities across the SVIT Vasad campus.",
  alternates: { canonical: "/campus-life/facilities" },
};

function pathFor(category: "academic" | "amenities", slug: string) {
  if (slug === LIBRARY_FACILITY_SLUG) return LIBRARY_PATH;
  if (category === "academic") return `/campus-life/facilities/academic/${slug}`;
  return `/campus-life/facilities/amenities/${slug}`;
}

function toCard(
  facility: Facility,
  category: "academic" | "amenities",
  albums: Map<string, EntryCardData["album"]>,
): EntryCardData {
  return {
    id: facility.id,
    slug: facility.slug,
    title: facility.name,
    subtitle: facility.subtitle,
    description: facility.description,
    cardPhotoUrl: facility.album_id ? (albums.get(facility.album_id)?.coverUrl ?? null) : null,
    // The Central Library has a dedicated page regardless of has_detail_page.
    hasDetailPage: facility.has_detail_page || facility.slug === LIBRARY_FACILITY_SLUG,
    detailHref:
      facility.has_detail_page || facility.slug === LIBRARY_FACILITY_SLUG
        ? pathFor(category, facility.slug)
        : null,
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

  const academic = facilities
    .filter((f) => f.category === "academic")
    .map((f) => toCard(f, "academic", albums));
  const amenities = facilities
    .filter((f) => f.category === "amenities")
    .map((f) => toCard(f, "amenities", albums));

  return (
    <div className="space-y-12">
      <FacilitySection eyebrow="Academic" title="Academic Facilities" entries={academic} />
      <FacilitySection eyebrow="Amenities" title="Campus Amenities" entries={amenities} />
    </div>
  );
}
