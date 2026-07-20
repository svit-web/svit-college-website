import { createFileRoute, notFound } from "@tanstack/react-router";
import { CampusLeafPage } from "@/components/site/CampusLeafPage";
import { PillTabs } from "@/components/site/PillTabs";
import { clubDetails as staticClubDetails, clubMap as staticClubMap } from "@/data/campus-rfe";
import { useSupabaseStudentClubs } from "@/hooks/useSupabaseData";

export const Route = createFileRoute("/campus-life/clubs/$slug")({
  loader: ({ params }) => {
    // Prefer static map for SSR loader; Supabase data hydrates on client
    const item = staticClubMap[params.slug];
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) =>
    loaderData
      ? { meta: [{ title: `${loaderData.item.title} — Clubs — SVIT Vasad` }, { name: "description", content: loaderData.item.description.slice(0, 155) }] }
      : { meta: [{ title: "Club — SVIT Vasad" }, { name: "robots", content: "noindex" }] },
  component: ClubLeaf,
  notFoundComponent: () => <div className="rounded-2xl border-2 border-navy/15 bg-white p-10 text-center"><div className="text-xs font-bold uppercase tracking-widest text-crimson">Not found</div><h2 className="mt-2 font-display text-2xl font-bold text-navy">Club not available</h2></div>,
});

function ClubLeaf() {
  const { item } = Route.useLoaderData();
  const { data: clubs } = useSupabaseStudentClubs();
  const list = clubs && clubs.length > 0 ? clubs : staticClubDetails;

  return (
    <div>
      <PillTabs
        ariaLabel="Clubs"
        items={list.map((c) => ({ label: c.title, to: `/campus-life/clubs/${c.slug}` }))}
      />
      <CampusLeafPage item={item} />
    </div>
  );
}
