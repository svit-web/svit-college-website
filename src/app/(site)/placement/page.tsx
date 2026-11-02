import type { Metadata } from "next";
import { PlacementPage } from "@/components/site-next/PlacementPage";
import { getAllMOUs } from "@/lib/mous.functions";
import { getPlacementContent } from "@/lib/placement.functions";

export const metadata: Metadata = {
  title: "Training & Placement Cell — SVIT Group of Institutions",
  description:
    "Placement outcomes, recruiting partners, year-on-year trends, and student achievements across SVIT engineering, architecture, computer applications, and nursing.",
  alternates: { canonical: "/placement" },
};

export default async function PlacementIndexPage() {
  const [data, mous] = await Promise.all([getPlacementContent(), getAllMOUs().catch(() => [])]);
  return <PlacementPage data={data} mous={mous} />;
}
