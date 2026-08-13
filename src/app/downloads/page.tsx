import type { Metadata } from "next";
import { PageHero } from "@/components/site-next/PageHero";
import { Reveal } from "@/components/site-next/Reveal";
import { getAllDownloads } from "@/lib/downloads.functions";
import { Download, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Downloads — SVIT Vasad",
};

export default async function Downloads() {
  const downloads = await getAllDownloads().catch(() => []);

  return (
    <>
      <PageHero title="Downloads" accent="Documents & Forms" subtitle="Prospectus, forms, fee structure and other important documents." crumbs={[{ label: "Home", to: "/" }, { label: "Downloads" }]} />

      <section className="container-page py-20">
        <ul className="space-y-3">
          {downloads.map((f, i) => (
            <Reveal key={f.id} delay={i * 0.03}>
              <li>
                <a href={f.file_url} className="card-lift flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy/5 text-navy"><FileText className="h-5 w-5" /></div>
                    <span className="font-semibold text-navy">{f.title}</span>
                  </div>
                  <Download className="h-5 w-5 text-navy" />
                </a>
              </li>
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}
