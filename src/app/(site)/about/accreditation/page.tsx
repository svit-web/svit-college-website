import type { Metadata } from "next";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { ShieldCheck, FileText, ExternalLink } from "lucide-react";
import { getAboutPage } from "@/lib/pages.functions";
import { getAllAccreditations } from "@/lib/accreditations.functions";
import { getAllMOUs } from "@/lib/mous.functions";
import type { MOU } from "@/lib/mous.functions";

export const metadata: Metadata = {
  title: "Accreditation & Compliance — SVIT Vasad",
  description: "SVIT Vasad's accreditations, approvals, academic regulations, mandatory disclosures and industry MOUs.",
  alternates: { canonical: "/about/accreditation" },
};

export default async function AccreditationPage() {
  const [aboutPage, accreditations, mous] = await Promise.all([
    getAboutPage().catch(() => null),
    getAllAccreditations().catch(() => []),
    getAllMOUs().catch(() => []),
  ]);
  const c = aboutPage;

  return (
    <>
      <section className="bg-paper-deep py-16 md:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Standards & Compliance"
            title="Accreditation & Compliance"
            variant="eyebrow"
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="border border-line bg-surface overflow-hidden">
              <div className="flex items-center gap-2 border-b border-line bg-paper-deep px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-navy">
                <ShieldCheck className="h-4 w-4" /> Recognitions
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {accreditations.map((acc) => (
                    <tr key={acc.id} className="border-t border-line first:border-t-0">
                      <td className="px-4 py-3 text-navy">
                        {acc.accreditation_body || `${acc.organization} (${acc.value})`}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-crimson">
                        {acc.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              {accreditations
                .filter((acc) => acc.description)
                .slice(0, 3)
                .map((acc) => (
                  <div key={acc.id} className="border border-line bg-surface p-5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-crimson">
                      {acc.organization}
                    </div>
                    <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                      {acc.description}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="border border-line bg-surface p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-crimson">
                Academic Regulations (GTU)
              </div>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
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
            <div className="border border-line bg-surface p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-crimson">
                Mandatory Disclosure &amp; Code of Conduct
              </div>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
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
                    className="group flex items-center justify-between gap-3 border border-line bg-surface p-4 hover:border-navy transition-colors"
                  >
                    <span className="flex items-center gap-3 text-sm font-medium text-navy">
                      <FileText className="h-4 w-4 text-gold" />
                      {d.label}
                    </span>
                    <ExternalLink className="h-4 w-4 text-ink-soft group-hover:text-crimson" />
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
          <p className="mt-4 max-w-3xl text-ink-soft">
            SVIT has signed MOUs with leading industries and organizations to provide students with internships, expert lectures, and hands-on training opportunities.
          </p>
          <div className="mt-8 overflow-hidden border border-line bg-surface">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-paper-deep text-[11px] uppercase tracking-[0.12em] text-navy">
                <tr>
                  <th className="px-4 py-3 text-left">Organization</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Purpose</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Department</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Signed</th>
                </tr>
              </thead>
              <tbody>
                {mous.map((mou: MOU, i: number) => (
                  <tr key={mou.id} className={`border-t border-line ${i % 2 === 0 ? "" : "bg-paper-deep"}`}>
                    <td className="px-4 py-3 font-medium text-navy">{mou.partner_organization}</td>
                    <td className="px-4 py-3 text-ink-soft hidden sm:table-cell">{mou.purpose}</td>
                    <td className="px-4 py-3 text-ink-soft hidden md:table-cell">
                      {mou.department_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-soft hidden lg:table-cell">
                      {mou.signed_date ? new Date(mou.signed_date).toLocaleDateString("en-IN", { year: "numeric", month: "short" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right text-xs text-ink-soft">
            {mous.length} active MOUs
          </div>
        </div>
      </section>
    </>
  );
}
