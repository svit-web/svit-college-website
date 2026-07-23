import { createFileRoute, notFound } from "@tanstack/react-router";
import { CampusLeafPage } from "@/components/site/CampusLeafPage";
import { PillTabs } from "@/components/site/PillTabs";
import { getAllStudentClubs, getStudentClubBySlug } from "@/lib/clubs.functions";

export const Route = createFileRoute("/campus-life/clubs/$slug")({
  loader: async ({ params }) => {
    console.log('[Clubs $slug loader] params:', params);
    console.log('[Clubs $slug loader] params.slug:', params.slug);

    // Try calling with object syntax
    const [item, allClubs] = await Promise.all([
      getStudentClubBySlug({ data: params.slug }),
      getAllStudentClubs(),
    ]);

    console.log('[Clubs $slug loader] item returned:', item?.name || null);

    if (!item) throw notFound();

    // Transform to match CampusLeafPage interface
    const transformedItem = {
      slug: item.slug,
      title: item.name,
      subtitle: item.metadata?.subtitle || "",
      accent: item.metadata?.accent || "Club",
      description: item.description || "",
      highlights: Array.isArray(item.metadata?.highlights) ? item.metadata.highlights : [],
      image: item.logo_url || null,
    };

    return { item: transformedItem, allClubs };
  },
  head: ({ loaderData }) =>
    loaderData
      ? { meta: [{ title: `${loaderData.item.title} — Clubs — SVIT Vasad` }, { name: "description", content: (loaderData.item.description || "").slice(0, 155) }] }
      : { meta: [{ title: "Club — SVIT Vasad" }, { name: "robots", content: "noindex" }] },
  component: ClubLeaf,
  notFoundComponent: () => <div className="rounded-2xl border-2 border-navy/15 bg-white p-10 text-center"><div className="text-xs font-bold uppercase tracking-widest text-crimson">Not found</div><h2 className="mt-2 font-display text-2xl font-bold text-navy">Club not available</h2></div>,
});

function ClubLeaf() {
  const { item, allClubs } = Route.useLoaderData();
  return (
    <div>
      <PillTabs
        ariaLabel="Clubs"
        items={allClubs.map((c) => ({ label: c.name, to: `/campus-life/clubs/${c.slug}` }))}
      />
      <CampusLeafPage item={item} />
    </div>
  );
}
