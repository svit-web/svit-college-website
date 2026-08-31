import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampusLeafPage } from "@/components/site-next/CampusLeafPage";
import { PageHero } from "@/components/site-next/PageHero";
import { PillTabs } from "@/components/site-next/PillTabs";
import { getAllCenters, getCenterBySlug } from "@/lib/centers.functions";

async function loadCentre(slug: string) {
  const [item, allCenters] = await Promise.all([getCenterBySlug(slug), getAllCenters()]);
  if (!item) return null;

  const transformedItem = {
    slug: item.slug,
    title: item.name,
    subtitle: item.subtitle || "",
    accent: item.accent_color || "Centre",
    description: item.description || "",
    highlights: item.metadata?.highlights ?? [],
    image: null,
  };

  return { item: transformedItem, allCenters };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadCentre(slug);
  if (!result) return { title: "Societies — SVIT Vasad", robots: { index: false } };
  return {
    title: `${result.item.title} — Societies — SVIT Vasad`,
    description: (result.item.description || "").slice(0, 155),
  };
}

export default async function CentreLeaf({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await loadCentre(slug);
  if (!result) notFound();

  const { item, allCenters } = result;

  return (
    <>
      <PageHero
        title="Societies"
        accent="Beyond the Classroom"
        subtitle="Centres, cells and chapters where students grow beyond the syllabus."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Societies", to: "/student-corner" },
          { label: item.title },
        ]}
      />

      <section className="container-page py-20">
        <PillTabs
          ariaLabel="Centres"
          items={allCenters.map((c) => ({
            label: c.name.split("(")[0].trim(),
            to: `/student-corner/${c.slug}`,
          }))}
        />
        <CampusLeafPage item={item} />
      </section>
    </>
  );
}
