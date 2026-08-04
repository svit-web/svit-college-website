import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ShieldCheck, FileText, ExternalLink } from "lucide-react";
import { getAllAccreditations } from "@/lib/accreditations.functions";
import { getAllMOUs } from "@/lib/mous.functions";
import type { MOU } from "@/lib/mous.functions";

const parent = getRouteApi("/about");

export const Route = createFileRoute("/about/accreditation")({
  head: () => ({
    meta: [
      { title: "Accreditation & Compliance — SVIT Vasad" },
      {
        name: "description",
        content: "SVIT Vasad's accreditations, approvals, academic regulations, mandatory disclosures and industry MOUs.",
      },
    ],
  }),
  loader: async () => {
    const [accreditations, mous] = await Promise.all([
      getAllAccreditations(),
      getAllMOUs(),
    ]);
    return { accreditations, mous };
  },
  component: AccreditationPage,
});

function AccreditationPage() {
  const { aboutPage: c } = parent.useLoaderData();
  const { accreditations, mous } = Route.useLoaderData();

  return (
    <>
      <section className="bg-secondary/50 py-16 md:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Standards & Compliance"
            title="Accreditation & Compliance"
            variant="eyebrow"
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border-2 border-navy/15 bg-white overflow-hidden">
              <div className="px-5 py-3 bg-navy text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Recognitions
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {accreditations.map((acc) => (
                    <tr key={acc.id} className="border-t border-border first:border-t-0">
                      <td className="px-4 py-3 text-navy">
                        {acc.metadata.body || `${acc.organization} (${acc.value})`}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gold">
                        {acc.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              {accreditations
                .filter((acc) => acc.metadata.description)
                .slice(0, 3)
                .map((acc) => (
                  <div key={acc.id} className="rounded-xl border-2 border-navy/15 bg-white p-5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-crimson">
                      {acc.organization}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {acc.metadata.description}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border-2 border-navy/15 bg-white p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-crimson">
                Academic Regulations (GTU)
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {c?.accreditation?.academicRegulationsText}
              </p>
              <ul className="mt-4 space-y-2">
                {(c?.accreditation?.regulationPoints ?? []).map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-navy">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border-2 border-navy/15 bg-white p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-crimson">
                Mandatory Disclosure &amp; Code of Conduct
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {c?.accreditation?.mandatoryDisclosureText}
              </p>
              <ul className="mt-4 space-y-2">
                {(c?.accreditation?.codeOfConductPoints ?? []).map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-navy">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Related documents */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-navy">
              Related Documents
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(c?.accreditation?.relatedDocuments ?? []).map((d) => (
                <li key={d.label}>
                  <a
                    href={d.fileUrl}
                    className="group flex items-center justify-between gap-3 rounded-xl border-2 border-navy/15 bg-white p-4 hover:border-gold transition-colors"
                  >
                    <span className="flex items-center gap-3 text-sm font-medium text-navy">
                      <FileText className="h-4 w-4 text-gold" />
                      {d.label}
                    </span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-gold" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* MOUs - Dynamic from Supabase */}
      <section className="py-16 md:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Industry Partnerships" title="Memoranda of Understanding" variant="eyebrow" />
          <p className="mt-4 max-w-3xl text-muted-foreground">
            SVIT has signed MOUs with leading industries and organizations to provide students with internships, expert lectures, and hands-on training opportunities.
          </p>
          <div className="mt-8 overflow-hidden rounded-xl border-2 border-navy/15 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Organization</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Purpose</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Department</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Signed</th>
                </tr>
              </thead>
              <tbody>
                {mous.map((mou: MOU, i: number) => (
                  <tr key={mou.id} className={`border-t border-border ${i % 2 === 0 ? "" : "bg-secondary/30"}`}>
                    <td className="px-4 py-3 font-medium text-navy">{mou.partner_organization}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{mou.purpose}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {mou.metadata?.department ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {mou.signed_date ? new Date(mou.signed_date).toLocaleDateString("en-IN", { year: "numeric", month: "short" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right text-xs text-muted-foreground">
            {mous.length} active MOUs
          </div>
        </div>
      </section>
    </>
  );
}
