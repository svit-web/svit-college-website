import { createFileRoute } from "@tanstack/react-router";
import { getAboutPage } from "@/lib/pages.functions";
import { AboutLayout } from "@/components/site/AboutLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SVIT Vasad — Legacy, Vision, Leadership & Campus" },
      {
        name: "description",
        content:
          "Established 1997 by NEST — SVIT Vasad's story, history, vision, leadership, accreditation, committees and campus facilities.",
      },
      { property: "og:title", content: "About SVIT Vasad" },
      { property: "og:description", content: "Legacy, vision, mission and campus of SVIT Vasad." },
    ],
  }),
  loader: async () => {
    const aboutPage = await getAboutPage();
    return { aboutPage };
  },
  component: AboutLayout,
});
