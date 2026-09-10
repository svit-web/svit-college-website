import type { Metadata } from "next";
import { getAllFacilities } from "@/lib/facilities.functions";
import { getSports, getSportsAchievements } from "@/lib/sports.functions";
import { SportsSection } from "@/components/site-next/SportsSection";

export const metadata: Metadata = {
  title: "Sports & Athletics — Campus Life — SVIT Vasad",
  description: "Sports disciplines, courts & facilities, and athletic achievements at SVIT Vasad.",
};

export default async function SportsAndAthleticsPage() {
  const [facilities, sports, achievements] = await Promise.all([
    getAllFacilities().catch(() => []),
    getSports().catch(() => []),
    getSportsAchievements().catch(() => []),
  ]);

  const sportsFacilities = facilities.filter((f) => f.category === "sports");

  return (
    <SportsSection
      sports={sports}
      achievements={achievements}
      sportsFacilities={sportsFacilities}
    />
  );
}
