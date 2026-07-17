import { createFileRoute, notFound } from "@tanstack/react-router";
import { CampusLeafPage } from "@/components/site/CampusLeafPage";
import { PillTabs } from "@/components/site/PillTabs";
import { centreDetails, centreMap } from "@/data/campus-rfe";

export const Route = createFileRoute("/campus-life/centre/$slug")({
  loader: ({ params }) => {
    const item = centreMap[params.slug];
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) =>
    loaderData
      ? { meta: [{ title: `${loaderData.item.title} — SVIT Vasad` }, { name: "description", content: loaderData.item.description.slice(0, 155) }] }
      : { meta: [{ title: "Centre — SVIT Vasad" }, { name: "robots", content: "noindex" }] },
  component: CentreLeaf,
  notFoundComponent: () => <div className="rounded-2xl border-2 border-navy/15 bg-white p-10 text-center"><div className="text-xs font-bold uppercase tracking-widest text-crimson">Not found</div><h2 className="mt-2 font-display text-2xl font-bold text-navy">Centre not available</h2></div>,
});

function CentreLeaf() {
  const { item } = Route.useLoaderData();
  return (
    <div>
      <PillTabs
        ariaLabel="Centres"
        items={centreDetails.map((c) => ({ label: c.title.split("(")[0].trim(), to: `/campus-life/centre/${c.slug}` }))}
      />
      <CampusLeafPage item={item} />
    </div>
  );
}
