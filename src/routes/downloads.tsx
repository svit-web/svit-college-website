import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { Download, FileText } from "lucide-react";

export const Route = createFileRoute("/downloads")({
  head: () => ({ meta: [{ title: "Downloads — SVIT Vasad" }] }),
  component: Downloads,
});

const files = [
  "Prospectus 2026-27.pdf",
  "Fee Structure — Engineering.pdf",
  "Fee Structure — MBA & MCA.pdf",
  "Admission Form.pdf",
  "Scholarship Guidelines.pdf",
  "Hostel Rules & Regulations.pdf",
  "Academic Calendar 2026-27.pdf",
  "Anti-Ragging Undertaking.pdf",
];

function Downloads() {
  return (
    <>
      <PageHero title="Downloads" accent="Documents & Forms" subtitle="Prospectus, forms, fee structure and other important documents." crumbs={[{ label: "Home", to: "/" }, { label: "Downloads" }]} />

      <section className="container-page py-20">
        <ul className="space-y-3">
          {files.map((f, i) => (
            <Reveal key={f} delay={i * 0.03}>
              <li>
                <a href="#" className="card-lift flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy/5 text-navy"><FileText className="h-5 w-5" /></div>
                    <span className="font-semibold text-navy">{f}</span>
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
