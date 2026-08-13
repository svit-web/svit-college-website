import type { Metadata } from "next";
import { PlacementPage } from "@/components/site-next/PlacementPage";
import { getPlacementContent } from "@/lib/placement.functions";

export const metadata: Metadata = {
  title: "Training & Placement Cell — SVIT Group of Institutions",
  description:
    "Placement outcomes, recruiting partners, year-on-year trends, and student achievements across SVIT engineering, architecture, computer applications, and nursing.",
};

export default async function PlacementIndexPage() {
  const data = await getPlacementContent();
  return <PlacementPage data={data} />;
}
