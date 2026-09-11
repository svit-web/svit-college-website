import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampusLeafPage } from "@/components/site-next/CampusLeafPage";
import { PageHero } from "@/components/site-next/PageHero";
import { getCenterBySlug } from "@/lib/centers.functions";

async function loadCoe() {
  const item = await getCenterBySlug("coe");
  if (!item) return null;

  return {
    slug: item.slug,
    title: item.name,
    subtitle: item.subtitle || "",
    accent: item.accent_color || "Centre",
    description: item.description || "",
    highlights: item.metadata?.highlights ?? [],
    image: null,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const item = await loadCoe();
  if (!item) return { title: "Centre of Excellence — SVIT Vasad", robots: { index: false } };
  return {
    title: `${item.title} — SVIT Vasad`,
    description: (item.description || "").slice(0, 155),
  };
}

export default async function CoePage() {
  const item = await loadCoe();
  if (!item) notFound();

  return (
    <>
      <PageHero
        title={item.title}
        accent="Beyond the Classroom"
        subtitle={item.subtitle}
        crumbs={[{ label: "Home", to: "/" }, { label: item.title }]}
      />

      <section className="container-page py-20">
        <CampusLeafPage item={item} />
      </section>
    </>
  );
}
