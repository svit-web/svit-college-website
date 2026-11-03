import type { Metadata } from "next";
import { MouBrowser } from "@/components/site-next/MouBrowser";
import { PageHero } from "@/components/site-next/PageHero";
import { getAllMOUs } from "@/lib/mous.functions";

export const metadata: Metadata = {
  title: "Industry Partners & MoUs — SVIT Vasad",
  description:
    "Memoranda of Understanding signed by SVIT Vasad and its departments with industry partners for internships, expert lectures and hands-on training.",
  alternates: { canonical: "/placement/mous" },
};

export const revalidate = 300; // seconds

export default async function PlacementMousPage() {
  const mous = await getAllMOUs().catch(() => []);

  return (
    <div>
      <PageHero
        title="Industry Partners & MoUs"
        accent="Training & Placement"
        subtitle="Partnerships that bring internships, expert lectures and hands-on training to our students."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Placement", to: "/placement" },
          { label: "MoUs" },
        ]}
      />
      <section className="bg-paper py-12 md:py-16">
        <div className="container-page">
          {mous.length > 0 ? (
            <MouBrowser mous={mous} />
          ) : (
            <p className="text-sm text-ink-soft">No MoUs yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
