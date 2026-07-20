import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { Download, FileText } from "lucide-react";
import { useSupabaseDownloads } from "@/hooks/useSupabaseData";

export const Route = createFileRoute("/downloads")({
  head: () => ({ meta: [{ title: "Downloads — SVIT Vasad" }] }),
  component: Downloads,
});

const staticFiles = [
  { id: "1", title: "Prospectus 2026-27.pdf", fileUrl: "#" },
  { id: "2", title: "Fee Structure — Engineering.pdf", fileUrl: "#" },
  { id: "3", title: "Fee Structure — MBA & MCA.pdf", fileUrl: "#" },
  { id: "4", title: "Admission Form.pdf", fileUrl: "#" },
  { id: "5", title: "Scholarship Guidelines.pdf", fileUrl: "#" },
  { id: "6", title: "Hostel Rules & Regulations.pdf", fileUrl: "#" },
  { id: "7", title: "Academic Calendar 2026-27.pdf", fileUrl: "#" },
  { id: "8", title: "Anti-Ragging Undertaking.pdf", fileUrl: "#" },
];

function Downloads() {
  const { data: supabaseFiles } = useSupabaseDownloads();
  const files = supabaseFiles && supabaseFiles.length > 0 ? supabaseFiles : staticFiles;

  return (
    <>
      <PageHero title="Downloads" accent="Documents & Forms" subtitle="Prospectus, forms, fee structure and other important documents." crumbs={[{ label: "Home", to: "/" }, { label: "Downloads" }]} />

      <section className="container-page py-20">
        <ul className="space-y-3">
          {files.map((f, i) => (
            <Reveal key={f.id} delay={i * 0.03}>
              <li>
                <a href={f.fileUrl} target={f.fileUrl !== "#" ? "_blank" : undefined} rel="noreferrer" className="card-lift flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-5">
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
