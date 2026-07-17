import { createFileRoute } from "@tanstack/react-router";
import { CampusLifeLayout } from "@/components/site/CampusLifeLayout";

export const Route = createFileRoute("/campus-life")({
  head: () => ({
    meta: [
      { title: "Campus Life — SVIT Vasad" },
      { name: "description", content: "Facilities, co-curricular centres, clubs and events that make SVIT more than a college." },
    ],
  }),
  component: CampusLifeLayout,
});
